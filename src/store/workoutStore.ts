// 导入必要的依赖
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { WorkoutPlan, Exercise, WorkoutRecord, Profile } from '../types/database';
import { logger } from '../utils/logger';
import { validateCustomExercise, formatCustomExercise, type CustomExerciseInput } from './workout/customExercise';

// 训练计划状态管理接口定义
interface WorkoutState {
  currentPlan: WorkoutPlan | null;
  exercises: Exercise[];
  records: WorkoutRecord[];
  isLoading: boolean;
  error: string | null;
  
  fetchUserPlan: (userId: string) => Promise<void>;
  generatePlan: (profile: Profile) => Promise<void>;
  recordWorkout: (record: Omit<WorkoutRecord, 'id' | 'date'>) => Promise<void>;
  updatePlanFrequency: (planId: string, frequency: number) => Promise<void>;
  regeneratePlan: (profile: Profile) => Promise<void>;
  createPlan: (plan: { user_id: string; name: string; description: string; frequency: number }) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  addCustomExercise: (exercise: Omit<Exercise, 'id'>) => Promise<void>;
  removeExercise: (exerciseId: string) => Promise<void>;
}

// 训练动作模板接口定义
interface ExerciseTemplate {
  name: string;                // 动作名称
  category: 'strength' | 'cardio';  // 动作类别：力量或有氧
  difficulty: 1 | 2 | 3;      // 难度等级：1初级，2中级，3高级
  targetMuscles: string[];    // 目标肌群
  equipment: string[];        // 所需器材
  description: string;        // 动作描述
}

// 训练动作库
const exerciseLibrary: ExerciseTemplate[] = [
  {
    name: '俯卧撑',
    category: 'strength',
    difficulty: 1,
    targetMuscles: ['胸部', '三头肌', '肩部'],
    equipment: ['无'],
    description: '基础的上肢力量训练动作'
  },
  // ... 其他训练动作定义
];

