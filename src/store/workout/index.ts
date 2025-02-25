import { create } from 'zustand';
import { usePlanStore } from './planStore';
import { useRecordStore } from './recordStore';
import type { Exercise, Profile, WorkoutPlan, WorkoutRecord } from '../../types/database';
import type { CreatePlanInput, CreateRecordInput, WorkoutPreferences } from './types';
import { ERROR_MESSAGES } from './constants';
import { handleError } from './utils';
import { logger } from '../../utils/logger';

interface WorkoutState {
  currentPlan: WorkoutPlan | null;
  exercises: Exercise[];
  records: WorkoutRecord[];
  isLoading: boolean;
  error: string | null;

  fetchUserPlan: (userId: string) => Promise<void>;
  createPlan: (plan: CreatePlanInput) => Promise<void>;
  updatePlanFrequency: (frequency: number) => Promise<void>;
  regeneratePlan: (profile: Profile, preferences?: WorkoutPreferences) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  recordWorkout: (record: CreateRecordInput) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => {
  const planStore = usePlanStore.getState();
  const recordStore = useRecordStore.getState();

  // 监听计划状态变化
  usePlanStore.subscribe((state) => {
    const currentState = get();
    if (
      state.currentPlan !== currentState.currentPlan ||
      state.exercises !== currentState.exercises ||
      state.isLoading !== currentState.isLoading ||
      state.error !== currentState.error
    ) {
      set({
        currentPlan: state.currentPlan,
        exercises: state.exercises,
        isLoading: state.isLoading || currentState.isLoading,
        error: state.error || currentState.error
      });
    }
  });

  // 监听记录状态变化
  useRecordStore.subscribe((state) => {
    const currentState = get();
    if (
      state.records !== currentState.records ||
      state.isLoading !== currentState.isLoading ||
      state.error !== currentState.error
    ) {
      set({
        records: state.records,
        isLoading: state.isLoading || currentState.isLoading,
        error: state.error || currentState.error
      });
    }
  });

  return {
    currentPlan: planStore.currentPlan,
    exercises: planStore.exercises,
    records: recordStore.records,
    isLoading: planStore.isLoading || recordStore.isLoading,
    error: planStore.error || recordStore.error,

    fetchUserPlan: async (userId: string) => {
      if (!userId) {
        logger.error('workout', '无效的用户ID', { userId });
        set({ error: ERROR_MESSAGES.VALIDATION.INVALID_USER_ID });
        return;
      }

      try {
        set({ isLoading: true, error: null });
        logger.info('workout', '开始获取用户训练计划', { userId });
        
        // 并行获取计划和记录
        await Promise.all([
          planStore.fetchUserPlan(userId),
          recordStore.fetchMonthlyRecords(
            userId,
            new Date().getFullYear(),
            new Date().getMonth()
          )
        ]);

        logger.info('workout', '训练计划获取成功', { userId });
      } catch (error) {
        const errorMessage = handleError(error, ERROR_MESSAGES.DATABASE.FETCH_PLAN);
        logger.error('workout', '获取训练计划失败', { userId, error: errorMessage });
        set({ error: errorMessage });
      } finally {
        set({ isLoading: false });
      }
    },

    createPlan: async (plan: CreatePlanInput) => {
      if (!plan.user_id || !plan.name) {
        logger.error('workout', '创建计划参数无效', { plan });
        set({ error: ERROR_MESSAGES.VALIDATION.INVALID_PLAN_DATA });
        return;
      }

      try {
        set({ isLoading: true, error: null });
        logger.info('workout', '开始创建训练计划', { plan });
        await planStore.createPlan(plan);
        logger.info('workout', '训练计划创建成功', { planId: plan.user_id });
      } catch (error) {
        const errorMessage = handleError(error, ERROR_MESSAGES.DATABASE.CREATE_PLAN);
        logger.error('workout', '创建训练计划失败', { plan, error: errorMessage });
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    updatePlanFrequency: async (frequency: number) => {
      const currentPlan = get().currentPlan;
      if (!currentPlan?.id || frequency < 1 || frequency > 7) {
        logger.error('workout', '更新计划频率参数无效', { planId: currentPlan?.id, frequency });
        set({ error: ERROR_MESSAGES.VALIDATION.INVALID_FREQUENCY });
        return;
      }

      try {
        set({ isLoading: true, error: null });
        logger.info('workout', '开始更新训练计划频率', { planId: currentPlan.id, frequency });
        await planStore.updatePlanFrequency(currentPlan.id, frequency);
        logger.info('workout', '训练计划频率更新成功', { planId: currentPlan.id });
      } catch (error) {
        const errorMessage = handleError(error, ERROR_MESSAGES.DATABASE.UPDATE_PLAN);
        logger.error('workout', '更新训练计划频率失败', { planId: currentPlan.id, error: errorMessage });
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    regeneratePlan: async (profile: Profile, preferences?: WorkoutPreferences) => {
      if (!profile.id) {
        logger.error('workout', '无效的用户配置', { profile });
        set({ error: ERROR_MESSAGES.VALIDATION.INVALID_PROFILE });
        return;
      }

      try {
        set({ isLoading: true, error: null });
        logger.info('workout', '开始重新生成训练计划', { userId: profile.id });
        
        // 保存当前的训练频率
        const currentFrequency = get().currentPlan?.frequency || 3;
        
        // 删除现有计划
        const currentPlan = get().currentPlan;
        if (currentPlan?.id) {
          await planStore.deletePlan(currentPlan.id);
        }

        // 创建新计划
        const planName = profile.fitness_goal === 'MUSCLE_GAIN' ? '增肌训练计划' : '减脂训练计划';
        await planStore.createPlan({
          user_id: profile.id,
          name: planName,
          description: `根据您的训练偏好定制的${profile.fitness_goal === 'MUSCLE_GAIN' ? '增肌' : '减脂'}训练计划`,
          frequency: currentFrequency,
          preferences
        });

        // 重新加载计划和记录
        await get().fetchUserPlan(profile.id);
        logger.info('workout', '训练计划重新生成成功', { userId: profile.id });
      } catch (error) {
        const errorMessage = handleError(error, ERROR_MESSAGES.DATABASE.CREATE_PLAN);
        logger.error('workout', '重新生成训练计划失败', { userId: profile.id, error: errorMessage });
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    deletePlan: async (planId: string) => {
      if (!planId) {
        logger.error('workout', '无效的计划ID', { planId });
        set({ error: ERROR_MESSAGES.VALIDATION.INVALID_PLAN_ID });
        return;
      }

      try {
        set({ isLoading: true, error: null });
        logger.info('workout', '开始删除训练计划', { planId });

        // 获取当前用户ID用于后续刷新
        const userId = get().currentPlan?.user_id;

        // 删除计划
        await planStore.deletePlan(planId);

        // 清除记录状态
        set(state => ({
          ...state,
          currentPlan: null,
          exercises: [],
          records: []
        }));

        logger.info('workout', '训练计划删除成功', { planId });
      } catch (error) {
        const errorMessage = handleError(error, ERROR_MESSAGES.DATABASE.DELETE_PLAN);
        logger.error('workout', '删除训练计划失败', { planId, error: errorMessage });
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    recordWorkout: async (record: CreateRecordInput) => {
      if (!record.user_id || !record.exercise_id) {
        logger.error('workout', '无效的训练记录数据', { record });
        set({ error: ERROR_MESSAGES.VALIDATION.INVALID_RECORD_DATA });
        return;
      }

      try {
        set({ isLoading: true, error: null });
        logger.info('workout', '开始记录训练', { record });
        await recordStore.recordWorkout(record);
        logger.info('workout', '训练记录保存成功', { recordId: record.exercise_id });
      } catch (error) {
        const errorMessage = handleError(error, ERROR_MESSAGES.DATABASE.CREATE_RECORD);
        logger.error('workout', '保存训练记录失败', { record, error: errorMessage });
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    }
  };
});