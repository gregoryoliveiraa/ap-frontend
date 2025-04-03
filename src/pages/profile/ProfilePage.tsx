import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    oab: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Adicionar estados para o popup de planos
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  
  // Adicionar mapeamento de valores dos planos
  const planPrices = {
    basic: 49.90,
    pro: 99.90,
    enterprise: 199.90
  };

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        oab: user.oab || '',
      });
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form to current user data when entering edit mode
      if (user) {
        setFormData({
          ...formData,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          oab: user.oab || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, you would send this data to your API
      await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        oab: formData.oab,
      });
      
      setNotification({
        open: true,
        message: 'Perfil atualizado com sucesso!',
        severity: 'success'
      });
      setIsEditing(false);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Erro ao atualizar perfil. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setNotification({
        open: true,
        message: 'As senhas não coincidem.',
        severity: 'error'
      });
      return;
    }
    
    try {
      // In a real app, you would send this data to your API
      // await api.post('/auth/change-password', {
      //   currentPassword: formData.currentPassword,
      //   newPassword: formData.newPassword
      // });
      
      setNotification({
        open: true,
        message: 'Senha atualizada com sucesso!',
        severity: 'success'
      });
      
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Erro ao atualizar senha. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Adicionar funções para gerenciar o popup de planos
  const handleOpenPlanDialog = () => {
    setOpenPlanDialog(true);
  };

  const handleClosePlanDialog = () => {
    setOpenPlanDialog(false);
    setSelectedPlan('');
  };

  const handleChangePlan = () => {
    if (!selectedPlan) {
      setNotification({
        open: true,
        message: 'Por favor, selecione um plano',
        severity: 'error'
      });
      return;
    }
    
    // Obter o valor do plano selecionado
    const planAmount = planPrices[selectedPlan as keyof typeof planPrices];
    
    // Navegar para o checkout com as informações do plano
    navigate('/checkout', { 
      state: { 
        amount: planAmount,
        method: 'credit', // Default para planos é cartão de crédito
        fromPage: 'profile',
        isPlanSubscription: true,
        planType: selectedPlan
      } 
    });
    
    handleClosePlanDialog();
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h6">Carregando perfil...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={0} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{ width: 80, height: 80, bgcolor: 'primary.main', mr: 2 }}
            src={user.avatar}
          >
            {!user.avatar && `${user.firstName?.[0]}${user.lastName?.[0]}`}
          </Avatar>
          <Box>
            <Typography variant="h5">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.email}
            </Typography>
            {user.oab && (
              <Typography variant="body2" color="text.secondary">
                OAB: {user.oab}
              </Typography>
            )}
          </Box>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Dados Pessoais" />
          <Tab label="Segurança" />
          <Tab label="Assinatura" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sobrenome"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número OAB"
                  name="oab"
                  value={formData.oab}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                {isEditing ? (
                  <>
                    <Button 
                      onClick={handleEditToggle} 
                      sx={{ mr: 2 }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                    >
                      Salvar Alterações
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleEditToggle} 
                    variant="outlined" 
                    color="primary"
                  >
                    Editar Perfil
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handlePasswordSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Senha Atual"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nova Senha"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirmar Nova Senha"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                >
                  Atualizar Senha
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plano Atual
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                {user.plano?.charAt(0).toUpperCase() + user.plano?.slice(1) || 'Gratuito'}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {user.plano === 'premium' 
                  ? 'Acesso completo a todas as funcionalidades.' 
                  : 'Acesso limitado às funcionalidades básicas.'}
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleOpenPlanDialog}
              >
                {user.plano === 'premium' ? 'Gerenciar Assinatura' : 'Fazer Upgrade'}
              </Button>
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom>
            Histórico de Pagamentos
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Os últimos pagamentos aparecerão aqui.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Adicionar Dialog para seleção de planos */}
      <Dialog 
        open={openPlanDialog} 
        onClose={handleClosePlanDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5">Escolher Plano</Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" paragraph>
            Escolha o plano que melhor se adapta às suas necessidades:
          </Typography>
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
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Detalhes do Plano:</Typography>
            {selectedPlan === 'basic' && (
              <>
                <Typography variant="body2">• 1.000 tokens por mês</Typography>
                <Typography variant="body2">• 10 documentos por mês</Typography>
                <Typography variant="body2">• Suporte por email</Typography>
              </>
            )}
            {selectedPlan === 'pro' && (
              <>
                <Typography variant="body2">• 5.000 tokens por mês</Typography>
                <Typography variant="body2">• 30 documentos por mês</Typography>
                <Typography variant="body2">• Suporte prioritário</Typography>
                <Typography variant="body2">• Acesso a modelos premium</Typography>
              </>
            )}
            {selectedPlan === 'enterprise' && (
              <>
                <Typography variant="body2">• 10.000 tokens por mês</Typography>
                <Typography variant="body2">• Documentos ilimitados</Typography>
                <Typography variant="body2">• Suporte dedicado</Typography>
                <Typography variant="body2">• Acesso a todos os recursos</Typography>
                <Typography variant="body2">• API personalizada</Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClosePlanDialog}>Cancelar</Button>
          <Button onClick={handleChangePlan} variant="contained" color="primary">
            Continuar para Pagamento
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage; 