// 根据用户信息生成训练动作 - 生成训练动作的函数
const generateExercises = (profile: Profile): Omit<Exercise, 'id' | 'plan_id'>[] => {
  logger.info('workout', '开始生成训练动作', {
    userId: profile.id,
    age: profile.age,
    fitnessGoal: profile.fitness_goal
  });

  const exercises: Omit<Exercise, 'id' | 'plan_id'>[] = [];
  const { age, fitness_goal, gender } = profile;

  // 根据年龄和性别确定训练难度
  const getDifficulty = (): 1 | 2 | 3 => {
    if (age < 25) return 3;
    if (age < 40) return 2;
    return 1;
  };
  const maxDifficulty = getDifficulty();

  logger.debug('workout', '确定训练难度', {
    age,
    maxDifficulty
  });

  // 根据目标和难度设置训练参数
  const getTrainingParams = (exerciseType: 'strength' | 'cardio') => {
    if (fitness_goal === 'MUSCLE_GAIN') {
      // 增肌训练参数设置
      if (exerciseType === 'strength') {
        switch (maxDifficulty) {
          case 3: return { sets: 4, reps: 12, rest: 90 };
          case 2: return { sets: 3, reps: 10, rest: 90 };
          case 1: return { sets: 3, reps: 8, rest: 120 };
        }
      } else {
        return { sets: 2, reps: 30, rest: 60 }; // 热身用
      }
    } else { // 减脂训练参数设置
      if (exerciseType === 'cardio') {
        switch (maxDifficulty) {
          case 3: return { sets: 4, reps: 30, rest: 30 };
          case 2: return { sets: 3, reps: 25, rest: 45 };
          case 1: return { sets: 3, reps: 20, rest: 60 };
        }
      } else {
        return { sets: 3, reps: 15, rest: 45 }; // 配合性力量训练
      }
    }
  };

  // 根据训练目标选择合适的训练动作
  const selectExercises = () => {
    const suitable = exerciseLibrary.filter(e => e.difficulty <= maxDifficulty);
    
    logger.debug('workout', '筛选合适的训练动作', {
      totalExercises: exerciseLibrary.length,
      suitableExercises: suitable.length,
      maxDifficulty
    });

    if (fitness_goal === 'MUSCLE_GAIN') {
      // 增肌训练: 主要是力量训练,配合少量有氧
      const strength = suitable.filter(e => e.category === 'strength');
      const cardio = suitable.filter(e => e.category === 'cardio');
      
      return {
        mainExercises: strength.slice(0, 4), // 4个主要力量训练
        warmupExercises: cardio.slice(0, 1)  // 1个热身运动
      };
    } else {
      // 减脂训练: 以有氧为主,配合力量训练
      const cardio = suitable.filter(e => e.category === 'cardio');
      const strength = suitable.filter(e => e.category === 'strength');
      
      return {
        mainExercises: cardio.slice(0, 3), // 3个主要有氧运动
        supportExercises: strength.slice(0, 2)  // 2个辅助力量训练
      }; 
    }
  };

  // 生成训练计划
  const selectedExercises = selectExercises();
  
  // 根据训练目标组织训练动作
  if (fitness_goal === 'MUSCLE_GAIN') {
    // 添加热身运动
    selectedExercises.warmupExercises.forEach(exercise => {
      const params = getTrainingParams('cardio');
      exercises.push({
        name: exercise.name,
        sets: params.sets,
        reps: params.reps,
        rest_time: params.rest,
        exercise_type: 'warmup',
        category: exercise.category,
        target_muscles: exercise.targetMuscles,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        notes: `热身运动: ${exercise.description}`
      });
    });

    // 添加主要力量训练
    selectedExercises.mainExercises.forEach(exercise => {
      const params = getTrainingParams('strength');
      exercises.push({
        name: exercise.name,
        sets: params.sets,
        reps: params.reps,
        rest_time: params.rest,
        exercise_type: 'strength',
        category: exercise.category,
        target_muscles: exercise.targetMuscles,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        notes: `目标肌群: ${exercise.targetMuscles.join(', ')}\n${exercise.description}`
      });
    });
  } else {
    // 添加主要有氧训练
    selectedExercises.mainExercises.forEach(exercise => {
      const params = getTrainingParams('cardio');
      exercises.push({
        name: exercise.name,
        sets: params.sets,
        reps: params.reps,
        rest_time: params.rest,
        exercise_type: 'cardio',
        category: exercise.category,
        target_muscles: exercise.targetMuscles,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        notes: `高强度有氧训练: ${exercise.description}`
      });
    });

    // 添加配合性力量训练
    selectedExercises.supportExercises.forEach(exercise => {
      const params = getTrainingParams('strength');
      exercises.push({
        name: exercise.name,
        sets: params.sets,
        reps: params.reps,
        rest_time: params.rest,
        exercise_type: 'strength',
        category: exercise.category,
        target_muscles: exercise.targetMuscles,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        notes: `配合性力量训练: ${exercise.description}`
      });
    });
  }

  logger.info('workout', '训练动作生成完成', {
    exerciseCount: exercises.length,
    fitnessGoal: fitness_goal
  });

  return exercises;
};

