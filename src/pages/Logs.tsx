import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { logApi } from '../lib/api/logs';
import { ActivityLog } from '../types/database';
import { ClipboardList, Search, Filter } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

type ActionFilter = 'all' | 'workout' | 'profile' | 'auth';

export default function Logs() {
  const { profile } = useAuthStore();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ActionFilter>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      if (!profile?.id) return;

      try {
        const data = await logApi.getUserLogs(profile.id, 100);
        setLogs(data);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [profile?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatAction = (action: string) => {
    return action
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'text-red-600';
    if (action.includes('ADD') || action.includes('CREATE')) return 'text-green-600';
    if (action.includes('UPDATE') || action.includes('TOGGLE')) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'VIEW_WORKOUTS':
        return '👀';
      case 'ADD_WORKOUT':
        return '💪';
      case 'DELETE_WORKOUT':
        return '🗑️';
      case 'TOGGLE_WORKOUT':
        return '✅';
      case 'UPDATE_PROFILE':
        return '👤';
      case 'SIGN_IN':
        return '🔑';
      case 'SIGN_OUT':
        return '👋';
      case 'SIGN_UP':
        return '✨';
      default:
        return '📝';
    }
  };

  const filterLogs = (logs: ActivityLog[]) => {
    return logs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());

      let matchesFilter = true;
      switch (filter) {
        case 'workout':
          matchesFilter = log.action.includes('WORKOUT');
          break;
        case 'profile':
          matchesFilter = log.action.includes('PROFILE');
          break;
        case 'auth':
          matchesFilter = ['SIGN_IN', 'SIGN_OUT', 'SIGN_UP'].includes(log.action);
          break;
      }

      return matchesSearch && matchesFilter;
    });
  };

  const filteredLogs = filterLogs(logs);

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Please sign in to view your activity logs</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
            <ClipboardList className="h-8 w-8 mr-3 text-gray-500" />
            Activity Logs
          </h2>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActionFilter)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Activities</option>
            <option value="workout">Workouts</option>
            <option value="profile">Profile</option>
            <option value="auth">Authentication</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner className="mt-8" />
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-600">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            Retry
          </button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-8">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activity logs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Your activity logs will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <li key={log.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3" role="img" aria-label="action icon">
                        {getActionIcon(log.action)}
                      </span>
                      <p className={`text-sm font-medium ${getActionColor(log.action)}`}>
                        {formatAction(log.action)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                  </div>
                  {Object.keys(log.details).length > 0 && (
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <pre className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}