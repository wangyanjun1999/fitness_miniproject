import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PreferencesDialogProps {
  onConfirm: (preferences: {
    difficulty: 'easy' | 'medium' | 'hard';
    focusAreas: string[];
    timePerSession: number;
  }) => void;
  onCancel: () => void;
  initialPreferences?: {
    difficulty: 'easy' | 'medium' | 'hard';
    focus_areas: string[];
    time_per_session: number;
  };
}

export function PreferencesDialog({ onConfirm, onCancel, initialPreferences }: PreferencesDialogProps) {
  const [preferences, setPreferences] = useState({
    difficulty: initialPreferences?.difficulty || 'medium' as const,
    focusAreas: initialPreferences?.focus_areas || [] as string[],
    timePerSession: initialPreferences?.time_per_session || 45
  });

  const handleFocusAreaChange = (area: string) => {
    setPreferences(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">训练偏好设置</h3>
          <button
            onClick={onCancel}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 训练难度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              训练难度
            </label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {[
                { value: 'easy', label: '简单' },
                { value: 'medium', label: '适中' },
                { value: 'hard', label: '困难' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPreferences(prev => ({ ...prev, difficulty: value as any }))}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    preferences.difficulty === value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 重点训练部位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              重点训练部位 (可多选)
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { value: 'chest', label: '胸部' },
                { value: 'back', label: '背部' },
                { value: 'legs', label: '腿部' },
                { value: 'core', label: '核心' },
                { value: 'arms', label: '手臂' },
                { value: 'shoulders', label: '肩部' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleFocusAreaChange(value)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    preferences.focusAreas.includes(value)
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 每次训练时长 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              每次训练时长 (分钟)
            </label>
            <input
              type="range"
              min="30"
              max="90"
              step="15"
              value={preferences.timePerSession}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                timePerSession: parseInt(e.target.value)
              }))}
              className="mt-2 w-full"
            />
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              <span>30分钟</span>
              <span className="font-medium text-indigo-600">
                {preferences.timePerSession}分钟
              </span>
              <span>90分钟</span>
            </div>
          </div>

          {/* 确认按钮 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              取消
            </button>
            <button
              onClick={() => onConfirm(preferences)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}