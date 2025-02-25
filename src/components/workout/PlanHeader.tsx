import React from 'react';
import { Edit2, X } from 'lucide-react';
import type { WorkoutPlan } from '../../types/database';

interface PlanHeaderProps {
  plan: WorkoutPlan;
  onFrequencyUpdate: (frequency: number) => Promise<void>;
}

export function PlanHeader({ plan, onFrequencyUpdate }: PlanHeaderProps) {
  const [showFrequencyEdit, setShowFrequencyEdit] = React.useState(false);
  const [newFrequency, setNewFrequency] = React.useState(plan.frequency);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFrequencyUpdate = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      await onFrequencyUpdate(newFrequency);
      setShowFrequencyEdit(false);
    } catch (err) {
      setError('更新训练频率失败，请重试');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
          <p className="mt-1 text-gray-600">{plan.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          {showFrequencyEdit ? (
            <>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(Number(e.target.value))}
                disabled={isUpdating}
                className={`rounded-lg border border-gray-300 px-3 py-1 text-sm ${
                  isUpdating ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                }`}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <option key={num} value={num}>{num}天/周</option>
                ))}
              </select>
              <button
                onClick={handleFrequencyUpdate}
                disabled={isUpdating}
                className={`rounded-lg px-3 py-1 text-sm font-medium ${
                  isUpdating
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isUpdating ? '更新中...' : '确定'}
              </button>
              <button
                onClick={() => {
                  setShowFrequencyEdit(false);
                  setNewFrequency(plan.frequency);
                  setError(null);
                }}
                disabled={isUpdating}
                className={`rounded-lg p-1 ${
                  isUpdating
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800">
                每周 {plan.frequency} 天
              </span>
              <button
                onClick={() => setShowFrequencyEdit(true)}
                className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                title="修改训练频率"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}