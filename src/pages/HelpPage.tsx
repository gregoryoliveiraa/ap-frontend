import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import HelpIcon from '@mui/icons-material/Help';
import SchoolIcon from '@mui/icons-material/School';
import ChatIcon from '@mui/icons-material/Chat';
import EmailIcon from '@mui/icons-material/Email';

const frequentArticles = [
  'Como alterar o cartão de crédito na Advogada Parceira',
  'Como elaborar uma Petição Inicial na Advogada Parceira',
  'Como cancelar minha assinatura?',
  'Como assinar um plano na Advogada Parceira',
  'Como elaborar uma Contestação na Advogada Parceira',
  'Como alterar o meu plano?'
];

const categories = [
  {
    title: 'Iniciando na Advogada Parceira',
    description: 'Série de tutoriais sobre como dar os primeiros passos em nossa plataforma.',
    icon: <SchoolIcon fontSize="large" color="primary" />
  },
  {
    title: 'Dúvidas mais frequentes',
    description: 'Compilado de dúvidas mais frequentes.',
    icon: <HelpIcon fontSize="large" color="primary" />
  },
  {
    title: 'Tutoriais de peças',
    description: 'Passo a passo para redação precisa das peças que oferecemos.',
    icon: <ArticleIcon fontSize="large" color="primary" />
  }
];

const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Central de Ajuda
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Como podemos te ajudar?
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ maxWidth: 600, mx: 'auto', mb: 6 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Procure na central de ajuda..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Frequent Articles */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Artigos lidos frequentemente
        </Typography>
        <List>
          {frequentArticles.map((article, index) => (
            <React.Fragment key={index}>
              <ListItem button>
                <ListItemText primary={article} />
              </ListItem>
              {index < frequentArticles.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button color="primary">Ver todas as categorias</Button>
        </Box>
      </Paper>

      {/* Categories */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {categories.map((category, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {category.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom align="center">
                  {category.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {category.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button size="small">Explorar</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Contact */}
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Não encontrou o que procurava?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Converse no chat ou envie um email.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<ChatIcon />}
            onClick={() => window.location.href = '/chat'}
          >
            Conversar no chat
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={() => window.location.href = 'mailto:suporte@advogadaparceira.com'}
          >
            Enviar um email
          </Button>
        </Box>
      </Paper>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Advogada Parceira
        </Typography>
      </Box>
    </Container>
  );
};

export default HelpPage; 