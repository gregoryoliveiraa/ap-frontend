import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import { useSnackbar } from 'notistack';
import * as documentService from '../../services/documentService';
import { useAuth } from '../../contexts/AuthContext';

const TemplateImportPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [templates, setTemplates] = useState<documentService.Template[]>([]);
  const [importStats, setImportStats] = useState<{ count: number; errors?: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  
  // Novo estado para importação
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importSource, setImportSource] = useState<'csv' | 'docx' | 'json'>('csv');
  const [importOptions, setImportOptions] = useState({
    overwrite: false,
    validate: true,
    category: '',
    subcategory: ''
  });
  
  // Estado para preview de template
  const [previewTemplate, setPreviewTemplate] = useState<documentService.Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  // Ref para input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await documentService.listTemplates();
      setTemplates(result.templates);
    } catch (err) {
      console.error('Erro ao buscar templates:', err);
      setError('Erro ao carregar os templates. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      enqueueSnackbar('Por favor, selecione um arquivo para importar', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await documentService.importTemplates(
        importSource,
        selectedFile,
        importOptions
      );
      
      setImportStats(result);
      
      if (result.errors && result.errors.length > 0) {
        enqueueSnackbar(`Importação concluída com ${result.errors.length} erros`, { variant: 'warning' });
      } else {
        enqueueSnackbar(`${result.count} templates importados com sucesso!`, { variant: 'success' });
      }
      
      // Recarregar lista de templates
      await fetchTemplates();
      
      // Limpar seleção
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Erro ao importar templates:', err);
      setError('Erro ao importar templates. Por favor, tente novamente.');
      enqueueSnackbar('Erro ao importar templates', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = async (template: documentService.Template) => {
    try {
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewTemplate(template);
      setPreviewOpen(true);
      
      // Validar template
      const validation = await documentService.validateTemplate({
        id: template.id,
        document_name: template.document_name,
        subfolder_1: template.subfolder_1,
        subfolder_2: template.subfolder_2,
        text: '', // Será preenchido pelo backend
        variables: [] // Será preenchido pelo backend
      });
      
      if (!validation.isValid) {
        setPreviewError(`Erros de validação:\n${validation.errors.join('\n')}`);
      }
    } catch (err) {
      console.error('Erro ao validar template:', err);
      setPreviewError('Erro ao validar template');
    } finally {
      setPreviewLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subfolder_1.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subfolder_2.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Importação de Templates
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Importar Novos Templates
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Fonte</InputLabel>
                  <Select
                    value={importSource}
                    onChange={(e) => setImportSource(e.target.value as typeof importSource)}
                    label="Fonte"
                  >
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="docx">Word (DOCX)</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                  </Select>
                </FormControl>
                
                <input
                  type="file"
                  accept={
                    importSource === 'csv' ? '.csv' :
                    importSource === 'docx' ? '.docx' :
                    '.json'
                  }
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
                
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {selectedFile ? selectedFile.name : 'Selecionar Arquivo'}
                </Button>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Categoria"
                      value={importOptions.category}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Subcategoria"
                      value={importOptions.subcategory}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, subcategory: e.target.value }))}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleImport}
                    disabled={!selectedFile || loading}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={24} /> : 'Importar Templates'}
                  </Button>
                </Box>
                
                {importStats && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Resultado da importação:
                    </Typography>
                    <Typography>
                      Templates importados: {importStats.count}
                    </Typography>
                    {importStats.errors && importStats.errors.length > 0 && (
                      <List dense>
                        {importStats.errors.map((error, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={error}
                              primaryTypographyProps={{ color: 'error' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    Templates Existentes
                  </Typography>
                  <IconButton onClick={fetchTemplates} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Box>
                
                <TextField
                  fullWidth
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Categoria</TableCell>
                        <TableCell>Subcategoria</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>{template.document_name}</TableCell>
                          <TableCell>{template.subfolder_1}</TableCell>
                          <TableCell>{template.subfolder_2}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Visualizar">
                              <IconButton
                                size="small"
                                onClick={() => handlePreviewTemplate(template)}
                              >
                                <PreviewIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Diálogo de Preview */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Preview do Template
        </DialogTitle>
        <DialogContent dividers>
          {previewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : previewError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {previewError}
            </Alert>
          ) : previewTemplate && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {previewTemplate.document_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Categoria: {previewTemplate.subfolder_1}
                {previewTemplate.subfolder_2 && ` / ${previewTemplate.subfolder_2}`}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {/* Aqui você pode adicionar mais detalhes do template */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TemplateImportPage; 