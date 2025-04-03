import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import * as usageService from '../../services/usageService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`usage-tabpanel-${index}`}
      aria-labelledby={`usage-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface PaymentHistory {
  id: string;
  created_at: string;
  amount: number;
  payment_method: 'credit' | 'pix';
  status: 'completed' | 'pending' | 'failed';
  card_last_digits?: string;
}

interface UsageData {
  total_tokens: number;
  total_documents: number;
  available_tokens: number;
  chat_history: {
    id: string;
    created_at: string;
    tokens_used: number;
  }[];
  document_history: {
    id: string;
    created_at: string;
    tokens_used: number;
    document_type: string;
  }[];
  payment_history: PaymentHistory[];
  tokens_per_credit?: number;
}

export const UsagePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showLast10, setShowLast10] = useState(true);
  const [usageData, setUsageData] = useState<UsageData>({
    total_tokens: 0,
    total_documents: 0,
    available_tokens: 0,
    chat_history: [],
    document_history: [],
    payment_history: []
  });
  const [openChangePlan, setOpenChangePlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openAddCreditsDialog, setOpenAddCreditsDialog] = useState(false);
  const [creditAmount, setCreditAmount] = useState<number>(10);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('pix');
  const navigate = useNavigate();

  // Adicionar mapeamento de valores dos planos
  const planPrices = {
    basic: 49.90,
    pro: 99.90,
    enterprise: 199.90
  };

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setLoading(true);
        const data = await usageService.getUserUsage();
        console.log('Usage data received:', data); // Para debugging
        setUsageData(data);
      } catch (err) {
        console.error('Error fetching usage data:', err);
        setError('Erro ao carregar dados de consumo. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePlan = () => {
    if (!selectedPlan) {
      setError('Por favor, selecione um plano');
      return;
    }
    
    // Obter o valor do plano selecionado
    const planAmount = planPrices[selectedPlan as keyof typeof planPrices];
    
    // Navegar para o checkout com as informações do plano
    navigate('/checkout', { 
      state: { 
        amount: planAmount,
        method: 'credit', // Default para planos é cartão de crédito
        fromPage: 'usage',
        isPlanSubscription: true,
        planType: selectedPlan
      } 
    });
    
    setOpenChangePlan(false);
  };

  const getFilteredHistory = (history: any[]) => {
    return showLast10 ? history.slice(0, 10) : history;
  };

  const getChartData = (history: any[]) => {
    if (!history || history.length === 0) {
      return [{ date: 'Sem dados', tokens: 0 }];
    }
    
    // Função para formatar a data no padrão brasileiro
    const formatarData = (dataStr: string) => {
      const data = new Date(dataStr);
      return data.toLocaleDateString('pt-BR');
    };
    
    // Agrupa por data para consolidar múltiplos registros do mesmo dia
    const groupedByDate = history.reduce((acc, item) => {
      const date = formatarData(item.created_at);
      if (!acc[date]) {
        acc[date] = {
          date,
          tokens: 0
        };
      }
      // Soma os tokens deste item ao acumulado do dia
      acc[date].tokens += (item.tokens_used || 0);
      return acc;
    }, {});
    
    // Converte o objeto agrupado em array e ordena por data
    return Object.values(groupedByDate).sort((a: any, b: any) => {
      // Converte data no formato dd/mm/aaaa para objeto Date para ordenação correta
      const [diaA, mesA, anoA] = (a.date as string).split('/').map(Number);
      const [diaB, mesB, anoB] = (b.date as string).split('/').map(Number);
      const dateA = new Date(anoA, mesA - 1, diaA);
      const dateB = new Date(anoB, mesB - 1, diaB);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const handleOpenAddCreditsDialog = () => {
    setOpenAddCreditsDialog(true);
  };

  const handleCloseAddCreditsDialog = () => {
    setOpenAddCreditsDialog(false);
  };

  const handleAddCredits = () => {
    navigate('/checkout', { 
      state: { 
        amount: creditAmount,
        method: paymentMethod,
        fromPage: 'usage' 
      } 
    });
    handleCloseAddCreditsDialog();
  };

  if (!user) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Por favor, faça login para acessar seu consumo.
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Carregando dados de consumo...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Tentar Novamente
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Meu Consumo
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddCreditsDialog}
        >
          Adicionar Saldo
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Usage Statistics */}
      <Typography variant="h5" gutterBottom>
        Estatísticas de Uso
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Taxa de conversão: <strong>1 crédito</strong> para cada <strong>{usageData?.tokens_per_credit || 20} tokens</strong> utilizados.
          </Typography>
        </Alert>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total de Tokens Utilizados
              </Typography>
              <Typography variant="h3">
                {(usageData?.total_tokens || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Documentos Gerados
              </Typography>
              <Typography variant="h3">
                {(usageData?.total_documents || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Usage Graphs */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Gráficos de Uso
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Tokens por Dia
            </Typography>
            <Box sx={{ height: 300, bgcolor: 'background.paper', borderRadius: 1, p: 2 }}>
              {usageData.chat_history && usageData.chat_history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData(usageData.chat_history)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="tokens" 
                      stroke="#8884d8" 
                      name="Tokens"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Alert severity="info" sx={{ width: '100%' }}>
                    Nenhum dado disponível para exibição. Use o chat para gerar histórico de uso.
                  </Alert>
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Documentos por Dia
            </Typography>
            <Box sx={{ height: 300, bgcolor: 'background.paper', borderRadius: 1, p: 2 }}>
              {usageData.document_history && usageData.document_history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData(usageData.document_history)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="tokens" 
                      fill="#82ca9d" 
                      name="Tokens"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Alert severity="info" sx={{ width: '100%' }}>
                    Nenhum documento foi gerado ainda. Crie documentos para ver o histórico.
                  </Alert>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* History Tabs */}
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="usage tabs">
            <Tab label="Histórico de Chat" />
            <Tab label="Histórico de Documentos" />
            <Tab label="Histórico de Pagamentos" />
          </Tabs>
          <FormControlLabel
            control={
              <Switch
                checked={showLast10}
                onChange={(e) => setShowLast10(e.target.checked)}
                color="primary"
              />
            }
            label="Mostrar últimos 10 itens"
          />
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Sessão</TableCell>
                  <TableCell>Provedor</TableCell>
                  <TableCell align="right">Tokens</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredHistory(usageData?.chat_history || []).length > 0 ? (
                  getFilteredHistory(usageData?.chat_history || []).map((chat) => (
                    <TableRow key={chat.id}>
                      <TableCell>{new Date(chat.created_at).toLocaleString()}</TableCell>
                      <TableCell>{chat.session_title || 'Conversa sem título'}</TableCell>
                      <TableCell>{chat.provider || 'openai'}</TableCell>
                      <TableCell align="right">{chat.tokens_used}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Alert severity="info" sx={{ my: 2 }}>
                        Nenhum histórico de chat disponível. Comece uma conversa para gerar dados.
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Tokens</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredHistory(usageData?.document_history || []).length > 0 ? (
                  getFilteredHistory(usageData?.document_history || []).map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{new Date(doc.created_at).toLocaleString()}</TableCell>
                      <TableCell>{doc.document_type}</TableCell>
                      <TableCell align="right">{doc.tokens_used}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Alert severity="info" sx={{ my: 2 }}>
                        Nenhum histórico de documentos disponível. Crie documentos para gerar dados.
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredHistory(usageData?.payment_history || []).length > 0 ? (
                  getFilteredHistory(usageData?.payment_history || []).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {payment.payment_method === 'credit' ? 'Cartão de Crédito' : 'PIX'}
                        {payment.card_last_digits && ` (**** ${payment.card_last_digits})`}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={
                            payment.status === 'completed' ? 'Concluído' : 
                            payment.status === 'pending' ? 'Pendente' : 'Falhou'
                          }
                          color={
                            payment.status === 'completed' ? 'success' : 
                            payment.status === 'pending' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{`R$ ${payment.amount.toFixed(2)}`}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Alert severity="info" sx={{ my: 2 }}>
                        Nenhum histórico de pagamentos disponível.
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Plan and Balance Section */}
      <Paper sx={{ mb: 4, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Plano e Saldo
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Plano Atual
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  Plano Básico
                </Typography>
                <Typography variant="body1" paragraph>
                  • 1000 tokens/mês
                </Typography>
                <Typography variant="body1" paragraph>
                  • 10 documentos/mês
                </Typography>
                <Typography variant="body1" paragraph>
                  • Suporte por email
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => setOpenChangePlan(true)}
                  sx={{ mt: 2 }}
                >
                  Mudar Plano
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Saldo Atual
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {usageData.available_tokens} créditos
                </Typography>
                <Typography variant="body1" paragraph>
                  Adicione saldo para continuar utilizando nossos serviços
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleOpenAddCreditsDialog}
                  sx={{ mt: 2 }}
                >
                  Adicionar Saldo
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialogs */}
      <Dialog 
        open={openChangePlan} 
        onClose={() => setOpenChangePlan(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5">Mudar Plano</Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Selecione o Plano</InputLabel>
            <Select
              value={selectedPlan}
              label="Selecione o Plano"
              onChange={(e) => setSelectedPlan(e.target.value)}
              sx={{ mt: 2 }}
            >
              <MenuItem value="basic">Plano Básico - R$ 49,90/mês</MenuItem>
              <MenuItem value="pro">Plano Pro - R$ 99,90/mês</MenuItem>
              <MenuItem value="enterprise">Plano Enterprise - R$ 199,90/mês</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenChangePlan(false)}>Cancelar</Button>
          <Button onClick={handleChangePlan} variant="contained" color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openAddCreditsDialog} 
        onClose={handleCloseAddCreditsDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Adicionar Saldo</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography gutterBottom>
              Selecione o valor que deseja adicionar:
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Valor em créditos"
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 0))}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                  inputProps: { min: 1 }
                }}
                helperText="Mínimo de 1 crédito (R$ 1,00)"
              />
            </FormControl>
            
            <Typography gutterBottom>
              Selecione o método de pagamento:
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="payment-method-label">Método de Pagamento</InputLabel>
              <Select
                labelId="payment-method-label"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'credit' | 'pix')}
                label="Método de Pagamento"
              >
                <MenuItem value="pix">PIX</MenuItem>
                <MenuItem value="credit">Cartão de Crédito</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCreditsDialog}>Cancelar</Button>
          <Button 
            onClick={handleAddCredits} 
            color="primary" 
            variant="contained"
          >
            Continuar para Pagamento
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsagePage; 