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
import AddIcon from '@mui/icons-material/Add';

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
  height: 'calc(80vh - 70px)',
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
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.text.primary,
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages();
    }
  }, [activeSessionId]);

  // Simplificar o efeito de scroll - apenas rola quando as mensagens mudam
  useEffect(() => {
    console.log("Mensagens mudaram, rolando para o final");
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
    }, 100);
  }, [messages]);

  // Efeito para carregar o último chat quando a página é carregada
  useEffect(() => {
    if (sessions.length > 0 && !currentSession && !activeSessionId) {
      const lastSession = sessions[0]; // O primeiro da lista é o mais recente
      console.log("Carregando o último chat automaticamente:", lastSession.id);
      handleSelectSession(lastSession);
    }
  }, [sessions, currentSession, activeSessionId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
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
      setInput('');
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const sessions = await getChatSessions();
      setSessions(sessions);
      
      // Se não houver sessão ativa e temos sessões, carregue a mais recente
      if (sessions.length > 0 && !currentSession && !activeSessionId) {
        console.log("Selecionando sessão mais recente:", sessions[0].id);
        setCurrentSession(sessions[0]);
        await loadSession(sessions[0].id);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      setIsLoading(true);
      const newSession = await createChatSession();
      
      // Garante que temos um ID de sessão válido
      if (!newSession || !newSession.id) {
        throw new Error("Failed to create a valid session");
      }
      
      // Atualiza o estado com a nova sessão
      await loadSessions();
      setMessages([]);
      setCurrentSession(newSession);
      setInput('');
      
      // Log para debug
      console.log("Nova sessão criada:", newSession);
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Error creating new chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Nova função para lidar com novas conversas, usando o método não-streaming para a primeira mensagem
  const handleFirstMessage = async () => {
    if (!input.trim() || !currentSession) return;
    
    console.log("Enviando primeira mensagem para sessão:", currentSession);

    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      content: input,
      isUser: true,
      created_at: new Date(),
      session_id: currentSession.id,
      role: 'user'
    };

    // Guardar o input atual e depois limpar
    const messageToSend = input;
    setInput('');
    
    // Adicione a mensagem do usuário ao estado
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Garante que temos uma sessão válida
      if (!currentSession.id) {
        throw new Error("Invalid session ID");
      }

      console.log("Enviando primeira mensagem não-streaming para sessão ID:", currentSession.id);
      
      // Usa o método sendMessage ao invés de streamChat para a primeira mensagem
      const response = await sendMessage({
        message: messageToSend,
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
      
      console.log("Primeira mensagem enviada com sucesso");
      
      // Após a primeira mensagem, atualize a lista de sessões e recarregue a sessão atual
      await loadSessions();
      if (currentSession?.id) {
        await loadSession(currentSession.id);
      }
    } catch (error) {
      console.error('Error sending first message:', error);
      setError(`Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Se houver um erro, adicione uma mensagem de erro
      setMessages(prev => {
        return [...prev, {
          id: `error-${Date.now()}`,
          content: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
          isUser: false,
          created_at: new Date(),
          session_id: currentSession.id,
          role: 'assistant'
        }];
      });
    } finally {
      setIsLoading(false);
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
      setInput('');
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

  const handleStreamChat = async () => {
    // Se for uma sessão recém-criada sem mensagens, use o método não-streaming
    if (currentSession && messages.length === 0) {
      return handleFirstMessage();
    }
    
    if (!input.trim() || !currentSession) return;
    
    // Log para debug
    console.log("Enviando mensagem para sessão:", currentSession);

    const userMessage: Message = {
      id: `temp-user-${Date.now()}`, // ID temporário para garantir a unicidade
      content: input,
      isUser: true,
      created_at: new Date(),
      session_id: currentSession.id,
      role: 'user'
    };

    // Guardar o input atual e depois limpar
    const messageToSend = input;
    setInput(''); // Limpar o campo de entrada imediatamente

    // Adicione a mensagem do usuário ao estado
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Garante que temos uma sessão válida
      if (!currentSession.id) {
        throw new Error("Invalid session ID");
      }

      // Crie uma mensagem do assistente vazia para começar
      const assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`, // ID temporário para garantir a unicidade
        content: '',
        isUser: false,
        created_at: new Date(),
        session_id: currentSession.id,
        role: 'assistant'
      };

      // Adicione a mensagem vazia ao estado
      setMessages(prev => [...prev, assistantMessage]);

      // Log para debug
      console.log("Iniciando streaming para sessão ID:", currentSession.id);

      // Variável para acumular a resposta
      let accumulatedResponse = '';

      // Faz a chamada de streaming e atualiza a mensagem do assistente à medida que os chunks chegam
      await streamChat(
        {
          message: messageToSend,
          session_id: currentSession.id,
          provider: selectedProvider
        },
        (chunk) => {
          // Acumula a resposta
          accumulatedResponse += chunk;
          
          // Atualiza a última mensagem (a do assistente) com o novo chunk completo
          setMessages(prev => {
            const newMessages = [...prev];
            // A última mensagem deve ser do assistente
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && !lastMessage.isUser) {
              lastMessage.content = accumulatedResponse;
            }
            return [...newMessages]; // Retorna um novo array para garantir reatividade
          });
          
          // Força o scroll para o final a cada chunk
          setTimeout(scrollToBottom, 10);
        }
      );

      console.log("Streaming concluído com sucesso");
      
      // Após o streaming terminar, atualize a lista de sessões e recarregue a sessão atual
      await loadSessions();
      if (currentSession?.id) {
        await loadSession(currentSession.id);
      }
      
      // Força o scroll após terminar
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 300);
    } catch (error) {
      console.error('Error streaming chat:', error);
      setError(`Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Se houver um erro, adicione uma mensagem de erro
      setMessages(prev => {
        const newMessages = [...prev];
        // Se a última mensagem for do assistente (vazia), substitua-a com uma mensagem de erro
        if (newMessages.length > 0 && !newMessages[newMessages.length - 1].isUser) {
          newMessages[newMessages.length - 1].content = 
            "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.";
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      // Força o scroll após terminar o loading
      setTimeout(scrollToBottom, 200);
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
      setInput('');
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
      
      <ChatLayout>
        <Sidebar>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            mb: 2
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Histórico de Conversas</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateSession}
              fullWidth
            >
              Nova Conversa
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
              <MessagesContainer ref={messagesContainerRef}>
                {messages.length === 0 && (
                  <WelcomeMessage>
                    <Typography variant="body1">
                      Como posso ajudar você a acelerar seu dia hoje?
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
                <div 
                  ref={messagesEndRef} 
                  style={{ height: '50px', width: '100%', clear: 'both' }} 
                  id="chat-end-anchor"
                />
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
