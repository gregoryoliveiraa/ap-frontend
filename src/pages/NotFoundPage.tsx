import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          py: 6,
          px: 4,
          mt: 8,
          textAlign: 'center',
          backgroundColor: 'background.paper',
        }}
      >
        <ErrorOutlineIcon
          color="error"
          sx={{ fontSize: 100, mb: 2 }}
        />
        
        <Typography variant="h3" component="h1" gutterBottom>
          404 - Página não encontrada
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Ops! A página que você está procurando não existe ou foi movida.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/"
            size="large"
          >
            Voltar para a página inicial
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage; 