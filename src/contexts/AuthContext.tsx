import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  nome_completo: string;
  verificado: boolean;
  numero_oab?: string;
  estado_oab?: string;
  plano: string;
  creditos_disponiveis: number;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  oab?: string;
  created_at?: string;
  updated_at?: string;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  oab?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: UpdateUserData) => Promise<void>;
}

interface RegisterData {
  email: string;
  nome_completo: string;
  password: string;
}

interface TokenData {
  exp: number;
  sub: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Check if token exists and is valid on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      // Get current path to handle public routes
      const currentPath = window.location.pathname;
      const publicRoutes = ['/', '/login', '/register', '/termos', '/privacidade', '/reset-password'];
      const isPublicRoute = publicRoutes.some(route => currentPath === route);
      
      if (token) {
        try {
          // Check if token is expired
          const decoded = jwt_decode<TokenData>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Set authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data
          const response = await api.get('/api/v1/users/me');
          setUser(response.data);
          
          // If user is already authenticated and trying to access login page, redirect to dashboard
          if (currentPath === '/login' || currentPath === '/register') {
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('Error validating authentication:', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate]);
  
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use x-www-form-urlencoded format
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('Login response:', response.data);
      
      if (!response.data.access_token) {
        throw new Error('Token não recebido do servidor');
      }
      
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      try {
        // Get user data
        const userResponse = await api.get('/api/v1/users/me');
        console.log('User data response:', userResponse.data);
        
        if (!userResponse.data) {
          throw new Error('Dados do usuário não recebidos');
        }
        
        setUser(userResponse.data);
        navigate('/dashboard');
      } catch (userErr: any) {
        console.error('Error fetching user data:', userErr);
        const errorMessage = userErr.response?.data?.detail || 'Erro ao obter dados do usuário';
        setError(errorMessage);
        localStorage.removeItem('token');
        api.defaults.headers.common['Authorization'] = '';
      }
    } catch (err: any) {
      console.error('Login error:', err);
      console.log('Login error details:', err.response?.data);
      
      let errorMessage = 'Erro no login. Verifique suas credenciais.';
      
      if (err.response?.data?.detail) {
        errorMessage = typeof err.response.data.detail === 'string' 
          ? err.response.data.detail 
          : 'Erro no login. Verifique suas credenciais.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Dados básicos para registro
      const requestData = {
        email: userData.email,
        nome_completo: userData.nome_completo,
        password: userData.password,
      };
      
      console.log('Dados para registro:', JSON.stringify(requestData, null, 2));
      
      const response = await api.post('/api/v1/auth/register', requestData);
      
      console.log('Registro bem-sucedido:', response.status);
      
      // Pequena pausa para garantir que o usuário foi criado no backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Auto login after registration
        const loginFormData = new URLSearchParams();
        loginFormData.append('username', userData.email);
        loginFormData.append('password', userData.password);
        
        const loginResponse = await api.post('/api/v1/auth/login', loginFormData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        const { access_token } = loginResponse.data;
        
        localStorage.setItem('token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        // Get user data
        const userResponse = await api.get('/api/v1/users/me');
        setUser(userResponse.data);
        
        // Redirecionar para o dashboard
        navigate('/dashboard');
        
        return response.data;
      } catch (loginErr) {
        console.error('Erro no login após registro:', loginErr);
        // Não mostra erro de login aqui, apenas retorna os dados do registro
        // O usuário verá o alerta de sucesso do registro
        return response.data;
      }
    } catch (err: any) {
      console.error('Erro no registro:', err);
      
      // Log de detalhes do erro
      if (err.response) {
        console.error('Detalhes do erro:', {
          status: err.response.status,
          data: JSON.stringify(err.response.data, null, 2)
        });
        
        // Verificar conflito de email
        if (err.response.status === 409) {
          setError('Este email já está cadastrado no sistema.');
          setLoading(false);
          throw err;
        }
      }
      
      // Erro genérico
      const errorMessage = typeof err.response?.data?.detail === 'object'
        ? 'Erro no cadastro. Tente novamente.'
        : err.response?.data?.detail || 'Erro no cadastro. Tente novamente.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };
  
  const clearError = () => {
    setError(null);
  };
  
  const updateUser = async (userData: UpdateUserData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Here you would normally update the user data through API
      // await api.put('/api/v1/users/me', userData);
      
      // For now, just update the local state
      if (user) {
        setUser({
          ...user,
          ...userData,
        });
      }
      
      return Promise.resolve();
    } catch (err: any) {
      console.error('Update user error:', err);
      setError(err.response?.data?.detail || 'Erro ao atualizar perfil. Tente novamente.');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };
  
  const loginWithGoogle = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Chamar o endpoint de login com Google no backend
      const response = await api.post('/api/v1/auth/google', { token }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      try {
        // Obter dados do usuário
        const userResponse = await api.get('/api/v1/users/me');
        setUser(userResponse.data);
        
        navigate('/dashboard');
      } catch (userErr: any) {
        console.error('Erro ao obter dados do usuário Google:', userErr);
        const errorMessage = typeof userErr.response?.data?.detail === 'object'
          ? 'Erro ao obter dados do usuário'
          : userErr.response?.data?.detail || 'Erro ao obter dados do usuário';
        setError(errorMessage);
        localStorage.removeItem('token');
      }
    } catch (err: any) {
      console.error('Erro no login com Google:', err);
      const errorMessage = typeof err.response?.data?.detail === 'object'
        ? 'Erro no login com Google. Tente novamente.'
        : err.response?.data?.detail || 'Erro no login com Google. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError,
    updateUser,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 