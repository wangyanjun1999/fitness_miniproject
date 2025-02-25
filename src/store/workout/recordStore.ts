import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { WorkoutRecordState, CreateRecordInput } from './types';
import { getStartOfDay, getEndOfDay, createError, handleError } from './utils';
import { ERROR_MESSAGES } from './constants';
import { logger } from '../../utils/logger';
import { calculateTrainingData } from '../../utils/workout';

// 定义性能装饰器
function logPerformance() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      try {
        return await originalMethod.apply(this, args);
      } finally {
        const end = performance.now();
        logger.info('performance', `${propertyKey} execution time`, {
          duration: `${end - start}ms`
        });
      }
    };
    return descriptor;
  };
}

export const useRecordStore = create<WorkoutRecordState>((set, get) => ({
  records: [],
  isLoading: false,
  error: null,

  recordWorkout: async function(record: CreateRecordInput) {
    try {
      set({ isLoading: true, error: null });
      logger.info('workout', '开始记录训练', {
        userId: record.user_id,
        exerciseId: record.exercise_id
      });
      
      // 参数验证
      if (!record.user_id || !record.exercise_id) {
        throw createError('VALIDATION', ERROR_MESSAGES.VALIDATION.INVALID_RECORD_DATA);
      }
      
      // Get today's date boundaries in user's local timezone
      const now = new Date();
      const startOfDay = getStartOfDay(now);
      const endOfDay = getEndOfDay(now);
      
      // Get existing record for today
      const { data: existingRecords, error: fetchError } = await supabase
        .from('workout_records')
        .select('*')
        .eq('user_id', record.user_id)
        .eq('exercise_id', record.exercise_id)
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString());

      if (fetchError) {
        throw createError('DATABASE', ERROR_MESSAGES.DATABASE.FETCH_RECORDS);
      }

      const existingRecord = existingRecords?.[0];
      
      // 获取训练动作信息
      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', record.exercise_id)
        .single();

      if (exerciseError || !exercise) {
        throw createError('DATABASE', '获取训练动作信息失败');
      }

      // 获取用户信息（用于计算卡路里消耗）
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('weight')
        .eq('id', record.user_id)
        .single();

      if (profileError) {
        throw createError('DATABASE', '获取用户信息失败');
      }

      // 计算训练数据
      const trainingData = calculateTrainingData(
        exercise,
        record.completed_sets,
        profile?.weight
      );

      // 处理记录更新或创建
      if (existingRecord) {
        if (existingRecord.completed_sets === record.completed_sets) {
          // 删除记录
          const { error: deleteError } = await supabase
            .from('workout_records')
            .delete()
            .eq('id', existingRecord.id);

          if (deleteError) {
            throw createError('DATABASE', ERROR_MESSAGES.DATABASE.DELETE_RECORD);
          }

          set(state => ({
            records: state.records.filter(r => r.id !== existingRecord.id)
          }));
          
          logger.info('workout', '训练记录已删除', { recordId: existingRecord.id });
        } else {
          // 更新记录
          const { data: updatedRecord, error: updateError } = await supabase
            .from('workout_records')
            .update({
              completed_sets: record.completed_sets,
              completed_reps: record.completed_reps,
              training_data: trainingData,
              notes: record.notes,
              date: new Date().toISOString()
            })
            .eq('id', existingRecord.id)
            .select()
            .single();

          if (updateError || !updatedRecord) {
            throw createError('DATABASE', ERROR_MESSAGES.DATABASE.UPDATE_RECORD);
          }

          set(state => ({
            records: state.records.map(r => 
              r.id === existingRecord.id ? updatedRecord : r
            )
          }));
          
          logger.info('workout', '训练记录已更新', {
            recordId: existingRecord.id,
            completedSets: record.completed_sets
          });
        }
      } else if (record.completed_sets > 0) {
        // 创建新记录
        const { data: newRecord, error: insertError } = await supabase
          .from('workout_records')
          .insert([{
            ...record,
            training_data: trainingData,
            date: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError || !newRecord) {
          throw createError('DATABASE', ERROR_MESSAGES.DATABASE.CREATE_RECORD);
        }

        set(state => ({
          records: [...state.records, newRecord]
        }));
        
        logger.info('workout', '新训练记录已创建', {
          recordId: newRecord.id,
          exerciseId: record.exercise_id
        });
      }

      set({ error: null });
    } catch (error) {
      const errorMessage = handleError(error, ERROR_MESSAGES.DATABASE.CREATE_RECORD);
      logger.error('workout', '记录训练失败', { error: errorMessage });
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMonthlyRecords: async function(userId: string, year: number, month: number) {
    try {
      set({ isLoading: true, error: null });
      logger.info('workout', '开始获取月度训练记录', { userId, year, month });

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const { data: records, error } = await supabase
        .from('workout_records')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startOfMonth.toISOString())
        .lte('date', endOfMonth.toISOString());

      if (error) {
        logger.error('database', '获取训练记录失败', error);
        throw createError('DATABASE', ERROR_MESSAGES.DATABASE.FETCH_RECORDS);
      }

      logger.info('workout', '成功获取月度训练记录', {
        userId,
        recordCount: records?.length || 0,
        month: `${year}-${month + 1}`
      });

      set({ records: records || [], error: null });
    } catch (error) {
      const errorMessage = handleError(error, ERROR_MESSAGES.DATABASE.FETCH_RECORDS);
      logger.error('workout', errorMessage, error);
      set({ 
        error: errorMessage,
        records: []
      });
    } finally {
      set({ isLoading: false });
    }
  }
}));