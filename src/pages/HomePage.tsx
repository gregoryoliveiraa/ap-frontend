import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  useTheme,
  alpha,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const HomePage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.3)} 0%, ${alpha(theme.palette.secondary.main, 0)} 70%)`,
          top: '-10vw',
          right: '-10vw',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '30vw',
          height: '30vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.light, 0)} 70%)`,
          bottom: '-10vw',
          left: '-5vw',
          zIndex: 0,
        }}
      />

      {/* Grid Lines */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(to right, ${alpha('#fff', 0.05)} 1px, transparent 1px),
            linear-gradient(to bottom, ${alpha('#fff', 0.05)} 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 8, height: '100%' }}>
        <Grid container spacing={4} sx={{ height: '100%' }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box textAlign={{ xs: 'center', md: 'left' }} mb={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  color: '#fff', 
                  fontWeight: 800,
                  mb: 2,
                  textShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Jurídico <Box component="span" sx={{ color: theme.palette.secondary.main }}>Inteligente</Box>
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha('#fff', 0.9), 
                  mb: 4,
                  fontWeight: 400,
                  lineHeight: 1.5
                }}
              >
                O poder da IA a serviço da advocacia brasileira
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}
              >
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  component={RouterLink}
                  to="/register"
                  startIcon={<PersonAddIcon />}
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    boxShadow: `0 8px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 10px 25px ${alpha(theme.palette.secondary.main, 0.5)}`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Inscrever-se
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit"
                  size="large"
                  component={RouterLink}
                  to="/login"
                  startIcon={<LockIcon />}
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    borderColor: '#fff',
                    color: '#fff',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: alpha('#fff', 0.1),
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Login
                </Button>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              p: 0,
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              background: 'transparent'
            }}>
              <Box
                component="img"
                src="/assets/home/home.png"
                alt="Ilustração da Parceira Jurídica"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: { xs: '400px', md: '500px' },
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block'
                }}
              />
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                pointerEvents: 'none'
              }} />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage; 