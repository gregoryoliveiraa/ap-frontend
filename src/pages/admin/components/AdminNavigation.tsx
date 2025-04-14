import React from 'react';
import { Paper, Tabs, Tab, Box, useTheme, useMediaQuery } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TokenIcon from '@mui/icons-material/Token';

interface AdminRoute {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const routes: AdminRoute[] = [
    { path: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/admin/users', label: 'Usuários', icon: <PeopleIcon /> },
    { path: '/admin/notifications', label: 'Notificações', icon: <NotificationsIcon /> },
    { path: '/admin/credits', label: 'Créditos', icon: <TokenIcon /> },
  ];

  // Determinar a rota ativa
  const currentPath = location.pathname;
  const activeIndex = routes.findIndex(route => 
    route.path === currentPath || 
    (route.path !== '/admin' && currentPath.startsWith(route.path))
  );

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    navigate(routes[newValue].path);
  };

  return (
    <Paper elevation={1} sx={{ borderRadius: 2 }}>
      <Tabs
        value={activeIndex !== -1 ? activeIndex : 0}
        onChange={handleChange}
        variant={isMobile ? 'scrollable' : 'fullWidth'}
        scrollButtons={isMobile ? 'auto' : false}
        textColor="primary"
        indicatorColor="primary"
        aria-label="Navegação administrativa"
      >
        {routes.map((route) => (
          <Tab
            key={route.path}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                {route.icon}
                <Box component="span" sx={{ ml: 1 }}>
                  {route.label}
                </Box>
              </Box>
            }
          />
        ))}
      </Tabs>
    </Paper>
  );
};

export default AdminNavigation; 