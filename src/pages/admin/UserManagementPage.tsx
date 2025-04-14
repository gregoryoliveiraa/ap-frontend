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
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import AdminNavigation from './components/AdminNavigation';
import { getAllUsers, updateUser, updateUserCredits } from '../../services/adminService';
import { UserListItem, CreditUpdateData } from '../../services/adminService';
import { formatDate } from '../../utils/dateUtils';

// Componente para renderizar o status de verificação
const VerificationStatus: React.FC<{ verified: boolean }> = ({ verified }) => {
  return verified ? (
    <Chip 
      icon={<VerifiedIcon fontSize="small" />} 
      label="Verificado" 
      size="small" 
      color="success" 
      variant="outlined" 
    />
  ) : (
    <Chip 
      icon={<BlockIcon fontSize="small" />} 
      label="Não verificado" 
      size="small" 
      color="error" 
      variant="outlined" 
    />
  );
};

// Componente para renderizar o tipo de plano
const PlanBadge: React.FC<{ plan: string }> = ({ plan }) => {
  let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
  
  switch (plan.toLowerCase()) {
    case 'free':
      color = "default";
      break;
    case 'basic':
      color = "info";
      break;
    case 'pro':
      color = "primary";
      break;
    case 'enterprise':
      color = "success";
      break;
    default:
      color = "default";
  }
  
  return (
    <Chip 
      label={plan.charAt(0).toUpperCase() + plan.slice(1)} 
      size="small" 
      color={color} 
      variant="outlined" 
    />
  );
};

