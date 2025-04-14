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
  Badge,
  useTheme,
  List,
  ListItem,
  ListItemText
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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const navigate = useNavigate();
  const theme = useTheme();
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
  
  const handleNotificationAction = (id: string, action: string) => {
    if (action === 'read') {
      markAsRead(id);
    } else if (action === 'delete') {
      deleteNotification(id);
    } else if (action === 'navigate' && notifications) {
      const notification = notifications.find(n => n.id === id);
      if (notification && notification.action_link) {
        handleNotificationsClose();
        navigate(notification.action_link);
        markAsRead(id);
      }
    }
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
  
  // Adicionar opção de admin se o usuário for administrador
  if (user && isAdmin()) {
    navItems.push({ 
      label: 'Administração', 
      path: '/admin', 
      icon: <AdminPanelSettingsIcon /> 
    });
  }

  return (
    <AppBar 
      position="sticky" 
      color="primary" 
      elevation={1}
      sx={{
        boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Box
            component={RouterLink}
            to={user ? "/dashboard" : "/"}
            sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            <Box 
              component="img" 
              src="/logo.png" 
              alt="Advogada Parceira" 
              onError={(e) => { console.error("Error loading logo:", e); }}
              onLoad={() => { console.log("Logo loaded successfully"); }}
              sx={{ 
                height: 45, 
                width: 'auto',
                mr: 2,
                display: { xs: 'block', sm: 'block' },
                borderRadius: '8px',
              }} 
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                textDecoration: 'none',
                flexGrow: { xs: 1, md: 0 }
              }}
            >
              Advogada Parceira
            </Typography>
          </Box>
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, mx: 2 }}>
          {user && navItems.map((item) => (
            <Button
              key={item.path}
              component={RouterLink}
              to={item.path}
              sx={{ 
                mx: 1,
                color: '#FFFFFF',
                '&.active': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  fontWeight: 600
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
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
                color="secondary"
                size="large"
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon sx={{ color: theme.palette.secondary.main }} />
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
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: theme.palette.primary.main,
                    cursor: 'pointer'
                  }}
                  src={user.avatar || undefined}
                >
                  {!user.avatar && (
                    (user.firstName?.[0] || user.nome_completo?.split(' ')?.[0]?.[0] || '') + 
                    (user.lastName?.[0] || (user.nome_completo?.split(' ')?.length > 1 ? user.nome_completo?.split(' ')[1]?.[0] : '') || '')
                  )}
                </Avatar>
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
            <Button 
              component={RouterLink} 
              to="/login" 
              variant="text"
              sx={{ 
                color: '#FFFFFF',
                mr: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Entrar
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              color="secondary"
              sx={{ 
                borderRadius: '20px', 
                px: 3,
                '&:hover': {
                  boxShadow: '0 4px 10px rgba(224, 119, 80, 0.25)'
                }
              }}
            >
              Cadastrar
            </Button>
          </Box>
        )}
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchorEl}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { 
            width: 220,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            mt: 1,
            '& .MuiMenuItem-root': {
              py: 1
            }
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.firstName || user?.nome_completo || 'Usuário'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
          {isAdmin && isAdmin() && (
            <Typography variant="caption" sx={{ 
              display: 'inline-block', 
              bgcolor: 'primary.main', 
              color: 'white', 
              px: 1, 
              py: 0.2, 
              borderRadius: 1,
              mt: 0.5
            }}>
              Administrador
            </Typography>
          )}
        </Box>
        
        <Divider />
        
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Meu Perfil
        </MenuItem>
        
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/usage'); }}>
          <ListItemIcon>
            <DataUsageIcon fontSize="small" />
          </ListItemIcon>
          Consumo
        </MenuItem>
        
        {isAdmin && isAdmin() && (
          <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin'); }}>
            <ListItemIcon>
              <AdminPanelSettingsIcon fontSize="small" />
            </ListItemIcon>
            Administração
          </MenuItem>
        )}
        
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile?tab=settings'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Configurações
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
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { 
            width: 320,
            maxHeight: 400,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            mt: 1
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notificações
          </Typography>
          {unreadCount > 0 && (
            <Tooltip title="Marcar todas como lidas">
              <IconButton size="small" onClick={() => markAllAsRead()}>
                <MarkEmailReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Divider />
        
        {notifications && notifications.length > 0 ? (
          <List sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    px: 2, 
                    py: 1,
                    bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.05)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      cursor: notification.action_link ? 'pointer' : 'default'
                    }
                  }}
                  onClick={() => notification.action_link && handleNotificationAction(notification.id, 'navigate')}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          variant="subtitle2" 
                          component="span" 
                          fontWeight={notification.read ? 'normal' : 'bold'}
                        >
                          {notification.title}
                        </Typography>
                        <Box>
                          {!notification.read && (
                            <IconButton 
                              size="small" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleNotificationAction(notification.id, 'read');
                              }}
                            >
                              <MarkEmailReadIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleNotificationAction(notification.id, 'delete');
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          component="span"
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="div"
                          sx={{ mt: 0.5 }}
                        >
                          {new Date(notification.created_at).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Nenhuma notificação disponível
            </Typography>
          </Box>
        )}
      </Menu>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchorEl}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { 
            width: 240,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            mt: 1
          }
        }}
      >
        {user && navItems.map((item) => (
          <MenuItem 
            key={item.path} 
            onClick={() => handleNavigation(item.path)}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </MenuItem>
        ))}
      </Menu>
    </AppBar>
  );
};

export default Header; 