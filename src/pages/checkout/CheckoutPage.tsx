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
  CardContent
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCode2Icon from '@mui/icons-material/QrCode2';
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
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Pagamento processado com sucesso! Redirecionando...
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Checkout
        </Typography>

        {/* Resumo da compra */}
        <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resumo
            </Typography>
            {isPlanSubscription ? (
              <>
                <Typography variant="body1" fontWeight="bold">
                  {getPlanName()}
                </Typography>
                <Typography variant="body1">
                  Valor mensal: R$ {amount.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  Assinatura com renovação automática mensal
                </Typography>
              </>
            ) : (
              <Typography variant="body1">
                Valor: R$ {amount.toFixed(2)}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 1 }}>
              {user?.nome_completo}
            </Typography>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          {/* Método de Pagamento */}
          <FormControl component="fieldset" sx={{ mb: 3 }}>
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
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome no Cartão"
                  value={cardData.name}
                  onChange={handleCardInputChange('name')}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Validade (MM/AA)"
                  value={cardData.expiry}
                  onChange={handleCardInputChange('expiry')}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVC"
                  value={cardData.cvc}
                  onChange={handleCardInputChange('cvc')}
                  required
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
                  bgcolor: 'grey.200', 
                  mx: 'auto', 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <QrCode2Icon sx={{ fontSize: 100, color: 'grey.400' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Chave PIX: advogadaparceira@email.com
              </Typography>
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
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Processando...' : (isPlanSubscription ? 'Assinar Plano' : 'Finalizar Pagamento')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CheckoutPage; 