import React, { useState } from 'react';
import { Dialog } from '../Dialog';

interface AddExerciseDialogProps {
  onConfirm: (exercise: {
    name: string;
    description: string;
    category: 'strength' | 'cardio';
    sets: number;
    reps: number;
    target_muscles: string[];
    equipment: string[];
    difficulty: number;
  }) => void;
  onCancel: () => void;
}

export function AddExerciseDialog({ onConfirm, onCancel }: AddExerciseDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'strength',
    sets: 3,
    reps: 12,
    target_muscles: [],
    equipment: [],
    difficulty: 2
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData as any);
  };

  return (
    <Dialog
      title="添加训练项目"
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">名称</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">描述</label>
          <textarea
            required
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">类型</label>
          <select
            value={formData.category}
            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as 'strength' | 'cardio' }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="strength">力量训练</option>
            <option value="cardio">有氧训练</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">组数</label>
            <input
              type="number"
              required
              min={1}
              max={10}
              value={formData.sets}
              onChange={e => setFormData(prev => ({ ...prev, sets: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">每组次数</label>
            <input
              type="number"
              required
              min={1}
              max={100}
              value={formData.reps}
              onChange={e => setFormData(prev => ({ ...prev, reps: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">目标肌群</label>
          <input
            type="text"
            value={formData.target_muscles.join(', ')}
            onChange={e => setFormData(prev => ({ 
              ...prev, 
              target_muscles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            }))}
            placeholder="例如：胸大肌, 三头肌（用逗号分隔）"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">所需器材</label>
          <input
            type="text"
            value={formData.equipment.join(', ')}
            onChange={e => setFormData(prev => ({ 
              ...prev, 
              equipment: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            }))}
            placeholder="例如：哑铃, 杠铃（用逗号分隔）"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">难度</label>
          <select
            value={formData.difficulty}
            onChange={e => setFormData(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value={1}>简单</option>
            <option value={2}>中等</option>
            <option value={3}>困难</option>
          </select>
        </div>

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
          >
            添加
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
          >
            取消
          </button>
        </div>
      </form>
    </Dialog>
  );
}