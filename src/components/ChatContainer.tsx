import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Chat } from './ChatComplete';
import { ChatSession, getChatSession } from '../services/chatService';
import { useSnackbar } from 'notistack';

interface ChatContainerProps {
  sessionId: string;
  onSessionUpdate?: (session: ChatSession) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ sessionId, onSessionUpdate }) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const session = await getChatSession(sessionId);
      setCurrentSession(session);
      onSessionUpdate?.(session);
    } catch (error) {
      console.error('Error loading session:', error);
      enqueueSnackbar('Erro ao carregar conversa', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        {currentSession?.title || 'Nova Conversa'}
      </Typography>
      <Chat />
    </Box>
  );
}; 