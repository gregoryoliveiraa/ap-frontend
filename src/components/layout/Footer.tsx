import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ mt: 'auto', py: 3, bgcolor: 'background.paper' }}>
      <Divider />
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Advogada Parceira - Todos os direitos reservados
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
            <Link href="#" color="inherit" underline="hover">
              <Typography variant="body2">Termos de Uso</Typography>
            </Link>
            <Link href="#" color="inherit" underline="hover">
              <Typography variant="body2">Privacidade</Typography>
            </Link>
            <Link href="#" color="inherit" underline="hover">
              <Typography variant="body2">Contato</Typography>
            </Link>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
          Esta ferramenta não substitui a orientação profissional jurídica. Use as informações por sua conta e risco.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 