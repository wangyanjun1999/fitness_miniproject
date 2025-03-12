// 引入必要的依赖
import { useState, useEffect } from 'react';
import { workoutApi } from '../lib/api/workouts';
import { logApi } from '../lib/api/logs';
import type { Plan } from '../types/database';

// 训练计划管理的自定义Hook
export function useWorkouts(userId: string | undefined) {
  // 状态管理
  const [workouts, setWorkouts] = useState<Plan[]>([]);  // 训练计划列表
  const [loading, setLoading] = useState(true);          // 加载状态
  const [error, setError] = useState('');                // 错误信息

  // 获取今天的训练计划
  const fetchWorkouts = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // 获取今天的训练计划
      const data = await workoutApi.getTodaysWorkouts(userId);
      setWorkouts(data);
      setError('');
      
      // 记录查看训练计划的操作日志
      await logApi.createLog(userId, 'VIEW_WORKOUTS', {
        date: new Date().toISOString().split('T')[0],
        count: data.length
      });
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [userId]);

  // 切换训练计划的完成状态
  const toggleCompletion = async (planId: number, currentStatus: boolean) => {
    if (!userId) return;

    try {
      // 更新训练计划的完成状态
      await workoutApi.toggleWorkoutCompletion(planId, currentStatus);
      
      // 更新本地状态
      setWorkouts(prev =>
        prev.map(workout =>
          workout.id === planId
            ? { ...workout, completed: !currentStatus }
            : workout
        )
      );

      // 记录状态切换的操作日志
      await logApi.createLog(userId, 'TOGGLE_WORKOUT', {
        workout_id: planId,
        completed: !currentStatus
      });
    } catch (err) {
      console.error('Error updating workout:', err);
    }
  };

  // 删除训练计划
  const deleteWorkout = async (planId: number) => {
    if (!userId) return;

    try {
      const workout = workouts.find(w => w.id === planId);
      // 删除训练计划
      await workoutApi.deleteWorkout(planId);
      
      // 更新本地状态
      setWorkouts(prev => prev.filter(w => w.id !== planId));

      // 记录删除操作的日志
      await logApi.createLog(userId, 'DELETE_WORKOUT', {
        workout_id: planId,
        exercise_name: workout?.exercises?.name,
        date: workout?.date
      });
    } catch (err) {
      console.error('Error deleting workout:', err);
      throw err;
    }
  };

  return {
    workouts,           // 训练计划列表
    loading,            // 加载状态
    error,              // 错误信息
    toggleCompletion,   // 切换完成状态的函数
    deleteWorkout,      // 删除训练计划的函数
    refreshWorkouts: fetchWorkouts  // 刷新训练计划的函数
  };
}