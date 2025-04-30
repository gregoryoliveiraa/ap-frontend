import React from 'react';
import { Box, Container } from '@mui/material';
import { Chat } from '../../components/Chat';
import { useParams } from 'react-router-dom';

export const ChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  
  return (
    <Container maxWidth="xl" sx={{ pt: 3, pb: 4 }}>
      <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
        <Chat sessionId={sessionId} />
      </Box>
    </Container>
  );
};

export default ChatPage;