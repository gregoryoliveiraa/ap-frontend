import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  useTheme,
  alpha,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import * as documentService from '../../services/documentService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDocumentName } from '../../utils/formatUtils';

const NewDocumentPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  
  // Estados para seleção de template
  const [categories, setCategories] = useState<documentService.TemplateCategories | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [templates, setTemplates] = useState<documentService.Template[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalTemplates, setTotalTemplates] = useState<number>(0);
  const ITEMS_PER_PAGE = 50;
  
  // Estados para detalhes do template
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateDetails, setTemplateDetails] = useState<documentService.TemplateDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  
  // Estados para geração com IA
  const [caseDescription, setCaseDescription] = useState<string>('');
  const [generatingAiSuggestions, setGeneratingAiSuggestions] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string> | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  
  // Estados para feedback
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'info'}>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Estados para preview do documento
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<{ title: string, content: string, document_type: string } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  
  // Diálogo de seleção de template
  const [templateDialogOpen, setTemplateDialogOpen] = useState<boolean>(false);
  const [selectedTemplateForDialog, setSelectedTemplateForDialog] = useState<documentService.Template | null>(null);
  
  // Ref para o observer do scroll infinito
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Novo estado para erros de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Estado para controle de status do documento
  const [documentStatus, setDocumentStatus] = useState<'draft' | 'final'>('draft');
  
  // Estado para metadados adicionais
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  
  // Elemento de referência para o último item da lista
  const lastTemplateElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreTemplates();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);
  
  // Carregar categorias ao montar o componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await documentService.getTemplateCategories();
        setCategories(categoriesData);
        
        // Selecionar a primeira categoria por padrão
        if (categoriesData.categorias.length > 0) {
          setSelectedCategory(categoriesData.categorias[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError('Não foi possível carregar as categorias de documentos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Carregar templates quando a categoria ou subcategoria mudar
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!selectedCategory) return;
      
      try {
        setLoading(true);
        setCurrentPage(0);
        setTemplates([]);
        
        const result = await documentService.listTemplates(
          selectedCategory,
          selectedSubcategory || undefined,
          0,
          ITEMS_PER_PAGE
        );
        
        setTemplates(result.templates);
        setTotalTemplates(result.total);
        setHasMore(result.templates.length < result.total);
      } catch (err) {
        console.error('Erro ao carregar templates:', err);
        setError('Não foi possível carregar os templates');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [selectedCategory, selectedSubcategory]);
  
  // Função para carregar mais templates
  const loadMoreTemplates = async () => {
    if (!hasMore || loading || !selectedCategory) return;
    
    try {
      setLoading(true);
      const nextPage = currentPage + 1;
      
      const result = await documentService.listTemplates(
        selectedCategory,
        selectedSubcategory || undefined,
        nextPage * ITEMS_PER_PAGE,
        ITEMS_PER_PAGE
      );
      
      setTemplates(prev => [...prev, ...result.templates]);
      setCurrentPage(nextPage);
      
      // Verificar se ainda existem mais templates para carregar
      const totalLoaded = (nextPage + 1) * ITEMS_PER_PAGE;
      setHasMore(totalLoaded < result.total);
    } catch (err) {
      console.error('Erro ao carregar mais templates:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar detalhes do template quando selecionado
  useEffect(() => {
    const fetchTemplateDetails = async () => {
      if (!selectedTemplate) {
        setTemplateDetails(null);
        return;
      }
      
      try {
        setLoadingDetails(true);
        const details = await documentService.getTemplateDetails(selectedTemplate);
        setTemplateDetails(details);
        
        // Inicializar o estado de variáveis com valores vazios
        const initialVariables: Record<string, string> = {};
        details.variables.forEach(variable => {
          initialVariables[variable] = '';
        });
        setVariables(initialVariables);
      } catch (err) {
        console.error('Erro ao carregar detalhes do template:', err);
        setError('Não foi possível carregar os detalhes do template');
      } finally {
        setLoadingDetails(false);
      }
    };
    
    fetchTemplateDetails();
  }, [selectedTemplate]);
  
  // Debounce para o termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Efeito para reiniciar o carregamento de templates quando o termo de busca com debounce muda
  useEffect(() => {
    // Se a busca estiver vazia, não precisamos fazer nada especial
    if (debouncedSearchTerm === '') return;
    
    // Para buscas, limitamos a exibição de resultados para melhorar a performance
    // Não precisamos carregar mais resultados se já tivermos muitos
    setHasMore(templates.length > 0 && templates.length < 200);
  }, [debouncedSearchTerm]);
  
  // Filtrar templates usando o termo de busca com debounce
  const filteredTemplates = templates.filter(template => 
    template.document_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    formatDocumentName(template.document_name).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );
  
  // Manipular mudança de categoria
  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const category = event.target.value as string;
    setSelectedCategory(category);
    setSelectedSubcategory('');
  };
  
  // Manipular mudança de subcategoria
  const handleSubcategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedSubcategory(event.target.value as string);
  };
  
  // Abrir diálogo de confirmação para seleção de template
  const handleTemplateClick = (template: documentService.Template) => {
    setSelectedTemplateForDialog(template);
    setTemplateDialogOpen(true);
  };
  
  // Confirmar seleção de template
  const handleConfirmTemplate = () => {
    if (selectedTemplateForDialog) {
      setSelectedTemplate(selectedTemplateForDialog.id);
    }
    setTemplateDialogOpen(false);
  };
  
  // Cancelar seleção de template
  const handleCancelTemplate = () => {
    setSelectedTemplateForDialog(null);
    setTemplateDialogOpen(false);
  };
  
  // Gerar sugestões com IA
  const handleGenerateAiSuggestions = async () => {
    if (!selectedTemplate || !caseDescription.trim()) {
      setSnackbar({
        open: true,
        message: 'Por favor, descreva o caso para gerar sugestões',
        severity: 'error'
      });
      return;
    }
    
    try {
      setGeneratingAiSuggestions(true);
      const result = await documentService.generateAiSuggestions(selectedTemplate, caseDescription);
      
      if (result.suggestions) {
        setAiSuggestions(result.suggestions);
        
        // Preencher as variáveis com as sugestões
        setVariables(prev => ({
          ...prev,
          ...result.suggestions
        }));
        
        setSnackbar({
          open: true,
          message: `Sugestões geradas com sucesso! ${result.tokens_used} tokens utilizados.`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Não foi possível gerar sugestões para os campos',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Erro ao gerar sugestões:', err);
      setSnackbar({
        open: true,
        message: 'Ocorreu um erro ao gerar sugestões com IA',
        severity: 'error'
      });
    } finally {
      setGeneratingAiSuggestions(false);
    }
  };
  
  // Atualizar valor de variável
  const handleVariableChange = (variable: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };
  
  // Gerar documento
  const handleGenerateDocument = async () => {
    if (!selectedTemplate) {
      setSnackbar({
        open: true,
        message: 'Por favor, selecione um template primeiro',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      setValidationErrors({});
      
      const formattedTitle = templateDetails?.name ? formatDocumentName(templateDetails.name) : undefined;
      
      const result = await documentService.generateDocument(
        selectedTemplate, 
        variables,
        formattedTitle,
        {
          status: documentStatus,
          metadata: {
            ...metadata,
            generated_from_template: true,
            template_version: templateDetails?.version,
            ai_assisted: !!aiSuggestions
          }
        }
      );
      
      setSnackbar({
        open: true,
        message: 'Documento gerado com sucesso!',
        severity: 'success'
      });
      
      // Navegar para o documento gerado
      setTimeout(() => {
        navigate(`/documents/${result.id}`);
      }, 1500);
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      
      // Verificar se é um erro de validação
      if (error instanceof Error && error.message.includes('Validação das variáveis falhou')) {
        try {
          const validationErrors = JSON.parse(error.message.split(': ')[1]);
          setValidationErrors(validationErrors);
          setSnackbar({
            open: true,
            message: 'Por favor, corrija os erros de validação nos campos',
            severity: 'error'
          });
        } catch {
          setSnackbar({
            open: true,
            message: 'Erro ao validar os campos do documento',
            severity: 'error'
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Ocorreu um erro ao gerar o documento',
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Gerar preview do documento
  const handlePreviewDocument = async () => {
    if (!selectedTemplate) {
      setSnackbar({
        open: true,
        message: 'Por favor, selecione um template primeiro',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoadingPreview(true);
      setValidationErrors({});
      
      const formattedTitle = templateDetails?.name ? formatDocumentName(templateDetails.name) : undefined;
      
      const result = await documentService.previewDocument(
        selectedTemplate, 
        variables,
        formattedTitle
      );
      
      setPreviewData(result);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Erro ao gerar preview do documento:', error);
      
      // Verificar se é um erro de validação
      if (error instanceof Error && error.message.includes('Validação das variáveis falhou')) {
        try {
          const validationErrors = JSON.parse(error.message.split(': ')[1]);
          setValidationErrors(validationErrors);
          setSnackbar({
            open: true,
            message: 'Por favor, corrija os erros de validação nos campos',
            severity: 'error'
          });
        } catch {
          setSnackbar({
            open: true,
            message: 'Erro ao validar os campos do documento',
            severity: 'error'
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Ocorreu um erro ao gerar o preview do documento',
          severity: 'error'
        });
      }
    } finally {
      setLoadingPreview(false);
    }
  };
  
  // Fechar preview
  const handleClosePreview = () => {
    setPreviewOpen(false);
  };
  
  // Fechar snackbar
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Renderizar etapa de seleção de template
  const renderTemplateSelection = () => {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Selecione um template
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Escolha a categoria e o tipo de documento que deseja criar
          </Typography>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="category-select-label">Categoria</InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedCategory}
                label="Categoria"
                onChange={handleCategoryChange as any}
                disabled={loading || !categories}
              >
                {categories?.categorias.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="subcategory-select-label">Subcategoria</InputLabel>
              <Select
                labelId="subcategory-select-label"
                value={selectedSubcategory}
                label="Subcategoria"
                onChange={handleSubcategoryChange as any}
                disabled={loading || !selectedCategory || !categories?.subcategorias[selectedCategory]?.length}
              >
                <MenuItem value="">Todas</MenuItem>
                {categories?.subcategorias[selectedCategory]?.map(subcategory => (
                  <MenuItem key={subcategory} value={subcategory}>{subcategory}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Grid>
        </Grid>
        
        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : filteredTemplates.length === 0 && !loading ? (
          <Alert severity="info" sx={{ mb: 3 }}>Nenhum template encontrado com os filtros selecionados</Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Mostrando {filteredTemplates.length} de {totalTemplates} templates
            </Typography>
            
            <Grid container spacing={2}>
              {filteredTemplates.map((template, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  key={template.id || `${template.document_name}-${Math.random().toString(36)}`}
                  ref={index === filteredTemplates.length - 1 ? lastTemplateElementRef : undefined}
                >
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleTemplateClick(template)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.1), 
                            color: 'primary.main',
                            mr: 2
                          }}
                        >
                          <DescriptionIcon />
                        </Avatar>
                        <Typography variant="h6" noWrap>
                          {formatDocumentName(template.document_name)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {template.subfolder_1} {template.subfolder_2 && `/ ${template.subfolder_2}`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            )}
          </>
        )}
        
        {/* Diálogo de confirmação para seleção de template */}
        <Dialog open={templateDialogOpen} onClose={handleCancelTemplate} maxWidth="sm" fullWidth>
          <DialogTitle>
            Confirmar seleção de template
          </DialogTitle>
          <DialogContent>
            {selectedTemplateForDialog && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {formatDocumentName(selectedTemplateForDialog.document_name)}
                </Typography>
                <Typography variant="body1" paragraph>
                  Categoria: {selectedTemplateForDialog.subfolder_1}
                  {selectedTemplateForDialog.subfolder_2 && ` / ${selectedTemplateForDialog.subfolder_2}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ao confirmar, você poderá preencher os campos deste documento e usar IA para gerar sugestões.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelTemplate} color="inherit">Cancelar</Button>
            <Button onClick={handleConfirmTemplate} variant="contained">Confirmar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };
  
  // Renderizar formulário de entrada de variáveis
  const renderVariablesInput = () => {
    if (!templateDetails) return null;
    
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Preencher Variáveis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Preencha os campos necessários para gerar o documento
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {templateDetails.variables.map((variable) => (
            <Grid item xs={12} sm={6} key={variable}>
              <TextField
                fullWidth
                label={formatDocumentName(variable)}
                value={variables[variable] || ''}
                onChange={(e) => {
                  setVariables(prev => ({
                    ...prev,
                    [variable]: e.target.value
                  }));
                  // Limpar erro de validação ao editar
                  if (validationErrors[variable]) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors[variable];
                      return newErrors;
                    });
                  }
                }}
                error={!!validationErrors[variable]}
                helperText={validationErrors[variable]}
                required={templateDetails.validation_rules?.[variable]?.required}
              />
            </Grid>
          ))}
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="document-status-label">Status do Documento</InputLabel>
              <Select
                labelId="document-status-label"
                value={documentStatus}
                label="Status do Documento"
                onChange={(e) => setDocumentStatus(e.target.value as 'draft' | 'final')}
              >
                <MenuItem value="draft">Rascunho</MenuItem>
                <MenuItem value="final">Final</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Botões de ação */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handlePreviewDocument}
                disabled={loading || loadingPreview}
              >
                Visualizar
              </Button>
              <Button
                variant="contained"
                onClick={handleGenerateDocument}
                disabled={loading || loadingPreview}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Gerar Documento
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {selectedTemplate ? renderVariablesInput() : renderTemplateSelection()}
      </Paper>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Diálogo de preview do documento */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewData?.title || 'Preview do Documento'}
        </DialogTitle>
        <DialogContent dividers>
          {previewData?.content ? (
            <Box sx={{ whiteSpace: 'pre-wrap', fontFamily: 'serif', p: 2 }}>
              {previewData.content}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Fechar</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleGenerateDocument}
          >
            Gerar Documento
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NewDocumentPage; 