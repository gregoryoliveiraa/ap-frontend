import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar, 
  Divider,
  ListItemIcon,
  Tooltip,
  Badge
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/images/logo.svg';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  
  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);
  const isProfileMenuOpen = Boolean(profileMenuAnchorEl);
  const isNotificationsMenuOpen = Boolean(notificationsAnchorEl);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMobileMenuClose();
  };

  // Main navigation items
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Documentos', path: '/documents', icon: <DescriptionIcon /> },
    { label: 'Chat IA', path: '/chat', icon: <ChatIcon /> },
    { label: 'Pesquisar', path: '/search', icon: <SearchIcon /> },
    { label: 'Ajuda', path: '/help', icon: <HelpIcon /> },
    { label: 'Meu Consumo', path: '/usage', icon: <DataUsageIcon /> },
  ];
  
  // Mock notifications
  const notifications = [
    { id: 1, content: 'Nova atualização disponível', time: '2 min atrás', read: false },
    { id: 2, content: 'Seu documento foi concluído', time: '1 hora atrás', read: false },
    { id: 3, content: 'Bem-vindo à plataforma', time: '1 dia atrás', read: true },
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <img src={logo} alt="Logo" style={{ height: 40, marginRight: 8 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to={user ? "/dashboard" : "/"}
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              flexGrow: { xs: 1, md: 0 }
            }}
          >
            Advogada Parceira
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, mx: 2 }}>
          {user && navItems.map((item) => (
            <Button
              key={item.path}
              component={RouterLink}
              to={item.path}
              sx={{ mx: 1 }}
              startIcon={item.icon}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right side icons */}
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Notifications */}
            <Tooltip title="Notificações">
              <IconButton
                onClick={handleNotificationsOpen}
                color="inherit"
                size="large"
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* Profile */}
            <Tooltip title="Perfil">
              <IconButton
                onClick={handleProfileMenuOpen}
                edge="end"
                color="inherit"
                size="large"
              >
                {user.avatar ? (
                  <Avatar 
                    src={user.avatar} 
                    alt={user.nome_completo}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {user.nome_completo ? user.nome_completo.charAt(0) : 'U'}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
            
            {/* Mobile menu button */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box>
            <Button component={RouterLink} to="/login" color="inherit">
              Entrar
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              color="primary"
              sx={{ ml: 1 }}
            >
              Registrar
            </Button>
          </Box>
        )}
      </Toolbar>

      {/* Mobile Navigation Menu */}
      <Menu
        anchorEl={mobileMenuAnchorEl}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{ mt: 1 }}
      >
        {user && navItems.map((item) => (
          <MenuItem key={item.path} onClick={() => handleNavigation(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <Typography>{item.label}</Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchorEl}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Meu Perfil
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={isNotificationsMenuOpen}
        onClose={handleNotificationsClose}
        sx={{ mt: 1, width: 320, maxWidth: '100%' }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1">Notificações</Typography>
          <Button size="small">Marcar todas como lidas</Button>
        </Box>
        <Divider />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              sx={{ 
                whiteSpace: 'normal',
                py: 1.5,
                borderLeft: notification.read ? 'none' : '3px solid',
                borderLeftColor: 'primary.main',
                bgcolor: notification.read ? 'inherit' : 'action.hover'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2">{notification.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2">Não há notificações</Typography>
          </MenuItem>
        )}
        <Divider />
        <MenuItem 
          sx={{ justifyContent: 'center' }}
          onClick={() => {
            handleNotificationsClose();
            // navigate to notifications page if you have one
          }}
        >
          <Typography variant="body2" color="primary">Ver todas</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header; 