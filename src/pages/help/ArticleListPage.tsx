import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Breadcrumbs,
  Link
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import UpdateIcon from '@mui/icons-material/Update';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Dados dos artigos
interface Article {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
  isNew?: boolean;
  isUpdated?: boolean;
  views: number;
}

const articles: Article[] = [
  {
    id: 1,
    title: 'Como alterar o cartão de crédito na Advogada Parceira',
    description: 'Aprenda como atualizar suas informações de pagamento e alterar o cartão de crédito vinculado à sua conta.',
    category: 'Assinatura e Pagamento',
    tags: ['Pagamento', 'Cartão', 'Cobrança'],
    date: '2023-11-15',
    views: 1245
  },
  {
    id: 2,
    title: 'Como elaborar uma Petição Inicial na Advogada Parceira',
    description: 'Guia completo para criar petições iniciais eficientes utilizando os recursos da plataforma.',
    category: 'Documentos',
    tags: ['Petição', 'Inicial', 'Tutorial'],
    date: '2023-10-28',
    views: 3560
  },
  {
    id: 3,
    title: 'Como cancelar minha assinatura?',
    description: 'Instruções passo a passo para cancelar sua assinatura e informações sobre o período remanescente.',
    category: 'Assinatura e Pagamento',
    tags: ['Cancelamento', 'Assinatura'],
    date: '2023-11-05',
    views: 890
  },
  {
    id: 4,
    title: 'Como assinar um plano na Advogada Parceira',
    description: 'Aprenda como escolher e assinar o plano ideal para suas necessidades como advogado.',
    category: 'Assinatura e Pagamento',
    tags: ['Planos', 'Assinatura', 'Pagamento'],
    date: '2023-09-20',
    views: 2150
  },
  {
    id: 5,
    title: 'Como elaborar uma Contestação na Advogada Parceira',
    description: 'Tutorial detalhado para criar contestações eficazes usando os recursos da plataforma.',
    category: 'Documentos',
    tags: ['Contestação', 'Tutorial'],
    date: '2023-10-15',
    views: 2780
  },
  {
    id: 6,
    title: 'Como alterar o meu plano?',
    description: 'Saiba como fazer upgrade ou downgrade do seu plano e como isso afeta seus recursos disponíveis.',
    category: 'Assinatura e Pagamento',
    tags: ['Planos', 'Upgrade', 'Alteração'],
    date: '2023-11-10',
    views: 1020
  },
  {
    id: 7,
    title: 'Como utilizar IA para melhorar minhas peças jurídicas',
    description: 'Guia completo para aproveitar ao máximo a inteligência artificial na elaboração de documentos jurídicos.',
    category: 'Inteligência Artificial',
    tags: ['IA', 'Documentos', 'Produtividade'],
    date: '2023-12-01',
    isNew: true,
    views: 1875
  },
  {
    id: 8,
    title: 'Como recuperar minha senha',
    description: 'Instruções para recuperar o acesso à sua conta caso tenha esquecido sua senha.',
    category: 'Conta e Segurança',
    tags: ['Segurança', 'Senha', 'Acesso'],
    date: '2023-09-05',
    views: 985
  },
  {
    id: 9,
    title: 'Como usar os modelos prontos de documentos',
    description: 'Aprenda a utilizar nossa biblioteca de modelos para criar documentos de forma mais rápida e eficiente.',
    category: 'Documentos',
    tags: ['Modelos', 'Documentos', 'Templates'],
    date: '2023-10-20',
    isUpdated: true,
    views: 3120
  },
  {
    id: 10,
    title: 'Como editar minhas informações de perfil',
    description: 'Saiba como manter seu perfil atualizado com suas informações profissionais e preferências pessoais.',
    category: 'Conta e Segurança',
    tags: ['Perfil', 'Conta', 'Configurações'],
    date: '2023-08-15',
    views: 765
  },
  {
    id: 11,
    title: 'Como ativar a autenticação de dois fatores',
    description: 'Aumente a segurança da sua conta com a autenticação de dois fatores (2FA).',
    category: 'Conta e Segurança',
    tags: ['Segurança', '2FA', 'Autenticação'],
    date: '2023-11-25',
    isNew: true,
    views: 1290
  },
  {
    id: 12,
    title: 'Como colaborar com outros advogados em documentos',
    description: 'Guia para trabalhar em conjunto com outros profissionais em documentos compartilhados.',
    category: 'Colaboração',
    tags: ['Compartilhamento', 'Equipe', 'Colaboração'],
    date: '2023-10-30',
    views: 1650
  }
];

