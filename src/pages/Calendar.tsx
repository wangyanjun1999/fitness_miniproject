import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCalendar } from '../hooks/useCalendar';
import { formatDate, getDaysInMonth, isToday } from '../utils/date';
import { calculateBMI } from '../utils/health';
import AddWorkoutModal from '../components/AddWorkoutModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { workoutApi } from '../lib/api/workouts';
import { logApi } from '../lib/api/logs';

export default function Calendar() {
  const { profile } = useAuthStore();
  const { currentDate, workouts, loading, previousMonth, nextMonth, setWorkouts } = useCalendar(profile?.id);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const bmi = profile?.height && profile?.weight
    ? Number(calculateBMI(profile.height.toString(), profile.weight.toString()))
    : null;

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDay }, (_, i) => i);

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(formatDate(date));
    setIsAddModalOpen(true);
  };

  const handleDeleteWorkout = async (workoutId: number) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        // 查找要删除的训练计划所在的日期和详细信息
        const dateStr = Object.keys(workouts).find(date => 
          workouts[date].some(w => w.id === workoutId)
        );
        const workout = dateStr ? workouts[dateStr].find(w => w.id === workoutId) : null;
        
        // 调用API删除数据
        await workoutApi.deleteWorkout(workoutId);
        
        // 更新本地状态（深拷贝以避免直接修改状态）
        if (dateStr) {
          const updatedWorkouts = {...workouts};
          updatedWorkouts[dateStr] = updatedWorkouts[dateStr].filter(w => w.id !== workoutId);
          setWorkouts(updatedWorkouts);
        }
        
        // 记录删除操作的日志 - 使用单独的try-catch块处理日志错误
        try {
          if (profile?.id && workout) {
            await logApi.createLog(profile.id, 'DELETE_WORKOUT', {
              workout_id: workoutId,
              exercise_name: workout.exercises?.name,
              date: workout.date
            });
          }
        } catch (logError) {
          // 仅记录日志错误，不影响主要功能
          console.error('Error logging workout deletion:', logError);
        }
      } catch (error) {
        console.error('Error deleting workout:', error);
        // TODO: alert('Failed to delete workout. Please try again.');
         window.location.reload()
      }
    }
  };

  const isPast = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return date < today;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
            <CalendarIcon className="h-8 w-8 mr-3 text-gray-500" />
            Workout Calendar
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b">
          <button
            onClick={previousMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-900"
              >
                {day}
              </div>
            ))}
            
            {blanks.map((blank) => (
              <div key={`blank-${blank}`} className="bg-white p-2 h-32" />
            ))}
            
            {days.map((day) => {
              const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
              const dayWorkouts = workouts[dateStr] || [];
              const isCurrentDay = isToday(dateStr);
              const isPastDay = isPast(dateStr);

              return (
                <div
                  key={day}
                  className={`bg-white p-2 h-32 relative group ${
                    isCurrentDay ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-semibold ${
                      isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day}
                    </span>
                    {!isPastDay && (
                      <button
                        onClick={() => handleDayClick(day)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full"
                        title="Add workout"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-24">
                    {dayWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className={`text-xs p-1 rounded flex items-center justify-between group/workout ${
                          workout.completed
                            ? 'bg-green-100 text-green-800'
                            : isPastDay
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                        title={`${workout.exercises?.name} - ${workout.sets} sets × ${
                          workout.exercises?.type === 'strength' ? `${workout.reps} reps` : `${workout.reps} mins`
                        }`}
                      >
                        <span className="truncate flex-1">{workout.exercises?.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWorkout(workout.id);
                          }}
                          className="opacity-0 group-hover/workout:opacity-100 ml-1 p-0.5 hover:bg-red-200 rounded transition-opacity"
                          title="Delete workout"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedDate && (
        <AddWorkoutModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedDate(null);
          }}
          userId={profile?.id || ''}
          initialDate={selectedDate}
          bmi={bmi}
        />
      )}
    </div>
  );
}