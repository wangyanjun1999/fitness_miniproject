// 引入必要的依赖
import React from 'react';

// 组件属性接口
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';    // 加载动画尺寸：小、中、大
  className?: string;           // 自定义CSS类名
}

// 加载动画组件
export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  // 定义不同尺寸对应的CSS类
  const sizeClasses = {
    sm: 'h-8 w-8',    // 小尺寸: 32px
    md: 'h-12 w-12',  // 中尺寸: 48px
    lg: 'h-16 w-16'   // 大尺寸: 64px
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      {/* 旋转动画的圆环 */}
      <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
    </div>
  );
}