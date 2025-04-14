import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, IconButton, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import logo from '../assets/images/logo.svg';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = 2025;

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme.palette.primary.main,
        color: '#FFFFFF',
        py: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Typography 
              variant="body2" 
              sx={{ 
                textAlign: { xs: 'center', sm: 'left' },
                fontWeight: 'bold'
              }}
            >
              © {currentYear} Advogada Parceira. Todos os direitos reservados.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                gap: 2
              }}
            >
              <Link 
                component={RouterLink} 
                to="/terms" 
                sx={{ 
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  '&:hover': { color: theme.palette.secondary.light },
                  fontWeight: 'medium'
                }}
              >
                Termos de Uso
              </Link>
              <Link 
                component={RouterLink} 
                to="/privacy" 
                sx={{ 
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  '&:hover': { color: theme.palette.secondary.light },
                  fontWeight: 'medium'
                }}
              >
                Política de Privacidade
              </Link>
              <Link 
                component={RouterLink} 
                to="/cookies" 
                sx={{ 
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  '&:hover': { color: theme.palette.secondary.light },
                  fontWeight: 'medium'
                }}
              >
                Cookies
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 2 }}>
              <IconButton 
                component="a" 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener" 
                size="small"
                sx={{ 
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { 
                    bgcolor: theme.palette.secondary.main,
                  }
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton 
                component="a" 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener"
                size="small"
                sx={{ 
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { 
                    bgcolor: theme.palette.secondary.main,
                  }
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton 
                component="a" 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener"
                size="small"
                sx={{ 
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { 
                    bgcolor: theme.palette.secondary.main,
                  }
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton 
                component="a" 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener"
                size="small"
                sx={{ 
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { 
                    bgcolor: theme.palette.secondary.main,
                  }
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer; 