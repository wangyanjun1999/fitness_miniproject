import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { WorkoutPlanState, CreatePlanInput, WorkoutPreferences } from './types';
import { generateExercises } from './exerciseGenerator';
import { createError, handleError } from './utils';
import { ERROR_MESSAGES } from './constants';
import type { Profile } from '../../types/database';
import { logger, logPerformance } from '../../utils/logger';

// 用于记录计划生成的辅助函数
const logPlanGeneration = (plan: any, exercises: any[]) => {
  logger.info('workout', '新生成训练计划', {
    plan: {
      名称: plan.name,
      描述: plan.description,
      训练频率: `${plan.frequency}天/周`,
      训练偏好: plan.preferences || '默认设置'
    },
    exercises: exercises.reduce((acc, exercise) => {
      const type = exercise.exercise_type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push({
        名称: exercise.name,
        组数: exercise.sets,
        次数: exercise.reps,
        休息时间: `${exercise.rest_time}秒`,
        目标肌群: exercise.target_muscles.join(', '),
        难度: exercise.difficulty,
        备注: exercise.notes
      });
      return acc;
    }, {} as Record<string, any[]>)
  });
};

export const usePlanStore = create<WorkoutPlanState>((set, get) => ({
  currentPlan: null,
  exercises: [],
  isLoading: false,
  error: null,

  fetchUserPlan: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      logger.debug('workout', '开始获取用户训练计划', { userId });
      
      const { data: plans, error: planError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (planError) {
        logger.error('database', '获取训练计划失败', planError);
        throw planError;
      }

      if (plans && plans.length > 0) {
        const currentPlan = plans[0];
        logger.debug('workout', '获取到训练计划', currentPlan);
        
        const { data: exercises, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .eq('plan_id', currentPlan.id);

        if (exercisesError) {
          logger.error('database', '获取训练动作失败', exercisesError);
          throw exercisesError;
        }

        logger.info('workout', '成功加载训练计划', {
          planId: currentPlan.id,
          exerciseCount: exercises?.length || 0
        });

        set({ 
          currentPlan,
          exercises: exercises || [],
          error: null
        });
      } else {
        logger.info('workout', '用户没有训练计划', { userId });
        set({ 
          currentPlan: null, 
          exercises: [],
          error: null
        });
      }
    } catch (error) {
      const errorMessage = handleError(error, ERROR_MESSAGES.DATABASE.FETCH_PLAN);
      logger.error('workout', '获取训练计划失败', error);
      set({ 
        error: errorMessage,
        currentPlan: null,
        exercises: []
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createPlan: async (plan: CreatePlanInput) => {
    const { user_id } = plan;
    
    try {
      if (!user_id || !plan.name) {
        throw createError('VALIDATION', ERROR_MESSAGES.VALIDATION.INVALID_PLAN_DATA);
      }

      set({ isLoading: true, error: null });
      logger.info('workout', '开始创建训练计划', { plan });

      // 获取用户信息
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user_id)
        .single();

      if (profileError || !profile) {
        throw createError('DATABASE', '获取用户信息失败');
      }

      // 生成训练动作
      const exercises = await generateExercises(profile, plan.preferences);
      
      if (!exercises || exercises.length === 0) {
        throw createError('VALIDATION', '生成训练动作失败：没有生成任何动作');
      }
      
      logger.debug('workout', '生成训练动作', { 
        exerciseCount: exercises.length,
        exercises: exercises.map(e => ({ name: e.name, type: e.exercise_type }))
      });

      // 创建新计划
      const { data: newPlan, error: planError } = await supabase
        .from('workout_plans')
        .insert([{
          ...plan,
          last_generated: new Date().toISOString()
        }])
        .select()
        .single();

      if (planError || !newPlan) {
        throw createError('DATABASE', '创建训练计划失败');
      }

      // 插入训练动作
      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(
          exercises.map(exercise => ({
            ...exercise,
            plan_id: newPlan.id
          }))
        );

      if (exercisesError) {
        // 如果插入动作失败，需要回滚计划创建
        await supabase
          .from('workout_plans')
          .delete()
          .eq('id', newPlan.id);
        throw createError('DATABASE', '创建训练动作失败');
      }

      // 记录新生成的计划
      logPlanGeneration(newPlan, exercises);

      // 重新获取完整的计划信息
      await get().fetchUserPlan(user_id);
      
      logger.info('workout', '训练计划创建成功', {
        planId: newPlan.id,
        exerciseCount: exercises.length,
        preferences: plan.preferences || '默认设置'
      });
    } catch (error) {
      const errorMessage = handleError(error, ERROR_MESSAGES.DATABASE.CREATE_PLAN);
      logger.error('workout', '创建训练计划失败', { error: errorMessage, plan });
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deletePlan: async (planId: string) => {
    try {
      set({ isLoading: true, error: null });
      logger.info('workout', '开始删除训练计划', { planId });

      // 验证计划存在性
      const { data: plan, error: fetchError } = await supabase
        .from('workout_plans')
        .select('id, user_id')
        .eq('id', planId)
        .single();

      if (fetchError) {
        logger.error('database', '获取计划信息失败', fetchError);
        throw createError('DATABASE', '获取计划信息失败');
      }

      if (!plan) {
        logger.warn('workout', '要删除的计划不存在', { planId });
        throw createError('VALIDATION', '训练计划不存在');
      }

      // 删除计划（级联删除会自动处理相关的训练动作和记录）
      const { error: deleteError } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId);

      if (deleteError) {
        logger.error('database', '删除计划失败', deleteError);
        throw createError('DATABASE', '删除计划失败');
      }

      logger.info('workout', '成功删除训练计划', {
        planId,
        userId: plan.user_id
      });

      // 清除本地状态
      set({ 
        currentPlan: null,
        exercises: [],
        error: null
      });

    } catch (error) {
      const errorMessage = handleError(error, ERROR_MESSAGES.DATABASE.DELETE_PLAN);
      logger.error('workout', '删除训练计划失败', error);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));

// export { usePlanStore }