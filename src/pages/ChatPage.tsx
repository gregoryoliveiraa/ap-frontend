import React, { useState, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { ChatContainer } from '../components/ChatContainer';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChatSession } from '../services/chatService';

export const ChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  if (!user) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Por favor, faça login para acessar o chat.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ height: 'calc(100vh - 64px)', py: 2 }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" gutterBottom>
          Chat
        </Typography>
        {sessionId && (
          <ChatContainer
            sessionId={sessionId}
            onSessionUpdate={setCurrentSession}
          />
        )}
      </Box>
    </Container>
  );
}; 