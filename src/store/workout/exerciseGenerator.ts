// 训练动作生成器优化
import type { Exercise, Profile } from '../../types/database';
import type { WorkoutPreferences } from './types';
import { trainingConfig } from './constants';
import { createError } from './utils';
import { ERROR_MESSAGES } from './constants';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

// 随机打乱数组
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 根据用户偏好和个人信息确定训练难度
const getDifficulty = (
  age: number,
  preferences?: WorkoutPreferences
): 1 | 2 | 3 => {
  if (preferences?.difficulty) {
    const difficultyMap: Record<string, 1 | 2 | 3> = {
      easy: 1,
      medium: 2,
      hard: 3
    };
    return difficultyMap[preferences.difficulty] as 1 | 2 | 3;
  }
  return age < 25 ? 3 : age < 40 ? 2 : 1;
};

// 获取训练参数
const getTrainingParams = (
  exerciseType: 'strength' | 'cardio',
  fitnessGoal: 'MUSCLE_GAIN' | 'FAT_LOSS',
  difficulty: 1 | 2 | 3,
  timePerSession?: number
) => {
  const config = fitnessGoal === 'MUSCLE_GAIN' 
    ? trainingConfig.muscleGain 
    : trainingConfig.fatLoss;

  let params;
  if (fitnessGoal === 'MUSCLE_GAIN') {
    params = exerciseType === 'strength'
      ? config.strength[difficulty.toString() as keyof typeof config.strength]
      : config.cardio[difficulty.toString() as keyof typeof config.cardio];
  } else {
    params = exerciseType === 'cardio'
      ? config.cardio[difficulty.toString() as keyof typeof config.cardio]
      : config.strength[difficulty.toString() as keyof typeof config.strength];
  }

  // 根据训练时长调整参数
  if (timePerSession && typeof params === 'object') {
    const timeAdjustment = timePerSession / 45; // 基准时间45分钟
    params = {
      sets: Math.min(6, Math.round((params as any).sets * timeAdjustment)),
      reps: (params as any).reps,
      rest_time: Math.max(30, Math.round((params as any).rest * timeAdjustment))
    };
  }

  return params;
};

// 从数据库获取训练动作
const fetchExercises = async (maxDifficulty: number) => {
  try {
    logger.debug('workout', '开始获取训练动作库', { maxDifficulty });
    
    const { data, error } = await supabase
      .from('exercise_library')
      .select('*')
      .lte('difficulty', maxDifficulty);

    if (error) {
      logger.error('database', '获取训练动作库失败', error);
      throw error;
    }

    if (!data || data.length === 0) {
      logger.error('workout', '训练动作库为空', { maxDifficulty });
      throw createError('DATABASE', '训练动作库为空，请联系管理员添加训练动作');
    }

    // 验证数据完整性
    const validExercises = data.filter(exercise => 
      exercise.name && 
      exercise.category && 
      exercise.target_muscles && 
      exercise.target_muscles.length > 0
    );

    if (validExercises.length === 0) {
      logger.error('workout', '没有找到有效的训练动作', { 
        totalExercises: data.length,
        maxDifficulty 
      });
      throw createError('DATABASE', '没有找到有效的训练动作');
    }

    logger.debug('workout', '成功获取训练动作库', { 
      totalExercises: data.length,
      validExercises: validExercises.length
    });

    return validExercises;
  } catch (error) {
    logger.error('database', '获取训练动作时发生错误', error);
    throw createError('DATABASE', '获取训练动作失败');
  }
};

// 根据用户偏好过滤训练动作
const filterExercisesByPreferences = (
  exercises: Exercise[],
  preferences?: WorkoutPreferences
): Exercise[] => {
  if (!preferences?.focus_areas?.length) {
    return shuffleArray(exercises);
  }

  // 肌群映射
  const muscleGroupMap = {
    chest: ['胸部'],
    back: ['背部'],
    legs: ['大腿', '臀部'],
    core: ['核心'],
    arms: ['二头肌', '三头肌'],
    shoulders: ['肩部']
  };

  const targetMuscles = preferences.focus_areas.flatMap(
    area => muscleGroupMap[area as keyof typeof muscleGroupMap] || []
  );

  logger.debug('workout', '根据偏好过滤训练动作', {
    focusAreas: preferences.focus_areas,
    targetMuscles,
    totalExercises: exercises.length
  });

  // 将动作分为匹配和不匹配两组
  const matching = exercises.filter(e => 
    e.target_muscles?.some(m => targetMuscles.includes(m))
  );
  const others = exercises.filter(e => 
    !e.target_muscles?.some(m => targetMuscles.includes(m))
  );

  logger.debug('workout', '动作过滤结果', {
    matchingExercises: matching.length,
    otherExercises: others.length
  });

  // 打乱并合并数组
  return [...shuffleArray(matching), ...shuffleArray(others)];
};

