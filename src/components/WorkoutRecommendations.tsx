// 引入必要的依赖
import React from 'react';
import { Dumbbell, Heart, Scale } from 'lucide-react';
import type { Exercise } from '../types/database';

// 组件属性接口
interface WorkoutRecommendationsProps {
  bmi: number | null;                // 用户的BMI指数
  onSelectWorkout: (exercise: Exercise, sets: number, reps: number) => void;  // 选择训练的回调函数
  exercises: Exercise[];             // 可用的运动项目列表
}

// 训练计划接口
interface WorkoutPlan {
  title: string;                    // 计划标题
  description: string;              // 计划描述
  color: string;                    // 主题颜色
  icon: typeof Dumbbell | typeof Heart | typeof Scale;  // 图标类型
  recommendations: {                // 推荐的训练项目
    type: 'strength' | 'cardio';    // 训练类型
    sets: number;                   // 推荐组数
    reps: number;                   // 推荐次数/时长
    exerciseNames: string[];        // 推荐的运动项目名称
  }[];
}

// 根据BMI获取训练计划
const getWorkoutPlan = (bmi: number): WorkoutPlan => {
  if (bmi < 18.5) {
    // BMI过低：增重计划
    return {
      title: 'Muscle Building Focus',
      description: 'Focus on strength training with progressive overload to build muscle mass.',
      color: 'blue',
      icon: Dumbbell,
      recommendations: [
        {
          type: 'strength',
          sets: 4,
          reps: 8,
          exerciseNames: ['Squats', 'Deadlifts', 'Bench Press', 'Pull-ups']
        },
        {
          type: 'cardio',
          sets: 2,
          reps: 10,
          exerciseNames: ['Jump Rope']
        }
      ]
    };
  } else if (bmi < 25) {
    // BMI正常：平衡计划
    return {
      title: 'Balanced Fitness',
      description: 'Maintain a healthy balance of strength and cardio training.',
      color: 'green',
      icon: Heart,
      recommendations: [
        {
          type: 'strength',
          sets: 4,
          reps: 12,
          exerciseNames: ['Push-ups', 'Dumbbell Rows', 'Shoulder Press', 'Lunges']
        },
        {
          type: 'cardio',
          sets: 3,
          reps: 15,
          exerciseNames: ['Running', 'Cycling', 'Jump Rope']
        }
      ]
    };
  } else if (bmi < 30) {
    // BMI超重：体重管理计划
    return {
      title: 'Weight Management',
      description: 'Focus on high-intensity workouts with a mix of cardio and strength training.',
      color: 'yellow',
      icon: Scale,
      recommendations: [
        {
          type: 'cardio',
          sets: 4,
          reps: 20,
          exerciseNames: ['Burpees', 'Mountain Climbers', 'High Knees']
        },
        {
          type: 'strength',
          sets: 3,
          reps: 15,
          exerciseNames: ['Push-ups', 'Squats', 'Plank']
        }
      ]
    };
  } else {
    // BMI肥胖：渐进式健身计划
    return {
      title: 'Progressive Fitness',
      description: 'Start with low-impact exercises and gradually increase intensity.',
      color: 'red',
      icon: Heart,
      recommendations: [
        {
          type: 'cardio',
          sets: 3,
          reps: 10,
          exerciseNames: ['Walking', 'Swimming', 'Cycling']
        },
        {
          type: 'strength',
          sets: 3,
          reps: 12,
          exerciseNames: ['Push-ups', 'Shoulder Press', 'Squats']
        }
      ]
    };
  }
};

// 训练推荐组件
export default function WorkoutRecommendations({ bmi, onSelectWorkout, exercises }: WorkoutRecommendationsProps) {
  // 如果没有BMI数据，不显示推荐
  if (!bmi) return null;

  // 获取训练计划
  const plan = getWorkoutPlan(bmi);
  const Icon = plan.icon;

  // 根据名称查找运动项目
  const findExercise = (name: string): Exercise | undefined => {
    return exercises.find(e => e.name.toLowerCase() === name.toLowerCase());
  };

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      {/* 计划标题和描述 */}
      <div className={`px-4 py-5 sm:p-6 border-l-4 border-${plan.color}-500`}>
        <div className="flex items-center">
          <div className={`flex-shrink-0 bg-${plan.color}-100 rounded-md p-3`}>
            <Icon className={`h-6 w-6 text-${plan.color}-600`} />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              Recommended Plan: {plan.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {plan.description}
            </p>
          </div>
        </div>

        {/* 推荐的训练项目列表 */}
        <div className="mt-6 space-y-6">
          {plan.recommendations.map((rec, idx) => (
            <div key={idx} className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">
                {rec.type === 'strength' ? 'Strength Training' : 'Cardio Training'}
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rec.exerciseNames.map(name => {
                  const exercise = findExercise(name);
                  if (!exercise) return null;

                  return (
                    <button
                      key={name}
                      onClick={() => onSelectWorkout(exercise, rec.sets, rec.reps)}
                      className={`relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-${plan.color}-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${plan.color}-500`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {exercise.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {rec.sets} sets × {rec.reps} {rec.type === 'strength' ? 'reps' : 'mins'}
                        </p>
                      </div>
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full bg-${plan.color}-100 flex items-center justify-center`}>
                        {rec.type === 'strength' ? (
                          <Dumbbell className={`h-5 w-5 text-${plan.color}-600`} />
                        ) : (
                          <Heart className={`h-5 w-5 text-${plan.color}-600`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}