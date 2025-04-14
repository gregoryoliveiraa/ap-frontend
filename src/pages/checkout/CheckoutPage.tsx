import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stepper,
  Step,
  StepLabel,
  useTheme
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useAuth } from '../../contexts/AuthContext';

interface LocationState {
  amount?: number;
  fromPage?: string;
  method?: 'credit' | 'pix';
  isPlanSubscription?: boolean;
  planType?: 'basic' | 'pro' | 'enterprise';
}

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
}

const CheckoutPage: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    amount = 0, 
    fromPage = 'usage', 
    method = 'credit',
    isPlanSubscription = false,
    planType = 'basic'
  } = (location.state as LocationState) || {};

  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>(method);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });

  // Passos do checkout
  const steps = ['Informações de Pagamento', 'Confirmação', 'Processamento'];

  const handleCardInputChange = (field: keyof CardData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    
    // Formatação básica dos campos
    if (field === 'number') {
      value = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    } else if (field === 'expiry') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5);
    } else if (field === 'cvc') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const getPlanName = () => {
    switch (planType) {
      case 'basic':
        return 'Plano Básico';
      case 'pro':
        return 'Plano Pro';
      case 'enterprise':
        return 'Plano Enterprise';
      default:
        return 'Plano';
    }
  };

  const getPlanFeatures = () => {
    switch (planType) {
      case 'basic':
        return [
          '1.000 tokens/mês',
          '10 documentos/mês',
          'Suporte por email'
        ];
      case 'pro':
        return [
          '5.000 tokens/mês',
          '50 documentos/mês',
          'Suporte prioritário',
          'Recursos avançados de IA'
        ];
      case 'enterprise':
        return [
          'Tokens ilimitados',
          'Documentos ilimitados',
          'Suporte dedicado 24/7',
          'API personalizada',
          'Recursos exclusivos'
        ];
      default:
        return [];
    }
  };

  const handleProceedToConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar dados do cartão se o método de pagamento for crédito
    if (paymentMethod === 'credit') {
      if (cardData.number.replace(/\s/g, '').length < 16) {
        setError('Número de cartão inválido');
        return;
      }
      
      if (!cardData.name) {
        setError('Nome no cartão é obrigatório');
        return;
      }
      
      if (cardData.expiry.length < 5) {
        setError('Data de validade inválida');
        return;
      }
      
      if (cardData.cvc.length < 3) {
        setError('CVC inválido');
        return;
      }
    }
    
    setError(null);
    setActiveStep(1);
  };

  const handleSubmit = async () => {
    setActiveStep(2);
    setLoading(true);
    setError(null);

    try {
      // Aqui seria a integração real com o gateway de pagamento
      // Por enquanto, vamos simular um sucesso após 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular chamada à API para atualizar saldo ou assinar plano
      const endpoint = isPlanSubscription ? '/api/v1/users/subscribe-plan' : '/api/v1/users/add-credits';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentMethod,
          ...(isPlanSubscription ? { planType } : {}),
          ...(paymentMethod === 'credit' ? {
            cardData: {
              ...cardData,
              number: cardData.number.replace(/\s/g, '').slice(-4) // Apenas últimos 4 dígitos
            }
          } : {})
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao processar pagamento');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(fromPage === 'usage' ? '/usage' : '/profile');
      }, 2000);
    } catch (err) {
      setError('Erro ao processar pagamento. Por favor, tente novamente.');
      setActiveStep(1);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            my: 4
          }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" component="h1" gutterBottom color="success.main" fontWeight="bold">
              Pagamento Processado com Sucesso!
            </Typography>
            <Typography variant="body1" paragraph>
              Sua transação foi concluída e {isPlanSubscription ? 'seu plano foi atualizado' : 'seus créditos foram adicionados'}.
            </Typography>
            <Typography variant="body2" sx={{ my: 1 }}>
              Redirecionando para a página de {fromPage === 'usage' ? 'consumo' : 'perfil'}...
            </Typography>
            <CircularProgress size={20} sx={{ mt: 2 }} />
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{ mr: 2 }}
            >
              Voltar
            </Button>
            <Typography variant="h5" component="h1" fontWeight="medium">
              Checkout
            </Typography>
          </Box>
          <Chip 
            icon={<SecurityIcon />} 
            label="Pagamento Seguro" 
            color="success" 
            variant="outlined" 
          />
        </Box>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Resumo da compra */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={5}>
            <Card elevation={3} sx={{ 
              borderRadius: 2,
              bgcolor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`
            }}>
              <CardHeader 
                title="Resumo da Compra" 
                sx={{ 
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  py: 1.5
                }}
              />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  {isPlanSubscription ? (
                    <>
                      <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                        {getPlanName()}
                      </Typography>
                      <Typography variant="subtitle1">
                        Valor mensal: <Box component="span" fontWeight="bold">R$ {amount.toFixed(2)}</Box>
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                        Recursos incluídos:
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {getPlanFeatures().map((feature, index) => (
                          <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                            {feature}
                          </Typography>
                        ))}
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Assinatura com renovação automática mensal
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Adição de Créditos
                      </Typography>
                      <Typography variant="subtitle1">
                        Quantidade: <Box component="span" fontWeight="bold">{amount} créditos</Box>
                      </Typography>
                      <Typography variant="subtitle1">
                        Valor: <Box component="span" fontWeight="bold">R$ {amount.toFixed(2)}</Box>
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        20 tokens por crédito
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Créditos adicionados imediatamente após o pagamento
                      </Typography>
                    </>
                  )}
                </Box>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: theme.palette.grey[50], 
                  borderRadius: 1, 
                  border: `1px dashed ${theme.palette.grey[300]}`
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptIcon fontSize="small" sx={{ mr: 1 }} />
                    Conta associada: {user?.email || 'Usuário'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            {activeStep === 0 && (
              <form onSubmit={handleProceedToConfirmation}>
                {/* Método de Pagamento */}
                <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                  <FormLabel component="legend">Método de Pagamento</FormLabel>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'credit' | 'pix')}
                  >
                    <FormControlLabel 
                      value="credit" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CreditCardIcon sx={{ mr: 1 }} />
                          Cartão de Crédito
                        </Box>
                      }
                    />
                    <FormControlLabel 
                      value="pix" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <QrCode2Icon sx={{ mr: 1 }} />
                          PIX
                        </Box>
                      }
                      disabled={isPlanSubscription}
                    />
                    {isPlanSubscription && paymentMethod === 'pix' && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', ml: 2 }}>
                        Assinaturas requerem pagamento por cartão de crédito para renovação automática.
                      </Typography>
                    )}
                  </RadioGroup>
                </FormControl>

                <Divider sx={{ mb: 3 }} />

                {/* Formulário de Cartão de Crédito */}
                {paymentMethod === 'credit' && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Número do Cartão"
                        value={cardData.number}
                        onChange={handleCardInputChange('number')}
                        placeholder="0000 0000 0000 0000"
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nome no Cartão"
                        value={cardData.name}
                        onChange={handleCardInputChange('name')}
                        placeholder="Como aparece no cartão"
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Validade (MM/AA)"
                        value={cardData.expiry}
                        onChange={handleCardInputChange('expiry')}
                        placeholder="MM/AA"
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="CVC"
                        value={cardData.cvc}
                        onChange={handleCardInputChange('cvc')}
                        placeholder="123"
                        required
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                )}

                {/* QR Code do PIX */}
                {paymentMethod === 'pix' && (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" gutterBottom>
                      Escaneie o QR Code para pagar
                    </Typography>
                    <Box 
                      sx={{ 
                        width: 200, 
                        height: 200, 
                        bgcolor: 'grey.100', 
                        mx: 'auto', 
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: 'grey.300',
                        borderRadius: 1
                      }}
                    >
                      <QrCode2Icon sx={{ fontSize: 100, color: 'grey.500' }} />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      Chave PIX: advogadaparceira@email.com
                    </Typography>
                    <Box sx={{ mt: 2, bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Após realizar o pagamento via PIX, seus créditos serão adicionados automaticamente à sua conta em até 5 minutos.
                      </Typography>
                    </Box>
                  </Box>
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    Continuar
                  </Button>
                </Box>
              </form>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Confirmar Pagamento
                </Typography>

                <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: theme.palette.grey[50] }}>
                  <Typography variant="body1" gutterBottom fontWeight="medium">
                    Detalhes do pagamento:
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Valor:</Typography>
                    <Typography variant="body2" fontWeight="bold">R$ {amount.toFixed(2)}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Método:</Typography>
                    <Typography variant="body2">
                      {paymentMethod === 'credit' 
                        ? `Cartão de crédito (final ${cardData.number.replace(/\s/g, '').slice(-4)})` 
                        : 'PIX'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Produto:</Typography>
                    <Typography variant="body2">
                      {isPlanSubscription ? getPlanName() : `${amount} créditos`}
                    </Typography>
                  </Box>
                </Paper>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Ao clicar em "Confirmar Pagamento", você concorda com os termos de uso e política de privacidade da Advogada Parceira.
                  </Typography>
                </Alert>

                {error && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(0)}
                    disabled={loading}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    {loading ? 'Processando...' : 'Confirmar Pagamento'}
                  </Button>
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Processando seu pagamento
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Por favor, aguarde enquanto processamos sua transação...
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CheckoutPage; 