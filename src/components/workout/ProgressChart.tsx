import React from 'react';
import { Calendar } from 'lucide-react';

interface ProgressChartProps {
  data: {
    date: string;
    value: number;
  }[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center text-lg font-semibold text-gray-900">
          <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
          训练进度
        </h3>
      </div>

      <div className="mt-6">
        <div className="flex h-40 items-end space-x-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex-1"
              title={`${item.date}: ${item.value}%`}
            >
              <div
                className="bg-indigo-600 transition-all duration-300 hover:bg-indigo-500"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              {new Date(item.date).getDate()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}