import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  CircularProgress,
  Link
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// Passos do processo de recuperação de senha
const steps = ['Email de Recuperação', 'Verificação de Código', 'Nova Senha'];

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  // Simular a verificação da força da senha
  const checkPasswordStrength = (password: string) => {
    if (!password) return null;
    
    if (password.length < 8) {
      return 'weak';
    } else if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return 'strong';
    } else {
      return 'medium';
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPwd = e.target.value;
    setNewPassword(newPwd);
    setPasswordStrength(checkPasswordStrength(newPwd));
  };

  // Simular o envio do email de recuperação
  const handleSendResetEmail = async () => {
    setError('');
    
    // Validar email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }
    
    setLoading(true);
    
    // Simulação de chamada de API
    setTimeout(() => {
      setLoading(false);
      // Avançar para o próximo passo
      setActiveStep(1);
    }, 2000);
  };

  // Simular a verificação do código
  const handleVerifyCode = () => {
    setError('');
    
    // Validar código
    if (!verificationCode || verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      setError('Por favor, insira um código válido de 6 dígitos.');
      return;
    }
    
    setLoading(true);
    
    // Simulação de chamada de API
    setTimeout(() => {
      setLoading(false);
      // Avançar para o próximo passo
      setActiveStep(2);
    }, 2000);
  };

  // Simular a definição da nova senha
  const handleResetPassword = () => {
    setError('');
    
    // Validar senha
    if (!newPassword || newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    setLoading(true);
    
    // Simulação de chamada de API
    setTimeout(() => {
      setLoading(false);
      // Avançar para o próximo passo
      setActiveStep(3);
    }, 2000);
  };

  // Renderizar o conteúdo do passo atual
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <MailOutlineIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Informe seu email de cadastro
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Enviaremos um código de verificação para seu email cadastrado.
            </Typography>
            
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              type="email"
              required
              autoFocus
            />
            
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleSendResetEmail} 
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Enviar código'}
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <VpnKeyIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Insira o código de verificação
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Digite o código de 6 dígitos que enviamos para {email}
            </Typography>
            
            <TextField
              fullWidth
              label="Código de verificação"
              variant="outlined"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              margin="normal"
              required
              autoFocus
              inputProps={{ maxLength: 6 }}
            />
            
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleVerifyCode} 
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verificar código'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Não recebeu o código?{' '}
                <Link 
                  component="button" 
                  variant="body2"
                  onClick={() => {
                    setActiveStep(0);
                    setVerificationCode('');
                  }}
                >
                  Enviar novamente
                </Link>
              </Typography>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LockResetIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Defina sua nova senha
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Crie uma senha segura com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.
            </Typography>
            
            <TextField
              fullWidth
              label="Nova senha"
              variant="outlined"
              value={newPassword}
              onChange={handlePasswordChange}
              margin="normal"
              type="password"
              required
              autoFocus
            />
            
            {passwordStrength && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Força da senha:
                </Typography>
                <Box sx={{ 
                  height: 4, 
                  borderRadius: 2, 
                  bgcolor: 'grey.200',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    height: '100%', 
                    width: passwordStrength === 'weak' ? '30%' : 
                           passwordStrength === 'medium' ? '60%' : '100%',
                    bgcolor: passwordStrength === 'weak' ? 'error.main' : 
                             passwordStrength === 'medium' ? 'warning.main' : 'success.main',
                  }} />
                </Box>
                <Typography variant="caption" color={
                  passwordStrength === 'weak' ? 'error' : 
                  passwordStrength === 'medium' ? 'warning.main' : 'success.main'
                }>
                  {passwordStrength === 'weak' ? 'Fraca' : 
                   passwordStrength === 'medium' ? 'Média' : 'Forte'}
                </Typography>
              </Box>
            )}
            
            <TextField
              fullWidth
              label="Confirme a nova senha"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              type="password"
              required
            />
            
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleResetPassword} 
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Redefinir senha'}
            </Button>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Senha redefinida com sucesso!
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Sua senha foi alterada. Agora você pode entrar em sua conta com a nova senha.
            </Typography>
            
            <Button 
              variant="contained" 
              onClick={() => navigate('/login')} 
              sx={{ mt: 2 }}
            >
              Ir para o login
            </Button>
          </Box>
        );
      default:
        return 'Passo desconhecido';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            component={RouterLink}
            to="/login"
            sx={{ mr: 2 }}
          >
            Voltar
          </Button>
          
          <Typography variant="h5" component="h1" fontWeight="bold">
            Recuperação de Senha
          </Typography>
        </Box>
        
        {activeStep < 3 && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {getStepContent(activeStep)}
        
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          Se precisar de ajuda, entre em contato com nosso{' '}
          <Link component={RouterLink} to="/help">
            suporte
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage; 