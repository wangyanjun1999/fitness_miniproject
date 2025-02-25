import React from 'react';
import { Award, Flame, Target, Zap } from 'lucide-react';

interface AchievementBadgeProps {
  type: 'streak' | 'completion' | 'consistency' | 'milestone';
  value: number;
  title: string;
  description: string;
}

export function AchievementBadge({ type, value, title, description }: AchievementBadgeProps) {
  const getIcon = () => {
    switch (type) {
      case 'streak':
        return <Flame className="h-6 w-6 text-orange-500" />;
      case 'completion':
        return <Target className="h-6 w-6 text-green-500" />;
      case 'consistency':
        return <Award className="h-6 w-6 text-purple-500" />;
      case 'milestone':
        return <Zap className="h-6 w-6 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'streak':
        return 'bg-orange-50';
      case 'completion':
        return 'bg-green-50';
      case 'consistency':
        return 'bg-purple-50';
      case 'milestone':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className={`rounded-lg ${getBgColor()} p-4 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start space-x-3">
        <div className="rounded-full bg-white p-2 shadow-sm">
          {getIcon()}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
          <div className="mt-2">
            <span className="text-2xl font-bold">{value}</span>
            <span className="ml-1 text-sm text-gray-500">
              {type === 'streak' ? '天' : '%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}