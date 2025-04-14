import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Container,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  useTheme,
  alpha,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../../contexts/AuthContext';
import { formatRelativeDate } from '../../utils/dateUtils';
import * as usageService from '../../services/usageService';
import * as chatService from '../../services/chatService';
import * as documentService from '../../services/documentService';

const DashboardPage: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const theme = useTheme();
  const location = useLocation();
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [totalChatSessions, setTotalChatSessions] = useState<number>(0);
  const [recentDocuments, setRecentDocuments] = useState<documentService.Document[]>([]);
  const [usageData, setUsageData] = useState<usageService.UsageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Função para buscar dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Apenas atualiza os dados do usuário na primeira carga
      if (user && !user.firstName && user.nome_completo) {
        await refreshUserData();
      }
      
      // Fetch usage data for credits and tokens
      const usage = await usageService.getUserUsage();
      setUsageData(usage);
      console.log('Dashboard usage data:', usage);
      
      // Fetch chat sessions
      const sessions = await chatService.getChatSessions();
      setTotalChatSessions(sessions.length); // Armazena o número total de sessões
      setChatSessions(sessions.slice(0, 3)); // Limit to 3 recent sessions
      
      // Fetch document history
      try {
        const documents = await documentService.getUserDocuments();
        console.log('Dashboard documents:', documents);
        setRecentDocuments(documents.slice(0, 3)); // Limit to 3 recent documents
      } catch (docError) {
        console.error('Error fetching documents:', docError);
        // Don't set general error, just log the specific error
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [refreshUserData, user]);
  
  // Manter referência da localização atual
  const history = React.useRef(location.pathname);
  
  // Atualiza os dados apenas quando a localização muda para o dashboard
  useEffect(() => {
    const isDashboardPage = location.pathname === '/dashboard' || location.pathname === '/';
    const wasNotDashboardPage = location.key && location.pathname !== history.current;
    
    if (isDashboardPage && wasNotDashboardPage) {
      console.log('Dashboard page active after navigation, fetching fresh data');
      fetchData();
      history.current = location.pathname;
    }
  }, [location.pathname, location.key, fetchData]);
  
  // Fetch real data from API quando o componente é montado
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Calculate credit usage percentage
  const creditPercentage = () => {
    const max = 100;
    const available = usageData?.available_tokens || user?.creditos_disponiveis || 0;
    return (available / max) * 100;
  };
  
  // Get total tokens used
  const totalTokensUsed = () => {
    return usageData?.total_tokens || 0;
  };
  
  // Get available tokens/credits
  const availableTokens = () => {
    return usageData?.available_tokens || user?.creditos_disponiveis || 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Welcome Section */}
        <Paper 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
            color: 'white',
            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom color="white">
                Bem-vindo(a), {user?.firstName || user?.nome_completo?.split(' ')[0] || 'Usuário'}!
              </Typography>
              <Typography variant="body1" color="white">
                O que você gostaria de fazer hoje?
              </Typography>
            </Box>
            <Box sx={{ mt: { xs: 2, md: 0 } }}>
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={<SettingsIcon />}
                component={RouterLink}
                to="/profile"
                sx={{ 
                  borderRadius: 2, 
                  px: 3,
                  color: '#fff',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                Minha Conta
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Créditos Disponíveis</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary" sx={{ my: 1 }}>
                    {availableTokens()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                  <CreditCardIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={creditPercentage()} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    mb: 1
                  }} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    {availableTokens()}/100 créditos
                  </Typography>
                  <Button 
                    size="small" 
                    startIcon={<AddCircleOutlineIcon />}
                    component={RouterLink}
                    to="/usage"
                  >
                    Adicionar
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Conversas</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary" sx={{ my: 1 }}>
                    {totalChatSessions}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                  <ChatIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 'auto' }}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/chat"
                  endIcon={<ChatIcon />}
                >
                  Ver Todas
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Tokens Utilizados</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary" sx={{ my: 1 }}>
                    {totalTokensUsed()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                  <HistoryIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 'auto' }}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/usage"
                  endIcon={<CreditCardIcon />}
                >
                  Ver Detalhes
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Main Features Section */}
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: theme.palette.primary.dark }}>
          Ferramentas
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'primary.main', 
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}>
                <ChatIcon sx={{ fontSize: 32, mr: 1, color: 'white' }} />
                <Typography variant="h6" fontWeight="bold" color="white">Assistente Jurídico</Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Converse com a IA para obter orientações jurídicas, redigir petições ou analisar documentos.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label="Fácil de usar" size="small" color="primary" variant="outlined" />
                  <Chip label="Rápido" size="small" color="primary" variant="outlined" />
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  fullWidth
                  variant="contained" 
                  component={RouterLink}
                  to="/chat"
                  startIcon={<ChatIcon />}
                >
                  Iniciar Conversa
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'primary.main', 
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}>
                <DescriptionIcon sx={{ fontSize: 32, mr: 1, color: 'white' }} />
                <Typography variant="h6" fontWeight="bold" color="white">Documentos</Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Crie, edite e gerencie seus documentos jurídicos com a ajuda da nossa inteligência artificial.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label="Modelos prontos" size="small" color="primary" variant="outlined" />
                  <Chip label="Personalização" size="small" color="primary" variant="outlined" />
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  fullWidth
                  variant="contained" 
                  component={RouterLink}
                  to="/documents/new"
                  startIcon={<DescriptionIcon />}
                >
                  Criar Documento
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'primary.main', 
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}>
                <SearchIcon sx={{ fontSize: 32, mr: 1, color: 'white' }} />
                <Typography variant="h6" fontWeight="bold" color="white">Jurisprudência</Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Pesquise e analise jurisprudência para encontrar precedentes relevantes para seus casos.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label="Busca avançada" size="small" color="primary" variant="outlined" />
                  <Chip label="Filtros" size="small" color="primary" variant="outlined" />
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  fullWidth
                  variant="contained" 
                  component={RouterLink}
                  to="/search"
                  startIcon={<SearchIcon />}
                >
                  Pesquisar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Conversas Recentes
                </Typography>
                <Button 
                  size="small" 
                  color="primary"
                  component={RouterLink}
                  to="/chat"
                >
                  Ver Todas
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {chatSessions.length > 0 ? (
                <List disablePadding>
                  {chatSessions.map((session) => (
                    <ListItem 
                      key={session.id} 
                      disablePadding 
                      sx={{ 
                        mb: 1, 
                        p: 1, 
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        }
                      }}
                      component={RouterLink}
                      to={`/chat/${session.id}`}
                      button={false as any}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                          <ChatIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={session.title}
                        secondary={
                          <React.Fragment>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14, color: 'text.secondary' }} />
                              <Typography component="span" variant="caption" color="text.secondary">
                                {session.updatedAt ? formatRelativeDate(session.updatedAt) : 'Data não disponível'}
                              </Typography>
                              <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
                              <Typography component="span" variant="caption" color="text.secondary">
                                {session.messageCount} mensagens
                              </Typography>
                            </Box>
                          </React.Fragment>
                        }
                        secondaryTypographyProps={{ component: "div" }}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Nenhuma conversa recente
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    component={RouterLink}
                    to="/chat"
                  >
                    Iniciar Conversa
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Documentos Recentes
                </Typography>
                <Button 
                  size="small" 
                  color="primary"
                  component={RouterLink}
                  to="/documents"
                >
                  Ver Todos
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {recentDocuments.length > 0 ? (
                <List disablePadding>
                  {recentDocuments.map((doc) => (
                    <ListItem 
                      key={doc.id} 
                      disablePadding 
                      sx={{ 
                        mb: 1, 
                        p: 1, 
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        }
                      }}
                      component={RouterLink}
                      to={`/documents/${doc.id}`}
                      button={false as any}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                          <DescriptionIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={doc.title}
                        secondary={
                          <React.Fragment>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14, color: 'text.secondary' }} />
                              <Typography component="span" variant="caption" color="text.secondary">
                                {doc.updated_at ? formatRelativeDate(doc.updated_at) : 'Data não disponível'}
                              </Typography>
                              <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
                              <Chip 
                                label={doc.document_type} 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } 
                                }} 
                              />
                            </Box>
                          </React.Fragment>
                        }
                        secondaryTypographyProps={{ component: "div" }}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Nenhum documento recente
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    component={RouterLink}
                    to="/documents/new"
                  >
                    Criar Documento
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Help Section */}
        <Paper 
          sx={{ 
            p: 3, 
            mt: 4, 
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <HelpOutlineIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Precisa de ajuda?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Confira nossos tutoriais e perguntas frequentes.
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="contained" 
            component={RouterLink}
            to="/help"
            sx={{ 
              borderRadius: 2,
              px: 3,
            }}
          >
            Central de Ajuda
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default DashboardPage; 