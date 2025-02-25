import React, { useState } from 'react';
import { ExerciseCard } from './ExerciseCard';
import { Dumbbell, Clock, RotateCcw, Flame, Target, Plus, Trash2 } from 'lucide-react';
import type { Exercise } from '../../types/database';
import { useExerciseGroups } from '../../hooks/useExerciseGroups';

interface ExerciseListProps {
  exercises: (Exercise & {
    isCompleted?: boolean;
  })[];
  onRecordExercise: (exerciseId: string, completed: boolean) => void;
  onAddExercise?: (exercise: Omit<Exercise, 'id' | 'plan_id'>) => void;
  onRemoveExercise?: (exerciseId: string) => void;
}

// 训练动作指导内容
const exerciseGuidance = {
  '俯卧撑': {
    description: '俯卧撑是一项经典的上肢力量训练动作，可以全面锻炼胸肌、三头肌和肩部肌群。',
    steps: [
      '双手略宽于肩，掌心完全贴合地面',
      '身体保持笔直成一条直线，核心和臀部收紧',
      '手臂弯曲缓慢下降，肘关节保持贴近身体',
      '当胸部距离地面约5厘米时停止下降',
      '保持核心稳定，用力推起回到起始位置'
    ],
    tips: [
      '保持颈部中立，视线自然向下约45度',
      '呼吸节奏：下降时吸气，推起时呼气',
      '控制下降速度，约2秒下降，1秒推起',
      '如果太难，可以先从跪姿俯卧撑开始',
      '注意肩胛骨的位置，避免过度内收或外展'
    ],
    mistakes: [
      '臀部过高或下沉，没有保持身体成一条直线',
      '手肘过度外展（超过45度）',
      '下降时身体扭转或摆动',
      '颈部过度前伸或后仰',
      '手掌支撑不稳，没有完全贴合地面'
    ]
  },
  // ... 其他训练动作指导内容保持不变
};

