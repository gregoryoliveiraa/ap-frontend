import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Breadcrumbs,
  Link,
  Chip,
  Divider,
  Button,
  IconButton,
  Alert,
  Tooltip
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UpdateIcon from '@mui/icons-material/Update';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';

// Simulação de artigos
interface Article {
  id: number;
  title: string;
  content: string[];
  category: string;
  tags: string[];
  date: string;
  lastUpdated?: string;
  author?: string;
  readTime?: number;
  relatedArticles?: number[];
}

const articles: Article[] = [
  {
    id: 1,
    title: 'Como alterar o cartão de crédito na Advogada Parceira',
    content: [
      'Manter suas informações de pagamento atualizadas é importante para evitar interrupções em seu serviço. Veja como você pode alterar o cartão de crédito vinculado à sua conta:',
      '## Passo a passo para atualizar seu cartão de crédito',
      '1. Acesse sua conta na Advogada Parceira',
      '2. Clique em "Meu Perfil" no menu superior direito',
      '3. Selecione a aba "Assinatura"',
      '4. Clique em "Gerenciar métodos de pagamento"',
      '5. Para adicionar um novo cartão, clique em "Adicionar novo cartão"',
      '6. Preencha os dados do cartão (número, data de validade, código de segurança)',
      '7. Após adicionar o novo cartão, você pode defini-lo como padrão',
      '8. Para remover um cartão antigo, clique no ícone de lixeira ao lado do cartão que deseja excluir',
      '## Quando a alteração entrará em vigor',
      'A alteração do cartão de crédito é imediata. A próxima cobrança já será realizada no novo cartão cadastrado.',
      '## Problemas comuns',
      'Se você estiver tendo problemas para atualizar seu cartão, verifique:',
      '- Se os dados foram inseridos corretamente',
      '- Se o cartão não está expirado ou bloqueado',
      '- Se o cartão permite transações online',
      '- Se o limite disponível é suficiente para o plano contratado',
      'Caso continue tendo problemas, entre em contato com nosso suporte.'
    ],
    category: 'Assinatura e Pagamento',
    tags: ['Pagamento', 'Cartão', 'Cobrança'],
    date: '2023-11-15',
    lastUpdated: '2023-11-15',
    author: 'Equipe Advogada Parceira',
    readTime: 3,
    relatedArticles: [3, 4, 6]
  },
  {
    id: 2,
    title: 'Como elaborar uma Petição Inicial na Advogada Parceira',
    content: [
      'A elaboração de uma petição inicial eficiente é fundamental para o sucesso do processo. Com a Advogada Parceira, você pode criar petições iniciais de forma rápida e profissional.',
      '## O que é uma Petição Inicial',
      'A petição inicial é o documento que dá início ao processo judicial. Ela deve conter todos os elementos necessários para que o juiz compreenda o pedido e as razões que o fundamentam.',
      '## Como criar uma Petição Inicial na plataforma',
      '1. Acesse a seção "Documentos" no menu lateral',
      '2. Clique em "+ Novo Documento"',
      '3. Selecione "Petição Inicial" entre os modelos disponíveis',
      '4. Escolha a área do direito específica',
      '5. Preencha os campos solicitados com as informações do caso',
      '6. Utilize os recursos de IA para aprimorar o texto quando necessário',
      '7. Revise o documento gerado',
      '8. Salve ou exporte o documento conforme sua necessidade',
      '## Elementos essenciais da Petição Inicial',
      'Certifique-se de que sua petição contenha:',
      '- Endereçamento correto',
      '- Qualificação das partes',
      '- Fatos e fundamentos jurídicos',
      '- Pedidos claros e específicos',
      '- Valor da causa',
      '- Provas que pretende produzir',
      '## Dicas para uma Petição Inicial eficaz',
      '- Seja claro e objetivo',
      '- Organize os fatos em ordem cronológica',
      '- Fundamente adequadamente os pedidos',
      '- Verifique se todos os documentos necessários estão anexados',
      '- Use uma linguagem formal, mas acessível'
    ],
    category: 'Documentos',
    tags: ['Petição', 'Inicial', 'Tutorial'],
    date: '2023-10-28',
    lastUpdated: '2023-11-10',
    author: 'Dra. Ana Silva',
    readTime: 6,
    relatedArticles: [5, 9, 12]
  },
  {
    id: 3,
    title: 'Como cancelar minha assinatura?',
    content: [
      'Se você precisa cancelar sua assinatura da Advogada Parceira, siga o passo a passo abaixo. Lembre-se que você continuará tendo acesso aos recursos até o final do período já pago.',
      '## Como cancelar sua assinatura',
      '1. Acesse sua conta na Advogada Parceira',
      '2. Clique em "Meu Perfil" no menu superior direito',
      '3. Selecione a aba "Assinatura"',
      '4. Clique no botão "Cancelar assinatura"',
      '5. Selecione o motivo do cancelamento no formulário que aparecerá',
      '6. Confirme o cancelamento clicando em "Confirmar cancelamento"',
      '7. Você receberá um e-mail confirmando o cancelamento',
      '## O que acontece após o cancelamento',
      'Após cancelar sua assinatura:',
      '- Você manterá acesso a todos os recursos até o final do período já pago',
      '- Seus documentos ficarão disponíveis para exportação por 30 dias após o término da assinatura',
      '- Você poderá reativar sua conta a qualquer momento dentro de 6 meses, recuperando acesso a todos os seus dados',
      '## Política de reembolso',
      'Se você cancelar nos primeiros 7 dias após a contratação, poderá solicitar reembolso integral. Após esse período, não há reembolso para o período não utilizado.',
      '## Precisa apenas de uma pausa?',
      'Se você precisa apenas de uma pausa temporária, considere fazer downgrade para o plano básico em vez de cancelar completamente. Assim, você mantém acesso aos seus documentos com um custo menor.'
    ],
    category: 'Assinatura e Pagamento',
    tags: ['Cancelamento', 'Assinatura'],
    date: '2023-11-05',
    lastUpdated: '2023-11-20',
    author: 'Equipe de Suporte',
    readTime: 4,
    relatedArticles: [1, 4, 6]
  }
];

