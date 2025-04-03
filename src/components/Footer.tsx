import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer" 
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}
    >
      <Divider sx={{ mb: 3 }} />
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Advogada Parceira. Todos os direitos reservados.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
            <Link href="/termos" color="inherit" underline="hover">
              <Typography variant="body2">Termos de Uso</Typography>
            </Link>
            <Link href="/privacidade" color="inherit" underline="hover">
              <Typography variant="body2">Política de Privacidade</Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 