import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import { useAuth } from '../../contexts/AuthContext';
import { formatDocumentName } from '../../utils/formatUtils';
import * as documentService from '../../services/documentService';

// Use the Document type from documentService
interface Document {
  id: string;
  title: string;
  document_type: string;
  created_at: Date;
  updated_at: Date;
  content?: string;
}

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents from API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const docs = await documentService.getUserDocuments();
        setDocuments(docs);
      } catch (err) {
        console.error('Erro ao carregar documentos:', err);
        setError('Não foi possível carregar seus documentos. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === 'all' || doc.document_type === categoryFilter)
    )
    .sort((a, b) => {
      switch(sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created_at':
          return b.created_at.getTime() - a.created_at.getTime();
        case 'updated_at':
        default:
          return b.updated_at.getTime() - a.updated_at.getTime();
      }
    });

  // Handle document deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        // TODO: Implement delete API call when available
        // await documentService.deleteDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
      } catch (err) {
        console.error('Erro ao excluir documento:', err);
        setError('Não foi possível excluir o documento. Por favor, tente novamente.');
      }
    }
  };

  // Extract unique categories for filter
  const categories = ['all', ...Array.from(new Set(documents.map(doc => doc.document_type)))];

  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 2, pb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Meus Documentos
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/documents/new"
          >
            Novo Documento
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters and Search */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="category-filter-label">Categoria</InputLabel>
                <Select
                  labelId="category-filter-label"
                  id="category-filter"
                  value={categoryFilter}
                  label="Categoria"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">Todas</MenuItem>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="sort-label">Ordenar por</InputLabel>
                <Select
                  labelId="sort-label"
                  id="sort"
                  value={sortBy}
                  label="Ordenar por"
                  onChange={(e) => setSortBy(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="updated_at">Última atualização</MenuItem>
                  <MenuItem value="created_at">Data de criação</MenuItem>
                  <MenuItem value="title">Título</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Document table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Criado em</TableCell>
                  <TableCell>Última atualização</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Nenhum documento encontrado
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell>
                        <Typography
                          component={RouterLink}
                          to={`/documents/${doc.id}`}
                          sx={{ 
                            textDecoration: 'none', 
                            color: 'primary.main',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {doc.title}
                        </Typography>
                        {doc.content && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {doc.content.substring(0, 100)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={doc.document_type} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        {doc.created_at.toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {doc.updated_at.toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small"
                            onClick={() => navigate(`/documents/${doc.id}/edit`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
};

export default DocumentsPage; 