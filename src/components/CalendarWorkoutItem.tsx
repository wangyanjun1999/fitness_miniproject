// 引入必要的依赖
import React, { useState } from 'react';
import { Trash2, BookOpen } from 'lucide-react';
import type { Plan } from '../types/database';
import ExerciseGuideModal from './ExerciseGuideModal';

// 组件属性接口
interface CalendarWorkoutItemProps {
  workout: Plan;                    // 训练计划数据
  onDelete: (e: React.MouseEvent) => void;  // 删除训练的回调
  isPastDay: boolean;              // 是否为过去的日期
}

/**
 * 日历视图的训练项目组件
 * 提供简洁的训练项目显示和指南查看功能
 */
export default function CalendarWorkoutItem({ workout, onDelete, isPastDay }: CalendarWorkoutItemProps) {
  // 状态管理
  const [isGuideOpen, setIsGuideOpen] = useState(false);  // 是否打开指导模态框

  // 检查是否有额外信息可以展示
  const hasGuidanceInfo = workout.exercises?.demonstration_photos?.length || 
                        workout.exercises?.description || 
                        workout.exercises?.video;

  // 打开指导模态框
  const openGuide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGuideOpen(true);
  };

  return (
    <>
      {/* 指导模态框 */}
      <ExerciseGuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)}
        exercise={workout.exercises || null}
      />
      
      {/* 训练项目显示 */}
      <div
        className={`text-xs p-1 rounded flex items-center justify-between group/workout ${
          workout.completed
            ? 'bg-green-100 text-green-800'
            : isPastDay
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800'
        }`}
        title={`${workout.exercises?.name} - ${workout.sets} sets × ${
          workout.exercises?.type === 'strength' ? `${workout.reps} reps` : `${workout.reps} mins`
        }`}
      >
        <span className="truncate flex-1">{workout.exercises?.name}</span>
        
        <div className="flex items-center">
          {/* 指南按钮 */}
          {hasGuidanceInfo && (
            <button
              onClick={openGuide}
              className="opacity-0 group-hover/workout:opacity-100 mr-1 p-0.5 hover:bg-blue-200 rounded transition-opacity"
              title="View exercise guide"
            >
              <BookOpen className="h-3 w-3" />
            </button>
          )}
          
          {/* 删除按钮 */}
          <button
            onClick={onDelete}
            className="opacity-0 group-hover/workout:opacity-100 p-0.5 hover:bg-red-200 rounded transition-opacity"
            title="Delete workout"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </>
  );
} 