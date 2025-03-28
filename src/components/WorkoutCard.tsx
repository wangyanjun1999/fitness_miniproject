import React, { useState } from 'react';
import { Trash2, ExternalLink} from 'lucide-react';
import type { Plan } from '../types/database';
import ExerciseGuideModal from './ExerciseGuideModal';

interface WorkoutCardProps {
  workout: Plan;                    // 训练计划数据
  onToggleComplete: () => void;     // 切换完成状态的回调
  onDelete: () => void;             // 删除训练的回调
}

export default function WorkoutCard({ workout, onToggleComplete, onDelete }: WorkoutCardProps) {
  // 状态管理
  const [isDeleting, setIsDeleting] = useState(false);    // 是否正在删除
  const [isGuideOpen, setIsGuideOpen] = useState(false);  // 是否打开指导模态框

  // 处理删除操作
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this workout?')) {
      setIsDeleting(true);
      try {
        await onDelete();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // 打开指导模态框
  const openGuide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGuideOpen(true);
  };

  // 检查是否有额外信息可以展示
  const hasAdditionalInfo = workout.exercises?.demonstration_photos?.length || 
                          workout.exercises?.description || 
                          workout.exercises?.video;

  return (
    <div
      className={`rounded-lg border mb-4 ${
        workout.completed
          ? 'bg-green-50 border-green-200'  // 已完成状态样式
          : 'bg-white border-gray-200'      // 未完成状态样式
      }`}
    >
      {/* 指导模态框 */}
      <ExerciseGuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)}
        exercise={workout.exercises || null}
      />
      
      {/* 主要信息区域 */}
      <div className="p-4">
        {/* 运动名称和信息 */}
        <div className="mb-1">
          <h4 className="text-lg font-medium text-gray-900">
            {workout.exercises?.name}
          </h4>
          <p className="text-sm text-gray-500">
            {workout.sets} sets × {workout.reps} {workout.exercises?.type === 'strength' ? 'reps' : 'mins'}
          </p>
          <p className="text-xs text-gray-400">
            Estimated calories: {(workout.exercises?.calories_per_unit || 0) * workout.sets * workout.reps}
          </p>
        </div>
        
        {/* 操作按钮区域 */}
        <div className="flex justify-end items-center space-x-2 mt-2">
          {/* 查看指导按钮 - 始终显示 */}
          <button
            onClick={openGuide}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            Guidance
          </button>
          
          {/* 完成按钮 */}
          <button
            onClick={onToggleComplete}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              workout.completed
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            {workout.completed ? 'Completed' : 'Mark Complete'}
          </button>
          
          {/* 删除按钮 */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Delete workout"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 展开的详细信息区域 */}
      {hasAdditionalInfo && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* 运动描述 */}
          {workout.exercises?.description && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Description</h5>
              <p className="text-sm text-gray-600">{workout.exercises.description}</p>
            </div>
          )}

          {/* 示范图片 */}
          {workout.exercises?.demonstration_photos && workout.exercises.demonstration_photos.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Demonstration</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {workout.exercises.demonstration_photos.map((photo, index) => (
                  <div key={index} className="relative aspect-ratio-container aspect-16-9 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photo}
                      alt={`${workout.exercises?.name} demonstration ${index + 1}`}
                      className="aspect-ratio-content object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 教学视频链接 */}
          {workout.exercises?.video && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Tutorial Video</h5>
              <a
                href={workout.exercises.video}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Watch Video Tutorial
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}