import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Button, Container, CircularProgress } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

interface AdminRouteProps {
  children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verificando permissões...
        </Typography>
      </Container>
    );
  }

  // Se o usuário não estiver autenticado, redirecione para a página de login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário não for administrador, mostre uma mensagem de acesso negado
  if (!isAdmin()) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <AdminPanelSettingsIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom color="error">
            Acesso Restrito
          </Typography>
          <Typography variant="body1" paragraph>
            Você não tem permissão para acessar a área administrativa.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            href="/dashboard" 
            sx={{ mt: 2 }}
          >
            Voltar para o Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  // Se o usuário for um administrador, permita o acesso ao conteúdo protegido
  return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute; 