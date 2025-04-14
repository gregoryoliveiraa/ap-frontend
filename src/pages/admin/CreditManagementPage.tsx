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
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import TokenIcon from '@mui/icons-material/Token';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AdminNavigation from './components/AdminNavigation';
import { getAllUsers, updateUserCredits } from '../../services/adminService';
import { UserListItem, CreditUpdateData } from '../../services/adminService';
import { formatDateTime } from '../../utils/dateUtils';

// Interface para histórico de transações de créditos
interface CreditTransaction {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  reason: string;
  created_at: string;
  admin_id?: string;
  admin_name?: string;
}

const CreditManagementPage: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [creditReason, setCreditReason] = useState<string>('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'info' | 'warning'
  });

  // Carregar dados
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Carregar usuários
      const userData = await getAllUsers();
      setUsers(userData);
      
      // Simular dados de transações para demonstração
      // Na implementação real, isso seria substituído por uma chamada de API
      const mockTransactions: CreditTransaction[] = [];
      
      for (let i = 0; i < 50; i++) {
        const randomUser = userData[Math.floor(Math.random() * userData.length)];
        const randomAmount = Math.floor(Math.random() * 1000) - 500;
        const reasons = [
          'Compra de créditos',
          'Reembolso',
          'Bônus mensal',
          'Ajuste administrativo',
          'Promoção',
          'Correção de saldo'
        ];
        
        mockTransactions.push({
          id: `trans-${i}`,
          user_id: randomUser.id,
          user_name: randomUser.nome_completo,
          amount: randomAmount,
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          created_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
          admin_id: i % 3 === 0 ? 'admin-1' : undefined,
          admin_name: i % 3 === 0 ? 'Administrador' : undefined
        });
      }
      
      // Ordenar por data - mais recente primeiro
      mockTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
    } catch (err) {
      setError('Erro ao carregar dados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrar transações com base no termo de pesquisa
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTransactions(transactions);
    } else {
      const lowercaseTerm = searchTerm.toLowerCase();
      const filtered = transactions.filter(transaction => 
        transaction.user_name.toLowerCase().includes(lowercaseTerm) || 
        transaction.reason.toLowerCase().includes(lowercaseTerm)
      );
      setFilteredTransactions(filtered);
    }
    setPage(0);
  }, [searchTerm, transactions]);

  // Manipuladores de paginação
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Abrir diálogo para adicionar créditos
  const handleOpenDialog = () => {
    setSelectedUser(null);
    setCreditAmount(0);
    setCreditReason('');
    setOpenDialog(true);
  };

  // Fechar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Atualizar créditos
  const handleUpdateCredits = async () => {
    if (!selectedUser || !creditReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Por favor, selecione um usuário e informe o motivo da operação.',
        severity: 'error'
      });
      return;
    }

    try {
      const data: CreditUpdateData = {
        userId: selectedUser.id,
        amount: creditAmount,
        reason: creditReason
      };

      await updateUserCredits(data);
      
      // Recarregar dados
      await loadData();
      
      handleCloseDialog();
      
      setSnackbar({
        open: true,
        message: `Créditos ${creditAmount >= 0 ? 'adicionados' : 'removidos'} com sucesso.`,
        severity: 'success'
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar créditos.',
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
          Gerenciamento de Créditos
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gerencie créditos dos usuários da plataforma e visualize o histórico de transações.
        </Typography>
        <AdminNavigation />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" component="h2">
                Adicionar ou Remover Créditos
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                Transação de Créditos
              </Button>
            </Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Use esta seção para adicionar ou remover créditos dos usuários. Todas as transações são registradas e aparecem no histórico abaixo.
            </Alert>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '250px' }}>
                <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                <TextField
                  label="Buscar transações"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>
              <Button 
                startIcon={<RefreshIcon />} 
                onClick={loadData} 
                disabled={loading}
              >
                Atualizar
              </Button>
            </Box>

            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Histórico de Transações
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredTransactions.length > 0 ? (
              <>
                <TableContainer>
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Usuário</TableCell>
                        <TableCell>Créditos</TableCell>
                        <TableCell>Motivo</TableCell>
                        <TableCell>Administrador</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTransactions
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {formatDateTime(transaction.created_at)}
                            </TableCell>
                            <TableCell>
                              {transaction.user_name}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: transaction.amount >= 0 ? theme.palette.success.main : theme.palette.error.main,
                                fontWeight: 'bold'
                              }}>
                                <TokenIcon 
                                  fontSize="small" 
                                  sx={{ 
                                    mr: 0.5,
                                    color: transaction.amount >= 0 ? theme.palette.success.main : theme.palette.error.main 
                                  }} 
                                />
                                {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {transaction.reason}
                            </TableCell>
                            <TableCell>
                              {transaction.admin_name || 'Sistema'}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredTransactions.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Linhas por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
              </>
            ) : (
              <Alert severity="info">Nenhuma transação encontrada com os critérios de busca.</Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo para adicionar/remover créditos */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Transação de Créditos
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={users}
                getOptionLabel={(option) => `${option.nome_completo} (${option.email})`}
                value={selectedUser}
                onChange={(_event, newValue) => {
                  setSelectedUser(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Selecionar Usuário"
                    variant="outlined"
                    required
                    error={!selectedUser && openDialog}
                    helperText={!selectedUser && openDialog ? 'Por favor, selecione um usuário' : ''}
                  />
                )}
              />
            </Grid>
            
            {selectedUser && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Créditos atuais: <strong>{selectedUser.creditos_disponiveis}</strong>
                </Alert>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Quantidade de Créditos"
                type="number"
                fullWidth
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                variant="outlined"
                InputProps={{
                  startAdornment: <TokenIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />,
                }}
                helperText="Use valores negativos para remover créditos"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Motivo"
                fullWidth
                multiline
                rows={2}
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                variant="outlined"
                required
                error={!creditReason.trim() && openDialog}
                helperText={!creditReason.trim() && openDialog ? 'Por favor, informe o motivo da operação' : 'Este motivo será registrado no histórico de transações'}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="transaction-type-label">Tipo de Transação</InputLabel>
                <Select
                  labelId="transaction-type-label"
                  value={creditAmount >= 0 ? 'add' : 'remove'}
                  onChange={(e) => {
                    if (e.target.value === 'add') {
                      setCreditAmount(Math.abs(creditAmount));
                    } else {
                      setCreditAmount(-Math.abs(creditAmount));
                    }
                  }}
                  label="Tipo de Transação"
                >
                  <MenuItem value="add">Adicionar Créditos</MenuItem>
                  <MenuItem value="remove">Remover Créditos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Cancelar</Button>
          <Button 
            onClick={handleUpdateCredits} 
            variant="contained" 
            color={creditAmount >= 0 ? "primary" : "error"}
            startIcon={creditAmount >= 0 ? <AddIcon /> : <ReceiptIcon />}
            disabled={!selectedUser || !creditReason.trim()}
          >
            {creditAmount >= 0 ? 'Adicionar Créditos' : 'Remover Créditos'}
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

export default CreditManagementPage; 