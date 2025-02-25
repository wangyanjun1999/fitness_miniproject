import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  Trash2,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWorkoutStore } from '../store/workoutStore';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { WorkoutCalendar } from '../components/WorkoutCalendar';
import { ExerciseList } from '../components/workout/ExerciseList';
import { PlanHeader } from '../components/workout/PlanHeader';
import { DeleteConfirmModal } from '../components/workout/DeleteConfirmModal';
import { PreferencesDialog } from '../components/workout/PreferencesDialog';
import { AchievementBadge } from '../components/workout/AchievementBadge';
import { ProgressChart } from '../components/workout/ProgressChart';

function WorkoutPlan() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const { 
    currentPlan,
    exercises,
    records,
    isLoading,
    error,
    fetchUserPlan,
    recordWorkout,
    updatePlanFrequency,
    regeneratePlan,
    deletePlan,
    addCustomExercise
  } = useWorkoutStore();

  const [showPreferences, setShowPreferences] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadUserPlan = async () => {
      if (user?.id) {
        try {
          await fetchUserPlan(user.id);
          setErrorMessage(null);
        } catch (err) {
          setErrorMessage('加载训练计划失败，请稍后重试');
        }
      } else {
        navigate('/');
      }
    };

    loadUserPlan();
  }, [user, fetchUserPlan, navigate]);

  // 计算训练统计数据
  const statistics = useMemo(() => {
    if (!records || records.length === 0) {
      return {
        streak: 0,
        completionRate: 0,
        totalWorkouts: 0,
        bestStreak: 0
      };
    }

    // 按日期分组记录
    const dailyRecords = records.reduce((acc, record) => {
      const date = record.date.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {} as Record<string, typeof records>);

    // 计算完成率
    const totalExercises = exercises.length * Object.keys(dailyRecords).length;
    const completedExercises = records.filter(r => {
      const exercise = exercises.find(e => e.id === r.exercise_id);
      return exercise && r.completed_sets === exercise.sets;
    }).length;

    // 计算连续训练天数
    const dates = Object.keys(dailyRecords).sort();
    let currentStreak = 0;
    let bestStreak = 0;
    let streak = 0;

    for (let i = 0; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const prevDate = i > 0 ? new Date(dates[i - 1]) : null;
      
      if (prevDate && 
          currentDate.getTime() - prevDate.getTime() === 24 * 60 * 60 * 1000) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }

      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }

      // 检查是否是当前连续记录
      const today = new Date();
      const diffDays = Math.floor(
        (today.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (diffDays <= 1) {
        streak = currentStreak;
      }
    }

    return {
      streak,
      completionRate: totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0,
      totalWorkouts: Object.keys(dailyRecords).length,
      bestStreak
    };
  }, [records, exercises]);

  // 计算最近7天的进度数据
  const progressData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayRecords = records.filter(r => 
        r.date.startsWith(date)
      );
      
      const completedExercises = dayRecords.filter(r => {
        const exercise = exercises.find(e => e.id === r.exercise_id);
        return exercise && r.completed_sets === exercise.sets;
      }).length;

      return {
        date,
        value: exercises.length > 0 
          ? (completedExercises / exercises.length) * 100 
          : 0
      };
    });
  }, [records, exercises]);

  // 计算成就
  const achievements = useMemo(() => {
    return [
      {
        type: 'streak' as const,
        value: statistics.streak,
        title: '连续训练',
        description: '保持训练习惯'
      },
      {
        type: 'completion' as const,
        value: Math.round(statistics.completionRate),
        title: '完成率',
        description: '训练计划完成度'
      },
      {
        type: 'consistency' as const,
        value: Math.round((statistics.totalWorkouts / 30) * 100),
        title: '坚持度',
        description: '每月训练天数'
      },
      {
        type: 'milestone' as const,
        value: statistics.bestStreak,
        title: '最佳记录',
        description: '最长连续训练天数'
      }
    ];
  }, [statistics]);

  const handleRecordExercise = useCallback(async (exerciseId: string, completed: boolean) => {
    if (!user?.id) return;

    try {
      const exercise = exercises.find(e => e.id === exerciseId);
      if (!exercise) {
        throw new Error('找不到对应的训练项目');
      }

      await recordWorkout({
        user_id: user.id,
        exercise_id: exerciseId,
        completed_sets: completed ? exercise.sets : 0,
        completed_reps: completed ? exercise.reps : 0,
        notes: completed ? '完成训练' : '未完成训练'
      });
      
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage('记录训练状态失败，请重试');
    }
  }, [user, exercises, recordWorkout]);

  const handlePreferencesUpdate = async (preferences: {
    difficulty: 'easy' | 'medium' | 'hard';
    focusAreas: string[];
    timePerSession: number;
  }) => {
    if (!user) return;
    
    try {
      // 更新用户配置
      await updateProfile({
        ...user,
        training_preferences: {
          difficulty: preferences.difficulty,
          focus_areas: preferences.focusAreas,
          time_per_session: preferences.timePerSession
        }
      });

      // 重新生成训练计划
      await regeneratePlan(user, {
        difficulty: preferences.difficulty,
        focus_areas: preferences.focusAreas,
        time_per_session: preferences.timePerSession
      });
      setShowPreferences(false);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage('更新训练偏好失败，请重试');
    }
  };

  const handleAddExercise = useCallback(async (exercise: {
    name: string;
    description: string;
    category: 'strength' | 'cardio';
    sets: number;
    reps: number;
    target_muscles: string[];
    equipment: string[];
    difficulty: number;
  }) => {
    if (!user?.id || !currentPlan) return;

    try {
      await addCustomExercise({
        ...exercise,
        exercise_type: exercise.category,
        rest_time: 60,
        notes: exercise.description
      });
      setShowAddExercise(false);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage('添加训练项目失败，请重试');
    }
  }, [user, currentPlan, addCustomExercise]);

  const handleDeletePlan = useCallback(async () => {
    if (!currentPlan) return;
    
    try {
      setErrorMessage(null);
      await deletePlan(currentPlan.id);
      setShowDeleteConfirm(false);
      
      // 删除成功后显示提示
      setErrorMessage('训练计划已删除');
      
      // 3秒后清除提示并重定向到个人资料页
      setTimeout(() => {
        setErrorMessage(null);
        navigate('/profile-edit');
      }, 3000);
      
    } catch (err) {
      setErrorMessage('删除计划失败，请重试');
    }
  }, [currentPlan, deletePlan, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBackButton />
        <PageContainer>
          <div className="flex h-[50vh] items-center justify-center">
            <div className="text-gray-500">加载中...</div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBackButton />
        <PageContainer>
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="text-center">
              <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">没有训练计划</h3>
              <p className="mt-1 text-sm text-gray-500">
                请先在个人资料中设置您的健身目标
              </p>
              <button
                onClick={() => navigate('/profile-edit')}
                className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                去设置
              </button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton />
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">训练计划</h1>
            {currentPlan && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAddExercise(true)}
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  <Dumbbell className="mr-2 h-4 w-4" />
                  添加训练
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  训练偏好
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除计划
                </button>
              </div>
            )}
          </div>

          {showDeleteConfirm && (
            <DeleteConfirmModal
              onConfirm={handleDeletePlan}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          )}

          {showPreferences && (
            <PreferencesDialog
              onConfirm={handlePreferencesUpdate}
              onCancel={() => setShowPreferences(false)}
              initialPreferences={user?.training_preferences}
            />
          )}

          {errorMessage && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="text-red-700">{errorMessage}</div>
            </div>
          )}

          {currentPlan && (
            <>
              <PlanHeader
                plan={currentPlan}
                onFrequencyUpdate={updatePlanFrequency}
              />

              {/* 训练统计 */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {achievements.map((achievement, index) => (
                  <AchievementBadge key={index} {...achievement} />
                ))}
              </div>

              {/* 进度图表 */}
              <ProgressChart data={progressData} />

              <WorkoutCalendar
                records={records}
                exercises={exercises}
              />

              <ExerciseList
                exercises={exercises.map(exercise => ({
                  ...exercise,
                  isCompleted: records.some(r => 
                    r.exercise_id === exercise.id && 
                    r.completed_sets === exercise.sets &&
                    r.date.startsWith(new Date().toISOString().split('T')[0])
                  )
                }))}
                onRecordExercise={handleRecordExercise}
              />
            </>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

export default WorkoutPlan;