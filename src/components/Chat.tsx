import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { Message, ChatSession, ChatProvider, createChatSession, getChatSessions, sendMessage, streamChat, deleteChatSession, getChatSession } from '../services/chatService';
import { Button, TextField, Box, Typography, Paper, CircularProgress, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { alpha } from '@mui/material/styles';

// Styled components with fixed heights for proper scrolling
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '80vh',
  width: '100%',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden'
}));

const MessagesContainer = styled(Box)({
  flexGrow: 1,
  overflow: 'auto',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  height: 'calc(80vh - 70px)'
});

interface MessageBubbleProps {
  theme?: any;
  isUser: boolean;
}

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUser'
})<MessageBubbleProps>(({ theme, isUser }) => ({
  padding: '12px 16px',
  borderRadius: '8px',
  maxWidth: '70%',
  marginBottom: '8px',
  wordBreak: 'break-word',
  ...(isUser && {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  }),
  ...(!isUser && {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  }),
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: '8px 16px',
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  position: 'sticky',
  bottom: 0,
  height: '70px'
}));

// Sidebar simplificada
const Sidebar = styled(Paper)({
  width: '300px',
  padding: '16px',
  marginRight: '16px',
  height: '650px',
  overflowY: 'auto',
  backgroundColor: '#ffffff',
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
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

interface ChatProps {
  sessionId?: string;
}

export const Chat: React.FC<ChatProps> = ({ sessionId: propSessionId }) => {
  const { user } = useAuth();
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const activeSessionId = propSessionId || routeSessionId;
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
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
    if (activeSessionId) {
      loadMessages();
    }
  }, [activeSessionId]);

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
      setInput(convertedMessages[convertedMessages.length - 1]?.content || '');
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const sessions = await getChatSessions();
      setSessions(sessions);
      if (sessions.length > 0 && !currentSession && !activeSessionId) {
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
      setInput(convertedMessages[convertedMessages.length - 1]?.content || '');
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
    if (!input.trim() || !currentSession) return;

    const userMessage: Message = {
      id: '', // Will be set by the backend
      content: input,
      isUser: true,
      created_at: new Date(),
      session_id: currentSession.id,
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage({
        message: input,
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
    if (!input.trim() || !currentSession) return;

    const userMessage: Message = {
      id: '', // Will be set by the backend
      content: input,
      isUser: true,
      created_at: new Date(),
      session_id: currentSession.id,
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
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
          message: input,
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

  const loadMessages = async () => {
    if (!activeSessionId) return;
    
    setIsLoading(true);
    try {
      const session = await getChatSession(activeSessionId);
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
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Error loading chat messages. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Custom renderer for code blocks
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={atomDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <ChatContainer>
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
        <Typography variant="h4">Chat</Typography>
        <Button variant="contained" onClick={handleCreateSession}>
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
                      Bem-vindo(a), {user?.email}!
                    </Typography>
                    <Typography variant="body1">
                      Como posso ajudar você hoje?
                    </Typography>
                  </WelcomeMessage>
                )}
                {messages.map((message, index) => (
                  <MessageBubble isUser={message.isUser} key={message.id || index}>
                    {message.isUser ? (
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {message.content}
                      </Typography>
                    ) : (
                      <ReactMarkdown 
                        children={message.content} 
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents}
                      />
                    )}
                  </MessageBubble>
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleStreamChat()}
                  disabled={isLoading}
                />
                <IconButton
                  color="primary"
                  onClick={handleStreamChat}
                  disabled={!input.trim() || isLoading}
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
