import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { Message, ChatSession, ChatProvider, createChatSession, getChatSessions, sendMessage, streamChat, deleteChatSession, getChatSession } from '../services/chatService';
import { Button, TextField, Box, Typography, Paper, CircularProgress, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import SendIcon from '@mui/icons-material/Send';

// Contêiner com altura fixa
const ChatWrapper = styled('div')({
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  position: 'relative',
  margin: '10px',
  marginBottom: '70px', // Espaço para o footer
  overflow: 'hidden'
});

// Área de mensagens com scroll
const MessageArea = styled('div')({
  height: '450px',
  overflowY: 'scroll',
  padding: '16px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  marginBottom: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  flex: '1 1 auto'
});

// Balão de mensagem do usuário
const UserMessage = styled('div')({
  backgroundColor: '#2e7d32',
  color: 'white',
  padding: '12px 16px',
  borderRadius: '12px',
  marginBottom: '8px',
  maxWidth: '75%',
  alignSelf: 'flex-end',
  marginLeft: 'auto'
});

// Balão de mensagem do assistente
const AssistantMessage = styled('div')({
  backgroundColor: 'white',
  color: '#333',
  padding: '12px 16px',
  borderRadius: '12px',
  marginBottom: '8px',
  maxWidth: '75%',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
});

// Texto da mensagem com quebra de palavra
const MessageText = styled('p')({
  margin: 0,
  wordBreak: 'break-word'
});

// Texto da mensagem do usuário (branco)
const UserMessageText = styled('p')({
  margin: 0,
  wordBreak: 'break-word',
  color: 'white'
});

// Informações da mensagem
const MessageInfo = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  marginTop: '6px',
  opacity: 0.8
});

// Área de entrada
const InputArea = styled('div')({
  display: 'flex',
  gap: '8px',
  padding: '12px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
});

// Barra lateral de histórico
const SidebarArea = styled('div')({
  width: '280px',
  padding: '16px',
  backgroundColor: 'white',
  borderRadius: '8px',
  height: '450px',
  overflowY: 'auto',
  marginRight: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
});

// Layout principal
const MainLayout = styled('div')({
  display: 'flex',
  height: 'calc(100% - 60px)',
});

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
    <ChatWrapper>
      {error && (
        <Box 
          sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: 'error.main', 
            color: 'white',
            borderRadius: 1
          }}
        >
          <Typography>{error}</Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Chat</Typography>
        <Button variant="contained" onClick={handleCreateSession}>
          Nova Conversa
        </Button>
      </Box>

      <MainLayout>
        <SidebarArea>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Histórico</Typography>
            <Button
              startIcon={<ArchiveIcon />}
              onClick={() => setShowArchived(!showArchived)}
              size="small"
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
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </SidebarArea>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {currentSession ? (
            <>
              <MessageArea>
                {messages.length === 0 && (
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      mb: 2,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    }}
                  >
                    <Typography variant="h5" gutterBottom>
                      Bem-vindo(a), {user?.email}!
                    </Typography>
                    <Typography variant="body1">
                      Como posso ajudar você hoje?
                    </Typography>
                  </Paper>
                )}
                
                {messages.map((message, index) => (
                  message.isUser ? (
                    <UserMessage key={index}>
                      <UserMessageText>{message.content}</UserMessageText>
                      <MessageInfo>
                        <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                        {message.tokens_used && (
                          <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                            Tokens: {message.tokens_used}
                          </span>
                        )}
                        {message.provider && (
                          <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                            {message.provider}
                          </span>
                        )}
                      </MessageInfo>
                    </UserMessage>
                  ) : (
                    <AssistantMessage key={index}>
                      <MessageText>{message.content}</MessageText>
                      <MessageInfo>
                        <span>{new Date(message.created_at).toLocaleTimeString()}</span>
                        {message.tokens_used && (
                          <span>Tokens: {message.tokens_used}</span>
                        )}
                        {message.provider && (
                          <span>{message.provider}</span>
                        )}
                      </MessageInfo>
                    </AssistantMessage>
                  )
                ))}
                <div ref={messagesEndRef} />
              </MessageArea>

              <InputArea>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Provedor</InputLabel>
                  <Select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as ChatProvider)}
                    label="Provedor"
                    size="small"
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
                  size="small"
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
              </InputArea>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                Selecione ou inicie uma conversa
              </Typography>
            </Box>
          )}
        </Box>
      </MainLayout>

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
    </ChatWrapper>
  );
}; 