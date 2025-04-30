import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { Message, ChatSession, ChatProvider, createChatSession, getChatSessions, sendMessage, streamChat, deleteChatSession, getChatSession } from '../services/chatService';
import { Button, TextField, Box, Typography, Paper, CircularProgress, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import SendIcon from '@mui/icons-material/Send';
import AlertIcon from '@mui/icons-material/Warning';

const NoticeBar = styled(Box)(({ theme }) => ({
  backgroundColor: '#ff5722',
  color: 'white',
  padding: '12px',
  marginBottom: '16px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '18px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
}));

// Contêiner principal
const ChatContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '85vh',
  margin: '16px',
  position: 'relative',
});

// Contêiner de mensagens com altura fixa
const MessagesContainer = styled(Paper)({
  flex: '0 1 auto',
  height: '400px', // Altura fixa
  overflowY: 'auto', // Scroll vertical
  padding: '16px',
  marginBottom: '16px',
  backgroundColor: '#f0f8ff', // Azul claro distinto
});

// Balões de mensagem simplificados
const MessageBubble = styled(Box)<{ isUser: boolean }>(({ isUser }) => ({
  padding: '10px 15px',
  marginBottom: '8px',
  maxWidth: '70%',
  backgroundColor: isUser ? '#d32f2f' : '#4caf50', // Vermelho e verde - cores bem diferentes
  borderRadius: '8px',
  marginLeft: isUser ? 'auto' : '0',
  marginRight: isUser ? '0' : 'auto',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
}));

// Estilos para texto de usuário (sempre branco)
const UserMessageText = styled(Typography)({
  color: 'white !important',
  fontWeight: 500,
});

// Estilos para informações da mensagem do usuário
const UserMessageInfo = styled(Typography)({
  color: 'rgba(255,255,255,0.8) !important',
  fontSize: '12px',
});

// Área de entrada
const InputContainer = styled(Box)({
  display: 'flex',
  gap: '8px',
  padding: '16px',
  backgroundColor: '#fff8e1', // Amarelo claro
  borderRadius: '8px',
  marginTop: 'auto',
});

// Sidebar simplificada
const Sidebar = styled(Paper)({
  width: '250px',
  padding: '16px',
  marginRight: '16px',
  height: '400px',
  overflowY: 'auto',
  backgroundColor: '#e8f5e9', // Verde claro para sidebar
});

// Layout principal
const ChatLayout = styled(Box)({
  display: 'flex',
  flex: 1,
  height: 'calc(100% - 50px)',
});

// Conteúdo principal
const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

