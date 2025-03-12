// 引入必要的依赖
import { useState, useEffect } from 'react';
import { workoutApi } from '../lib/api/workouts';
import type { Plan } from '../types/database';

// 日历功能的自定义Hook
export function useCalendar(userId: string | undefined) {
  // 状态管理
  const [currentDate, setCurrentDate] = useState(new Date());           // 当前选中的日期
  const [workouts, setWorkouts] = useState<Record<string, Plan[]>>({}); // 按日期分组的训练计划
  const [loading, setLoading] = useState(true);                         // 加载状态

  // 获取月度训练计划
  useEffect(() => {
    const fetchMonthWorkouts = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // 获取指定月份的所有训练计划
        const data = await workoutApi.getMonthWorkouts(userId, currentDate);
        
        // 按日期对训练计划进行分组
        const grouped = data.reduce<Record<string, Plan[]>>((acc, workout) => {
          const date = workout.date;
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(workout);
          return acc;
        }, {});

        setWorkouts(grouped);
      } catch (err) {
        console.error('Error fetching workouts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthWorkouts();
  }, [currentDate, userId]);

  // 切换到上一个月
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  // 切换到下一个月
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return {
    currentDate,  // 当前选中的日期
    workouts,     // 训练计划数据
    loading,      // 加载状态
    previousMonth, // 切换到上一月的函数
    nextMonth,    // 切换到下一月的函数
    setWorkouts   // 更新训练计划的函数
  };
}