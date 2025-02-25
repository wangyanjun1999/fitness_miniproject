import { Exercise } from '../../types/database';
import { createError } from './utils';
import { logger } from '../../utils/logger';

// 自定义训练动作输入接口
export interface CustomExerciseInput {
  name: string;
  exercise_type: 'warmup' | 'strength' | 'cardio';
  category: 'strength' | 'cardio';
  target_muscles: string[];
  equipment: string[];
  difficulty: 1 | 2 | 3;
  sets: number;
  reps: number;
  rest_time: number;
  notes?: string;
}

// 验证自定义训练动作输入
export const validateCustomExercise = (input: CustomExerciseInput): void => {
  // 验证必填字段
  if (!input.name?.trim()) {
    throw createError('VALIDATION', '训练动作名称不能为空');
  }

  if (!input.target_muscles?.length) {
    throw createError('VALIDATION', '请至少选择一个目标肌群');
  }

  // 验证训练参数范围
  if (input.sets < 1 || input.sets > 6) {
    throw createError('VALIDATION', '训练组数必须在1-6组之间');
  }

  if (input.reps < 1 || input.reps > 50) {
    throw createError('VALIDATION', '每组次数必须在1-50次之间');
  }

  if (input.rest_time < 30 || input.rest_time > 180) {
    throw createError('VALIDATION', '休息时间必须在30-180秒之间');
  }

  // 验证难度等级
  if (![1, 2, 3].includes(input.difficulty)) {
    throw createError('VALIDATION', '难度等级必须为1-3级');
  }

  logger.debug('workout', '自定义训练动作验证通过', input);
};

// 格式化自定义训练动作
export const formatCustomExercise = (
  input: CustomExerciseInput
): Omit<Exercise, 'id' | 'plan_id'> => {
  return {
    name: input.name.trim(),
    exercise_type: input.exercise_type,
    category: input.category,
    target_muscles: input.target_muscles,
    equipment: input.equipment,
    difficulty: input.difficulty,
    sets: input.sets,
    reps: input.reps,
    rest_time: input.rest_time,
    notes: input.notes?.trim() || ''
  };
};