import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Link, 
  Slide,
  useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CookieIcon from '@mui/icons-material/Cookie';

const CookieConsent: React.FC = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  
  useEffect(() => {
    // Verificar se o usuário já aceitou os cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      // Mostrar o banner após um pequeno delay para melhor experiência do usuário
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setOpen(false);
  };

  const handleCustomize = () => {
    // Poderia abrir um modal com configurações mais detalhadas
    // Por enquanto, apenas vamos redirecionar para a página de cookies
    localStorage.setItem('cookiesAccepted', 'true');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          py: 2,
          px: { xs: 2, md: 4 },
          borderRadius: '12px 12px 0 0',
          boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          maxWidth: { sm: '100%', md: '100%' },
          mx: 'auto',
          borderTop: `3px solid ${theme.palette.secondary.main}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CookieIcon 
            sx={{ 
              fontSize: 40, 
              color: theme.palette.secondary.main,
              mr: 2
            }} 
          />
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 'bold' }}>
              Este site utiliza cookies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{' '}
              <Link component={RouterLink} to="/privacy" color="primary" underline="hover">
                Política de Privacidade
              </Link>{' '}
              e{' '}
              <Link component={RouterLink} to="/cookies" color="primary" underline="hover">
                Política de Cookies
              </Link>.
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          mt: { xs: 2, md: 0 },
          alignItems: { xs: 'stretch', sm: 'center' }
        }}>
          <Button 
            variant="outlined" 
            onClick={handleCustomize}
            sx={{ 
              px: 3,
              borderColor: theme.palette.secondary.main,
              color: theme.palette.secondary.main,
              '&:hover': {
                borderColor: theme.palette.secondary.dark,
                backgroundColor: 'rgba(224, 119, 80, 0.08)'
              }
            }}
          >
            Personalizar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAccept}
            sx={{ 
              px: 3,
              backgroundColor: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark
              }
            }}
          >
            Aceitar todos
          </Button>
        </Box>
      </Paper>
    </Slide>
  );
};

export default CookieConsent; 