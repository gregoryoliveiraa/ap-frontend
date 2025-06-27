import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container,
  Link,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  InputAdornment,
  IconButton,
  FormHelperText
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from '@azure/msal-react';
import FacebookIcon from '../../components/FacebookIcon';
import MicrosoftIcon from '../../components/MicrosoftIcon';

// Validation schema
const validationSchema = yup.object({
  nome_completo: yup
    .string()
    .required('Nome completo é obrigatório'),
  email: yup
    .string()
    .email('Digite um email válido')
    .required('Email é obrigatório'),
  password: yup
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .required('Senha é obrigatória'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'As senhas não coincidem')
    .required('Confirmação de senha é obrigatória')
});

const RegisterPage: React.FC = () => {
  const { register, loginWithGoogle, loginWithFacebook, loginWithMicrosoft, error, loading, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isGoogleLoginDisabled, setIsGoogleLoginDisabled] = useState(false);
  const { instance } = useMsal();

  // Form handling with Formik
  const formik = useFormik({
    initialValues: {
      nome_completo: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Limpar erro do contexto antes de iniciar
        clearError();
        
        const { confirmPassword, ...userData } = values;
        
        console.log('Enviando dados de registro:', userData);
        
        // Mostra o indicador de carregamento
        setSuccess(false);
        
        await register(userData);
        
        // Se chegou aqui sem exceções, o registro foi bem-sucedido
        setSuccess(true);
        console.log('Registro bem-sucedido!');
      } catch (error) {
        console.error('Erro no formulário de registro:', error);
        setSuccess(false);
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Configuração do login com Google
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!isGoogleLoginDisabled) {
        try {
          // O endpoint de autenticação com Google deve criar uma conta se não existir
          await loginWithGoogle(tokenResponse.access_token);
        } catch (error) {
          console.error('Erro no registro com Google:', error);
        }
      }
    },
    onError: (error) => {
      console.error('Erro na autenticação com Google:', error);
    }
  });

  // Configuração do login com Facebook
  const handleFacebookLogin = () => {
    if (loading) return;
    
    const FB = (window as any).FB;
    if (FB) {
      FB.login((response: any) => {
        if (response.authResponse) {
          loginWithFacebook(response.authResponse.accessToken);
        } else {
          console.error('Login do Facebook cancelado');
        }
      }, { scope: 'email' });
    } else {
      console.error('Facebook SDK não carregado');
    }
  };

  // Configuração do login com Microsoft
  const handleMicrosoftLogin = async () => {
    if (loading) return;
    
    try {
      const loginRequest = {
        scopes: ['User.Read'],
        prompt: 'select_account'
      };
      
      const response = await instance.loginPopup(loginRequest);
      if (response.accessToken) {
        await loginWithMicrosoft(response.accessToken);
      }
    } catch (error) {
      console.error('Erro no login com Microsoft:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Cadastro
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Cadastro realizado com sucesso! Redirecionando...
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="nome_completo"
                label="Nome Completo"
                name="nome_completo"
                autoComplete="name"
                autoFocus
                value={formik.values.nome_completo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nome_completo && Boolean(formik.errors.nome_completo)}
                helperText={formik.touched.nome_completo && formik.errors.nome_completo}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirmar Senha"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Cadastrar"}
          </Button>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              ou
            </Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<GoogleIcon />}
            onClick={() => googleLogin()}
            sx={{ mb: 2 }}
            disabled={loading}
          >
            Cadastrar com Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<FacebookIcon />}
            onClick={handleFacebookLogin}
            sx={{ mb: 2 }}
            disabled={loading}
          >
            Cadastrar com Facebook
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<MicrosoftIcon />}
            onClick={handleMicrosoftLogin}
            sx={{ mb: 2 }}
            disabled={loading}
          >
            Cadastrar com Microsoft
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Já tem uma conta? Faça login
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage; 