// 生成训练动作
export const generateExercises = async (
  profile: Profile,
  preferences?: WorkoutPreferences
): Promise<Omit<Exercise, 'id' | 'plan_id'>[]> => {
  if (!profile.age || !profile.fitness_goal) {
    throw createError('VALIDATION', ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED);
  }

  logger.info('workout', '开始生成训练动作', {
    userId: profile.id,
    fitnessGoal: profile.fitness_goal,
    preferences
  });

  const exercises: Omit<Exercise, 'id' | 'plan_id'>[] = [];
  const maxDifficulty = getDifficulty(profile.age, preferences);
  
  // 从数据库获取适合难度的动作
  const libraryExercises = await fetchExercises(maxDifficulty);
  
  if (libraryExercises.length === 0) {
    logger.error('workout', '没有找到合适的训练动作', { maxDifficulty });
    throw createError('VALIDATION', '没有合适难度的训练动作');
  }

  // 根据偏好过滤动作
  const filteredExercises = filterExercisesByPreferences(libraryExercises, preferences);

  if (profile.fitness_goal === 'MUSCLE_GAIN') {
    // 增肌训练：主要是力量训练，配合少量有氧
    const strength = filteredExercises.filter(e => e.category === 'strength');
    const cardio = filteredExercises.filter(e => e.category === 'cardio');

    logger.debug('workout', '增肌训练动作分类', {
      strengthExercises: strength.length,
      cardioExercises: cardio.length
    });

    // 添加1个热身有氧运动
    if (cardio.length > 0) {
      const warmup = cardio[0];
      const params = getTrainingParams(
        'cardio',
        profile.fitness_goal,
        maxDifficulty,
        preferences?.time_per_session
      );
      exercises.push({
        name: warmup.name,
        sets: params.sets,
        reps: params.reps,
        rest_time: params.rest_time,
        exercise_type: 'cardio',
        category: warmup.category,
        target_muscles: warmup.target_muscles || [],
        equipment: warmup.equipment || [],
        difficulty: warmup.difficulty || 1,
        notes: `热身运动: ${warmup.notes || ''}`
      });
    }

    // 添加4个力量训练
    const selectedStrength = shuffleArray(strength).slice(0, 4);
    selectedStrength.forEach(exercise => {
      const params = getTrainingParams(
        'strength',
        profile.fitness_goal || 'MUSCLE_GAIN',
        maxDifficulty,
        preferences?.time_per_session
      );
      exercises.push({
        name: exercise.name,
        sets: params.sets,
        reps: params.reps,
        rest_time: params.rest_time,
        exercise_type: 'strength',
        category: exercise.category,
        target_muscles: exercise.target_muscles,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        notes: exercise.notes || ''
      });
    });
  } else {
    // 减脂训练：以有氧为主，配合力量训练
    const cardio = filteredExercises.filter(e => e.category === 'cardio');
    const strength = filteredExercises.filter(e => e.category === 'strength');

    logger.debug('workout', '减脂训练动作分类', {
      cardioExercises: cardio.length,
      strengthExercises: strength.length
    });

    // 添加3个有氧训练
    const selectedCardio = shuffleArray(cardio).slice(0, 3);
    selectedCardio.forEach(exercise => {
      const params = getTrainingParams(
        'cardio',
        profile.fitness_goal || 'FAT_LOSS',
        maxDifficulty,
        preferences?.time_per_session
      );
      exercises.push({
        name: exercise.name,
        sets: params.sets,
        reps: params.reps,
        rest_time: params.rest_time,
        exercise_type: 'cardio',
        category: exercise.category,
        target_muscles: exercise.target_muscles,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        notes: exercise.notes || ''
      });
    });

    // 添加2个配合性力量训练
    const selectedStrength = shuffleArray(strength).slice(0, 2);
    selectedStrength.forEach(exercise => {
      const params = getTrainingParams(
        'strength',
        profile.fitness_goal || 'FAT_LOSS',
        maxDifficulty,
        preferences?.time_per_session
      );
      exercises.push({
        name: exercise.name,
        sets: params.sets,
        reps: params.reps,
        rest_time: params.rest_time,
        exercise_type: 'strength',
        category: exercise.category,
        target_muscles: exercise.target_muscles,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        notes: exercise.notes || ''
      });
    });
  }

  logger.info('workout', '训练动作生成完成', {
    exerciseCount: exercises.length,
    fitnessGoal: profile.fitness_goal
  });

  return shuffleArray(exercises); // 最后再打乱顺序
};