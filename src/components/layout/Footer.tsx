import React from 'react';
import { Box, Container, Typography, Link, Divider, useTheme, alpha } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto', 
        py: 3, 
        bgcolor: 'background.paper',
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          py: 2 
        }}>
          <Typography 
            variant="body2" 
            sx={{
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.text.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              fontWeight: 500,
              letterSpacing: '0.02em',
              fontSize: '0.75rem'
            }}
          >
            © {currentYear} AP
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, mt: { xs: 2, md: 0 } }}>
            <Link 
              component={RouterLink} 
              to="/terms" 
              sx={{ 
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                transition: 'color 0.2s',
                '&:hover': {
                  color: theme.palette.primary.main
                },
                fontSize: '0.75rem'
              }}
            >
              <Typography variant="body2" sx={{ fontSize: 'inherit' }}>Termos</Typography>
            </Link>
            <Link 
              component={RouterLink} 
              to="/privacy" 
              sx={{ 
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                transition: 'color 0.2s',
                '&:hover': {
                  color: theme.palette.primary.main
                },
                fontSize: '0.75rem'
              }}
            >
              <Typography variant="body2" sx={{ fontSize: 'inherit' }}>Privacidade</Typography>
            </Link>
            <Link 
              href="mailto:contato@advogadaparceira.com.br" 
              sx={{ 
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                transition: 'color 0.2s',
                '&:hover': {
                  color: theme.palette.primary.main
                },
                fontSize: '0.75rem'
              }}
            >
              <Typography variant="body2" sx={{ fontSize: 'inherit' }}>Contato</Typography>
            </Link>
          </Box>
        </Box>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center" 
          display="block" 
          sx={{ 
            mt: 0.5,
            opacity: 0.7,
            fontSize: '0.65rem'
          }}
        >
          Uso por conta e risco. Não substitui orientação jurídica profissional.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 