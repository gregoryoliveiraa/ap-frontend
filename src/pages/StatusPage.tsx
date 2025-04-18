import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

// Dados simulados dos serviços
const services = [
  {
    id: 'api',
    name: 'API Principal',
    description: 'API REST que serve toda a aplicação',
    status: 'operational'
  },
  {
    id: 'database',
    name: 'Banco de Dados',
    description: 'PostgreSQL para armazenamento de dados',
    status: 'operational'
  },
  {
    id: 'auth',
    name: 'Serviço de Autenticação',
    description: 'Gerenciamento de usuários e autenticação',
    status: 'operational'
  },
  {
    id: 'ai',
    name: 'Serviços de IA',
    description: 'Inteligência artificial para geração de documentos',
    status: 'operational'
  },
  {
    id: 'storage',
    name: 'Armazenamento',
    description: 'Sistema de armazenamento de documentos',
    status: 'operational'
  },
  {
    id: 'payment',
    name: 'Processamento de Pagamentos',
    description: 'Integração com gateways de pagamento',
    status: 'operational'
  }
];

// Simulação de incidentes
const incidents = [
  {
    id: 'inc-001',
    title: 'Manutenção Programada',
    description: 'Manutenção programada para atualização do sistema de banco de dados.',
    status: 'scheduled',
    affectedServices: ['database'],
    scheduled: new Date('2023-12-10T02:00:00'),
    duration: '3 horas',
    updates: [
      {
        timestamp: new Date('2023-12-01T14:00:00'),
        message: 'Manutenção programada para atualização do sistema de banco de dados.'
      }
    ]
  }
];

const StatusPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'operational' | 'partial' | 'major'>('operational');
  const [servicesData, setServicesData] = useState(services);
  const [incidentsData, setIncidentsData] = useState(incidents);

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Verificar status geral com base nos serviços
      const hasIssues = servicesData.some(service => service.status !== 'operational');
      const hasMajorIssues = servicesData.some(service => service.status === 'major_outage');
      
      if (hasMajorIssues) {
        setSystemStatus('major');
      } else if (hasIssues) {
        setSystemStatus('partial');
      } else {
        setSystemStatus('operational');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [servicesData]);

  // Renderizar chip de status
  const renderStatusChip = (status: string) => {
    switch (status) {
      case 'operational':
        return <Chip 
          icon={<CheckCircleIcon />} 
          label="Operacional" 
          color="success" 
          variant="outlined"
        />;
      case 'degraded_performance':
        return <Chip 
          icon={<HourglassEmptyIcon />} 
          label="Performance Degradada" 
          color="warning" 
          variant="outlined"
        />;
      case 'partial_outage':
        return <Chip 
          icon={<ErrorIcon />} 
          label="Interrupção Parcial" 
          color="warning" 
          variant="outlined"
        />;
      case 'major_outage':
        return <Chip 
          icon={<ErrorIcon />} 
          label="Interrupção Total" 
          color="error" 
          variant="outlined"
        />;
      default:
        return <Chip 
          label="Desconhecido" 
          variant="outlined"
        />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Status dos Serviços
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitoramento em tempo real de todos os serviços da Advogada Parceira
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Status Geral */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Status Geral do Sistema
              </Typography>
              
              {systemStatus === 'operational' && (
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ justifyContent: 'center' }}>
                  Todos os sistemas estão operacionais
                </Alert>
              )}
              
              {systemStatus === 'partial' && (
                <Alert severity="warning" sx={{ justifyContent: 'center' }}>
                  Alguns sistemas estão enfrentando problemas
                </Alert>
              )}
              
              {systemStatus === 'major' && (
                <Alert severity="error" sx={{ justifyContent: 'center' }}>
                  Interrupção significativa dos serviços
                </Alert>
              )}
            </Box>
          </Paper>

          {/* Serviços */}
          <Typography variant="h5" gutterBottom sx={{ mt: 6, mb: 2 }}>
            Serviços
          </Typography>
          <Grid container spacing={3}>
            {servicesData.map((service) => (
              <Grid item xs={12} md={6} key={service.id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{service.name}</Typography>
                      {renderStatusChip(service.status)}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Incidentes */}
          <Typography variant="h5" gutterBottom sx={{ mt: 6, mb: 2 }}>
            Incidentes e Manutenções Programadas
          </Typography>
          
          {incidentsData.length === 0 ? (
            <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Não há incidentes ativos ou manutenções programadas no momento.
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              {incidentsData.map((incident, index) => (
                <React.Fragment key={incident.id}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">{incident.title}</Typography>
                      <Chip 
                        label={incident.status === 'scheduled' ? 'Agendado' : 'Em Andamento'} 
                        color={incident.status === 'scheduled' ? 'info' : 'warning'} 
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      {incident.description}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Serviços afetados:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {incident.affectedServices.map(serviceId => {
                          const service = services.find(s => s.id === serviceId);
                          return service ? (
                            <Chip 
                              key={serviceId}
                              label={service.name} 
                              size="small" 
                              variant="outlined" 
                            />
                          ) : null;
                        })}
                      </Box>
                    </Box>
                    
                    {incident.status === 'scheduled' && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Agendado para:</strong> {incident.scheduled instanceof Date ? incident.scheduled.toLocaleString() : new Date(incident.scheduled).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Duração estimada:</strong> {incident.duration}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Atualizações:
                      </Typography>
                      {incident.updates.map((update, updateIndex) => (
                        <Box key={updateIndex} sx={{ ml: 2, mt: 1 }}>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {update.timestamp instanceof Date ? update.timestamp.toLocaleString() : new Date(update.timestamp).toLocaleString()}
                          </Typography>
                          <Typography variant="body2">
                            {update.message}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  
                  {index < incidentsData.length - 1 && <Divider sx={{ my: 3 }} />}
                </React.Fragment>
              ))}
            </Paper>
          )}
        </>
      )}
      
      {/* Informações Adicionais */}
      <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Esta página é atualizada automaticamente a cada 60 segundos. Última atualização: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Container>
  );
};

export default StatusPage; 