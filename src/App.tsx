import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ChatPage from './pages/chat/ChatPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import DocumentEditorPage from './pages/documents/DocumentEditorPage';
import NewDocumentPage from './pages/documents/NewDocumentPage';
import SearchPage from './pages/search/SearchPage';
import ProfilePage from './pages/profile/ProfilePage';
import UsagePage from './pages/usage/UsagePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import HelpPage from './pages/HelpPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public routes */}
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="termos" element={<TermsPage />} />
              <Route path="privacidade" element={<PrivacyPage />} />
              
              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route
                  path="chat/:sessionId?"
                  element={
                    <PrivateRoute>
                      <ChatPage />
                    </PrivateRoute>
                  }
                />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="documents/new" element={<NewDocumentPage />} />
                <Route path="documents/:id" element={<DocumentEditorPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="usage" element={<UsagePage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
              </Route>
              
              {/* Error routes */}
              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App; 