// Componente principal
const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackValue, setFeedbackValue] = useState<'positive' | 'negative' | null>(null);
  const [relatedArticlesList, setRelatedArticlesList] = useState<Article[]>([]);

  // Simular busca de artigo
  useEffect(() => {
    if (id) {
      const numId = parseInt(id, 10);
      const foundArticle = articles.find(a => a.id === numId);
      
      if (foundArticle) {
        setArticle(foundArticle);
        
        // Buscar artigos relacionados
        if (foundArticle.relatedArticles && foundArticle.relatedArticles.length > 0) {
          const related = articles.filter(a => 
            foundArticle.relatedArticles?.includes(a.id)
          );
          setRelatedArticlesList(related);
        }
      }
    }
  }, [id]);

  // Função para lidar com impressão
  const handlePrint = () => {
    window.print();
  };

  // Função para compartilhar
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: `Confira este artigo na Central de Ajuda da Advogada Parceira: ${article?.title}`,
        url: window.location.href,
      })
      .catch((error) => console.log('Erro ao compartilhar', error));
    } else {
      // Fallback - copiar link para a área de transferência
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  // Função para favoritar
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  // Função para enviar feedback
  const handleFeedback = (value: 'positive' | 'negative') => {
    setFeedbackValue(value);
    setFeedbackSent(true);
  };

  // Renderizar um parágrafo ou título com base no conteúdo
  const renderContent = (text: string) => {
    if (text.startsWith('## ')) {
      return (
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          {text.replace('## ', '')}
        </Typography>
      );
    } else if (text.startsWith('- ')) {
      return (
        <Box component="li" sx={{ ml: 4, mb: 1 }}>
          <Typography variant="body1">
            {text.replace('- ', '')}
          </Typography>
        </Box>
      );
    } else if (text.match(/^\d+\.\s/)) {
      return (
        <Box component="li" sx={{ ml: 4, mb: 1 }}>
          <Typography variant="body1">
            {text.replace(/^\d+\.\s/, '')}
          </Typography>
        </Box>
      );
    } else {
      return (
        <Typography variant="body1" paragraph>
          {text}
        </Typography>
      );
    }
  };

  // Renderizar lista numerada ou não numerada
  const renderList = (items: string[], startIndex: number, isNumbered: boolean) => {
    const listItems = [];
    let currentIndex = startIndex;
    
    while (
      currentIndex < items.length && 
      (items[currentIndex].startsWith('- ') || items[currentIndex].match(/^\d+\.\s/))
    ) {
      const isNumberedItem = items[currentIndex].match(/^\d+\.\s/);
      
      if ((isNumbered && isNumberedItem) || (!isNumbered && !isNumberedItem)) {
        listItems.push(renderContent(items[currentIndex]));
      } else {
        break;
      }
      
      currentIndex++;
    }
    
    return (
      <>
        {isNumbered ? (
          <Box component="ol" sx={{ mt: 2, mb: 3 }}>
            {listItems}
          </Box>
        ) : (
          <Box component="ul" sx={{ mt: 2, mb: 3 }}>
            {listItems}
          </Box>
        )}
      </>
    );
  };

  // Renderizar conteúdo do artigo
  const renderArticleContent = () => {
    if (!article) return null;
    
    const elements = [];
    
    for (let i = 0; i < article.content.length; i++) {
      const text = article.content[i];
      
      if (text.match(/^\d+\.\s/)) {
        // Verificar se é o início de uma lista numerada
        const listItems = renderList(article.content, i, true);
        elements.push(listItems);
        
        // Avançar o índice para após a lista
        while (
          i + 1 < article.content.length && 
          article.content[i + 1].match(/^\d+\.\s/)
        ) {
          i++;
        }
      } else if (text.startsWith('- ')) {
        // Verificar se é o início de uma lista não numerada
        const listItems = renderList(article.content, i, false);
        elements.push(listItems);
        
        // Avançar o índice para após a lista
        while (
          i + 1 < article.content.length && 
          article.content[i + 1].startsWith('- ')
        ) {
          i++;
        }
      } else {
        // Renderizar parágrafos e títulos normalmente
        elements.push(renderContent(text));
      }
    }
    
    return elements;
  };

  // Se artigo não for encontrado
  if (!article) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Artigo não encontrado
          </Typography>
          <Typography variant="body1" paragraph>
            O artigo que você está procurando não existe ou foi removido.
          </Typography>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/help/articles"
            startIcon={<ArrowBackIcon />}
          >
            Voltar para a lista de artigos
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/help" color="inherit">
          Central de Ajuda
        </Link>
        <Link component={RouterLink} to="/help/articles" color="inherit">
          Artigos
        </Link>
        <Typography color="text.primary" noWrap sx={{ maxWidth: 200 }}>
          {article.title}
        </Typography>
      </Breadcrumbs>

      {/* Article Container */}
      <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }} className="article-content">
        {/* Article Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {article.title}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
            <Chip 
              label={article.category} 
              color="primary" 
              variant="outlined"
              component={RouterLink}
              to={`/help/articles?category=${encodeURIComponent(article.category)}`}
              clickable
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {article.readTime} min de leitura
              </Typography>
            </Box>
            
            {article.author && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {article.author}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <UpdateIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Atualizado em: {new Date(article.lastUpdated || article.date).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Tooltip title="Imprimir">
              <IconButton onClick={handlePrint}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Compartilhar">
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={bookmarked ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
              <IconButton onClick={handleBookmark}>
                {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Article Content */}
        <Box sx={{ mb: 4 }}>
          {renderArticleContent()}
        </Box>
        
        {/* Tags */}
        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Tags:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {article.tags.map((tag) => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                variant="outlined"
                component={RouterLink}
                to={`/help/articles?search=${encodeURIComponent(tag)}`}
                clickable
              />
            ))}
          </Box>
        </Box>
        
        {/* Feedback Section */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Este artigo foi útil?
          </Typography>
          
          {feedbackSent ? (
            <Alert 
              icon={<CheckCircleIcon fontSize="inherit" />} 
              severity="success"
              sx={{ mt: 2 }}
            >
              Obrigado pelo seu feedback! Estamos sempre buscando melhorar nossa base de conhecimento.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<ThumbUpAltOutlinedIcon />}
                onClick={() => handleFeedback('positive')}
              >
                Sim, foi útil
              </Button>
              <Button 
                variant="outlined" 
                color="inherit"
                startIcon={<ThumbDownAltOutlinedIcon />}
                onClick={() => handleFeedback('negative')}
              >
                Não, precisa melhorar
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Related Articles */}
      {relatedArticlesList.length > 0 && (
        <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Artigos relacionados
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {relatedArticlesList.map((relatedArticle) => (
              <Box component="li" key={relatedArticle.id} sx={{ mb: 2 }}>
                <Link 
                  component={RouterLink} 
                  to={`/help/article/${relatedArticle.id}`}
                  color="primary"
                  underline="hover"
                >
                  {relatedArticle.title}
                </Link>
                <Typography variant="body2" color="text.secondary">
                  {relatedArticle.content[0].substring(0, 100)}...
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
      
      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/help/articles"
        >
          Voltar para artigos
        </Button>
        
        <Button 
          variant="contained"
          component={RouterLink}
          to="/help"
        >
          Central de Ajuda
        </Button>
      </Box>
    </Container>
  );
};

export default ArticleDetailPage; 