import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ChatPage from './pages/ChatPage';
import KnowledgePage from './pages/KnowledgePage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import { ChatProvider } from './contexts/ChatContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import TwoFactorNudgeModal from './components/TwoFactorNudgeModal';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function ProtectedApp() {
  const { isAuthenticated, showTwoFactorNudge, dismissTwoFactorNudge } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <ChatProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>

      <TwoFactorNudgeModal open={showTwoFactorNudge} onClose={dismissTwoFactorNudge} />
    </ChatProvider>
  );
}

function LoginGate() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/chat" replace />;
  return <LoginPage />;
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginGate />} />
            <Route path="/*" element={<ProtectedApp />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

