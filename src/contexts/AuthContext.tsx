import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import api from '../services/api';
import * as userService from '../services/userService';

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
  role?: string;
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
  loginWithFacebook: (token: string) => Promise<void>;
  loginWithMicrosoft: (token: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: UpdateUserData) => Promise<User | null>;
  uploadAvatar: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  refreshUserData: () => Promise<User | null>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAdmin: () => boolean;
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
      
      if (token) {
        try {
          // Check if token is expired
          const decoded = jwt_decode<TokenData>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            localStorage.removeItem('token');
            localStorage.removeItem('userProfile');
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Set authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data
          const response = await api.get('/users/me');
          setUser(response.data);
        } catch (err) {
          console.error('Error validating authentication:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('userProfile');
          setUser(null);
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Função para atualizar os dados do usuário no contexto
  const refreshUserData = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(prevUser => {
        if (!prevUser) return response.data;
        return { ...prevUser, ...response.data };
      });
      return response.data;
    } catch (err) {
      console.error('Error refreshing user data:', err);
      return null;
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use x-www-form-urlencoded format
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/auth/login', formData, {
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
        const userResponse = await api.get('/users/me');
        console.log('User data response:', userResponse.data);
        
        if (!userResponse.data) {
          throw new Error('Dados do usuário não recebidos');
        }
        
        // Recuperar dados persistidos do perfil do usuário
        const userProfile = localStorage.getItem('userProfile');
        const userAvatar = localStorage.getItem('userAvatar');
        
        let combinedUserData = { ...userResponse.data };
        
        // Adicionar dados do perfil salvo localmente, se existirem
        if (userProfile) {
          try {
            const savedProfile = JSON.parse(userProfile);
            combinedUserData = { 
              ...combinedUserData, 
              ...savedProfile,
              // Manter o avatar local se existir
              avatar: userAvatar || combinedUserData.avatar
            };
          } catch (e) {
            console.error('Erro ao analisar perfil do usuário:', e);
          }
        }
        
        // Atualizar o estado do usuário com os dados combinados
        setUser(combinedUserData);
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
        // Check if it's a network error (backend not running)
        if (err.message.includes('Network Error') || err.code === 'ERR_NETWORK') {
          errorMessage = 'O servidor não está respondendo. Por favor, verifique se o backend está em execução.';
        } else {
          errorMessage = err.message;
        }
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
      
      const response = await api.post('/auth/register', requestData);
      
      console.log('Registro bem-sucedido:', response.status);
      
      // Pequena pausa para garantir que o usuário foi criado no backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Auto login after registration
        const loginFormData = new URLSearchParams();
        loginFormData.append('username', userData.email);
        loginFormData.append('password', userData.password);
        
        const loginResponse = await api.post('/auth/login', loginFormData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        const { access_token } = loginResponse.data;
        
        localStorage.setItem('token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        // Get user data
        const userResponse = await api.get('/users/me');
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
      
      console.log('AuthContext - Updating user with data:', userData);
      
      // Usar o serviço para atualizar os dados do usuário
      const updatedUser = await userService.updateUserProfile(userData);
      
      console.log('AuthContext - Received updated user from API:', updatedUser);
      
      // Atualizar o estado do usuário, preservando os dados existentes
      setUser(prevUser => {
        if (!prevUser) return updatedUser;
        const mergedUser = { ...prevUser, ...updatedUser };
        console.log('AuthContext - Merged user state:', mergedUser);
        return mergedUser;
      });
      
      // Retornar o usuário atualizado para atualizar o formulário
      return updatedUser;
    } catch (err: any) {
      console.error('Update user error:', err);
      setError(err.response?.data?.detail || 'Erro ao atualizar perfil. Tente novamente.');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };
  
  const uploadAvatar = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar o serviço para fazer upload do avatar
      const updatedUser = await userService.uploadAvatar(file);
      
      // Atualizar o estado do usuário
      setUser(updatedUser);
      
      return Promise.resolve();
    } catch (err: any) {
      console.error('Upload avatar error:', err);
      setError(err.response?.data?.detail || 'Erro ao fazer upload da imagem. Tente novamente.');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteAvatar = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar o serviço para excluir o avatar
      const updatedUser = await userService.deleteAvatar();
      
      // Atualizar o estado do usuário
      setUser(updatedUser);
      
      return Promise.resolve();
    } catch (err: any) {
      console.error('Delete avatar error:', err);
      setError(err.response?.data?.detail || 'Erro ao remover a imagem. Tente novamente.');
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
      const response = await api.post('/auth/google', { token }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      try {
        // Obter dados do usuário
        const userResponse = await api.get('/users/me');
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

  const loginWithFacebook = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Chamar o endpoint de login com Facebook no backend
      const response = await api.post('/auth/facebook', { token }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      try {
        // Obter dados do usuário
        const userResponse = await api.get('/users/me');
        setUser(userResponse.data);
        
        navigate('/dashboard');
      } catch (userErr: any) {
        console.error('Erro ao obter dados do usuário Facebook:', userErr);
        const errorMessage = typeof userErr.response?.data?.detail === 'object'
          ? 'Erro ao obter dados do usuário'
          : userErr.response?.data?.detail || 'Erro ao obter dados do usuário';
        setError(errorMessage);
        localStorage.removeItem('token');
      }
    } catch (err: any) {
      console.error('Erro no login com Facebook:', err);
      const errorMessage = typeof err.response?.data?.detail === 'object'
        ? 'Erro no login com Facebook. Tente novamente.'
        : err.response?.data?.detail || 'Erro no login com Facebook. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginWithMicrosoft = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Chamar o endpoint de login com Microsoft no backend
      const response = await api.post('/auth/microsoft', { token }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      try {
        // Obter dados do usuário
        const userResponse = await api.get('/users/me');
        setUser(userResponse.data);
        
        navigate('/dashboard');
      } catch (userErr: any) {
        console.error('Erro ao obter dados do usuário Microsoft:', userErr);
        const errorMessage = typeof userErr.response?.data?.detail === 'object'
          ? 'Erro ao obter dados do usuário'
          : userErr.response?.data?.detail || 'Erro ao obter dados do usuário';
        setError(errorMessage);
        localStorage.removeItem('token');
      }
    } catch (err: any) {
      console.error('Erro no login com Microsoft:', err);
      const errorMessage = typeof err.response?.data?.detail === 'object'
        ? 'Erro no login com Microsoft. Tente novamente.'
        : err.response?.data?.detail || 'Erro no login com Microsoft. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar o serviço para atualizar a senha
      await userService.updatePassword(currentPassword, newPassword);
      
      return Promise.resolve();
    } catch (err: any) {
      console.error('Update password error:', err);
      
      let errorMessage = 'Erro ao atualizar a senha.';
      
      if (err.response?.status === 401) {
        errorMessage = 'A senha atual está incorreta.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Verifica se o usuário atual é administrador
  const isAdmin = () => {
    if (!user) return false;
    return user.role === 'admin' || user.plano === 'admin';
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    loginWithMicrosoft,
    logout,
    clearError,
    updateUser,
    uploadAvatar,
    deleteAvatar,
    refreshUserData,
    updatePassword,
    isAdmin
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 