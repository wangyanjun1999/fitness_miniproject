// 引入必要的依赖
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

// 页面加载状态组件
export default function PageLoading() {
  return (
    // 全屏加载状态容器
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center">
        {/* 使用大尺寸的加载动画 */}
        <LoadingSpinner size="lg" />
        {/* 加载提示文本 */}
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}