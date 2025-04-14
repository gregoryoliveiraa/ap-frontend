import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Tooltip,
  Alert,
  Snackbar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminNavigation from './components/AdminNavigation';
import { getAllNotifications, sendNotification, deleteNotification } from '../../services/adminService';
import { NotificationData } from '../../services/adminService';
import { formatDateTime } from '../../utils/dateUtils';

// Componente para renderizar o tipo da notificação
const NotificationType: React.FC<{ type: string }> = ({ type }) => {
  const theme = useTheme();
  
  switch (type) {
    case 'info':
      return (
        <Chip 
          icon={<InfoIcon fontSize="small" />} 
          label="Informação" 
          size="small" 
          color="info" 
          variant="outlined" 
          sx={{ backgroundColor: theme.palette.info.light + '20' }}
        />
      );
    case 'warning':
      return (
        <Chip 
          icon={<WarningIcon fontSize="small" />} 
          label="Aviso" 
          size="small" 
          color="warning" 
          variant="outlined" 
          sx={{ backgroundColor: theme.palette.warning.light + '20' }}
        />
      );
    case 'error':
      return (
        <Chip 
          icon={<ErrorIcon fontSize="small" />} 
          label="Erro" 
          size="small" 
          color="error" 
          variant="outlined" 
          sx={{ backgroundColor: theme.palette.error.light + '20' }}
        />
      );
    case 'success':
      return (
        <Chip 
          icon={<CheckCircleIcon fontSize="small" />} 
          label="Sucesso" 
          size="small" 
          color="success" 
          variant="outlined" 
          sx={{ backgroundColor: theme.palette.success.light + '20' }}
        />
      );
    default:
      return (
        <Chip 
          label={type} 
          size="small" 
          color="default" 
          variant="outlined" 
        />
      );
  }
};

