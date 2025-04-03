import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Box, 
  Container,
  Paper,
  TextField,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Grid,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as chatService from '../../services/chatService';
import { Message, ChatSession, ChatProvider } from '../../services/chatService';
import { ChatContainer } from '../../components/ChatContainer';

export const ChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ChatProvider>('openai');
  const [firstMessageSent, setFirstMessageSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatSessions = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching sessions...');
      const data = await chatService.getChatSessions();
      console.log('Sessions loaded:', data);
      setSessions(data);
      
      if (sessionId) {
        console.log('Fetching specific session:', sessionId);
        const selected = data.find(s => s.id === sessionId);
        if (selected) {
          console.log('Session found:', selected);
          setCurrentSession(selected);
          
          const fullSession = await chatService.getChatSession(sessionId);
          console.log('Full session data:', fullSession);
          
          if (fullSession.messages && fullSession.messages.length > 0) {
            console.log('Converting messages...');
            const convertedMessages = fullSession.messages.map(msg => ({
              id: msg.id,
              content: msg.content,
              isUser: msg.role === 'user',
              created_at: new Date(msg.created_at),
              session_id: fullSession.id,
              tokens_used: msg.tokens_used,
              provider: msg.provider,
              role: msg.role
            }));
            
            console.log('Messages converted:', convertedMessages);
            setMessages(convertedMessages);
            
            // Verifica se há mensagens do usuário
            setFirstMessageSent(convertedMessages.some(msg => msg.isUser));
            
            setCurrentSession(prev => ({
              ...fullSession,
              title: prev?.title || fullSession.title
            }));
            
            setSessions(prev => prev.map(s => 
              s.id === fullSession.id ? {
                ...fullSession,
                title: s.title
              } : s
            ));
          } else {
            // Sessão sem mensagens, então primeira mensagem não foi enviada
            setFirstMessageSent(false);
          }
        }
      } else {
        // Nenhuma sessão selecionada
        setFirstMessageSent(false);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Error loading chat sessions');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchChatSessions();
  }, [fetchChatSessions]);

  const createNewSession = async () => {
    try {
      setLoading(true);
      const newSession = await chatService.createChatSession();
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
      setFirstMessageSent(false);
      navigate(`/chat/${newSession.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Error creating new chat session');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = async (session: ChatSession) => {
    try {
      setLoading(true);
      navigate(`/chat/${session.id}`);
      
      const fullSession = await chatService.getChatSession(session.id);
      console.log('Session loaded:', fullSession);
      
      if (fullSession.messages && fullSession.messages.length > 0) {
        const convertedMessages = fullSession.messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.role === 'user',
          created_at: new Date(msg.created_at),
          session_id: fullSession.id,
          tokens_used: msg.tokens_used,
          provider: msg.provider,
          role: msg.role
        }));
        
        setMessages(convertedMessages);
        
        // Verifica se há mensagens do usuário para definir o estado de primeira mensagem
        setFirstMessageSent(convertedMessages.some(msg => msg.isUser));
      } else {
        setFirstMessageSent(false);
      }
      
      setCurrentSession(prev => ({
        ...fullSession,
        title: prev?.title || fullSession.title
      }));
    } catch (error) {
      console.error('Error loading session:', error);
      setError('Error loading chat session');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentSession) return;

    const userMessage: Message = {
      id: '',
      content: messageInput,
      isUser: true,
      created_at: new Date(),
      session_id: currentSession.id,
      role: 'user'
    };

    const isFirstMessage = !firstMessageSent;
    setFirstMessageSent(true);

    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setSending(true);

    try {
      const response = await chatService.sendMessage({
        message: messageInput,
        session_id: currentSession.id,
        provider: selectedProvider
      });

      const assistantMessage: Message = {
        id: '',
        content: response.message,
        isUser: false,
        created_at: new Date(),
        session_id: currentSession.id,
        tokens_used: response.tokens_used,
        provider: response.provider,
        role: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Se esta é a primeira mensagem do usuário, atualiza o título
      if (isFirstMessage) {
        // Pequeno atraso para garantir que o backend processou a atualização do título
        setTimeout(async () => {
          try {
            // Atualiza a sessão para obter o novo título
            const updatedSession = await chatService.getChatSession(currentSession.id);
            
            // Atualiza a sessão atual
            setCurrentSession(updatedSession);
            
            // Atualiza a lista de sessões
            setSessions(prev => prev.map(session => 
              session.id === currentSession.id ? updatedSession : session
            ));
          } catch (err) {
            console.error('Error updating session title:', err);
          }
        }, 1000); // 1 segundo de atraso
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteSession = async (session: ChatSession) => {
    try {
      await chatService.deleteChatSession(session.id);
      setSessions(sessions.filter(s => s.id !== session.id));
      if (currentSession?.id === session.id) {
        setCurrentSession(null);
        setMessages([]);
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Erro ao excluir conversa');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 4 }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Histórico de Chat</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={createNewSession}
                disabled={loading}
              >
                Novo Chat
              </Button>
            </Box>
            <Divider />
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <List>
                {sessions.map((session) => (
                  <ListItem
                    key={session.id}
                    button
                    selected={currentSession?.id === session.id}
                    onClick={() => handleSessionClick(session)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <SmartToyIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={session.title || `Chat ${session.id}`}
                      secondary={new Date(session.created_at).toLocaleDateString()}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {currentSession ? (
              <>
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <Box key={index} sx={{ mb: 2, display: 'flex', justifyContent: message.isUser ? 'flex-end' : 'flex-start' }}>
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            backgroundColor: message.isUser ? 'primary.main' : 'grey.100',
                            color: message.isUser ? 'primary.contrastText' : 'text.primary'
                          }}
                        >
                          <Typography>{message.content}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                            {new Date(message.created_at).toLocaleString()}
                            {message.tokens_used && ` • ${message.tokens_used} tokens`}
                            {message.provider && ` • ${message.provider}`}
                          </Typography>
                        </Paper>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        Inicie uma conversa enviando uma mensagem
                      </Typography>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Box>
                
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <InputLabel id="provider-select-label">Provedor IA</InputLabel>
                          <Select
                            labelId="provider-select-label"
                            value={selectedProvider}
                            label="Provedor IA"
                            onChange={(e) => setSelectedProvider(e.target.value as ChatProvider)}
                          >
                            <MenuItem value="openai">OpenAI</MenuItem>
                            <MenuItem value="claude">Claude</MenuItem>
                            <MenuItem value="deepseek">DeepSeek</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          multiline
                          maxRows={4}
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Digite sua mensagem..."
                          disabled={sending}
                        />
                        <IconButton
                          color="primary"
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim() || sending}
                        >
                          {sending ? <CircularProgress size={24} /> : <SendIcon />}
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Selecione ou inicie uma conversa
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ChatPage;