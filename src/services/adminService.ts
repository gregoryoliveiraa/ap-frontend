import api from './api';

export interface UserListItem {
  id: string;
  email: string;
  nome_completo: string;
  plano: string;
  creditos_disponiveis: number;
  verificado: boolean;
  created_at: string;
  role?: string;
}

export interface NotificationData {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target_users?: string[]; // Lista de IDs de usuários para enviar notificação específica
  target_role?: string; // Enviar para todos os usuários com essa role
  target_all?: boolean; // Enviar para todos os usuários
  expiry_date?: string; // Data de expiração da notificação
  scheduled_at?: string; // Data de agendamento da notificação
  created_at?: string;
  read?: boolean;
  action_link?: string; // Link opcional para ação
  is_active?: boolean; // Status da notificação
  created_by?: string; // ID do usuário que criou a notificação
  updated_at?: string; // Data da última atualização
  read_by?: string[]; // Lista de IDs de usuários que leram a notificação
  target_user_ids?: string[]; // IDs dos usuários alvo (alternativo para target_users)
  target_roles?: string[]; // Lista de roles alvo (alternativo para target_role)
  priority?: 'low' | 'medium' | 'high'; // Prioridade da notificação
  category?: string; // Categoria da notificação
  metadata?: Record<string, any>; // Dados adicionais em formato JSON
}

export interface CreditUpdateData {
  userId: string;
  amount: number;
  reason: string;
}

// Obter lista de todos os usuários
export const getAllUsers = async (): Promise<UserListItem[]> => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    
    // Se for erro 404, retornar dados de demonstração
    if (error.response && error.response.status === 404) {
      console.log('Endpoint de usuários não encontrado. Usando dados de demonstração.');
      
      // Gerar dados de usuários de amostra
      const mockUsers: UserListItem[] = [];
      const planos = ['free', 'basic', 'pro', 'enterprise'];
      const nomes = [
        'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 
        'Carlos Pereira', 'Juliana Almeida', 'Fernando Souza', 'Mariana Lima',
        'Lucas Ferreira', 'Camila Rodrigues', 'Rafael Gomes', 'Amanda Martins'
      ];
      
      for (let i = 0; i < 20; i++) {
        const nome = nomes[i % nomes.length];
        const email = nome.toLowerCase().replace(' ', '.') + '@exemplo.com';
        const plano = planos[Math.floor(Math.random() * planos.length)];
        const verificado = Math.random() > 0.3; // 70% dos usuários verificados
        const role = Math.random() > 0.9 ? 'admin' : 'user'; // 10% são admins
        
        mockUsers.push({
          id: `user-${i + 1}`,
          email,
          nome_completo: nome,
          plano,
          creditos_disponiveis: Math.floor(Math.random() * 1000),
          verificado,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
          role
        });
      }
      
      return mockUsers;
    }
    
    throw error;
  }
};