export function ExerciseList({ exercises, onRecordExercise, onAddExercise, onRemoveExercise }: ExerciseListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExercise, setNewExercise] = useState<Omit<Exercise, 'id' | 'plan_id'>>({  // 修改类型定义
    name: '',
    description: '',  // 添加必要字段
    sets: 3,
    reps: 12,
    rest_time: 60,
    exercise_type: 'strength',
    target_muscles: [],
    equipment: [],
    difficulty: 1,
    notes: ''
  });
  const [expandedExercise, setExpandedExercise] = React.useState<string | null>(null);
  const { warmup, strength, cardio } = useExerciseGroups(exercises);

  const toggleGuidance = (exerciseId: string) => {
    setExpandedExercise(expandedExercise === exerciseId ? null : exerciseId);
  };

  // 计算总训练时间
  const totalTime = React.useMemo(() => {
    return exercises.reduce((total, exercise) => {
      const exerciseTime = (exercise.sets * exercise.rest_time) + 
                         (exercise.sets * (exercise.reps * 3));
      return total + exerciseTime;
    }, 0);
  }, [exercises]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  // 计算完成进度
  const progress = React.useMemo(() => {
    const completed = exercises.filter(e => e.isCompleted).length;
    return {
      count: completed,
      total: exercises.length,
      percentage: (completed / exercises.length) * 100
    };
  }, [exercises]);

  return (
    <div className="space-y-6">
      {/* 训练概览 */}
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center text-lg font-semibold text-gray-900">
            <Dumbbell className="mr-2 h-5 w-5 text-indigo-600" />
            今日训练项目
          </h3>
          {onAddExercise && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加训练
            </button>
          )}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="mr-1 h-4 w-4" />
              预计用时：{formatTime(totalTime)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <RotateCcw className="mr-1 h-4 w-4" />
              完成进度：{progress.count}/{progress.total}
            </div>
          </div>
        </div>

        {/* 进度条 */}
        {showAddForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">添加新训练项目</h4>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="训练名称"
                className="p-2 border rounded"
                value={newExercise.name}
                onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
              />
              <select
                className="p-2 border rounded"
                value={newExercise.exercise_type}
                onChange={(e) => {
                  const value = e.target.value as 'strength' | 'cardio' | 'warmup';
                  setNewExercise({
                    ...newExercise,
                    exercise_type: value as 'strength' | 'cardio' | 'warmup'
                  });
                }}
              >
                <option value="strength">力量训练</option>
                <option value="cardio">有氧训练</option>
                <option value="warmup">热身运动</option>
              </select>
              <input
                type="number"
                placeholder="组数"
                className="p-2 border rounded"
                value={newExercise.sets}
                onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 0 }))}
              />
              <input
                type="number"
                placeholder="每组次数"
                className="p-2 border rounded"
                value={newExercise.reps}
                onChange={(e) => setNewExercise(prev => ({ ...prev, reps: parseInt(e.target.value) || 0 }))}
              />
              <input
                type="number"
                placeholder="休息时间(秒)"
                className="p-2 border rounded"
                value={newExercise.rest_time}
                onChange={(e) => setNewExercise(prev => ({ ...prev, rest_time: parseInt(e.target.value) || 0 }))}
              />
              <textarea
                placeholder="备注"
                className="p-2 border rounded col-span-2"
                value={newExercise.notes || ''}
                onChange={(e) => setNewExercise(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onAddExercise && newExercise.name) {
                    // 添加必要的验证
                    if (!newExercise.description) {
                      alert('请填写训练描述');
                      return;
                    }
                    if (newExercise.sets <= 0) {
                      alert('组数必须大于0');
                      return;
                    }
                    if (newExercise.reps <= 0) {
                      alert('每组次数必须大于0');
                      return;
                    }
                    
                    onAddExercise(newExercise);
                    setShowAddForm(false);
                    // 重置表单
                    setNewExercise({
                      name: '',
                      description: '',
                      sets: 3,
                      reps: 12,
                      rest_time: 60,
                      exercise_type: 'strength',
                      target_muscles: [],
                      equipment: [],
                      difficulty: 1,
                      notes: ''
                    });
                  }
                }}
                className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
                disabled={!newExercise.name}
              >
                添加
              </button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 训练列表 */}
      <div className="space-y-6">
        {/* 热身运动 */}
        {warmup.length > 0 && (
          <div className="rounded-lg bg-orange-50 p-6">
            <h4 className="flex items-center text-lg font-semibold text-orange-800 mb-4">
              <Flame className="mr-2 h-5 w-5" />
              热身运动
            </h4>
            <div className="space-y-4">
              {warmup.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onToggleGuidance={toggleGuidance}
                  onRecordExercise={onRecordExercise}
                  isExpanded={expandedExercise === exercise.id}
                  guidance={exerciseGuidance[exercise.name as keyof typeof exerciseGuidance]}
                />
              ))}
            </div>
          </div>
        )}

        {/* 力量训练 */}
        {strength.length > 0 && (
          <div className="rounded-lg bg-indigo-50 p-6">
            <h4 className="flex items-center text-lg font-semibold text-indigo-800 mb-4">
              <Dumbbell className="mr-2 h-5 w-5" />
              力量训练
            </h4>
            <div className="space-y-4">
              {strength.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onToggleGuidance={toggleGuidance}
                  onRecordExercise={onRecordExercise}
                  isExpanded={expandedExercise === exercise.id}
                  guidance={exerciseGuidance[exercise.name as keyof typeof exerciseGuidance]}
                />
              ))}
            </div>
          </div>
        )}

        {/* 有氧训练 */}
        {cardio.length > 0 && (
          <div className="rounded-lg bg-green-50 p-6">
            <h4 className="flex items-center text-lg font-semibold text-green-800 mb-4">
              <Target className="mr-2 h-5 w-5" />
              有氧训练
            </h4>
            <div className="space-y-4">
              {cardio.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onToggleGuidance={toggleGuidance}
                  onRecordExercise={onRecordExercise}
                  isExpanded={expandedExercise === exercise.id}
                  guidance={exerciseGuidance[exercise.name as keyof typeof exerciseGuidance]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}