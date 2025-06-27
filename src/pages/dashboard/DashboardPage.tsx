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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useAuth } from '../../contexts/AuthContext';
import { formatRelativeDate } from '../../utils/dateUtils';
import * as chatService from '../../services/chatService';
import * as documentService from '../../services/documentService';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [welcomeMessage] = useState<string>("Olá");
  const [suggestedPrompts] = useState<string[]>([
    "Redigir petição inicial",
    "Criar contrato",
    "Analisar jurisprudência",
    "Responder cliente",
    "Contestação",
    "Recurso"
  ]);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (user && !user.firstName && user.nome_completo) {
        await refreshUserData();
      }
      
      const sessions = await chatService.getChatSessions();
      setChatSessions(sessions.slice(0, 3));
      
      try {
        const documents = await documentService.getUserDocuments();
        setRecentDocuments(documents.slice(0, 3));
      } catch (docError) {
        console.error('Error fetching documents:', docError);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [refreshUserData, user]);
  
  const history = React.useRef(location.pathname);
  
  useEffect(() => {
    const isDashboardPage = location.pathname === '/dashboard' || location.pathname === '/';
    const wasNotDashboardPage = location.key && location.pathname !== history.current;
    
    if (isDashboardPage && wasNotDashboardPage) {
      fetchData();
      history.current = location.pathname;
    }
  }, [location.pathname, location.key, fetchData]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        
        <Box sx={{ 
          mb: 4, 
          borderRadius: 3,
          bgcolor: 'transparent',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: '#f5f7fa',
            zIndex: -1
          }} />
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '60%',
            height: '100%',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #f5f7fa 40%, transparent 100%)',
            zIndex: -1
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '75%',
            height: '100%',
            background: 'linear-gradient(135deg, transparent 0%, #e8f0fe 40%, #e8f0fe 100%)',
            zIndex: -1
          }} />
          
          <Grid container spacing={0}>
            <Grid item xs={12} md={8} sx={{ p: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 600,
                    mb: 0.5,
                    background: `linear-gradient(90deg, #2c3e50 0%, ${theme.palette.primary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent'
                  }}
                >
                  Olá {user?.firstName || user?.nome_completo?.split(' ')[0] || 'Usuário'}!
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontWeight: 'medium'
                  }}
                >
                  O que precisa hoje?
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {suggestedPrompts.map((prompt, index) => (
                  <Button 
                    key={index}
                    variant="outlined" 
                    size="medium"
                    onClick={() => navigate('/chat')}
                    sx={{ 
                      borderRadius: 8,
                      px: 2,
                      py: 1.2,
                      color: theme.palette.text.primary,
                      backgroundColor: 'white',
                      borderColor: theme.palette.divider,
                      textTransform: 'none',
                      fontWeight: 'medium',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        borderColor: theme.palette.primary.main,
                      },
                      mb: 1
                    }}
                    startIcon={
                      index === 0 ? <DescriptionIcon color="primary" /> : 
                      index === 1 ? <DescriptionIcon color="secondary" /> :
                      index === 2 ? <SearchIcon color="primary" /> :
                      index === 3 ? <ChatIcon color="secondary" /> :
                      index === 4 ? <DescriptionIcon color="primary" /> :
                      <DescriptionIcon color="secondary" />
                    }
                  >
                    {prompt}
                  </Button>
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              p: 4,
              borderLeft: { md: `1px solid ${theme.palette.divider}` }
            }}>
              <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                Acesso rápido
              </Typography>
              
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/chat')}
                sx={{ 
                  borderRadius: 2,
                  py: 1.5,
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 'medium',
                  textTransform: 'none',
                  mb: 2,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`,
                  }
                }}
                startIcon={<ChatIcon />}
              >
                Novo chat
              </Button>
              
              <Button 
                variant="outlined" 
                size="large"
                component={RouterLink}
                to="/documents/new"
                sx={{ 
                  borderRadius: 2,
                  py: 1.5,
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.divider,
                  fontWeight: 'medium',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    borderColor: theme.palette.primary.main,
                  }
                }}
                startIcon={<DescriptionIcon />}
              >
                Novo modelo
              </Button>
            </Grid>
          </Grid>
        </Box>

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
                <Typography variant="h6" fontWeight="bold" color="white">Assistente AI</Typography>
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
                <Typography variant="h6" fontWeight="bold" color="white">Modelos</Typography>
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
                  Criar Modelo
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
                  Modelos Recentes
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
                    O que você quer saber?
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