// Mensagem de boas-vindas
const WelcomeMessage = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: '#673ab7', // Roxo
  color: 'white',
}));

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ChatProvider>('openai');
  const [showArchived, setShowArchived] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, [showArchived]);

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSession = async (id: string) => {
    try {
      const session = await getChatSession(id);
      setCurrentSession(session);
      const convertedMessages = session.messages?.map(msg => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.role === 'user',
        created_at: msg.created_at,
        session_id: session.id,
        tokens_used: msg.tokens_used,
        provider: msg.provider,
        role: msg.role
      })) || [];
      setMessages(convertedMessages);
      setInputMessage(convertedMessages[convertedMessages.length - 1]?.content || '');
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const sessions = await getChatSessions();
      setSessions(sessions);
      if (sessions.length > 0 && !currentSession && !sessionId) {
        setCurrentSession(sessions[0]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      const newSession = await createChatSession();
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleSelectSession = async (session: ChatSession) => {
    try {
      const fullSession = await getChatSession(session.id);
      setCurrentSession(fullSession);
      const convertedMessages = fullSession.messages?.map(msg => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.role === 'user',
        created_at: msg.created_at,
        session_id: fullSession.id,
        tokens_used: msg.tokens_used,
        provider: msg.provider,
        role: msg.role
      })) || [];
      setMessages(convertedMessages);
      setInputMessage(convertedMessages[convertedMessages.length - 1]?.content || '');
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const handleDeleteClick = (session: ChatSession) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    
    try {
      await deleteChatSession(sessionToDelete.id);
      setSessions(sessions.filter(s => s.id !== sessionToDelete.id));
      if (currentSession?.id === sessionToDelete.id) {
        setCurrentSession(null);
        setMessages([]);
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Error deleting chat. Please try again later.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession) return;

    const userMessage: Message = {
      id: '', // Will be set by the backend
      content: inputMessage,
      isUser: true,
      created_at: new Date(),
      session_id: currentSession.id,
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessage({
        message: inputMessage,
        session_id: currentSession.id,
        provider: selectedProvider
      });

      const assistantMessage: Message = {
        id: '', // Will be set by the backend
        content: response.message,
        isUser: false,
        created_at: new Date(),
        session_id: currentSession.id,
        tokens_used: response.tokens_used,
        provider: response.provider,
        role: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error sending message. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamChat = async () => {
    if (!inputMessage.trim() || !currentSession) return;

    const userMessage: Message = {
      id: '', // Will be set by the backend
      content: inputMessage,
      isUser: true,
      created_at: new Date(),
      session_id: currentSession.id,
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let assistantMessage: Message = {
        id: '', // Will be set by the backend
        content: '',
        isUser: false,
        created_at: new Date(),
        session_id: currentSession.id,
        role: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);

      await streamChat(
        {
          message: inputMessage,
          session_id: currentSession.id,
          provider: selectedProvider
        },
        (chunk) => {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && !lastMessage.isUser) {
              lastMessage.content += chunk;
            }
            return newMessages;
          });
        }
      );
    } catch (error) {
      console.error('Error streaming chat:', error);
      setError('Error sending message. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <NoticeBar>
        <AlertIcon sx={{ mr: 1 }} />
        NOVA VERSÃO DO CHAT - MODIFICADO POR CLAUDE
      </NoticeBar>
      
      {error && (
        <Box sx={{ 
          mb: 2, 
          p: 2, 
          bgcolor: 'error.main', 
          color: 'error.contrastText',
          borderRadius: 1
        }}>
          <Typography>{error}</Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" color="#d32f2f">Chat Renovado</Typography>
        <Button variant="contained" onClick={handleCreateSession} color="warning">
          Nova Conversa
        </Button>
      </Box>

      <ChatLayout>
        <Sidebar>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Histórico</Typography>
            <Button
              startIcon={<ArchiveIcon />}
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? 'Ativos' : 'Arquivados'}
            </Button>
          </Box>
          <List>
            {sessions.map((session) => (
              <ListItem
                key={session.id}
                button
                selected={currentSession?.id === session.id}
                onClick={() => handleSelectSession(session)}
              >
                <ListItemText
                  primary={session.title || `Conversa ${session.id}`}
                  secondary={new Date(session.created_at).toLocaleDateString()}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(session);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Sidebar>

        <MainContent>
          {currentSession ? (
            <>
              <MessagesContainer>
                {messages.length === 0 && (
                  <WelcomeMessage>
                    <Typography variant="h5" gutterBottom>
                      Bem-vindo(a) ao NOVO CHAT, {user?.email}!
                    </Typography>
                    <Typography variant="body1">
                      Como posso ajudar você hoje? Este é o chat reformulado.
                    </Typography>
                  </WelcomeMessage>
                )}
                {messages.map((message, index) => (
                  message.role === 'user' ? (
                    <MessageBubble key={index} isUser={true}>
                      <UserMessageText>{message.content}</UserMessageText>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <UserMessageInfo>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </UserMessageInfo>
                        {message.tokens_used && (
                          <UserMessageInfo>
                            Tokens: {message.tokens_used}
                          </UserMessageInfo>
                        )}
                        {message.provider && (
                          <UserMessageInfo>
                            Provider: {message.provider}
                          </UserMessageInfo>
                        )}
                      </Box>
                    </MessageBubble>
                  ) : (
                    <MessageBubble key={index} isUser={false}>
                      <Typography color="white">{message.content}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="white">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </Typography>
                        {message.tokens_used && (
                          <Typography variant="caption" color="white">
                            Tokens: {message.tokens_used}
                          </Typography>
                        )}
                        {message.provider && (
                          <Typography variant="caption" color="white">
                            Provider: {message.provider}
                          </Typography>
                        )}
                      </Box>
                    </MessageBubble>
                  )
                ))}
                <div ref={messagesEndRef} />
              </MessagesContainer>

              <InputContainer>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Provedor</InputLabel>
                  <Select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as ChatProvider)}
                    label="Provedor"
                  >
                    <MenuItem value="deepseek">DeepSeek</MenuItem>
                    <MenuItem value="claude">Claude</MenuItem>
                    <MenuItem value="openai">OpenAI</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Digite sua mensagem..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <IconButton
                  color="error"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
              </InputContainer>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                Selecione ou inicie uma conversa
              </Typography>
            </Box>
          )}
        </MainContent>
      </ChatLayout>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteSession} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </ChatContainer>
  );
}; 