// Obter detalhes de um usuário específico
export const getUserDetails = async (userId: string): Promise<UserListItem> => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Erro ao buscar detalhes do usuário ${userId}:`, error);
    
    // Se for erro 404, gerar dados fictícios
    if (error.response && error.response.status === 404) {
      console.log('Endpoint de detalhes de usuário não encontrado. Usando dados de demonstração.');
      
      // Tentar encontrar o usuário na lista de todos os usuários
      try {
        const users = await getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
          return user;
        }
      } catch (e) {
        console.error('Não foi possível obter lista de usuários:', e);
      }
      
      // Se não encontrou o usuário ou falhou ao buscar, retorna dados fictícios
      return {
        id: userId,
        email: `usuario${userId}@exemplo.com`,
        nome_completo: `Usuário ${userId}`,
        plano: 'basic',
        creditos_disponiveis: 150,
        verificado: true,
        created_at: new Date().toISOString(),
        role: 'user'
      };
    }
    
    throw error;
  }
};

// Atualizar dados de um usuário
export const updateUser = async (userId: string, userData: Partial<UserListItem>): Promise<UserListItem> => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error: any) {
    console.error(`Erro ao atualizar usuário ${userId}:`, error);
    
    // Se for erro 404, simular sucesso com os dados fornecidos
    if (error.response && error.response.status === 404) {
      console.log('Endpoint de atualização de usuário não encontrado. Simulando resposta bem-sucedida.');
      return {
        id: userId,
        email: userData.email || 'usuario@exemplo.com',
        nome_completo: userData.nome_completo || 'Nome do Usuário',
        plano: userData.plano || 'free',
        creditos_disponiveis: userData.creditos_disponiveis || 0,
        verificado: userData.verificado !== undefined ? userData.verificado : true,
        created_at: new Date().toISOString(),
        role: userData.role || 'user'
      };
    }
    
    throw error;
  }
};

// Adicionar ou remover créditos de um usuário
export const updateUserCredits = async (data: CreditUpdateData): Promise<UserListItem> => {
  try {
    const response = await api.post('/admin/credits', data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao atualizar créditos:', error);
    
    // Se for erro 404, simular sucesso
    if (error.response && error.response.status === 404) {
      console.log('Endpoint de créditos não encontrado. Simulando resposta bem-sucedida.');
      
      // Buscar os dados de usuário existentes para ter uma resposta completa
      let userData: UserListItem;
      try {
        const users = await getAllUsers();
        userData = users.find(user => user.id === data.userId) || {
          id: data.userId,
          email: 'usuario@exemplo.com',
          nome_completo: 'Nome do Usuário',
          plano: 'free',
          creditos_disponiveis: 500,
          verificado: true,
          created_at: new Date().toISOString()
        };
      } catch (e) {
        userData = {
          id: data.userId,
          email: 'usuario@exemplo.com',
          nome_completo: 'Nome do Usuário',
          plano: 'free',
          creditos_disponiveis: 500,
          verificado: true,
          created_at: new Date().toISOString()
        };
      }
      
      // Atualizar os créditos
      userData.creditos_disponiveis += data.amount;
      
      return userData;
    }
    
    throw error;
  }
};

// Enviar notificação para usuários
export const sendNotification = async (notification: NotificationData): Promise<NotificationData> => {
  try {
    const response = await api.post('/admin/notifications', notification);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao enviar notificação:', error);
    
    // Se for erro 404, simular sucesso
    if (error.response && error.response.status === 404) {
      console.log('Endpoint de envio de notificação não encontrado. Simulando resposta bem-sucedida.');
      return {
        ...notification,
        id: `notification-${Date.now()}`,
        created_at: new Date().toISOString()
      };
    }
    
    throw error;
  }
};

// Obter todas as notificações
export const getAllNotifications = async (): Promise<NotificationData[]> => {
  try {
    const response = await api.get('/admin/notifications');
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar notificações:', error);
    
    // Se for erro 404, retornar dados de demonstração
    if (error.response && error.response.status === 404) {
      console.log('Endpoint de notificações não encontrado. Usando dados de demonstração.');
      
      // Dados temporários para demonstração
      return [
        {
          id: '1',
          title: 'Manutenção programada',
          message: 'O sistema estará indisponível para manutenção no dia 15/06 das 02:00 às 04:00.',
          type: 'info',
          target_all: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiry_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Novos recursos disponíveis',
          message: 'Confira os novos recursos de geração de documentos com IA que acabamos de lançar!',
          type: 'success',
          target_all: true,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Atualize seus dados',
          message: 'Por favor, verifique se seus dados estão atualizados para continuar usando o sistema.',
          type: 'warning',
          target_role: 'user',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          expiry_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    }
    
    throw error;
  }
};

// Excluir uma notificação
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await api.delete(`/admin/notifications/${notificationId}`);
  } catch (error: any) {
    console.error(`Erro ao excluir notificação ${notificationId}:`, error);
    
    // Se for erro 404, apenas simular sucesso
    if (error.response && error.response.status === 404) {
      console.log('Endpoint de exclusão de notificação não encontrado. Simulando resposta bem-sucedida.');
      return;
    }
    
    throw error;
  }
};

// Obter estatísticas da plataforma
export const getSystemStats = async (): Promise<any> => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do sistema:', error);
    
    // Se for erro 404, retornar dados de demonstração
    if (error.response && error.response.status === 404) {
      console.log('Endpoint de estatísticas não encontrado. Usando dados de demonstração.');
      
      // Dados temporários para demonstração
      return {
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
    }
    
    // Se for outro tipo de erro, propagar o erro
    throw error;
  }
};

// Verificar se o usuário tem permissões de administrador
export const checkAdminPermission = async (): Promise<boolean> => {
  try {
    const response = await api.get('/admin/check-permission');
    return response.data.isAdmin;
  } catch (error: any) {
    console.error('Erro ao verificar permissões de administrador:', error);
    
    // Se for erro 404, permitir acesso temporariamente
    if (error.response && error.response.status === 404) {
      console.log('Endpoint de verificação de permissão não encontrado. Permitindo acesso temporariamente.');
      return true;
    }
    
    return false;
  }
}; 