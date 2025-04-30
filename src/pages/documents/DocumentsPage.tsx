import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
  Breadcrumbs,
  Divider,
  ListItemButton
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import FolderIcon from '@mui/icons-material/Folder';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
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
  folder_path?: string | null;
}

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
}

interface ErrorState {
  message: string;
  code?: string;
  severity: 'error' | 'warning' | 'info';
}

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [error, setError] = useState<ErrorState | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([]);
  
  // Dialog states
  const [createFolderDialog, setCreateFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [movingDocument, setMovingDocument] = useState<Document | null>(null);
  const [moveDocumentDialog, setMoveDocumentDialog] = useState(false);
  const [targetFolder, setTargetFolder] = useState<string | null>(null);
  const [deleteFolderDialog, setDeleteFolderDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);

  // Fetch documents and folders from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch documents and folders in parallel
      const [docs, foldersData] = await Promise.all([
        documentService.getUserDocuments(),
        documentService.getUserFolders()
      ]);
      
      setDocuments(docs);
      setFolders(foldersData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      
      let errorState: ErrorState;
      if (err instanceof documentService.DocumentServiceError) {
        switch (err.code) {
          case 'UNAUTHORIZED':
            errorState = {
              message: 'Sua sessão expirou. Por favor, faça login novamente.',
              code: err.code,
              severity: 'error'
            };
            // Optionally trigger a logout or redirect to login
            break;
          case 'FORBIDDEN':
            errorState = {
              message: 'Você não tem permissão para visualizar estes documentos.',
              code: err.code,
              severity: 'error'
            };
            break;
          case 'NOT_FOUND':
            errorState = {
              message: 'Nenhum documento encontrado.',
              code: err.code,
              severity: 'info'
            };
            break;
          case 'SERVER_ERROR':
            errorState = {
              message: 'O servidor encontrou um erro. Por favor, tente novamente mais tarde.',
              code: err.code,
              severity: 'error'
            };
            break;
          default:
            errorState = {
              message: err.message,
              code: err.code,
              severity: 'error'
            };
        }
      } else {
        errorState = {
          message: 'Ocorreu um erro inesperado ao carregar os documentos.',
          severity: 'error'
        };
      }
      
      setError(errorState);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update folder path when currentFolder changes
  useEffect(() => {
    if (currentFolder === null) {
      setFolderPath([]);
      return;
    }

    const buildPath = (folderId: string): {id: string, name: string}[] => {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return [];
      
      if (folder.parent_id === null) {
        return [{ id: folder.id, name: folder.name }];
      } else {
        return [...buildPath(folder.parent_id), { id: folder.id, name: folder.name }];
      }
    };

    setFolderPath(buildPath(currentFolder));
  }, [currentFolder, folders]);

  // Filter documents by current folder and search/category filters
  const filteredItems = () => {
    let filteredDocs = documents.filter(doc => 
      (currentFolder === null ? (doc.folder_path === null || doc.folder_path === undefined || doc.folder_path === '') : doc.folder_path === currentFolder) &&
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === 'all' || doc.document_type === categoryFilter)
    );
    
    // Sort documents
    filteredDocs = filteredDocs.sort((a, b) => {
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
    
    // Get subfolders in current folder
    const subfolders = folders.filter(folder => folder.parent_id === currentFolder);
    
    return { documents: filteredDocs, folders: subfolders };
  };

  const { documents: displayedDocuments, folders: displayedFolders } = filteredItems();

  // Handle document deletion
  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await documentService.deleteDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
      } catch (err) {
        console.error('Erro ao excluir documento:', err);
        setError({ message: 'Não foi possível excluir o documento. Por favor, tente novamente.', severity: 'error' });
      }
    }
  };

  // Handle create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const newFolder = await documentService.createFolder({
        name: newFolderName,
        parent_id: currentFolder
      });
      
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setCreateFolderDialog(false);
    } catch (err) {
      console.error('Erro ao criar pasta:', err);
      setError({ message: 'Não foi possível criar a pasta. Por favor, tente novamente.', severity: 'error' });
    }
  };

  // Handle delete folder
  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    try {
      await documentService.deleteFolder(folderToDelete.id);
      setFolders(folders.filter(f => f.id !== folderToDelete.id));
      setDeleteFolderDialog(false);
      setFolderToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir pasta:', err);
      setError({ message: 'Não foi possível excluir a pasta. Por favor, tente novamente.', severity: 'error' });
    }
  };

  // Handle move document
  const handleMoveDocument = async () => {
    if (!movingDocument) return;
    
    try {
      const updatedDoc = await documentService.moveDocument(
        movingDocument.id, 
        targetFolder
      );
      
      // Update document in list
      setDocuments(documents.map(doc => 
        doc.id === updatedDoc.id ? updatedDoc : doc
      ));
      
      setMoveDocumentDialog(false);
      setMovingDocument(null);
      setTargetFolder(null);
    } catch (err) {
      console.error('Erro ao mover documento:', err);
      setError({ message: 'Não foi possível mover o documento. Por favor, tente novamente.', severity: 'error' });
    }
  };

  // Navigate to folder
  const handleFolderClick = (folder: Folder) => {
    setCurrentFolder(folder.id);
  };

  // Navigate back
  const handleNavigateBack = () => {
    if (folderPath.length > 1) {
      // Go to parent folder
      setCurrentFolder(folderPath[folderPath.length - 2].id);
    } else {
      // Go to root
      setCurrentFolder(null);
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
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<CreateNewFolderIcon />}
              onClick={() => setCreateFolderDialog(true)}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Nova Pasta
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/documents/new"
              disabled={loading}
            >
              Novo Documento
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert 
            severity={error.severity} 
            sx={{ mb: 3 }}
            action={
              error.code === 'SERVER_ERROR' && (
                <Button color="inherit" size="small" onClick={fetchData}>
                  Tentar Novamente
                </Button>
              )
            }
          >
            {error.message}
          </Alert>
        )}

        {/* Folder navigation */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Button 
              component="button"
              onClick={() => setCurrentFolder(null)}
              sx={{ textTransform: 'none' }}
              startIcon={<FolderIcon />}
            >
              Raiz
            </Button>
            {folderPath.map((folder, index) => (
              <Button
                key={folder.id}
                component="button"
                onClick={() => setCurrentFolder(folder.id)}
                sx={{ textTransform: 'none' }}
                disabled={index === folderPath.length - 1}
              >
                {folder.name}
              </Button>
            ))}
          </Breadcrumbs>
          
          {currentFolder && (
            <Button 
              startIcon={<ArrowBackIcon />}
              onClick={handleNavigateBack}
              sx={{ mb: 2 }}
            >
              Voltar
            </Button>
          )}
        </Paper>

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

        {/* Folders list */}
        {displayedFolders.length > 0 && (
          <Paper sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pastas
            </Typography>
            <List>
              {displayedFolders.map((folder) => (
                <ListItem
                  key={folder.id}
                  disablePadding
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => {
                        setFolderToDelete(folder);
                        setDeleteFolderDialog(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton onClick={() => handleFolderClick(folder)}>
                    <ListItemIcon>
                      <FolderIcon />
                    </ListItemIcon>
                    <ListItemText primary={folder.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

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
                ) : displayedDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Nenhum documento encontrado
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedDocuments.map((doc) => (
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
                        <Tooltip title="Mover">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setMovingDocument(doc);
                              setMoveDocumentDialog(true);
                            }}
                          >
                            <DriveFileMoveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
                            onClick={() => handleDeleteDocument(doc.id)}
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

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty state */}
        {!loading && !error && documents.length === 0 && folders.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Nenhum documento encontrado
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Comece criando um novo documento ou pasta
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={RouterLink}
                to="/documents/new"
                sx={{ mr: 2 }}
              >
                Criar Documento
              </Button>
              <Button
                variant="outlined"
                startIcon={<CreateNewFolderIcon />}
                onClick={() => setCreateFolderDialog(true)}
              >
                Criar Pasta
              </Button>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Create Folder Dialog */}
      <Dialog 
        open={createFolderDialog} 
        onClose={() => setCreateFolderDialog(false)}
      >
        <DialogTitle>Nova Pasta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Digite o nome da nova pasta:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Pasta"
            type="text"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFolderDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateFolder} variant="contained">Criar</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog
        open={deleteFolderDialog}
        onClose={() => setDeleteFolderDialog(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a pasta "{folderToDelete?.name}"? Todos os documentos dentro desta pasta serão movidos para a raiz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFolderDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteFolder} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move Document Dialog */}
      <Dialog
        open={moveDocumentDialog}
        onClose={() => setMoveDocumentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mover Documento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Selecione para onde deseja mover "{movingDocument?.title}":
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <List>
              <ListItem 
                button 
                onClick={() => setTargetFolder(null)}
                selected={targetFolder === null}
              >
                <ListItemIcon>
                  <FolderIcon />
                </ListItemIcon>
                <ListItemText primary="Raiz" />
              </ListItem>
              <Divider />
              {folders.map(folder => (
                <ListItem 
                  key={folder.id} 
                  button
                  onClick={() => setTargetFolder(folder.id)}
                  selected={targetFolder === folder.id}
                >
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={folder.name} 
                    secondary={
                      folder.parent_id ? 
                        `Em: ${folders.find(f => f.id === folder.parent_id)?.name || 'Pasta'}` 
                        : 'Na raiz'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDocumentDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleMoveDocument} 
            variant="contained"
            disabled={movingDocument?.folder_path === targetFolder}
          >
            Mover
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentsPage; 