// 引入必要的依赖
import { supabase } from '../supabase';
import { logApi } from './logs';
import type { Profile } from '../../types/database';

// 更新用户档案的参数接口
interface ProfileUpdate {
  id: string;             // 用户ID
  height: number | null;  // 身高
  weight: number | null;  // 体重
  goal: string | null;    // 健身目标
}

// 用户档案相关的API操作
export const profileApi = {
  // 更新用户档案信息
  async updateProfile(updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)           // 更新指定字段
      .eq('id', updates.id)      // 匹配用户ID
      .select()                  // 返回更新后的数据
      .single();                 // 只返回一条记录

    if (error) throw error;

    // 记录档案更新的操作日志
    await logApi.createLog(updates.id, 'UPDATE_PROFILE', {
      height: updates.height,
      weight: updates.weight,
      goal: updates.goal
    });

    return data;
  }
};