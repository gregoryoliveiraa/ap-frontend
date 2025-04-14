import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import HelpIcon from '@mui/icons-material/Help';
import SchoolIcon from '@mui/icons-material/School';
import ChatIcon from '@mui/icons-material/Chat';
import EmailIcon from '@mui/icons-material/Email';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';
import { Link as RouterLink } from 'react-router-dom';

const frequentArticles = [
  'Como alterar o cartão de crédito na Advogada Parceira',
  'Como elaborar uma Petição Inicial na Advogada Parceira',
  'Como cancelar minha assinatura?',
  'Como assinar um plano na Advogada Parceira',
  'Como elaborar uma Contestação na Advogada Parceira',
  'Como alterar o meu plano?',
  'Como utilizar IA para melhorar minhas peças jurídicas',
  'Como recuperar minha senha',
  'Como usar os modelos prontos de documentos',
  'Como editar minhas informações de perfil'
];

const faqItems = [
  {
    category: 'Assinatura e Pagamento',
    items: [
      {
        question: 'Quais são os planos disponíveis?',
        answer: 'A Advogada Parceira oferece três planos: Básico, Profissional e Enterprise. Cada plano inclui diferentes recursos e limites de uso adaptados às necessidades de diferentes perfis de advogados. Visite nossa página de planos para detalhes completos sobre preços e recursos incluídos.'
      },
      {
        question: 'Como posso alterar meu plano?',
        answer: 'Para alterar seu plano, acesse "Meu Perfil" no menu superior direito, clique na aba "Assinatura" e selecione "Alterar Plano". Lá você poderá visualizar as opções disponíveis e fazer o upgrade ou downgrade da sua assinatura.'
      },
      {
        question: 'Posso pagar anualmente para obter desconto?',
        answer: 'Sim! Oferecemos desconto de 20% para pagamentos anuais em todos os nossos planos. Você pode selecionar a opção de faturamento anual ao assinar ou alterar seu plano atual para faturamento anual a qualquer momento.'
      },
      {
        question: 'Como atualizar meus dados de pagamento?',
        answer: 'Para atualizar seus dados de pagamento, acesse "Meu Perfil", vá para a aba "Assinatura" e clique em "Gerenciar métodos de pagamento". Lá você poderá adicionar um novo cartão, definir um cartão como padrão ou remover cartões existentes.'
      },
      {
        question: 'Como cancelar minha assinatura?',
        answer: 'Para cancelar sua assinatura, acesse "Meu Perfil", vá para a aba "Assinatura" e clique em "Cancelar assinatura". Você terá acesso aos serviços até o final do período já pago. Fique à vontade para nos contatar se desejar compartilhar o motivo do cancelamento, estamos sempre buscando melhorar.'
      }
    ]
  },
  {
    category: 'Uso da Plataforma',
    items: [
      {
        question: 'Como criar um novo documento?',
        answer: 'Para criar um novo documento, acesse a página "Documentos" pelo menu lateral e clique no botão "+ Novo Documento". Você pode começar do zero ou escolher um dos nossos modelos pré-configurados para agilizar o processo.'
      },
      {
        question: 'Como usar a assistência de IA para melhorar meus textos?',
        answer: 'Em qualquer editor de documento, você pode selecionar o texto e clicar no botão "Assistente IA" para abrir o painel de recursos. Lá você encontrará opções para revisar ortografia, melhorar a argumentação, simplificar linguagem, ou obter sugestões específicas para o tipo de documento que está redigindo.'
      },
      {
        question: 'É possível colaborar com outros advogados em um documento?',
        answer: 'Sim! No plano Profissional e Enterprise, você pode compartilhar documentos com colaboradores. Para isso, abra o documento, clique no botão "Compartilhar" no canto superior direito, e insira os emails dos colaboradores que deseja convidar, definindo as permissões de visualização ou edição.'
      },
      {
        question: 'Como exportar meus documentos?',
        answer: 'Para exportar um documento, abra-o no editor e clique no botão "Exportar" no menu superior. Você pode escolher entre os formatos PDF, DOCX ou exportar diretamente para sistemas de peticionamento compatíveis, como o PJe, dependendo do seu plano.'
      },
      {
        question: 'Como pesquisar em minha biblioteca de documentos?',
        answer: 'Use a barra de pesquisa na página "Documentos" para buscar por título, conteúdo ou tags. Você também pode utilizar os filtros avançados para refinar a busca por data, tipo de documento ou status.'
      }
    ]
  },
  {
    category: 'Recursos e Treinamento',
    items: [
      {
        question: 'Existem tutoriais em vídeo disponíveis?',
        answer: 'Sim! Acesse a seção "Academia" no menu lateral para encontrar uma biblioteca completa de tutoriais em vídeo, organizados por nível de experiência e por funcionalidade da plataforma.'
      },
      {
        question: 'A Advogada Parceira oferece treinamentos ao vivo?',
        answer: 'Sim, realizamos webinars mensais gratuitos para todos os usuários. Os assinantes dos planos Profissional e Enterprise também têm acesso a sessões personalizadas de onboarding e treinamentos específicos para equipes.'
      },
      {
        question: 'Onde encontro exemplos de peças processuais?',
        answer: 'Na seção "Modelos" você encontrará uma extensa biblioteca de modelos de documentos jurídicos, organizados por área do direito e tipo de documento, que podem ser personalizados conforme suas necessidades.'
      },
      {
        question: 'Como posso sugerir novas funcionalidades?',
        answer: 'Valorizamos muito seu feedback! Você pode enviar sugestões clicando no botão "Sugestões" no rodapé do site ou enviando um email para feedback@advogadaparceira.com. Analisamos todas as sugestões e priorizamos as mais solicitadas em nosso roadmap de desenvolvimento.'
      }
    ]
  },
  {
    category: 'Suporte e Segurança',
    items: [
      {
        question: 'Qual o horário de atendimento do suporte?',
        answer: 'Nosso suporte por chat está disponível de segunda a sexta, das 8h às 20h. Fora desse horário, você pode enviar um email para suporte@advogadaparceira.com e responderemos no próximo dia útil.'
      },
      {
        question: 'Meus documentos estão seguros na plataforma?',
        answer: 'Sim! Utilizamos criptografia de ponta a ponta e seguimos os mais rígidos protocolos de segurança. Seus dados são armazenados em servidores certificados com backup diário, e nunca compartilhamos ou utilizamos informações de seus documentos para qualquer finalidade sem sua autorização expressa.'
      },
      {
        question: 'Como ativar a autenticação de dois fatores?',
        answer: 'Para aumentar a segurança de sua conta, acesse "Meu Perfil", vá para a aba "Segurança" e ative a opção "Autenticação de dois fatores". Você poderá escolher entre receber códigos por SMS ou usar um aplicativo autenticador como Google Authenticator ou Authy.'
      },
      {
        question: 'O que acontece com meus documentos se eu cancelar minha assinatura?',
        answer: 'Após o cancelamento, você terá 30 dias para exportar seus documentos. Recomendamos fazer o download de todos os seus arquivos importantes antes de finalizar o cancelamento. Após esse período, os documentos serão arquivados e poderão ser recuperados caso você reative sua assinatura dentro de 6 meses.'
      }
    ]
  }
];

