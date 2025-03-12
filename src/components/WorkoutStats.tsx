// 引入必要的依赖
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Flame, Target } from 'lucide-react';
import type { Plan } from '../types/database';

// 组件属性接口
interface WorkoutStatsProps {
  workouts: Plan[];  // 训练计划列表
}

// 训练统计组件
export default function WorkoutStats({ workouts }: WorkoutStatsProps) {
  // 计算总消耗卡路里
  const totalCalories = workouts.reduce((total, workout) => {
    if (!workout.exercises?.calories_per_unit) return total;
    return total + (workout.exercises.calories_per_unit * workout.sets * workout.reps);
  }, 0);

  // 计算完成率
  const completionRate = workouts.length > 0
    ? Math.round((workouts.filter(w => w.completed).length / workouts.length) * 100)
    : 0;

  // 准备图表数据：按运动类型分组统计
  const chartData = workouts.reduce<Record<string, { name: string; count: number }>>(
    (acc, workout) => {
      const type = workout.exercises?.type || 'unknown';
      if (!acc[type]) {
        acc[type] = { name: type, count: 0 };
      }
      acc[type].count++;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {/* 统计卡片区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 完成率卡片 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{completionRate}%</p>
            </div>
          </div>
        </div>

        {/* 卡路里消耗卡片 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <Flame className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Calories Burned</p>
              <p className="text-2xl font-semibold text-gray-900">{Math.round(totalCalories)}</p>
            </div>
          </div>
        </div>

        {/* 总训练数量卡片 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Workouts</p>
              <p className="text-2xl font-semibold text-gray-900">{workouts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 训练分布图表 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Workout Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Object.values(chartData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}