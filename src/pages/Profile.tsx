import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { profileApi } from '../lib/api/profile';
import { User, Settings, Save } from 'lucide-react';
import { calculateBMI, getBMICategory } from '../utils/health';

type Gender = 'male' | 'female' | 'other' | null;

export default function Profile() {
  const { profile, loadProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    goal: '',
    gender: null as Gender,
    age: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        goal: profile.goal || '',
        gender: profile.gender,
        age: profile.age?.toString() || ''
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'gender') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : value as Gender
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      setError('Profile not found. Please try logging in again.');
      return;
    }

    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const updates = {
        id: profile.id,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        goal: formData.goal || null,
        gender: formData.gender,
        age: formData.age ? Number(formData.age) : null
      };

      await profileApi.updateProfile(updates);
      await loadProfile();
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const bmi = calculateBMI(formData.height, formData.weight);
  const bmiInfo = bmi ? getBMICategory(Number(bmi)) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
            <User className="h-8 w-8 mr-3 text-gray-500" />
            Profile Settings
          </h2>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Personal Information
          </h3>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="mt-1">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="age"
                  id="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  max="150"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="height"
                  id="height"
                  value={formData.height}
                  onChange={handleChange}
                  min="0"
                  max="300"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="weight"
                  id="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0"
                  max="500"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
                Fitness Goal
              </label>
              <div className="mt-1">
                <select
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select a goal</option>
                  <option value="increase">Build Muscle</option>
                  <option value="decrease">Lose Weight</option>
                  <option value="maintain">Maintain</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isUpdating}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isUpdating
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg mt-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Health Metrics
          </h3>
          <div className="mt-6 space-y-6">
            {bmi && bmiInfo && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">BMI (Body Mass Index)</h4>
                <p className="mt-2 text-3xl font-bold text-gray-900">{bmi}</p>
                <p className={`mt-1 text-sm ${bmiInfo.color}`}>
                  {bmiInfo.category}
                </p>
              </div>
            )}

            {formData.goal && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Current Goal</h4>
                <p className="mt-2 text-lg font-medium text-gray-900">
                  {formData.goal === 'increase' && 'Build Muscle'}
                  {formData.goal === 'decrease' && 'Lose Weight'}
                  {formData.goal === 'maintain' && 'Maintain'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}