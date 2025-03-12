// 引入必要的依赖
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// 应用布局组件
export default function Layout() {
  // 获取当前路由位置
  const location = useLocation();
  // 获取登出函数
  const { signOut } = useAuthStore();

  // 定义导航菜单项
  const navigation = [
    { name: 'Home', href: '/', icon: Home },           // 首页
    { name: 'Calendar', href: '/calendar', icon: Calendar },  // 日历页
    { name: 'Profile', href: '/profile', icon: User },  // 个人资料页
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col h-screen">
        {/* 主要内容区域 */}
        <main className="flex-1 overflow-y-auto pb-16">
          <Outlet />
        </main>
        
        {/* 底部导航栏 */}
        <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex justify-around">
              {/* 导航菜单项 */}
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex flex-col items-center py-2 px-3 ${
                      location.pathname === item.href
                        ? 'text-blue-600'  // 当前选中项的样式
                        : 'text-gray-500 hover:text-blue-600'  // 未选中项的样式
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs mt-1">{item.name}</span>
                  </Link>
                );
              })}
              {/* 登出按钮 */}
              <button
                onClick={() => signOut()}
                className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-blue-600"
              >
                <LogOut className="h-6 w-6" />
                <span className="text-xs mt-1">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}