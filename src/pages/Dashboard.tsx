import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Edit, Dumbbell } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="text-center">
        <p>请先登录查看您的个人主页。</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          去登录
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">欢迎, {user.full_name}</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/profile-edit')}
            className="flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200"
          >
            <Edit className="mr-2 h-4 w-4" />
            编辑资料
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">个人信息</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">年龄:</span>
              <p className="text-gray-900">{user.age} 岁</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">身高:</span>
              <p className="text-gray-900">{user.height} 厘米</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">体重:</span>
              <p className="text-gray-900">{user.weight} 公斤</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">性别:</span>
              <p className="text-gray-900">
                {user.gender === 'MALE' ? '男' : user.gender === 'FEMALE' ? '女' : '其他'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">健身目标</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">当前目标:</span>
              <p className="text-gray-900">
                {user.fitness_goal === 'MUSCLE_GAIN' ? '增肌' : '减脂'}
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => navigate('/workout')}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Dumbbell className="mr-2 h-4 w-4" />
                查看训练计划
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;