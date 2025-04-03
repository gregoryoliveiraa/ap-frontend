import api from './api';

export interface PaymentHistory {
  id: string;
  created_at: string;
  amount: number;
  payment_method: 'credit' | 'pix';
  status: 'completed' | 'pending' | 'failed';
  card_last_digits?: string;
}

export interface UsageData {
  total_tokens: number;
  total_documents: number;
  available_tokens: number;
  tokens_per_credit: number;
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
}

export const getUsageData = async (): Promise<UsageData> => {
  const response = await fetch('/api/v1/usage', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch usage data');
  }

  return response.json();
};

export const addCredits = async (amount: number, payment_method: string, card_data?: any): Promise<void> => {
  const response = await fetch('/api/v1/users/add-credits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      amount,
      payment_method,
      card_data
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add credits');
  }
};

export const getUserUsage = async (): Promise<UsageData> => {
  try {
    const response = await api.get('/api/v1/usage');
    
    // Log para debug
    console.log('Raw API response:', response.data);
    
    // Mapear a resposta do backend para o formato esperado pelo frontend
    const data = response.data;
    
    // Criar objeto de retorno com valores padrão para evitar undefined/null
    const result: UsageData = {
      total_tokens: 0,
      total_documents: 0,
      available_tokens: 0,
      tokens_per_credit: 20,
      chat_history: [],
      document_history: [],
      payment_history: []
    };
    
    // Preencher com os dados da API, se disponíveis
    if (data) {
      // Campos numéricos
      result.total_tokens = typeof data.total_tokens === 'number' ? data.total_tokens : 0;
      result.total_documents = typeof data.total_documents === 'number' ? data.total_documents : 0;
      result.available_tokens = typeof data.available_tokens === 'number' ? data.available_tokens : 
                               (typeof data.credits_remaining === 'number' ? data.credits_remaining : 0);
      result.tokens_per_credit = typeof data.tokens_per_credit === 'number' ? data.tokens_per_credit : 20;
      
      // Arrays
      if (Array.isArray(data.chat_history)) {
        result.chat_history = data.chat_history.map((item: any) => ({
          id: String(item.id || ''),
          created_at: String(item.created_at || new Date().toISOString()),
          tokens_used: typeof item.tokens_used === 'number' ? item.tokens_used : 0
        }));
      }
      
      if (Array.isArray(data.document_history)) {
        result.document_history = data.document_history.map((item: any) => ({
          id: String(item.id || ''),
          created_at: String(item.created_at || new Date().toISOString()),
          tokens_used: typeof item.tokens_used === 'number' ? item.tokens_used : 0,
          document_type: String(item.document_type || 'document')
        }));
      }
      
      if (Array.isArray(data.payment_history)) {
        result.payment_history = data.payment_history.map((item: any) => ({
          id: String(item.id || ''),
          created_at: String(item.created_at || new Date().toISOString()),
          amount: typeof item.amount === 'number' ? item.amount : 0,
          payment_method: item.payment_method as 'credit' | 'pix' || 'credit',
          status: item.status as 'completed' | 'pending' | 'failed' || 'completed',
          card_last_digits: item.card_last_digits
        }));
      }
    }
    
    console.log('Mapped usage data:', result);
    return result;
  } catch (error) {
    console.error('Error getting usage data:', error);
    throw error;
  }
}; 