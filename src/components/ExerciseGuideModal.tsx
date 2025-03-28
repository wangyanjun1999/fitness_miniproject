// 引入必要的依赖
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Exercise } from '../types/database';

// 组件属性接口
interface ExerciseGuideModalProps {
  isOpen: boolean;              // 是否打开模态框
  onClose: () => void;          // 关闭模态框的回调函数
  exercise: Exercise | null;    // 运动项目详情
}

/**
 * 运动指导模态框组件
 * 用于显示运动项目的详细指导，包括文字说明和视频教程
 */
export default function ExerciseGuideModal({ isOpen, onClose, exercise }: ExerciseGuideModalProps) {
  // 当前显示的图片索引
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // 如果没有运动项目数据，不显示模态框
  if (!exercise) return null;
  
  // 图片数组
  const photos = exercise.demonstration_photos || [];
  
  // 下一张图片
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };
  
  // 上一张图片
  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // 获取基于视频URL的嵌入式视频链接
  const getEmbedUrl = (videoUrl: string | null): string | null => {
    if (!videoUrl) return null;
    
    // 处理YouTube链接
    if (videoUrl.includes('youtube.com/watch')) {
      const videoId = new URL(videoUrl).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // 处理YouTube短链接
    if (videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // 其他视频平台可以在这里添加处理逻辑
    
    return videoUrl; // 默认返回原始链接
  };
  
  // 获取嵌入式视频链接
  const embedUrl = getEmbedUrl(exercise.video);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        {/* 背景遮罩 */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        {/* 模态框内容 */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* 标题和关闭按钮 */}
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {exercise.name} - Guide Details
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 运动类型标签 */}
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      exercise.type === 'strength' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {exercise.type === 'strength' ? 'Strength Training' : 'Cardio'}
                    </span>
                    {exercise.calories_per_unit && (
                      <span className="ml-2 text-xs text-gray-500">
                        burn {exercise.calories_per_unit} calories per unit
                      </span>
                    )}
                  </div>

                  {/* 运动描述 */}
                  {exercise.description && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-2">Details</h4>
                      <p className="text-gray-600">{exercise.description}</p>
                    </div>
                  )}

                  {/* 示范图片滑动区域 */}
                  {photos.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-2">Photo Examples</h4>
                      <div className="relative">
                        <div className="aspect-ratio-container aspect-16-9 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={photos[currentPhotoIndex]}
                            alt={`${exercise.name} Photo Example ${currentPhotoIndex + 1}`}
                            className="aspect-ratio-content object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/800x450?text=Image+Not+Found';
                            }}
                          />
                        </div>
                        
                        {/* 图片导航按钮 */}
                        {photos.length > 1 && (
                          <div className="absolute inset-0 flex items-center justify-between p-2">
                            <button
                              onClick={prevPhoto}
                              className="p-1 rounded-full bg-white/80 text-gray-800 hover:bg-white"
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                              onClick={nextPhoto}
                              className="p-1 rounded-full bg-white/80 text-gray-800 hover:bg-white"
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                          </div>
                        )}
                        
                        {/* 图片计数器 */}
                        {photos.length > 1 && (
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded-md">
                            {currentPhotoIndex + 1} / {photos.length}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 教学视频 */}
                  {embedUrl && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-2">Video Tutorial</h4>
                      <div className="aspect-ratio-container aspect-16-9 rounded-lg overflow-hidden bg-gray-100">
                        <iframe
                          src={embedUrl}
                          title={`${exercise.name} Video Tutorial`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="aspect-ratio-content"
                        ></iframe>
                      </div>
                    </div>
                  )}
                  
                  {/* 外部视频链接 */}
                  {exercise.video && !embedUrl && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-2">Video Tutorial</h4>
                      <a
                        href={exercise.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Watch Tutorial
                      </a>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 