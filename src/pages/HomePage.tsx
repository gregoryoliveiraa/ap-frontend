import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';

const features = [
  {
    icon: <ChatIcon fontSize="large" color="primary" />,
    title: 'Assistente Jurídico',
    description: 'Tire dúvidas jurídicas com IA especializada no sistema jurídico brasileiro.'
  },
  {
    icon: <DescriptionIcon fontSize="large" color="primary" />,
    title: 'Geração de Documentos',
    description: 'Crie petições, recursos e outros documentos jurídicos em minutos.'
  },
  {
    icon: <SearchIcon fontSize="large" color="primary" />,
    title: 'Pesquisa de Jurisprudência',
    description: 'Encontre decisões relevantes para fortalecer seus argumentos.'
  },
];

const benefits = [
  {
    icon: <LightbulbIcon fontSize="medium" />,
    title: 'Aumente sua Produtividade',
    description: 'Economize horas de pesquisa e redação com assistência de IA.'
  },
  {
    icon: <SpeedIcon fontSize="medium" />,
    title: 'Respostas Rápidas',
    description: 'Acesse informações jurídicas instantaneamente.'
  },
  {
    icon: <SecurityIcon fontSize="medium" />,
    title: 'Informações Confiáveis',
    description: 'Conteúdo baseado na legislação e jurisprudência atual.'
  },
];

const HomePage: React.FC = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Paper 
        sx={{ 
          py: 8, 
          px: 2,
          backgroundColor: 'primary.main',
          color: 'white',
          borderRadius: 0,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                Sua Parceira Jurídica Inteligente
              </Typography>
              <Typography variant="h6" paragraph>
                Assistente de IA especializado no sistema jurídico brasileiro para advogados que buscam eficiência e excelência.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  component={RouterLink}
                  to="/register"
                  sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
                >
                  Começar Agora
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit"
                  size="large"
                  component={RouterLink}
                  to="/login"
                >
                  Fazer Login
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/assets/home/home.jpg"
                alt="Ilustração da Parceira Jurídica"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h4" component="h2" gutterBottom>
            Recursos Poderosos para Profissionais do Direito
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Combine o conhecimento jurídico com inteligência artificial para potencializar seu trabalho.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h3">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom>
                Benefícios da Nossa Solução
              </Typography>
              <Typography variant="subtitle1" paragraph color="text.secondary">
                A Advogada Parceira foi desenvolvida para otimizar seu fluxo de trabalho jurídico.
              </Typography>
              
              <List>
                {benefits.map((benefit, index) => (
                  <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemIcon>
                      {benefit.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={benefit.title}
                      secondary={benefit.description}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 4, 
                  borderRadius: 2, 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Experimente Gratuitamente
                </Typography>
                <Typography paragraph>
                  Registre-se hoje e ganhe créditos para testar todas as funcionalidades.
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  component={RouterLink}
                  to="/register"
                  sx={{ mt: 2 }}
                >
                  Criar Conta Grátis
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          O Que Dizem Nossos Usuários
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          {/* Testimonial 1 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body1" paragraph>
                  "A Advogada Parceira revolucionou minha prática jurídica. Economizo horas de pesquisa e redação, com resultados de alta qualidade."
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Dra. Marina Silva
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Advogada, São Paulo
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Testimonial 2 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body1" paragraph>
                  "Os modelos de petição e a pesquisa de jurisprudência me ajudam a fundamentar melhor meus casos. Ferramenta indispensável."
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Dr. Carlos Mendes
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Advogado, Rio de Janeiro
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Testimonial 3 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body1" paragraph>
                  "Como advogada iniciante, a plataforma tem sido minha mentora virtual. Me ajuda a criar documentos profissionais e aprender sobre diversas áreas."
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Dra. Ana Costa
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Advogada, Belo Horizonte
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage; 