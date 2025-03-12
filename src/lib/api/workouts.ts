// 引入必要的依赖
import { supabase } from '../supabase';
import { logApi } from './logs';
import type { Plan } from '../../types/database';

// 添加训练计划的参数接口
interface AddWorkoutParams {
  user_id: string;       // 用户ID
  exercise_id: number;   // 运动项目ID
  sets: number;         // 组数
  reps: number;         // 每组重复次数/时长
  date: string;         // 日期
}

// 训练计划相关的API操作
export const workoutApi = {
  // 获取今天的训练计划
  async getTodaysWorkouts(userId: string): Promise<Plan[]> {
    const today = new Date().toISOString().split('T')[0];  // 获取今天的日期
    const { data, error } = await supabase
      .from('plans')
      .select('*, exercises(*)')   // 选择所有字段，并关联exercises表
      .eq('user_id', userId)       // 匹配用户ID
      .eq('date', today)           // 匹配今天的日期
      .order('created_at', { ascending: true });  // 按创建时间升序排序

    if (error) throw error;
    return data || [];
  },

  // 获取指定月份的训练计划
  async getMonthWorkouts(userId: string, date: Date): Promise<Plan[]> {
    // 计算月份的起始和结束日期
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('plans')
      .select('*, exercises(*)')
      .eq('user_id', userId)
      .gte('date', startOfMonth.toISOString().split('T')[0])  // 大于等于月初
      .lte('date', endOfMonth.toISOString().split('T')[0])    // 小于等于月末
      .order('date');

    if (error) throw error;
    return data || [];
  },

  // 切换训练计划的完成状态
  async toggleWorkoutCompletion(planId: number, currentStatus: boolean): Promise<void> {
    const { error } = await supabase
      .from('plans')
      .update({ completed: !currentStatus })  // 切换完成状态
      .eq('id', planId);

    if (error) throw error;
  },

  // 添加新的训练计划
  async addWorkout(params: AddWorkoutParams): Promise<void> {
    const { error } = await supabase
      .from('plans')
      .insert([params]);

    if (error) throw error;

    // 记录添加训练计划的操作日志
    await logApi.createLog(params.user_id, 'ADD_WORKOUT', {
      exercise_id: params.exercise_id,
      date: params.date,
      sets: params.sets,
      reps: params.reps
    });
  },

  // 删除训练计划
  async deleteWorkout(planId: number): Promise<void> {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId);

    if (error) throw error;
  }
};