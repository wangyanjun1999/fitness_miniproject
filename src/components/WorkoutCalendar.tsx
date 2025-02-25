import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import type { WorkoutRecord, Exercise } from '../types/database';

interface WorkoutCalendarProps {
  records: WorkoutRecord[];
  exercises: Exercise[];
}

interface DayDetails {
  date: Date;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  records?: WorkoutRecord[];
  status?: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export function WorkoutCalendar({ records, exercises }: WorkoutCalendarProps) {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
    };
  });

  const [selectedDay, setSelectedDay] = useState<DayDetails | null>(null);

  const today = useMemo(() => new Date(), []);
  const isCurrentMonth = today.getMonth() === viewDate.month && 
                        today.getFullYear() === viewDate.year;
  const currentDate = today.getDate();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
  const firstDayOfMonth = getFirstDayOfMonth(viewDate.year, viewDate.month);
  const monthName = new Date(viewDate.year, viewDate.month).toLocaleString('zh-CN', { month: 'long' });

  const isPastDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    date.setHours(23, 59, 59, 999);
    return date < today;
  };

  const dailyRecords = useMemo(() => {
    const recordMap = new Map<number, WorkoutRecord[]>();
    
    records.forEach(record => {
      const date = new Date(record.date);
      // Adjust for local timezone
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      
      if (localDate.getMonth() === viewDate.month && localDate.getFullYear() === viewDate.year) {
        const day = localDate.getDate();
        if (!recordMap.has(day)) {
          recordMap.set(day, []);
        }
        recordMap.get(day)?.push(record);
      }
    });

    return recordMap;
  }, [records, viewDate.month, viewDate.year]);

  const getCompletionStatus = (day: number) => {
    const dayRecords = dailyRecords.get(day) || [];
    if (dayRecords.length === 0) return null;

    const totalExercises = exercises.length;
    const completedExercises = dayRecords.filter(record => {
      const exercise = exercises.find(e => e.id === record.exercise_id);
      return exercise && record.completed_sets === exercise.sets;
    }).length;

    return {
      completed: completedExercises,
      total: totalExercises,
      percentage: (completedExercises / totalExercises) * 100
    };
  };

  const goToPreviousMonth = () => {
    setViewDate(prev => {
      const newMonth = prev.month - 1;
      if (newMonth < 0) {
        return {
          year: prev.year - 1,
          month: 11,
        };
      }
      return {
        ...prev,
        month: newMonth,
      };
    });
  };

  const goToNextMonth = () => {
    setViewDate(prev => {
      const newMonth = prev.month + 1;
      if (newMonth > 11) {
        return {
          year: prev.year + 1,
          month: 0,
        };
      }
      return {
        ...prev,
        month: newMonth,
      };
    });
  };

  const goToCurrentMonth = () => {
    setViewDate({
      year: today.getFullYear(),
      month: today.getMonth(),
    });
  };

  const handleDayClick = (day: number) => {
    const date = new Date(viewDate.year, viewDate.month, day);
    const isPast = isPastDate(viewDate.year, viewDate.month, day);
    const isToday = date.toDateString() === today.toDateString();
    const isFuture = date > today;

    setSelectedDay({
      date,
      isPast,
      isToday,
      isFuture,
      records: dailyRecords.get(day),
      status: getCompletionStatus(day)
    });
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          <span className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            训练日历
          </span>
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="rounded-full p-1 text-gray-600 hover:bg-gray-100"
              title="上个月"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-[100px] text-center">
              <button
                onClick={goToCurrentMonth}
                className={`text-sm ${
                  isCurrentMonth
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-indigo-600 hover:text-indigo-800'
                }`}
                disabled={isCurrentMonth}
              >
                {viewDate.year}年 {monthName}
              </button>
            </div>
            <button
              onClick={goToNextMonth}
              className="rounded-full p-1 text-gray-600 hover:bg-gray-100"
              title="下个月"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-24 bg-gray-50 rounded-lg" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isToday = isCurrentMonth && day === currentDate;
          const status = getCompletionStatus(day);
          const isPast = isPastDate(viewDate.year, viewDate.month, day);
          const isFuture = !isPast && !isToday;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`h-24 rounded-lg border p-2 text-left transition-all duration-200 ${
                isToday
                  ? 'border-indigo-500 bg-indigo-50 hover:bg-indigo-100'
                  : isPast
                  ? 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`text-sm font-medium ${
                    isToday 
                      ? 'text-indigo-600' 
                      : isPast 
                      ? 'text-gray-500'
                      : 'text-gray-700'
                  }`}
                >
                  {day}
                </span>
                {status && (
                  <div className="flex items-center">
                    {status.completed === status.total ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : status.completed > 0 ? (
                      <div className="text-xs font-medium text-orange-500">
                        {status.completed}/{status.total}
                      </div>
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
                {isFuture && (
                  <Info className="h-4 w-4 text-indigo-400" />
                )}
              </div>
              {status && (
                <div
                  className="mt-2 h-1 rounded-full bg-gray-200"
                  title={`完成率: ${status.percentage.toFixed(0)}%`}
                >
                  <div
                    className={`h-1 rounded-full ${
                      status.percentage === 100
                        ? 'bg-green-500'
                        : status.percentage > 0
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 日期详情弹窗 */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDay.date.toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} 训练计划
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedDay.isPast && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">训练完成情况</span>
                    {selectedDay.status && (
                      <span className={`rounded-full px-2 py-1 text-sm ${
                        selectedDay.status.percentage === 100
                          ? 'bg-green-100 text-green-800'
                          : selectedDay.status.percentage > 0
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedDay.status.completed}/{selectedDay.status.total} 完成
                      </span>
                    )}
                  </div>
                  {selectedDay.records?.map((record, index) => {
                    const exercise = exercises.find(e => e.id === record.exercise_id);
                    return exercise ? (
                      <div key={index} className="mt-2 flex items-center justify-between text-sm">
                        <span>{exercise.name}</span>
                        <span className="text-gray-500">
                          {record.completed_sets}/{exercise.sets} 组
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {selectedDay.isToday && (
                <div className="rounded-lg bg-indigo-50 p-4">
                  <p className="text-indigo-700">今日训练进行中</p>
                  <div className="mt-2 space-y-2">
                    {exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{exercise.name}</span>
                        <span className="text-gray-500">
                          {exercise.sets} 组 × {exercise.reps} 次
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDay.isFuture && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-gray-700">预计训练内容</p>
                  <div className="mt-2 space-y-2">
                    {exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{exercise.name}</span>
                        <span className="text-gray-500">
                          {exercise.sets} 组 × {exercise.reps} 次
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    * 训练计划可能会根据您的进度和状态进行调整
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}