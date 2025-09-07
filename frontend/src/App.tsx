import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';

// Import pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import EventsPage from './pages/student/EventsPage';
import MyEventsPage from './pages/student/MyEventsPage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'admin' | 'student' }> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main App Routes
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/events" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminEventsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reports" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminReportsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Student Routes */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/events" 
        element={
          <ProtectedRoute requiredRole="student">
            <EventsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/my-events" 
        element={
          <ProtectedRoute requiredRole="student">
            <MyEventsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/leaderboard" 
        element={
          <ProtectedRoute requiredRole="student">
            <LeaderboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect based on user role */}
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