const tutorials = [
  {
    title: 'Primeiros passos na plataforma',
    duration: '5:20',
    level: 'Iniciante',
    views: 3240
  },
  {
    title: 'Como usar a IA para elaborar petições',
    duration: '8:45',
    level: 'Intermediário',
    views: 2815
  },
  {
    title: 'Gestão eficiente do fluxo de trabalho',
    duration: '7:15',
    level: 'Avançado',
    views: 1982
  },
  {
    title: 'Integrando com sistemas de peticionamento',
    duration: '10:30',
    level: 'Avançado',
    views: 1574
  }
];

const categories = [
  {
    title: 'Iniciando na Advogada Parceira',
    description: 'Tutoriais e guias para novos usuários começarem a usar a plataforma de forma eficiente.',
    icon: <SchoolIcon fontSize="large" color="primary" />,
    tags: ['Iniciante', 'Onboarding', 'Tutorial']
  },
  {
    title: 'Assinatura e Pagamentos',
    description: 'Informações sobre planos, pagamentos, upgrades e gestão da sua assinatura.',
    icon: <PaymentIcon fontSize="large" color="primary" />,
    tags: ['Planos', 'Pagamento', 'Faturamento']
  },
  {
    title: 'Segurança e Privacidade',
    description: 'Saiba como proteger sua conta e entenda nossas políticas de privacidade.',
    icon: <SecurityIcon fontSize="large" color="primary" />,
    tags: ['Segurança', 'Privacidade', '2FA']
  },
  {
    title: 'Criação de Documentos',
    description: 'Guias detalhados para criação e edição de diversos tipos de documentos jurídicos.',
    icon: <DescriptionIcon fontSize="large" color="primary" />,
    tags: ['Documentos', 'Modelos', 'Edição']
  },
  {
    title: 'Recursos Avançados de IA',
    description: 'Aprenda a utilizar nossos recursos de inteligência artificial para potencializar seu trabalho.',
    icon: <ArticleIcon fontSize="large" color="primary" />,
    tags: ['IA', 'Automação', 'Produtividade']
  },
  {
    title: 'Dúvidas mais frequentes',
    description: 'Respostas para as perguntas mais comuns de nossos usuários.',
    icon: <HelpIcon fontSize="large" color="primary" />,
    tags: ['FAQ', 'Suporte', 'Ajuda']
  }
];

