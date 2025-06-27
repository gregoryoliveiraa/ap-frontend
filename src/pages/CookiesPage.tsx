import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import CookieIcon from '@mui/icons-material/Cookie';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import InfoIcon from '@mui/icons-material/Info';
import UpdateIcon from '@mui/icons-material/Update';
import LockIcon from '@mui/icons-material/Lock';

const CookiesPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          Política de Cookies da Advogada Parceira
        </Typography>
        
        <Alert severity="info" sx={{ my: 3 }}>
          <Typography variant="body2">
            <strong>Atualização Importante:</strong> O Chrome está implementando uma nova experiência que permite aos usuários escolher navegar sem cookies de terceiros. Esta mudança faz parte da iniciativa Privacy Sandbox, que visa proteger a privacidade dos usuários enquanto mantém a web funcional. Estamos adaptando nossa plataforma para garantir a melhor experiência possível respeitando suas escolhas de privacidade, priorizando cookies essenciais que não comprometem sua navegação.
          </Typography>
        </Alert>
        
        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          A política de cookies da Advogada Parceira (a "Política de Cookies") descreve como utilizamos cookies e tecnologias similares em nosso site para melhorar sua experiência de navegação. Ao continuar a usar nosso site, você concorda com o uso de cookies conforme descrito nesta política.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" component="h2" gutterBottom color="secondary" fontWeight="bold">
          O que são cookies?
        </Typography>
        
        <Typography variant="body1" paragraph>
          Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo (computador, tablet ou celular) quando você visita um site. Eles permitem que o site se lembre de suas ações e preferências durante um determinado período, para que você não precise reinserir certas informações cada vez que visita o site ou navega de uma página para outra.
        </Typography>
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom color="secondary" fontWeight="bold">
            Tipos de cookies que utilizamos
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <StorageIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h3" fontWeight="bold">Cookies essenciais</Typography>
                </Box>
                <Typography variant="body2">
                  Necessários para o funcionamento básico do site. Permitem que você navegue pelo site e use recursos essenciais, como áreas seguras e formulários. Esses cookies não coletam informações pessoais ou sobre suas preferências.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <SettingsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h3" fontWeight="bold">Cookies de preferências</Typography>
                </Box>
                <Typography variant="body2">
                  Permitem que o site se lembre de escolhas que você fez no passado, como idioma preferido, região, tamanho do texto e outras configurações personalizáveis. Estes cookies melhoram sua experiência de usuário.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <InfoIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h3" fontWeight="bold">Cookies analíticos</Typography>
                </Box>
                <Typography variant="body2">
                  Utilizados para coletar informações sobre como os visitantes usam nosso site. Usamos essas informações para melhorar o site e entender como os usuários interagem com ele. Todos os dados coletados são anônimos e agregados.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <SecurityIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h3" fontWeight="bold">Cookies de segurança</Typography>
                </Box>
                <Typography variant="body2">
                  Utilizados para funções específicas de segurança, como autenticação e proteção dos seus dados. Estes cookies ajudam a prevenir acesso não autorizado a contas e informações de login.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h5" component="h2" gutterBottom color="secondary" fontWeight="bold">
          Como gerenciar cookies
        </Typography>
        
        <Typography variant="body1" paragraph>
          Você pode controlar e/ou excluir cookies conforme desejar. Você pode excluir todos os cookies que já estão no seu computador e configurar a maioria dos navegadores para impedir que sejam instalados. No entanto, se fizer isso, talvez seja necessário ajustar manualmente algumas preferências cada vez que visitar um site e alguns serviços e funcionalidades podem não funcionar.
        </Typography>
        
        <Box sx={{ mb: 4, bgcolor: '#f5f5f5', p: 3, borderRadius: 2 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <UpdateIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h3" fontWeight="bold">Mudanças nos navegadores</Typography>
          </Box>
          <Typography variant="body2" paragraph>
            Os principais navegadores estão implementando mudanças significativas na forma como gerenciam cookies de terceiros:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <LockIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Controles de privacidade aprimorados" 
                secondary="O Chrome está liderando uma mudança importante, permitindo aos usuários navegar sem cookies de terceiros através da iniciativa Privacy Sandbox. Outros navegadores como Firefox e Safari já implementaram restrições semelhantes."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Como isso afeta nossa plataforma" 
                secondary="Priorizamos cookies essenciais e de primeira parte para manter a funcionalidade básica mesmo quando cookies de terceiros são bloqueados. Nossa plataforma foi adaptada para respeitar sua privacidade sem comprometer a experiência."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="O que você precisa fazer" 
                secondary="Não é necessária nenhuma ação de sua parte. Nosso site funcionará normalmente mesmo se você optar por navegar sem cookies de terceiros, mantendo todas as funcionalidades essenciais."
              />
            </ListItem>
          </List>
        </Box>
        
        <Typography variant="h6" component="h3" gutterBottom fontWeight="bold" sx={{ mt: 4 }}>
          Configurações do Navegador
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <CookieIcon color="secondary" />
            </ListItemIcon>
            <ListItemText 
              primary="Configurações do navegador" 
              secondary="A maioria dos navegadores permite que você veja quais cookies foram armazenados e os exclua individualmente ou bloqueie cookies de sites específicos ou de todos os sites."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SecurityIcon color="secondary" />
            </ListItemIcon>
            <ListItemText 
              primary="Cookies de terceiros" 
              secondary="Para recusar o uso de cookies de terceiros, você pode geralmente ativá-los alterando as configurações do seu navegador. Consulte as instruções específicas do seu navegador para obter mais informações."
            />
          </ListItem>
        </List>
        
        <Box sx={{ mt: 4, bgcolor: 'primary.light', p: 3, borderRadius: 2 }}>
          <Typography variant="h6" component="h3" color="white" gutterBottom fontWeight="bold">
            Alterações na política de cookies
          </Typography>
          <Typography variant="body2" color="white">
            Podemos atualizar esta Política de Cookies periodicamente. Quando fizermos alterações, atualizaremos a data de "última atualização" no topo desta política. Recomendamos que você revise esta política regularmente para se manter informado sobre como estamos usando cookies.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default CookiesPage; 