import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Paper,
  TextField,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TimerIcon from '@mui/icons-material/Timer';
import { useAuth } from '../../contexts/AuthContext';
import { formatDocumentName } from '../../utils/formatUtils';
import * as documentService from '../../services/documentService';

// Use the Document type from documentService
interface Document extends documentService.Document {}

const DocumentEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNewDocument = !id || id === 'new';
  
  const [document, setDocument] = useState<Document>({
    id: '',
    title: '',
    document_type: 'Petição Inicial',
    content: '',
    created_at: new Date(),
    updated_at: new Date()
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [autoSaveTimerId, setAutoSaveTimerId] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Document types for dropdown
  const documentTypes = ['Petição Inicial', 'Recurso', 'Contrato', 'Procuração', 'Parecer', 'Carta', 'Outro'];

  // Handle save function with useCallback
  const handleSave = useCallback(async (isAutoSave: boolean = false) => {
    setSaving(true);
    
    try {
      let updatedDoc;
      
      if (isNewDocument) {
        // Logic for creating a new document would go here
        updatedDoc = {
          ...document,
          created_at: new Date(),
          updated_at: new Date()
        };
        // Here we would normally call an API to create the document
      } else {
        // Update existing document
        updatedDoc = await documentService.updateDocument(document.id, {
          title: document.title,
          content: document.content,
          document_type: document.document_type
        });
        console.log('Documento atualizado:', updatedDoc);
      }
      
      setDocument(updatedDoc);
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        setSnackbar({
          open: true,
          message: 'Modelo salvo com sucesso!',
          severity: 'success'
        });
        
        // Redirect to the document view if it was a new document
        if (isNewDocument) {
          navigate('/documents');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar o modelo. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  }, [document, isNewDocument, navigate]);

  // Fetch document from API
  useEffect(() => {
    if (isNewDocument) {
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        setLoading(true);
        const doc = await documentService.getDocument(id!);
        setDocument(doc as Document);
        console.log('Documento carregado:', doc);
      } catch (error) {
        console.error('Erro ao carregar documento:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar o documento. Por favor, tente novamente.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, isNewDocument]);

  // Auto-save feature
  useEffect(() => {
    // Clear previous timer if exists
    if (autoSaveTimerId) {
      clearTimeout(autoSaveTimerId);
    }

    // Only set auto-save for existing documents
    if (!isNewDocument && document.id) {
      const timerId = setTimeout(() => {
        handleSave(true);
      }, 30000); // Auto-save every 30 seconds

      setAutoSaveTimerId(timerId);
    }

    return () => {
      if (autoSaveTimerId) {
        clearTimeout(autoSaveTimerId);
      }
    };
  }, [document, isNewDocument, handleSave, autoSaveTimerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocument(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    
    setDocument(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Function to format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Editor Toolbar */}
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={0}
        sx={{ 
          top: 64, // Height of the main app header
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <Toolbar variant="dense">
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="voltar" 
            onClick={() => navigate('/documents')}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link 
                component={RouterLink} 
                to="/documents"
                underline="hover"
                color="inherit"
              >
                Documentos
              </Link>
              <Typography color="text.primary">
                {isNewDocument ? 'Novo documento' : `Editar: ${document.title}`}
              </Typography>
            </Breadcrumbs>
          </Box>
          
          {!isNewDocument && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <TimerIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {lastSaved 
                  ? `Salvo ${lastSaved.toLocaleTimeString()}`
                  : `Última atualização: ${formatDate(document.updated_at)}`}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<DownloadIcon />}
              variant="outlined"
              size="small"
              disabled={loading || saving || isNewDocument}
            >
              Exportar
            </Button>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              size="small"
              disabled={loading || saving}
              onClick={() => handleSave()}
            >
              {saving ? 'Salvando...' : 'Salvar'}
              {saving && <CircularProgress size={16} sx={{ ml: 1 }} />}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 2, mb: 4, flexGrow: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {/* Document Details */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Título do documento"
                      name="title"
                      value={document.title}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Ex: Petição Inicial - Caso João Silva"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="document-type-label">Tipo de documento</InputLabel>
                      <Select
                        labelId="document-type-label"
                        id="document_type"
                        name="document_type"
                        value={document.document_type}
                        label="Tipo de documento"
                        onChange={handleSelectChange as any}
                      >
                        {documentTypes.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Data de criação"
                      value={formatDate(document.created_at)}
                      variant="outlined"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Document Editor */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                    Conteúdo
                  </Typography>
                  <IconButton color="primary" size="small" aria-label="ajuda">
                    <HelpOutlineIcon />
                  </IconButton>
                </Box>
                
                <TextField
                  fullWidth
                  name="content"
                  value={document.content}
                  onChange={handleChange}
                  multiline
                  rows={20}
                  variant="outlined"
                  placeholder="Digite o conteúdo do documento aqui..."
                />
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Suporte a formatação simplificada com markdown. Use # para títulos, ** para negrito, * para itálico.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentEditorPage; 