const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState<Record<string, boolean>>({});

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFeedback = (id: string, isPositive: boolean) => {
    // Em produção, enviaria esta informação para o backend
    console.log(`Feedback ${isPositive ? 'positivo' : 'negativo'} para o artigo ${id}`);
    setFeedbackSent(prev => ({ ...prev, [id]: true }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Central de Ajuda
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Encontre respostas, tutoriais e dicas para aproveitar ao máximo a Advogada Parceira
        </Typography>
        
        {/* Search */}
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Procure na central de ajuda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Quick Access Categories */}
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {categories.map((category, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {category.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom align="center">
                  {category.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                  {category.tags.map((tag, i) => (
                    <Chip key={i} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  sx={{ borderRadius: 4 }}
                  component={RouterLink}
                  to={
                    category.title === 'Iniciando na Advogada Parceira' ? '/help#iniciando' :
                    category.title === 'Assinatura e Pagamentos' ? '/help#assinatura' :
                    category.title === 'Segurança e Privacidade' ? '/help#seguranca' :
                    category.title === 'Criação de Documentos' ? '/help#documentos' :
                    category.title === 'Recursos Avançados de IA' ? '/help#ia' :
                    '/help#faq'
                  }
                >
                  Explorar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs Section */}
      <Box sx={{ width: '100%', mb: 6 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="help content tabs" centered>
            <Tab label="Artigos Frequentes" />
            <Tab label="FAQs" />
            <Tab label="Tutoriais em Vídeo" />
          </Tabs>
        </Box>
        
        {/* Artigos Frequentes */}
        <Box hidden={tabValue !== 0} sx={{ py: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Artigos lidos frequentemente
            </Typography>
            <List>
              {frequentArticles.map((article, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    button 
                    sx={{ 
                      borderRadius: 1,
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                      px: 2
                    }}
                    component={RouterLink}
                    to={`/help/article/${index + 1}`}
                    secondaryAction={
                      <Tooltip title="Salvar para ler depois">
                        <IconButton edge="end" aria-label="bookmark">
                          <BookmarkBorderIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText 
                      primary={article} 
                      secondary={index % 3 === 0 ? "Atualizado recentemente" : ""}
                    />
                  </ListItem>
                  {index < frequentArticles.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                color="primary" 
                variant="outlined" 
                sx={{ borderRadius: 4 }}
                component={RouterLink}
                to="/help/articles"
              >
                Ver todos os artigos
              </Button>
            </Box>
          </Paper>
        </Box>
        
        {/* FAQs */}
        <Box hidden={tabValue !== 1} sx={{ py: 3 }}>
          {faqItems.map((faqCategory, categoryIndex) => (
            <Paper sx={{ p: 3, mb: 3 }} key={categoryIndex}>
              <Typography variant="h6" gutterBottom color="primary">
                {faqCategory.category}
              </Typography>
              
              {faqCategory.items.map((item, itemIndex) => {
                const itemId = `faq-${categoryIndex}-${itemIndex}`;
                return (
                  <Accordion key={itemIndex} sx={{ mt: 1 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel-${itemId}-content`}
                      id={`panel-${itemId}-header`}
                    >
                      <Typography variant="subtitle1">{item.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                        {item.answer}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Esta resposta foi útil?
                        </Typography>
                        
                        {feedbackSent[itemId] ? (
                          <Typography variant="caption" color="success.main">
                            Obrigado pelo seu feedback!
                          </Typography>
                        ) : (
                          <Box>
                            <IconButton 
                              size="small" 
                              onClick={() => handleFeedback(itemId, true)}
                              color="primary"
                            >
                              <ThumbUpAltOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleFeedback(itemId, false)}
                            >
                              <ThumbDownAltOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Paper>
          ))}
        </Box>
        
        {/* Tutoriais em Vídeo */}
        <Box hidden={tabValue !== 2} sx={{ py: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tutoriais em Vídeo
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {tutorials.map((tutorial, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card variant="outlined">
                    <Box sx={{ position: 'relative' }}>
                      <Box 
                        sx={{ 
                          height: 180, 
                          backgroundColor: 'rgba(0, 0, 0, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <IconButton 
                          size="large" 
                          sx={{ 
                            p: 2,
                            backgroundColor: 'white',
                            '&:hover': { backgroundColor: 'white', opacity: 0.9 }
                          }}
                        >
                          <PlayCircleOutlineIcon fontSize="large" color="primary" />
                        </IconButton>
                      </Box>
                      <Chip 
                        label={tutorial.duration} 
                        size="small" 
                        sx={{ 
                          position: 'absolute', 
                          bottom: 8, 
                          right: 8,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white'
                        }} 
                      />
                      <Chip 
                        label={tutorial.level} 
                        size="small" 
                        color={
                          tutorial.level === 'Iniciante' ? 'success' : 
                          tutorial.level === 'Intermediário' ? 'primary' : 'secondary'
                        }
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          left: 8
                        }} 
                      />
                    </Box>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {tutorial.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tutorial.views.toLocaleString()} visualizações
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button color="primary" variant="outlined" sx={{ borderRadius: 4 }}>
                Ver biblioteca completa
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Contact */}
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Não encontrou o que procurava?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Nossa equipe de suporte está pronta para ajudar você a resolver qualquer dúvida.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<ChatIcon />}
            component={RouterLink}
            to="/chat"
            sx={{ borderRadius: 4 }}
          >
            Conversar no chat
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            component="a"
            href="mailto:suporte@advogadaparceira.com"
            sx={{ borderRadius: 4 }}
          >
            Enviar um email
          </Button>
          <Button
            variant="outlined"
            startIcon={<WhatsAppIcon />}
            component="a"
            href="https://wa.me/5511999999999"
            target="_blank"
            sx={{ borderRadius: 4 }}
          >
            WhatsApp
          </Button>
        </Box>
      </Paper>

      {/* Self-Service Tools */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom align="center">
          Ferramentas de Autoatendimento
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ py: 2, borderRadius: 2 }}
              component={RouterLink}
              to="/status"
            >
              Status dos Serviços
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ py: 2, borderRadius: 2 }}
              component={RouterLink}
              to="/reset-password"
            >
              Recuperar Senha
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ py: 2, borderRadius: 2 }}
              component={RouterLink}
              to="/keyboard-shortcuts"
            >
              Atalhos de Teclado
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Advogada Parceira
        </Typography>
      </Box>
    </Container>
  );
};

export default HelpPage; 