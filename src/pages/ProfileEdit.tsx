import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWorkoutStore } from '../store/workoutStore';

// 个人资料编辑页面组件
function ProfileEdit() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const { generatePlan } = useWorkoutStore();
  const [error, setError] = useState('');
  
  // 表单数据状态
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    height: '',
    weight: '',
    gender: '',
    fitness_goal: '',
  });

  // 当用户数据加载时,填充表单
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        age: user.age?.toString() || '',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
        gender: user.gender || '',
        fitness_goal: user.fitness_goal || '',
      });
    } else {
      // 如果没有用户数据,重定向到登录页
      navigate('/');
    }
  }, [user, navigate]);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const updatedProfile = {
        full_name: formData.full_name,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        gender: formData.gender as 'MALE' | 'FEMALE' | 'OTHER',
        fitness_goal: formData.fitness_goal as 'MUSCLE_GAIN' | 'FAT_LOSS',
      };

      await updateProfile(updatedProfile);
      
      // 如果用户更新了健身目标,自动生成新的训练计划
      if (user && user.fitness_goal !== updatedProfile.fitness_goal) {
        await generatePlan({
          ...user,
          ...updatedProfile
        });
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新个人资料失败');
    }
  };

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">编辑个人资料</h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              姓名
            </label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                年龄
              </label>
              <input
                type="number"
                name="age"
                id="age"
                required
                value={formData.age}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                性别
              </label>
              <select
                name="gender"
                id="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="">请选择性别</option>
                <option value="MALE">男</option>
                <option value="FEMALE">女</option>
                <option value="OTHER">其他</option>
              </select>
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                身高 (cm)
              </label>
              <input
                type="number"
                name="height"
                id="height"
                required
                step="0.1"
                value={formData.height}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                体重 (kg)
              </label>
              <input
                type="number"
                name="weight"
                id="weight"
                required
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="fitness_goal" className="block text-sm font-medium text-gray-700">
              健身目标
            </label>
            <select
              name="fitness_goal"
              id="fitness_goal"
              required
              value={formData.fitness_goal}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            >
              <option value="">请选择目标</option>
              <option value="MUSCLE_GAIN">增肌</option>
              <option value="FAT_LOSS">减脂</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              保存修改
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileEdit;