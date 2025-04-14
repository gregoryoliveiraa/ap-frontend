import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
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
import CookiesPage from './pages/CookiesPage';
import HelpPage from './pages/HelpPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import StatusPage from './pages/StatusPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import KeyboardShortcutsPage from './pages/KeyboardShortcutsPage';
import { PrivateRoute } from './components/PrivateRoute';
import ArticleListPage from './pages/help/ArticleListPage';
import ArticleDetailPage from './pages/help/ArticleDetailPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import NotificationManagementPage from './pages/admin/NotificationManagementPage';
import CreditManagementPage from './pages/admin/CreditManagementPage';

function App() {
  // Adicionar verificação inicial para recuperar dados de perfil locais quando a aplicação inicia
  useEffect(() => {
    // Verificar se existe token no localStorage (usuário já logado)
    const token = localStorage.getItem('token');
    if (token) {
      // O token existe, mas o AuthContext.tsx já irá verificar e carregar o usuário
      // Esta verificação é apenas para garantir que, caso a aplicação seja recarregada,
      // os dados visuais (como avatar) sejam exibidos o mais rápido possível
      
      // Verificar se há avatar local
      const localAvatar = localStorage.getItem('userAvatar');
      // Verificar se há dados de perfil local
      const userProfile = localStorage.getItem('userProfile');
      
      if (localAvatar || userProfile) {
        console.log('Dados locais do perfil encontrados na inicialização da aplicação');
      }
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public routes */}
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="cookies" element={<CookiesPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="keyboard-shortcuts" element={<KeyboardShortcutsPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="help/articles" element={<ArticleListPage />} />
                <Route path="help/article/:id" element={<ArticleDetailPage />} />
                
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
                  <Route path="status" element={<StatusPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  
                  {/* Admin routes */}
                  <Route path="admin" element={<AdminRoute />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="notifications" element={<NotificationManagementPage />} />
                    <Route path="credits" element={<CreditManagementPage />} />
                  </Route>
                </Route>
                
                {/* Error routes */}
                <Route path="404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App; 