import { useMemo } from 'react';
import type { Exercise, WorkoutRecord } from '../types/database';
import { calculateCompletionRate, calculateTrainingDuration } from '../utils/workout';

interface WorkoutMetrics {
  totalTime: number;
  completionRate: number;
  streak: number;
  bestStreak: number;
  totalWorkouts: number;
}

export const useWorkoutMetrics = (
  exercises: Exercise[],
  records: WorkoutRecord[]
): WorkoutMetrics => {
  return useMemo(() => {
    // 计算总训练时间
    const totalTime = exercises.reduce((total, exercise) => {
      return total + calculateTrainingDuration(
        exercise.sets,
        exercise.reps,
        exercise.rest_time
      );
    }, 0);

    // 按日期分组记录
    const dailyRecords = records.reduce((acc, record) => {
      const date = record.date.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {} as Record<string, WorkoutRecord[]>);

    // 计算完成率
    const totalExercises = exercises.length * Object.keys(dailyRecords).length;
    const completedExercises = records.filter(r => {
      const exercise = exercises.find(e => e.id === r.exercise_id);
      return exercise && r.completed_sets === exercise.sets;
    }).length;

    const completionRate = calculateCompletionRate(totalExercises, completedExercises);

    // 计算连续训练天数
    const dates = Object.keys(dailyRecords).sort();
    let currentStreak = 0;
    let bestStreak = 0;
    let streak = 0;

    for (let i = 0; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const prevDate = i > 0 ? new Date(dates[i - 1]) : null;
      
      if (prevDate && 
          currentDate.getTime() - prevDate.getTime() === 24 * 60 * 60 * 1000) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }

      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }

      // 检查是否是当前连续记录
      const today = new Date();
      const diffDays = Math.floor(
        (today.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (diffDays <= 1) {
        streak = currentStreak;
      }
    }

    return {
      totalTime,
      completionRate,
      streak,
      bestStreak,
      totalWorkouts: Object.keys(dailyRecords).length
    };
  }, [exercises, records]);
};