// Categorias para filtragem
const categories = [
  'Todas',
  'Assinatura e Pagamento',
  'Documentos',
  'Conta e Segurança',
  'Inteligência Artificial',
  'Colaboração'
];

const ArticleListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('relevant');

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  // Filtrar e ordenar artigos
  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todas' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Ordenar artigos
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'mostViewed':
        return b.views - a.views;
      default: // 'relevant' e padrão
        // Os novos e atualizados têm prioridade, depois por visualizações
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        if (a.isUpdated && !b.isUpdated && !b.isNew) return -1;
        if (!a.isUpdated && b.isUpdated && !a.isNew) return 1;
        return b.views - a.views;
    }
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/help" color="inherit">
          Central de Ajuda
        </Link>
        <Typography color="text.primary">Artigos</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Biblioteca de Artigos
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Explore nossa coleção de artigos de ajuda e tutoriais para tirar o máximo proveito da Advogada Parceira
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar artigos..."
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-select-label">Categoria</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={selectedCategory}
                label="Categoria"
                onChange={handleCategoryChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-select-label">Ordenar por</InputLabel>
              <Select
                labelId="sort-select-label"
                id="sort-select"
                value={sortBy}
                label="Ordenar por"
                onChange={handleSortChange}
              >
                <MenuItem value="relevant">Relevância</MenuItem>
                <MenuItem value="newest">Mais recentes</MenuItem>
                <MenuItem value="oldest">Mais antigos</MenuItem>
                <MenuItem value="mostViewed">Mais vistos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {filteredArticles.length} {filteredArticles.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}
        </Typography>
        
        <Paper sx={{ borderRadius: 2 }}>
          <List>
            {sortedArticles.map((article, index) => (
              <React.Fragment key={article.id}>
                <ListItem 
                  alignItems="flex-start" 
                  component={RouterLink}
                  to={`/help/article/${article.id}`}
                  sx={{ 
                    textDecoration: 'none', 
                    color: 'inherit',
                    py: 2, 
                    px: 3,
                    '&:hover': { 
                      bgcolor: 'rgba(0, 0, 0, 0.04)' 
                    },
                    display: 'block'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium" color="primary">
                        {article.title}
                      </Typography>
                      {article.isNew && (
                        <Chip 
                          icon={<FiberNewIcon />} 
                          label="Novo" 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      )}
                      {article.isUpdated && (
                        <Chip 
                          icon={<UpdateIcon />} 
                          label="Atualizado" 
                          size="small" 
                          color="info" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.preventDefault(); // Prevenir navegação ao clicar no ícone
                        // Lógica para salvar
                      }}
                    >
                      <BookmarkBorderIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {article.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {article.tags.map((tag) => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          variant="outlined"
                          onClick={(e) => {
                            e.preventDefault(); // Prevenir navegação ao clicar na tag
                            setSearchTerm(tag);
                          }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(article.date).toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {article.views} visualizações
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                {index < sortedArticles.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
        
        {filteredArticles.length === 0 && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Nenhum artigo encontrado para os critérios de busca. Tente outros termos ou filtros.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Help */}
      <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Não encontrou o que procurava?
        </Typography>
        <Typography variant="body2" paragraph>
          Entre em contato com nosso suporte para obter ajuda personalizada.
        </Typography>
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/help"
          sx={{ borderRadius: 4 }}
        >
          Voltar para a Central de Ajuda
        </Button>
      </Paper>
    </Container>
  );
};

export default ArticleListPage; 