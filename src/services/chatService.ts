import api from './api';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  created_at: Date;
  session_id: string;
  tokens_used?: number;
  provider?: string;
  role?: 'user' | 'assistant' | 'system';
}

export interface ChatSession {
  id: string;
  title: string;
  messages?: Message[];
  created_at: Date;
  updated_at: Date;
  updatedAt: Date;
  createdAt: Date;
  messageCount: number;
  user_id: string;
}

export type ChatProvider = 'openai' | 'claude' | 'deepseek';

export interface ChatRequest {
  message: string;
  session_id: string;
  provider: string;
}

export interface ChatResponse {
  message: string;
  session_id: string;
  tokens_used?: number;
  provider: string;
}

export interface ChatStreamResponse {
  content?: string;
  error?: string;
  done?: boolean;
  tokens_used?: number;
  provider?: string;
}

// Helper function to transform date strings to Date objects
const transformDates = (session: any): ChatSession => {
  console.log('Transforming session:', session);
  const transformed = {
    ...session,
    id: session.id,
    created_at: new Date(session.created_at),
    updated_at: new Date(session.updated_at),
    updatedAt: new Date(session.updated_at),
    createdAt: new Date(session.created_at),
    title: session.title,
    user_id: session.user_id,
    messageCount: session.messages?.length || 0,
    messages: session.messages?.map((msg: any) => {
      console.log('Transforming message:', msg);
      return {
        id: msg.id,
        content: msg.content,
        isUser: msg.role === 'user',
        created_at: new Date(msg.created_at),
        createdAt: new Date(msg.created_at),
        session_id: session.id,
        tokens_used: msg.tokens_used,
        provider: msg.provider,
        role: msg.role
      };
    })
  };
  console.log('Transformed session:', transformed);
  return transformed;
};

/**
 * Get all chat sessions for the user
 */
export const getChatSessions = async (): Promise<ChatSession[]> => {
  try {
    const response = await api.get('/chat');
    return response.data.map(transformDates);
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    throw error;
  }
};

/**
 * Get a specific chat session with its messages
 */
export const getChatSession = async (sessionId: string): Promise<ChatSession> => {
  try {
    console.log('Fetching session:', sessionId);
    const response = await api.get(`/chat/${sessionId}`);
    console.log('API response:', response.data);
    const session = response.data;
    
    // Sort messages by created_at
    if (session.messages) {
      console.log('Messages before sorting:', session.messages);
      session.messages.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    
    return transformDates(session);
  } catch (error) {
    console.error('Error getting chat session:', error);
    throw error;
  }
};

/**
 * Create a new chat session
 */
export const createChatSession = async (title = 'Nova Conversa'): Promise<ChatSession> => {
  try {
    const response = await api.post('/chat', { title });
    return transformDates(response.data);
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

/**
 * Update a chat session
 */
export const updateChatSession = async (
  sessionId: string, 
  data: { title?: string }
): Promise<ChatSession> => {
  try {
    const response = await api.put(`/chat/${sessionId}`, data);
    return transformDates(response.data);
  } catch (error) {
    console.error('Error updating chat session:', error);
    throw error;
  }
};

/**
 * Send a message to a chat session
 */
export const sendMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  try {
    const response = await api.post('/chat/message', data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Stream chat responses
 */
export const streamChat = async (
  data: ChatRequest,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    console.log('Iniciando streamChat com dados:', data);
    
    if (!data.session_id) {
      console.error('Session ID is missing');
      throw new Error('Session ID is required');
    }
    
    const response = await fetch(`${api.defaults.baseURL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stream API error:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
    }

    console.log('Stream reader obtained, starting to process chunks');

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('Stream completed');
        break;
      }

      const chunk = new TextDecoder().decode(value);
      console.log('Received chunk:', chunk.substring(0, 50) + (chunk.length > 50 ? '...' : ''));
      
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              onChunk(data.content);
            }
            if (data.done) {
              console.log('Stream signaled completion');
              return;
            }
          } catch (parseError) {
            console.error('Error parsing streaming response:', parseError, 'Line:', line);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming chat:', error);
    throw error;
  }
};

/**
 * Delete a chat session
 */
export const deleteChatSession = async (sessionId: string): Promise<void> => {
  try {
    await api.delete(`/chat/${sessionId}`);
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
};