// 创建训练计划状态管理 store
const useWorkoutStore = create<WorkoutState>((set, get) => ({
  // 添加自定义训练项目
  addCustomExercise: async (exercise: CustomExerciseInput) => {
    try {
      logger.info('workout', '开始添加自定义训练项目', { exercise });
      set({ isLoading: true, error: null });

      // 验证输入
      validateCustomExercise(exercise);

      const currentPlan = get().currentPlan;
      if (!currentPlan) {
        throw new Error('没有找到当前训练计划');
      }

      // 格式化训练动作
      const formattedExercise = formatCustomExercise(exercise);

      const { data: newExercise, error } = await supabase
        .from('exercises')
        .insert([{
          ...formattedExercise,
          plan_id: currentPlan.id
        }])
        .select()
        .single();

      if (error) {
        logger.error('workout', '添加训练项目失败', error);
        throw error;
      }

      logger.info('workout', '成功添加训练项目', { exerciseId: newExercise.id });
      set(state => ({
        exercises: [...state.exercises, newExercise]
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '添加训练项目失败';
      logger.error('workout', errorMessage, error);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  // 删除训练项目
  removeExercise: async (exerciseId: string) => {
    try {
      logger.info('workout', '开始删除训练项目', { exerciseId });
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) {
        logger.error('workout', '删除训练项目失败', error);
        throw error;
      }

      logger.info('workout', '成功删除训练项目', { exerciseId });
      set(state => ({
        exercises: state.exercises.filter(e => e.id !== exerciseId)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除训练项目失败';
      logger.error('workout', errorMessage, error);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },
  currentPlan: null,
  exercises: [],
  records: [],
  isLoading: false,
  error: null,

  fetchUserPlan: async (userId: string) => {
    try {
      logger.info('workout', '开始获取用户训练计划', { userId });
      set({ isLoading: true, error: null });
      
      const { data: plans, error: planError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (planError) {
        logger.error('workout', '获取训练计划失败', planError);
        throw planError;
      }

      if (plans && plans.length > 0) {
        const currentPlan = plans[0];
        logger.debug('workout', '找到用户训练计划', { planId: currentPlan.id });
        
        const { data: exercises, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .eq('plan_id', currentPlan.id);

        if (exercisesError) {
          logger.error('workout', '获取训练动作失败', exercisesError);
          throw exercisesError;
        }

        // Get the entire month's records in user's local timezone
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const { data: records, error: recordsError } = await supabase
          .from('workout_records')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startOfMonth.toISOString())
          .lte('date', endOfMonth.toISOString());

        if (recordsError) {
          logger.error('workout', '获取训练记录失败', recordsError);
          throw recordsError;
        }

        logger.info('workout', '成功获取训练计划和记录', {
          planId: currentPlan.id,
          exerciseCount: exercises?.length || 0,
          recordCount: records?.length || 0
        });

        set({ 
          currentPlan,
          exercises: exercises || [],
          records: records || [],
          error: null
        });
      } else {
        logger.info('workout', '用户没有训练计划', { userId });
        set({ 
          currentPlan: null, 
          exercises: [], 
          records: [],
          error: null
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取训练计划失败';
      logger.error('workout', errorMessage, error);
      set({ 
        error: errorMessage,
        currentPlan: null,
        exercises: [],
        records: []
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createPlan: async (plan) => {
    try {
      logger.info('workout', '开始创建训练计划', { userId: plan.user_id });
      set({ isLoading: true, error: null });

      const { data: newPlan, error: planError } = await supabase
        .from('workout_plans')
        .insert([plan])
        .select()
        .single();

      if (planError) {
        logger.error('workout', '创建训练计划失败', planError);
        throw planError;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', plan.user_id)
        .single();

      if (profileError) {
        logger.error('workout', '获取用户资料失败', profileError);
        throw profileError;
      }

      const exercises = generateExercises(profile);

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(
          exercises.map(exercise => ({
            ...exercise,
            plan_id: newPlan.id
          }))
        );

      if (exercisesError) {
        logger.error('workout', '创建训练动作失败', exercisesError);
        throw exercisesError;
      }

      logger.info('workout', '训练计划创建成功', {
        planId: newPlan.id,
        exerciseCount: exercises.length
      });

      await get().fetchUserPlan(plan.user_id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建训练计划失败';
      logger.error('workout', errorMessage, error);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  generatePlan: async (profile: Profile) => {
    try {
      logger.info('workout', '开始生成训练计划', { 
        userId: profile.id,
        fitnessGoal: profile.fitness_goal
      });
      set({ isLoading: true, error: null });

      const planName = profile.fitness_goal === 'MUSCLE_GAIN' ? '增肌训练计划' : '减脂训练计划';
      const { data: newPlan, error: planError } = await supabase
        .from('workout_plans')
        .insert([{
          user_id: profile.id,
          name: planName,
          description: `根据您的个人情况定制的${profile.fitness_goal === 'MUSCLE_GAIN' ? '增肌' : '减脂'}训练计划`,
          frequency: 3
        }])
        .select()
        .single();

      if (planError) {
        logger.error('workout', '创建训练计划失败', planError);
        throw planError;
      }

      const exercises = generateExercises(profile);

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(
          exercises.map(exercise => ({
            ...exercise,
            plan_id: newPlan.id
          }))
        );

      if (exercisesError) {
        logger.error('workout', '创建训练动作失败', exercisesError);
        throw exercisesError;
      }

      logger.info('workout', '训练计划生成成功', {
        planId: newPlan.id,
        exerciseCount: exercises.length
      });

      await get().fetchUserPlan(profile.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成训练计划失败';
      logger.error('workout', errorMessage, error);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  recordWorkout: async (record) => {
    try {
      logger.info('workout', '开始记录训练', {
        userId: record.user_id,
        exerciseId: record.exercise_id
      });
      set({ isLoading: true, error: null });
      
      // Ensure the exercise exists
      const exercise = get().exercises.find(e => e.id === record.exercise_id);
      if (!exercise) {
        logger.error('workout', '找不到对应的训练项目', { exerciseId: record.exercise_id });
        throw new Error('找不到对应的训练项目');
      }

      // Get today's date boundaries in user's local timezone
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      
      // Get existing record for today
      const { data: existingRecords, error: fetchError } = await supabase
        .from('workout_records')
        .select('*')
        .eq('user_id', record.user_id)
        .eq('exercise_id', record.exercise_id)
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString());

      if (fetchError) {
        logger.error('workout', '获取现有记录失败', fetchError);
        throw fetchError;
      }

      const existingRecord = existingRecords?.[0];
      
      try {
        if (existingRecord) {
          if (existingRecord.completed_sets === record.completed_sets) {
            // Delete record if toggling same state
            logger.info('workout', '删除训练记录', { recordId: existingRecord.id });
            await supabase
              .from('workout_records')
              .delete()
              .eq('id', existingRecord.id);
          } else {
            // Update to new state
            logger.info('workout', '更新训练记录', {
              recordId: existingRecord.id,
              completedSets: record.completed_sets
            });
            await supabase
              .from('workout_records')
              .update({
                completed_sets: record.completed_sets,
                completed_reps: record.completed_reps,
                notes: record.notes,
                date: new Date().toISOString()
              })
              .eq('id', existingRecord.id);
          }
        } else if (record.completed_sets > 0) {
          // Create new record
          logger.info('workout', '创建新训练记录', {
            exerciseId: record.exercise_id,
            completedSets: record.completed_sets
          });
          await supabase
            .from('workout_records')
            .insert([{
              ...record,
              date: new Date().toISOString()
            }]);
        }

        // Refresh records for the entire month
        await get().fetchUserPlan(record.user_id);
      } catch (error) {
        logger.error('workout', '更新训练记录失败', error);
        throw new Error('更新训练记录失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '记录训练状态失败';
      logger.error('workout', errorMessage, error);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  updatePlanFrequency: async (planId: string, frequency: number) => {
    try {
      logger.info('workout', '开始更新训练频率', { planId, frequency });
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('workout_plans')
        .update({ frequency })
        .eq('id', planId);

      if (error) {
        logger.error('workout', '更新训练频率失败', error);
        throw error;
      }

      const currentPlan = get().currentPlan;
      if (currentPlan) {
        logger.info('workout', '训练频率更新成功', {
          planId,
          oldFrequency: currentPlan.frequency,
          newFrequency: frequency
        });
        set({ 
          currentPlan: { 
            ...currentPlan, 
            frequency 
          } 
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新训练频率失败';
      logger.error('workout', errorMessage, error);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  regeneratePlan: async (profile: Profile) => {
    try {
      logger.info('workout', '开始重新生成训练计划', {
        userId: profile.id,
        fitnessGoal: profile.fitness_goal
      });
      set({ isLoading: true, error: null });

      const currentFrequency = get().currentPlan?.frequency || 3;

      const planName = profile.fitness_goal === 'MUSCLE_GAIN' ? '增肌训练计划' : '减脂训练计划';
      const { data: newPlan, error: planError } = await supabase
        .from('workout_plans')
        .insert([{
          user_id: profile.id,
          name: planName,
          description: `根据您最新的个人情况重新定制的${profile.fitness_goal === 'MUSCLE_GAIN' ? '增肌' : '减脂'}训练计划`,
          frequency: currentFrequency
        }])
        .select()
        .single();

      if (planError) {
        logger.error('workout', '创建新训练计划失败', planError);
        throw planError;
      }

      const exercises = generateExercises(profile);

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(
          exercises.map(exercise => ({
            ...exercise,
            plan_id: newPlan.id
          }))
        );

      if (exercisesError) {
        logger.error('workout', '创建训练动作失败', exercisesError);
        throw exercisesError;
      }

      logger.info('workout', '训练计划重新生成成功', {
        planId: newPlan.id,
        exerciseCount: exercises.length
      });

      await get().fetchUserPlan(profile.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '重新生成训练计划失败';
      logger.error('workout', errorMessage, error);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  deletePlan: async (planId: string) => {
    try {
      logger.info('workout', '开始删除训练计划', { planId });
      set({ isLoading: true, error: null });

      // Delete the plan (cascade will handle related records)
      const { error: planError } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId);

      if (planError) {
        logger.error('workout', '删除训练计划失败', planError);
        throw planError;
      }

      logger.info('workout', '训练计划删除成功', { planId });

      // Clear current state
      set({ 
        currentPlan: null,
        exercises: [],
        records: [],
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除训练计划失败';
      logger.error('workout', errorMessage, error);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export { useWorkoutStore };