import React from 'react';

interface CreatePlanFormProps {
  onSubmit: (plan: {
    name: string;
    description: string;
    frequency: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export function CreatePlanForm({ onSubmit, onCancel }: CreatePlanFormProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    frequency: '3',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: formData.name,
      description: formData.description,
      frequency: parseInt(formData.frequency),
    });
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-gray-900">创建训练计划</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            计划名称
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            计划描述
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            rows={3}
            required
          />
        </div>
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
            每周训练频率
          </label>
          <select
            id="frequency"
            value={formData.frequency}
            onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            required
          >
            {[1, 2, 3, 4, 5, 6, 7].map(num => (
              <option key={num} value={num}>{num}天/周</option>
            ))}
          </select>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            创建计划
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}