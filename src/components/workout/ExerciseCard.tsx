import React from 'react';
import { CheckCircle, ChevronDown, ChevronUp, Clock, RotateCcw, Flame, Target } from 'lucide-react';
import type { Exercise } from '../../types/database';

interface ExerciseCardProps {
  exercise: Exercise & {
    isCompleted?: boolean;
  };
  onToggleGuidance: (exerciseId: string) => void;
  onRecordExercise: (exerciseId: string, completed: boolean) => void;
  onRemoveExercise?: (exerciseId: string) => void;
  isExpanded: boolean;
  guidance?: {
    description: string;
    steps: string[];
    tips: string[];
    mistakes: string[];
  };
}

export function ExerciseCard({
  exercise,
  onToggleGuidance,
  onRecordExercise,
  onRemoveExercise,
  isExpanded,
  guidance
}: ExerciseCardProps) {
  // 计算单个动作的预计用时和消耗热量
  const exerciseStats = React.useMemo(() => {
    const totalTime = (exercise.sets * exercise.rest_time) + 
                     (exercise.sets * (exercise.reps * 3)); // 假设每次动作需要3秒
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    
    // 粗略估算卡路里消耗（仅供参考）
    const caloriesPerRep = exercise.exercise_type === 'cardio' ? 0.5 : 0.3; // 有氧运动消耗更多
    const totalCalories = Math.round(exercise.sets * exercise.reps * caloriesPerRep);

    return {
      time: `${minutes}分${seconds}秒`,
      calories: totalCalories
    };
  }, [exercise]);

  // 获取动作类型的显示文本和颜色
  const getTypeStyles = () => {
    switch (exercise.exercise_type) {
      case 'warmup':
        return {
          text: '热身运动',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800'
        };
      case 'cardio':
        return {
          text: '有氧训练',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'strength':
        return {
          text: '力量训练',
          bgColor: 'bg-indigo-100',
          textColor: 'text-indigo-800'
        };
      default:
        return {
          text: '其他训练',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
        <div className="flex-1">
          <div className="flex items-center">
            <h4 className="text-lg font-medium text-gray-900">{exercise.name}</h4>
            <span className={`ml-3 rounded-full px-2 py-0.5 text-xs font-medium ${
              exercise.isCompleted
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {exercise.isCompleted ? '已完成' : '未完成'}
            </span>
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${typeStyles.bgColor} ${typeStyles.textColor}`}>
              {typeStyles.text}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center">
              <RotateCcw className="mr-1 h-4 w-4" />
              {exercise.sets} 组 × {exercise.reps} 次
            </span>
            <span className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              休息 {exercise.rest_time} 秒
            </span>
            <span className="flex items-center text-indigo-600">
              <Clock className="mr-1 h-4 w-4" />
              预计用时：{exerciseStats.time}
            </span>
            <span className="flex items-center text-orange-600">
              <Flame className="mr-1 h-4 w-4" />
              预计消耗：{exerciseStats.calories} 千卡
            </span>
          </div>
          {exercise.target_muscles && exercise.target_muscles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {exercise.target_muscles.map((muscle, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                >
                  {muscle}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="ml-4 flex items-center space-x-2">
          <button
            onClick={() => onRecordExercise(exercise.id, !exercise.isCompleted)}
            className={`rounded-full p-2 transition-all duration-200 ${
              exercise.isCompleted
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500'
            }`}
            title={exercise.isCompleted ? "取消完成状态" : "标记为已完成"}
          >
            <CheckCircle className="h-6 w-6" />
          </button>
          <button
            onClick={() => onToggleGuidance(exercise.id)}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
            title="查看训练指导"
          >
            {isExpanded ? (
              <ChevronUp className="h-6 w-6" />
            ) : (
              <ChevronDown className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && guidance && (
        <div className="mt-4 overflow-hidden rounded-lg bg-gray-50 transition-all duration-300">
          <div className="space-y-4 p-4">
            <div>
              <p className="text-gray-600">{guidance.description}</p>
            </div>
            
            <div>
              <h5 className="flex items-center font-medium text-gray-900">
                <Target className="mr-2 h-4 w-4 text-indigo-600" />
                动作要领
              </h5>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-gray-600">
                {guidance.steps.map((step, index) => (
                  <li key={index} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h5 className="flex items-center font-medium text-gray-900">
                <Flame className="mr-2 h-4 w-4 text-orange-600" />
                训练要点
              </h5>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-600">
                {guidance.tips.map((tip, index) => (
                  <li key={index} className="leading-relaxed">{tip}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="flex items-center font-medium text-gray-900">
                <Clock className="mr-2 h-4 w-4 text-red-600" />
                常见错误
              </h5>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-red-600">
                {guidance.mistakes.map((mistake, index) => (
                  <li key={index} className="leading-relaxed">{mistake}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {exercise.notes && (
        <p className="mt-3 text-sm text-gray-500 italic">{exercise.notes}</p>
      )}
    </div>
  </div>
  )
};