const UserManagementPage: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openCreditDialog, setOpenCreditDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [creditReason, setCreditReason] = useState<string>('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  // Campos editáveis do usuário
  const [editableFields, setEditableFields] = useState({
    nome_completo: '',
    email: '',
    plano: '',
    verificado: false,
    role: ''
  });

  // Carregar usuários
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError('Erro ao carregar dados dos usuários.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrar usuários com base no termo de pesquisa
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowercaseTerm = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.nome_completo.toLowerCase().includes(lowercaseTerm) || 
        user.email.toLowerCase().includes(lowercaseTerm) ||
        user.plano.toLowerCase().includes(lowercaseTerm)
      );
      setFilteredUsers(filtered);
    }
    setPage(0);
  }, [searchTerm, users]);

  // Manipuladores de paginação
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Abrir diálogo de gerenciamento de créditos
  const handleOpenCreditDialog = (user: UserListItem) => {
    setSelectedUser(user);
    setCreditAmount(0);
    setCreditReason('');
    setOpenCreditDialog(true);
  };

  // Fechar diálogo de créditos
  const handleCloseCreditDialog = () => {
    setOpenCreditDialog(false);
    setSelectedUser(null);
  };

  // Enviar atualização de créditos
  const handleCreditUpdate = async () => {
    if (!selectedUser || !creditReason) {
      setNotificationMessage('Por favor, preencha todos os campos obrigatórios.');
      setNotificationSeverity('error');
      setNotificationOpen(true);
      return;
    }

    try {
      const data: CreditUpdateData = {
        userId: selectedUser.id,
        amount: creditAmount,
        reason: creditReason
      };

      await updateUserCredits(data);
      
      // Atualizar a lista de usuários
      await loadUsers();
      
      handleCloseCreditDialog();
      
      setNotificationMessage(`Créditos ${creditAmount >= 0 ? 'adicionados' : 'removidos'} com sucesso.`);
      setNotificationSeverity('success');
      setNotificationOpen(true);
    } catch (err) {
      console.error(err);
      setNotificationMessage('Erro ao atualizar créditos.');
      setNotificationSeverity('error');
      setNotificationOpen(true);
    }
  };

  // Abrir diálogo de edição de usuário
  const handleOpenUserDialog = (user: UserListItem) => {
    setSelectedUser(user);
    setEditableFields({
      nome_completo: user.nome_completo,
      email: user.email,
      plano: user.plano,
      verificado: user.verificado,
      role: user.role || 'user'
    });
    setOpenUserDialog(true);
  };

  // Fechar diálogo de edição de usuário
  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setSelectedUser(null);
  };

  // Atualizar dados do usuário
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, {
        ...editableFields
      });
      
      // Atualizar a lista de usuários
      await loadUsers();
      
      handleCloseUserDialog();
      
      setNotificationMessage('Usuário atualizado com sucesso.');
      setNotificationSeverity('success');
      setNotificationOpen(true);
    } catch (err) {
      console.error(err);
      setNotificationMessage('Erro ao atualizar usuário.');
      setNotificationSeverity('error');
      setNotificationOpen(true);
    }
  };

  // Fechar notificação
  const handleCloseNotification = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotificationOpen(false);
  };

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'free': return theme.palette.grey[500];
      case 'basic': return theme.palette.info.main;
      case 'pro': return theme.palette.primary.main;
      case 'enterprise': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gerenciamento de Usuários
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gerencie todos os usuários da plataforma, atualize informações e ajuste créditos.
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
            <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            <TextField
              label="Buscar usuários"
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
              onClick={loadUsers} 
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Atualizar
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              disabled
            >
              Novo Usuário
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length > 0 ? (
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Plano</TableCell>
                    <TableCell>Créditos</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Cadastro</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell component="th" scope="row">
                          {user.nome_completo || 'Sem nome'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <PlanBadge plan={user.plano} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {user.creditos_disponiveis}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <VerificationStatus verified={user.verificado} />
                        </TableCell>
                        <TableCell>
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell>
                          {user.role === 'admin' ? (
                            <Chip 
                              icon={<AdminPanelSettingsIcon fontSize="small" />} 
                              label="Admin" 
                              size="small" 
                              color="secondary" 
                              variant="outlined" 
                            />
                          ) : (
                            <Chip 
                              icon={<PersonIcon fontSize="small" />} 
                              label="Usuário" 
                              size="small" 
                              color="default" 
                              variant="outlined" 
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar usuário">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenUserDialog(user)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Gerenciar créditos">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenCreditDialog(user)}
                            >
                              <CreditCardIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Enviar notificação">
                            <IconButton 
                              size="small" 
                              color="primary"
                              disabled
                            >
                              <NotificationsIcon fontSize="small" />
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
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        ) : (
          <Alert severity="info">Nenhum usuário encontrado com os critérios de busca.</Alert>
        )}
      </Paper>

      {/* Diálogo para atualização de créditos */}
      <Dialog open={openCreditDialog} onClose={handleCloseCreditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Gerenciar Créditos
          {selectedUser && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedUser.nome_completo} ({selectedUser.email})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {selectedUser && (
                <>
                  Créditos atuais: <strong>{selectedUser.creditos_disponiveis}</strong>
                </>
              )}
            </Alert>
            <TextField
              autoFocus
              margin="dense"
              label="Quantidade de Créditos"
              type="number"
              fullWidth
              value={creditAmount}
              onChange={(e) => setCreditAmount(Number(e.target.value))}
              helperText="Use valores negativos para remover créditos"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Motivo"
              type="text"
              fullWidth
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              variant="outlined"
              required
              helperText="Obrigatório - será registrado no histórico"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreditDialog} color="inherit">Cancelar</Button>
          <Button 
            onClick={handleCreditUpdate} 
            variant="contained" 
            color={creditAmount >= 0 ? "primary" : "error"}
            disabled={!creditReason}
          >
            {creditAmount >= 0 ? 'Adicionar Créditos' : 'Remover Créditos'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para edição de usuário */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Editar Usuário
          {selectedUser && (
            <Typography variant="subtitle2" color="text.secondary">
              ID: {selectedUser.id}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Nome Completo"
                fullWidth
                value={editableFields.nome_completo}
                onChange={(e) => setEditableFields({...editableFields, nome_completo: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                value={editableFields.email}
                onChange={(e) => setEditableFields({...editableFields, email: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Plano"
                fullWidth
                value={editableFields.plano}
                onChange={(e) => setEditableFields({...editableFields, plano: e.target.value})}
                variant="outlined"
              >
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="pro">Pro</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status de Verificação"
                fullWidth
                value={editableFields.verificado ? "verificado" : "nao_verificado"}
                onChange={(e) => setEditableFields({...editableFields, verificado: e.target.value === "verificado"})}
                variant="outlined"
              >
                <MenuItem value="verificado">Verificado</MenuItem>
                <MenuItem value="nao_verificado">Não Verificado</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Tipo de Usuário"
                fullWidth
                value={editableFields.role}
                onChange={(e) => setEditableFields({...editableFields, role: e.target.value})}
                variant="outlined"
              >
                <MenuItem value="user">Usuário</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog} color="inherit">Cancelar</Button>
          <Button onClick={handleUpdateUser} variant="contained" color="primary">
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notificationSeverity} 
          sx={{ width: '100%' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagementPage; 