const NotificationManagementPage: React.FC = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'warning' | 'error'
  });
  
  // Campos para nova notificação
  const [newNotification, setNewNotification] = useState<NotificationData>({
    title: '',
    message: '',
    type: 'info',
    target_all: true,
    expiry_date: ''
  });
  
  // Validação de campos
  const [formErrors, setFormErrors] = useState({
    title: false,
    message: false
  });

  // Carregar notificações
  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllNotifications();
      setNotifications(data);
      setFilteredNotifications(data);
    } catch (err) {
      setError('Erro ao carregar notificações.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Filtrar notificações com base no termo de pesquisa
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNotifications(notifications);
    } else {
      const lowercaseTerm = searchTerm.toLowerCase();
      const filtered = notifications.filter(notification => 
        notification.title.toLowerCase().includes(lowercaseTerm) || 
        notification.message.toLowerCase().includes(lowercaseTerm) ||
        notification.type.toLowerCase().includes(lowercaseTerm)
      );
      setFilteredNotifications(filtered);
    }
    setPage(0);
  }, [searchTerm, notifications]);

  // Manipuladores de paginação
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Abrir diálogo para nova notificação
  const handleOpenDialog = (notification?: NotificationData) => {
    if (notification) {
      setSelectedNotification(notification);
      setNewNotification({
        ...notification
      });
    } else {
      setSelectedNotification(null);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        target_all: true,
        expiry_date: ''
      });
    }
    setFormErrors({ title: false, message: false });
    setOpenDialog(true);
  };

  // Fechar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const errors = {
      title: !newNotification.title.trim(),
      message: !newNotification.message.trim()
    };
    setFormErrors(errors);
    return !errors.title && !errors.message;
  };

  // Atualizar campos da notificação
  const handleNotificationChange = (field: keyof NotificationData, value: any) => {
    setNewNotification(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário digitar algo
    if (field === 'title' || field === 'message') {
      setFormErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  // Enviar notificação
  const handleSendNotification = async () => {
    if (!validateForm()) return;

    try {
      await sendNotification(newNotification);
      
      handleCloseDialog();
      await loadNotifications();
      
      setSnackbar({
        open: true,
        message: selectedNotification ? 'Notificação atualizada com sucesso.' : 'Notificação enviada com sucesso.',
        severity: 'success'
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: 'Erro ao enviar notificação.',
        severity: 'error'
      });
    }
  };

  // Excluir notificação
  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      
      await loadNotifications();
      
      setSnackbar({
        open: true,
        message: 'Notificação excluída com sucesso.',
        severity: 'success'
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir notificação.',
        severity: 'error'
      });
    }
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gerenciamento de Notificações
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Crie, edite e gerencie notificações para os usuários da plataforma.
        </Typography>
        <AdminNavigation />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '250px' }}>
            <TextField
              label="Buscar notificações"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          <Box>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={loadNotifications} 
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Atualizar
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Nova Notificação
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications.length > 0 ? (
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Mensagem</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Alvo</TableCell>
                    <TableCell>Data de Criação</TableCell>
                    <TableCell>Expiração</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredNotifications
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          {notification.title}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                            {notification.message}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <NotificationType type={notification.type} />
                        </TableCell>
                        <TableCell>
                          {notification.target_all ? (
                            <Chip label="Todos os usuários" size="small" color="primary" variant="outlined" />
                          ) : notification.target_role ? (
                            <Chip label={`Papel: ${notification.target_role}`} size="small" color="secondary" variant="outlined" />
                          ) : (
                            <Chip label="Usuários específicos" size="small" color="default" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          {notification.created_at ? formatDateTime(notification.created_at) : '-'}
                        </TableCell>
                        <TableCell>
                          {notification.expiry_date ? formatDateTime(notification.expiry_date) : 'Sem expiração'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar notificação">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenDialog(notification)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir notificação">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => notification.id && handleDeleteNotification(notification.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredNotifications.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        ) : (
          <Alert severity="info">Nenhuma notificação encontrada com os critérios de busca.</Alert>
        )}
      </Paper>

      {/* Diálogo para criar/editar notificação */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedNotification ? 'Editar Notificação' : 'Nova Notificação'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Título"
                fullWidth
                value={newNotification.title}
                onChange={(e) => handleNotificationChange('title', e.target.value)}
                variant="outlined"
                error={formErrors.title}
                helperText={formErrors.title ? 'Título é obrigatório' : ''}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Mensagem"
                fullWidth
                value={newNotification.message}
                onChange={(e) => handleNotificationChange('message', e.target.value)}
                variant="outlined"
                multiline
                rows={4}
                error={formErrors.message}
                helperText={formErrors.message ? 'Mensagem é obrigatória' : ''}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="notification-type-label">Tipo</InputLabel>
                <Select
                  labelId="notification-type-label"
                  value={newNotification.type}
                  onChange={(e) => handleNotificationChange('type', e.target.value)}
                  label="Tipo"
                >
                  <MenuItem value="info">Informação</MenuItem>
                  <MenuItem value="success">Sucesso</MenuItem>
                  <MenuItem value="warning">Aviso</MenuItem>
                  <MenuItem value="error">Erro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Link de Ação (opcional)"
                fullWidth
                value={newNotification.action_link || ''}
                onChange={(e) => handleNotificationChange('action_link', e.target.value)}
                variant="outlined"
                placeholder="Ex: /dashboard"
                helperText="URL para direcionar o usuário (opcional)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="notification-target-label">Público Alvo</InputLabel>
                <Select
                  labelId="notification-target-label"
                  value={newNotification.target_all ? 'all' : newNotification.target_role ? 'role' : 'specific'}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'all') {
                      handleNotificationChange('target_all', true);
                      handleNotificationChange('target_role', undefined);
                      handleNotificationChange('target_users', undefined);
                    } else if (value === 'role') {
                      handleNotificationChange('target_all', false);
                      handleNotificationChange('target_role', 'user');
                      handleNotificationChange('target_users', undefined);
                    } else {
                      handleNotificationChange('target_all', false);
                      handleNotificationChange('target_role', undefined);
                      handleNotificationChange('target_users', []);
                    }
                  }}
                  label="Público Alvo"
                >
                  <MenuItem value="all">Todos os usuários</MenuItem>
                  <MenuItem value="role">Por papel (role)</MenuItem>
                  <MenuItem value="specific">Usuários específicos</MenuItem>
                </Select>
                <FormHelperText>
                  Defina quem receberá esta notificação
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {!newNotification.target_all && newNotification.target_role && (
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="notification-role-label">Papel (Role)</InputLabel>
                  <Select
                    labelId="notification-role-label"
                    value={newNotification.target_role}
                    onChange={(e) => handleNotificationChange('target_role', e.target.value)}
                    label="Papel (Role)"
                  >
                    <MenuItem value="user">Usuários</MenuItem>
                    <MenuItem value="admin">Administradores</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Data de Expiração (opcional)"
                type="datetime-local"
                fullWidth
                value={newNotification.expiry_date || ''}
                onChange={(e) => handleNotificationChange('expiry_date', e.target.value)}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                helperText="Após esta data, a notificação não será mais exibida"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Cancelar</Button>
          <Button onClick={handleSendNotification} variant="contained" color="primary">
            {selectedNotification ? 'Atualizar Notificação' : 'Enviar Notificação'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotificationManagementPage; 