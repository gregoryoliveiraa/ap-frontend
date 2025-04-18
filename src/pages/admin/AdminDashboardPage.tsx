import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  Divider, 
  Button, 
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import TokenIcon from '@mui/icons-material/Token';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AdminNavigation from './components/AdminNavigation';
import * as adminService from '../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Interfaces para tipagem dos dados
interface UserPlan {
  name: string;
  value: number;
}

interface TokenUsage {
  date: string;
  tokens: number;
}

interface RecentAction {
  id: number;
  user: string;
  action: string;
  time: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTokens: number;
  totalDocuments: number;
  pendingActions: number;
  usersRegisteredThisMonth: number;
  usersPerPlan: UserPlan[];
  tokensPerDay: TokenUsage[];
  recentActions: RecentAction[];
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getSystemStats();
        setStats({ ...data, recentActions: data.recentActions || [] });
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        setError('Não foi possível carregar as estatísticas do sistema');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Dados temporários para demonstração
  const demoStats: SystemStats = {
    totalUsers: 156,
    activeUsers: 98,
    totalTokens: 456840,
    totalDocuments: 312,
    pendingActions: 8,
    usersRegisteredThisMonth: 22,
    usersPerPlan: [
      { name: 'Gratuito', value: 78 },
      { name: 'Básico', value: 45 },
      { name: 'Pro', value: 28 },
      { name: 'Enterprise', value: 5 }
    ],
    tokensPerDay: [
      { date: '01/06', tokens: 1200 },
      { date: '02/06', tokens: 1400 },
      { date: '03/06', tokens: 1800 },
      { date: '04/06', tokens: 1600 },
      { date: '05/06', tokens: 2200 },
      { date: '06/06', tokens: 2400 },
      { date: '07/06', tokens: 2100 }
    ],
    recentActions: [
      { id: 1, user: 'maria@example.com', action: 'Assinatura do plano Pro', time: '2 horas atrás' },
      { id: 2, user: 'joao@example.com', action: 'Geração de documento', time: '4 horas atrás' },
      { id: 3, user: 'carlos@example.com', action: 'Adição de créditos', time: '1 dia atrás' }
    ]
  };

  const data: SystemStats = stats || demoStats;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Carregando estatísticas...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <AdminPanelSettingsIcon sx={{ fontSize: 36, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Painel Administrativo
        </Typography>
      </Box>

      <AdminNavigation />
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Métricas principais */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Usuários Totais
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {data.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.usersRegisteredThisMonth} novos este mês
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TokenIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Tokens Utilizados
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {data && data.totalTokens ? data.totalTokens.toLocaleString() : '...'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Desde o início da plataforma
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DescriptionIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Documentos Gerados
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {data.totalDocuments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Por todos os usuários
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsActiveIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Ações Pendentes
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {data.pendingActions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Requerem atenção
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Gráficos e análises */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Consumo de Tokens nos Últimos 7 Dias
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.tokensPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                    activeDot={{ r: 8 }} 
                    name="Tokens"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Distribuição de Usuários por Plano
            </Typography>
            <Box sx={{ height: 300, mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.usersPerPlan}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(data?.usersPerPlan ?? []).map((entry: UserPlan, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} usuários`, 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Ações recentes */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Atividades Recentes
              </Typography>
              <Button 
                variant="text" 
                endIcon={<TrendingUpIcon />}
                onClick={() => navigate('/admin/users')}
              >
                Ver todas
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
              {(data?.recentActions ?? []).length > 0 ? (
                (data?.recentActions ?? []).map((action: RecentAction) => (
                  <ListItem key={action.id} alignItems="flex-start" sx={{ px: 1 }}>
                    <ListItemIcon>
                      <AccessTimeIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={action.action}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {action.user}
                          </Typography>
                          {` — ${action.time}`}
                        </>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem sx={{ px: 1 }}>
                  <ListItemText primary="Nenhuma atividade recente encontrada." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Ações rápidas */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ações Rápidas
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/admin/users')}
                  startIcon={<PeopleIcon />}
                >
                  Gerenciar Usuários
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={() => navigate('/admin/notifications')}
                  startIcon={<NotificationsActiveIcon />}
                >
                  Enviar Notificação
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="contained" 
                  color="info"
                  onClick={() => navigate('/admin/credits')}
                  startIcon={<TokenIcon />}
                >
                  Gerenciar Créditos
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboardPage; 