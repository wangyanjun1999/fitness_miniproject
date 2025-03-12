// 引入必要的依赖
import { supabase } from '../supabase';
import type { ActivityLog } from '../../types/database';

// 活动日志相关的API操作
export const logApi = {
  // 创建新的活动日志
  async createLog(userId: string, action: string, details: Record<string, any> = {}): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert([{
          user_id: userId,   // 用户ID
          action,            // 操作类型
          details           // 操作详情
        }]);

      if (error) throw error;

      // 添加控制台日志记录
      console.log(`[Activity Log] ${action}`, {
        timestamp: new Date().toISOString(),
        userId,
        details
      });
    } catch (err) {
      console.error('Error creating activity log:', err);
      // 不抛出错误 - 日志记录不应影响主要功能
    }
  },

  // 获取用户的活动日志
  async getUserLogs(userId: string, limit: number = 50): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select()
      .eq('user_id', userId)                    // 匹配用户ID
      .order('created_at', { ascending: false }) // 按创建时间降序排序
      .limit(limit);                            // 限制返回数量

    if (error) throw error;
    return data || [];
  }
};