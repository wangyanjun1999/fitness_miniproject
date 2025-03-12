import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkouts } from '../hooks/useWorkouts';
import { Calendar, TrendingUp, Dumbbell, Plus } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import WorkoutCard from '../components/WorkoutCard';
import AddWorkoutModal from '../components/AddWorkoutModal';
import Timer from '../components/Timer';
import { calculateBMI } from '../utils/health';
import type { Plan } from '../types/database';

export default function Dashboard() {
  const { profile, loading: profileLoading } = useAuthStore();
  const { workouts, loading: workoutsLoading, error, toggleCompletion, deleteWorkout, refreshWorkouts } = useWorkouts(profile?.id);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const loading = profileLoading || workoutsLoading;

  const bmi = profile?.height && profile?.weight
    ? Number(calculateBMI(profile.height.toString(), profile.weight.toString()))
    : null;

  const handleModalClose = () => {
    setIsAddModalOpen(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner className="mt-8" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Please sign in to view your dashboard</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome back, {profile.username || 'User'}!
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Workout
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Stats Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Today's Progress
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {workouts.filter(w => w.completed).length}/{workouts.length}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      Workouts Completed
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Current Streak
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      0
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-orange-600">
                      Days
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Timer Card */}
        <div className="col-span-full lg:col-span-1">
          <Timer onComplete={() => console.log('Timer completed!')} />
        </div>

        {/* Today's Workout Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg col-span-full">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Dumbbell className="h-5 w-5 mr-2" />
                Today's Workout
              </h3>
            </div>

            {error ? (
              <div className="text-center py-4">
                <div className="text-red-600">{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Retry
                </button>
              </div>
            ) : workouts.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No workouts planned</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new workout.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Workout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {workouts.map((workout: Plan) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    onToggleComplete={() => toggleCompletion(workout.id, workout.completed)}
                    onDelete={() => deleteWorkout(workout.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddWorkoutModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        userId={profile.id}
        bmi={bmi}
        onWorkoutAdded={refreshWorkouts}
      />
    </div>
  );
}