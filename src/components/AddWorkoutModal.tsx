// 引入必要的依赖
import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Timer } from 'lucide-react';
import { exerciseApi } from '../lib/api/exercises';
import { workoutApi } from '../lib/api/workouts';
import type { Exercise } from '../types/database';
import LoadingSpinner from './LoadingSpinner';
import WorkoutRecommendations from './WorkoutRecommendations';

// 组件属性接口
interface AddWorkoutModalProps {
  isOpen: boolean;                // 是否显示模态框
  onClose: () => void;           // 关闭模态框的回调函数
  userId: string;                // 用户ID
  initialDate?: string;          // 初始日期
  bmi?: number | null;           // 用户的BMI指数
  onWorkoutAdded?: () => Promise<void>;  // 添加训练成功后的回调函数
}

// 添加训练计划模态框组件
export default function AddWorkoutModal({ isOpen, onClose, userId, initialDate, bmi, onWorkoutAdded }: AddWorkoutModalProps) {
  // 状态管理
  const [exercises, setExercises] = useState<Exercise[]>([]);  // 运动项目列表
  const [loading, setLoading] = useState(true);                // 加载状态
  const [submitting, setSubmitting] = useState(false);         // 提交状态
  const [error, setError] = useState('');                      // 错误信息
  const [selectedType, setSelectedType] = useState<'strength' | 'cardio'>('strength');  // 选中的运动类型
  const [formData, setFormData] = useState({
    exerciseId: '',   // 选中的运动项目ID
    sets: '3',        // 训练组数
    reps: '10',       // 每组重复次数/时长
    date: initialDate || new Date().toISOString().split('T')[0]  // 训练日期
  });

  // 当初始日期改变时更新表单数据
  useEffect(() => {
    if (initialDate) {
      setFormData(prev => ({ ...prev, date: initialDate }));
    }
  }, [initialDate]);

  // 获取运动项目列表
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await exerciseApi.getExercisesByType(selectedType);
        setExercises(data);
        setError('');
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError('Failed to load exercises. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      setLoading(true);
      fetchExercises();
    }
  }, [isOpen, selectedType]);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.exerciseId) {
      setError('Please select an exercise');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      // 添加新的训练计划
      await workoutApi.addWorkout({
        user_id: userId,
        exercise_id: parseInt(formData.exerciseId),
        sets: parseInt(formData.sets),
        reps: parseInt(formData.reps),
        date: formData.date
      });
      
      // Call the onWorkoutAdded callback if provided
      if (onWorkoutAdded) {
        await onWorkoutAdded();
      }
      
      // Close the modal and reset form
      onClose();
    } catch (err) {
      console.error('Error adding workout:', err);
      setError('Failed to add workout. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // 处理推荐训练的选择
  const handleRecommendedWorkout = (exercise: Exercise, sets: number, reps: number) => {
    setFormData({
      ...formData,
      exerciseId: exercise.id.toString(),
      sets: sets.toString(),
      reps: reps.toString()
    });
    setSelectedType(exercise.type);
  };

  // 如果模态框未打开，不渲染任何内容
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      {/* 模态框背景遮罩 */}
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* 模态框内容 */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
          {/* 关闭按钮 */}
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Add New Workout
              </h3>

              {/* 错误提示 */}
              {error && (
                <div className="mt-2 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* 训练推荐 */}
              {bmi && !loading && (
                <div className="mt-4">
                  <WorkoutRecommendations
                    bmi={bmi}
                    exercises={exercises}
                    onSelectWorkout={handleRecommendedWorkout}
                  />
                </div>
              )}

              {loading ? (
                <LoadingSpinner className="mt-4" />
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* 运动类型选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Exercise Type
                    </label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedType('strength')}
                        className={`flex items-center justify-center px-4 py-2 border rounded-md ${
                          selectedType === 'strength'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Dumbbell className="h-5 w-5 mr-2" />
                        Strength
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedType('cardio')}
                        className={`flex items-center justify-center px-4 py-2 border rounded-md ${
                          selectedType === 'cardio'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Timer className="h-5 w-5 mr-2" />
                        Cardio
                      </button>
                    </div>
                  </div>

                  {/* 运动项目选择 */}
                  <div>
                    <label htmlFor="exercise" className="block text-sm font-medium text-gray-700">
                      Exercise
                    </label>
                    <select
                      id="exercise"
                      value={formData.exerciseId}
                      onChange={(e) => setFormData(prev => ({ ...prev, exerciseId: e.target.value }))}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      required
                    >
                      <option value="">Select an exercise</option>
                      {exercises.map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 组数和重复次数/时长设置 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sets" className="block text-sm font-medium text-gray-700">
                        Sets
                      </label>
                      <input
                        type="number"
                        id="sets"
                        min="1"
                        value={formData.sets}
                        onChange={(e) => setFormData(prev => ({ ...prev, sets: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="reps" className="block text-sm font-medium text-gray-700">
                        {selectedType === 'strength' ? 'Reps' : 'Minutes'}
                      </label>
                      <input
                        type="number"
                        id="reps"
                        min="1"
                        value={formData.reps}
                        onChange={(e) => setFormData(prev => ({ ...prev, reps: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* 日期选择 */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  {/* 操作按钮 */}
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                        submitting ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {submitting ? 'Adding...' : 'Add Workout'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}