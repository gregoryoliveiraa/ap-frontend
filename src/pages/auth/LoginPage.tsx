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
  Divider,
  Grid,
  InputAdornment,
  IconButton
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
  email: yup
    .string()
    .email('Digite um email válido')
    .required('Email é obrigatório'),
  password: yup
    .string()
    .required('Senha é obrigatória'),
});

const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, loginWithFacebook, loginWithMicrosoft, error, loading, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoginDisabled, setIsGoogleLoginDisabled] = useState(false);
  const { instance } = useMsal();

  // Form handling with Formik
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: (values) => {
      login(values.email, values.password);
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  // Configuração do login com Google
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!isGoogleLoginDisabled) {
        try {
          await loginWithGoogle(tokenResponse.access_token);
        } catch (error) {
          console.error('Erro no login com Google:', error);
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
    
    // Usando Facebook SDK via window object
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
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <Typography variant="h4" component="h1" gutterBottom>
            Entrar
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
              {error}
            </Alert>
          )}
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={loading}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
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
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Entrar"}
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
            Entrar com Google
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
            Entrar com Facebook
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
            Entrar com Microsoft
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ display: 'block', mb: 1 }}>
              Esqueceu a senha?
            </Link>
            <Link component={RouterLink} to="/register" variant="body2">
              Não tem uma conta? Cadastre-se
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage; 