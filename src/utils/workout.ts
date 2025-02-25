// 训练相关工具函数
import { logger } from './logger';

// 计算训练完成率
export const calculateCompletionRate = (
  totalExercises: number,
  completedExercises: number
): number => {
  if (totalExercises === 0) return 0;
  return Math.min(100, Math.round((completedExercises / totalExercises) * 100));
};

// 计算训练量
export const calculateTrainingVolume = (
  sets: number,
  reps: number,
  weight: number = 0
): number => {
  return Math.max(0, sets * reps * (weight || 1));
};

// 估算训练强度
export const estimateTrainingIntensity = (
  exerciseType: 'strength' | 'cardio',
  difficulty: 1 | 2 | 3,
  completionRate: number
): number => {
  const baseIntensity = difficulty * 2;
  const typeMultiplier = exerciseType === 'strength' ? 1.2 : 1;
  const completionMultiplier = Math.min(1, Math.max(0, completionRate / 100));
  
  return Math.round(baseIntensity * typeMultiplier * completionMultiplier * 10) / 10;
};

// 计算训练时长
export const calculateTrainingDuration = (
  sets: number,
  reps: number,
  restTime: number,
  timePerRep: number = 3 // 默认每个动作3秒
): number => {
  const totalExerciseTime = sets * reps * timePerRep;
  const totalRestTime = (sets - 1) * restTime; // 最后一组后不需要休息
  return totalExerciseTime + totalRestTime;
};

// 估算卡路里消耗
export const estimateCaloriesBurned = (
  exerciseType: 'strength' | 'cardio',
  duration: number, // 秒
  intensity: number,
  weight: number = 70 // 默认体重70kg
): number => {
  // MET值 (Metabolic Equivalent of Task)
  const baseMet = exerciseType === 'strength' ? 3.5 : 5;
  const adjustedMet = baseMet * (intensity / 5);
  
  // 卡路里消耗 = MET * 体重(kg) * 时间(小时)
  return Math.round(adjustedMet * weight * (duration / 3600));
};

// 计算训练数据
export const calculateTrainingData = (
  exercise: {
    exercise_type: 'warmup' | 'strength' | 'cardio';
    difficulty: number;
    sets: number;
    reps: number;
    rest_time: number;
  },
  completedSets: number,
  userWeight?: number
) => {
  try {
    logger.debug('workout', '开始计算训练数据', {
      exerciseType: exercise.exercise_type,
      difficulty: exercise.difficulty,
      completedSets
    });

    const completionRate = (completedSets / exercise.sets) * 100;
    const duration = calculateTrainingDuration(
      completedSets,
      exercise.reps,
      exercise.rest_time
    );
    const intensity = estimateTrainingIntensity(
      exercise.exercise_type === 'cardio' ? 'cardio' : 'strength',
      exercise.difficulty as 1 | 2 | 3,
      completionRate
    );
    const caloriesBurned = estimateCaloriesBurned(
      exercise.exercise_type === 'cardio' ? 'cardio' : 'strength',
      duration,
      intensity,
      userWeight
    );

    logger.debug('workout', '训练数据计算完成', {
      duration,
      intensity,
      caloriesBurned
    });

    return {
      duration,
      intensity,
      calories_burned: caloriesBurned
    };
  } catch (error) {
    logger.error('workout', '计算训练数据失败', error);
    return {
      duration: 0,
      intensity: 0,
      calories_burned: 0
    };
  }
};