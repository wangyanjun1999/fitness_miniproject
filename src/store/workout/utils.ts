// 工具函数优化
import { ErrorType, ERROR_MESSAGES } from './constants';

/**
 * 日期处理工具函数
 */

// 获取当天的开始时间
export const getStartOfDay = (date: Date = new Date()): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// 获取当天的结束时间
export const getEndOfDay = (date: Date = new Date()): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

// 获取月份的开始时间
export const getStartOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

// 获取月份的结束时间
export const getEndOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
};

/**
 * 错误处理工具函数
 */

// 自定义错误类
export class WorkoutError extends Error {
  constructor(
    message: string,
    public type: keyof typeof ErrorType,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'WorkoutError';
    // 修复 instanceof 检查在某些环境下失效的问题
    Object.setPrototypeOf(this, WorkoutError.prototype);
  }

  static isWorkoutError(error: unknown): error is WorkoutError {
    return error instanceof WorkoutError;
  }
}

// 创建错误实例
export const createError = (
  type: keyof typeof ErrorType,
  message: string,
  details?: Record<string, any>
): WorkoutError => {
  return new WorkoutError(message, type, details);
};

// 统一错误处理
export const handleError = (error: unknown, defaultMessage: string): string => {
  if (WorkoutError.isWorkoutError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

/**
 * 数据验证工具函数
 */

// 验证日期是否有效
export const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

// 格式化日期
export const formatDate = (date: Date): string => {
  if (!isValidDate(date)) {
    throw createError('VALIDATION', ERROR_MESSAGES.VALIDATION.INVALID_DATE);
  }
  return date.toISOString();
};

/**
 * 训练进度评估工具函数
 */

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