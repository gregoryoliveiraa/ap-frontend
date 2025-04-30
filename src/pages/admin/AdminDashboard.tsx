import React, { useState, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSnackbar } from 'notistack';
import * as documentService from '../../services/documentService';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  
  // Estado para importação
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importSource, setImportSource] = useState<'csv' | 'docx' | 'json'>('csv');
  const [importOptions, setImportOptions] = useState({
    overwrite: false,
    validate: true,
    category: '',
    subcategory: ''
  });
  const [importStats, setImportStats] = useState<{ count: number; errors?: string[] } | null>(null);
  
  // Ref para input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportTemplates = async () => {
    if (!selectedFile) {
      enqueueSnackbar('Por favor, selecione um arquivo para importar', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
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
      
      // Limpar seleção
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao importar templates:', error);
      enqueueSnackbar('Erro ao importar templates. Verifique o console para mais detalhes.', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CloudUploadIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                Importação de Templates
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Importe templates de documentos de diferentes fontes para o sistema.
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
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              sx={{ mb: 2 }}
            >
              {selectedFile ? selectedFile.name : 'Selecionar Arquivo'}
            </Button>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
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
            
            <Button
              variant="contained"
              onClick={handleImportTemplates}
              disabled={loading || !selectedFile}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Importar Templates'}
            </Button>
            
            {importStats && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 2 }} />
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
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SettingsIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                Configurações do Sistema
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Gerencie as configurações gerais do sistema de documentos.
            </Typography>
            
            <Button
              variant="outlined"
              fullWidth
              component="a"
              href="/admin/templates"
            >
              Gerenciar Templates
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminDashboard; 