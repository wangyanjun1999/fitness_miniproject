// 训练计算相关工具函数
import { logger } from './logger';

// 训练难度等级和类型定义
export type DifficultyLevel = 1 | 2 | 3;
export type ExerciseType = 'strength' | 'cardio' | 'warmup';

// 训练参数接口定义
export interface TrainingParams {
  exercise_type: ExerciseType;
  difficulty: DifficultyLevel;
  sets: number;
  reps: number;
  rest_time: number;
}

// 训练数据结果接口
export interface TrainingResult {
  duration: number;
  intensity: number;
  calories_burned: number;
}

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
  exerciseType: ExerciseType,
  difficulty: DifficultyLevel,
  completionRate: number
): number => {
  try {
    if (completionRate < 0 || completionRate > 100) {
      logger.warn('workout', '完成率超出有效范围', { completionRate });
      return 0;
    }

    const baseIntensity = difficulty * 2;
    const typeMultiplier = exerciseType === 'cardio' ? 1.2 : 
                          exerciseType === 'strength' ? 1.1 : 1;
    const completionMultiplier = Math.min(1, Math.max(0, completionRate / 100));
    
    return Math.round(baseIntensity * typeMultiplier * completionMultiplier * 10) / 10;
  } catch (error) {
    logger.error('workout', '计算训练强度时发生错误', error);
    return 0;
  }
};

// 计算训练时长（秒）
export const calculateTrainingDuration = (
  sets: number,
  reps: number,
  restTime: number,
  timePerRep: number = 3 // 默认每个动作3秒
): number => {
  const totalExerciseTime = sets * reps * timePerRep;
  const totalRestTime = Math.max(0, sets - 1) * restTime; // 最后一组后不需要休息
  return totalExerciseTime + totalRestTime;
};

// 估算卡路里消耗
export const estimateCaloriesBurned = (
  exerciseType: ExerciseType,
  duration: number, // 秒
  intensity: number,
  weight: number = 70 // 默认体重70kg
): number => {
  // MET值 (Metabolic Equivalent of Task)
  const baseMet = exerciseType === 'cardio' ? 5 :
                  exerciseType === 'strength' ? 3.5 : 2.5;
  const adjustedMet = baseMet * (intensity / 5);
  
  // 卡路里消耗 = MET * 体重(kg) * 时间(小时)
  return Math.round(adjustedMet * weight * (duration / 3600));
};

// 验证训练参数
export const validateTrainingParams = (
  sets: number,
  reps: number,
  restTime: number,
  difficulty: DifficultyLevel
): boolean => {
  try {
    // 基本参数验证
    if (sets <= 0 || reps <= 0 || restTime < 0) {
      logger.warn('workout', '训练参数无效', { sets, reps, restTime });
      return false;
    }

    // 根据难度验证参数合理性
    const maxSets = difficulty === 3 ? 6 : difficulty === 2 ? 5 : 4;
    const maxReps = difficulty === 3 ? 20 : difficulty === 2 ? 15 : 12;
    
    if (sets > maxSets || reps > maxReps) {
      logger.warn('workout', '训练参数超出难度限制', {
        difficulty,
        sets,
        maxSets,
        reps,
        maxReps
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('workout', '验证训练参数时发生错误', error);
    return false;
  }
};

// 计算训练数据
export const calculateTrainingData = (
  exercise: TrainingParams,
  completedSets: number,
  userWeight?: number
): TrainingResult => {
  try {
    logger.debug('workout', '开始计算训练数据', {
      exerciseType: exercise.exercise_type,
      difficulty: exercise.difficulty,
      completedSets
    });

    // 验证训练参数
    if (!validateTrainingParams(
      exercise.sets,
      exercise.reps,
      exercise.rest_time,
      exercise.difficulty
    )) {
      throw new Error('训练参数无效');
    }

    const completionRate = calculateCompletionRate(exercise.sets, completedSets);
    const duration = calculateTrainingDuration(
      completedSets,
      exercise.reps,
      exercise.rest_time
    );
    const intensity = estimateTrainingIntensity(
      exercise.exercise_type,
      exercise.difficulty,
      completionRate
    );
    const caloriesBurned = estimateCaloriesBurned(
      exercise.exercise_type,
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
