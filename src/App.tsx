import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { PageContainer } from './components/layout/PageContainer';
import AuthPage from './pages/AuthPage';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import ProfileEdit from './pages/ProfileEdit';
import WorkoutPlan from './pages/WorkoutPlan';
import LogViewer from './pages/LogViewer';
import { useAuthStore } from './store/authStore';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/workout" element={<WorkoutPlan />} />
          <Route path="/logs" element={<LogViewer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;