// 引入必要的依赖
import { supabase } from '../supabase';
import type { Exercise } from '../../types/database';

// 运动项目相关的API操作
export const exerciseApi = {
  // 获取所有运动项目
  async getAllExercises(): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')    // 从exercises表中查询
      .select()            // 选择所有字段
      .order('name');      // 按名称排序

    if (error) throw error;
    return data || [];
  },

  // 根据类型获取运动项目（力量训练或有氧运动）
  async getExercisesByType(type: 'strength' | 'cardio'): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select()
      .eq('type', type)    // 匹配指定类型
      .order('name');      // 按名称排序

    if (error) throw error;
    return data || [];
  }
};