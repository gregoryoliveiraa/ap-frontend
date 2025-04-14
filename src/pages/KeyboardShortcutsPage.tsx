import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import SaveIcon from '@mui/icons-material/Save';
import NavigationIcon from '@mui/icons-material/Navigation';
import FormatBoldIcon from '@mui/icons-material/FormatBold';

// Interface para os atalhos de teclado
interface Shortcut {
  key: string; // A combinação de teclas
  description: string; // Descrição da ação
  platform?: 'mac' | 'windows' | 'all'; // Plataforma específica ou todas
}

// Interface para as categorias de atalhos
interface ShortcutCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  shortcuts: Shortcut[];
}

// Dados dos atalhos por categoria
const shortcutCategories: ShortcutCategory[] = [
  {
    title: 'Navegação',
    description: 'Atalhos para navegar pela aplicação',
    icon: <NavigationIcon fontSize="large" color="primary" />,
    shortcuts: [
      { key: 'G + D', description: 'Ir para o Dashboard', platform: 'all' },
      { key: 'G + C', description: 'Ir para o Chat', platform: 'all' },
      { key: 'G + P', description: 'Ir para a página de Perfil', platform: 'all' },
      { key: 'G + H', description: 'Ir para a Central de Ajuda', platform: 'all' },
      { key: 'G + S', description: 'Abrir barra de pesquisa', platform: 'all' },
      { key: 'Esc', description: 'Fechar diálogos ou painéis abertos', platform: 'all' }
    ]
  },
  {
    title: 'Editor de Documentos',
    description: 'Atalhos para o editor de documentos',
    icon: <EditIcon fontSize="large" color="primary" />,
    shortcuts: [
      { key: '⌘ + B', description: 'Negrito', platform: 'mac' },
      { key: 'Ctrl + B', description: 'Negrito', platform: 'windows' },
      { key: '⌘ + I', description: 'Itálico', platform: 'mac' },
      { key: 'Ctrl + I', description: 'Itálico', platform: 'windows' },
      { key: '⌘ + U', description: 'Sublinhado', platform: 'mac' },
      { key: 'Ctrl + U', description: 'Sublinhado', platform: 'windows' },
      { key: '⌘ + Z', description: 'Desfazer', platform: 'mac' },
      { key: 'Ctrl + Z', description: 'Desfazer', platform: 'windows' },
      { key: '⌘ + Shift + Z', description: 'Refazer', platform: 'mac' },
      { key: 'Ctrl + Y', description: 'Refazer', platform: 'windows' },
      { key: '⌘ + S', description: 'Salvar documento', platform: 'mac' },
      { key: 'Ctrl + S', description: 'Salvar documento', platform: 'windows' },
      { key: '⌘ + Enter', description: 'Inserir quebra de linha', platform: 'mac' },
      { key: 'Ctrl + Enter', description: 'Inserir quebra de linha', platform: 'windows' }
    ]
  },
  {
    title: 'Formatação de Texto',
    description: 'Atalhos para formatação de texto',
    icon: <FormatBoldIcon fontSize="large" color="primary" />,
    shortcuts: [
      { key: '⌘ + Alt + 1', description: 'Título H1', platform: 'mac' },
      { key: 'Ctrl + Alt + 1', description: 'Título H1', platform: 'windows' },
      { key: '⌘ + Alt + 2', description: 'Título H2', platform: 'mac' },
      { key: 'Ctrl + Alt + 2', description: 'Título H2', platform: 'windows' },
      { key: '⌘ + Alt + 3', description: 'Título H3', platform: 'mac' },
      { key: 'Ctrl + Alt + 3', description: 'Título H3', platform: 'windows' },
      { key: '⌘ + Shift + L', description: 'Lista ordenada', platform: 'mac' },
      { key: 'Ctrl + Shift + L', description: 'Lista ordenada', platform: 'windows' },
      { key: '⌘ + Shift + U', description: 'Lista não ordenada', platform: 'mac' },
      { key: 'Ctrl + Shift + U', description: 'Lista não ordenada', platform: 'windows' },
      { key: '⌘ + K', description: 'Inserir link', platform: 'mac' },
      { key: 'Ctrl + K', description: 'Inserir link', platform: 'windows' }
    ]
  },
  {
    title: 'Pesquisa e Navegação em Documentos',
    description: 'Atalhos para pesquisar e navegar em documentos',
    icon: <SearchIcon fontSize="large" color="primary" />,
    shortcuts: [
      { key: '⌘ + F', description: 'Buscar no documento atual', platform: 'mac' },
      { key: 'Ctrl + F', description: 'Buscar no documento atual', platform: 'windows' },
      { key: '⌘ + G', description: 'Buscar próxima ocorrência', platform: 'mac' },
      { key: 'F3', description: 'Buscar próxima ocorrência', platform: 'windows' },
      { key: '⌘ + Shift + G', description: 'Buscar ocorrência anterior', platform: 'mac' },
      { key: 'Shift + F3', description: 'Buscar ocorrência anterior', platform: 'windows' },
      { key: '⌘ + Shift + F', description: 'Substituir texto', platform: 'mac' },
      { key: 'Ctrl + H', description: 'Substituir texto', platform: 'windows' }
    ]
  },
  {
    title: 'Gerenciamento de Documentos',
    description: 'Atalhos para gerenciar documentos',
    icon: <DescriptionIcon fontSize="large" color="primary" />,
    shortcuts: [
      { key: '⌘ + N', description: 'Novo documento', platform: 'mac' },
      { key: 'Ctrl + N', description: 'Novo documento', platform: 'windows' },
      { key: '⌘ + O', description: 'Abrir documento existente', platform: 'mac' },
      { key: 'Ctrl + O', description: 'Abrir documento existente', platform: 'windows' },
      { key: '⌘ + P', description: 'Imprimir documento', platform: 'mac' },
      { key: 'Ctrl + P', description: 'Imprimir documento', platform: 'windows' },
      { key: '⌘ + E', description: 'Exportar documento', platform: 'mac' },
      { key: 'Ctrl + E', description: 'Exportar documento', platform: 'windows' },
      { key: '⌘ + W', description: 'Fechar documento atual', platform: 'mac' },
      { key: 'Ctrl + W', description: 'Fechar documento atual', platform: 'windows' },
      { key: '⌘ + S', description: 'Salvar documento', platform: 'mac' },
      { key: 'Ctrl + S', description: 'Salvar documento', platform: 'windows' },
      { key: '⌘ + Shift + S', description: 'Salvar como', platform: 'mac' },
      { key: 'Ctrl + Shift + S', description: 'Salvar como', platform: 'windows' }
    ]
  }
];

const KeyboardShortcutsPage: React.FC = () => {
  const theme = useTheme();
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Renderizar uma tecla de atalho com estilo
  const renderKeyChip = (keyText: string) => {
    const keys = keyText.split(' + ');
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <Chip 
              label={key} 
              size="small" 
              sx={{ 
                fontFamily: 'monospace', 
                fontWeight: 'bold',
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                px: 1
              }} 
            />
            {index < keys.length - 1 && (
              <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
                +
              </Typography>
            )}
          </React.Fragment>
        ))}
      </Box>
    );
  };

  // Filtrar atalhos com base na plataforma
  const getShortcutsForPlatform = (shortcuts: Shortcut[]) => {
    return shortcuts.filter(shortcut => 
      shortcut.platform === 'all' || 
      (isMac && shortcut.platform === 'mac') || 
      (!isMac && shortcut.platform === 'windows')
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <KeyboardIcon fontSize="large" color="primary" />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Atalhos de Teclado
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Aumente sua produtividade com atalhos de teclado para navegar e interagir com a Advogada Parceira
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Dica de uso
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Os atalhos abaixo são mostrados para {isMac ? 'macOS' : 'Windows/Linux'}. 
          Em alguns casos, é necessário pressionar as teclas sequencialmente (como G + D para ir ao Dashboard), 
          enquanto em outros casos você deve manter a primeira tecla pressionada enquanto aperta a segunda (como Ctrl + B para negrito).
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <SaveIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Você pode salvar esta página nos favoritos ou imprimi-la para referência rápida.
          </Typography>
        </Box>
      </Paper>

      {shortcutCategories.map((category, index) => (
        <Paper key={index} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ mr: 2 }}>{category.icon}</Box>
            <Box>
              <Typography variant="h5" gutterBottom>
                {category.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {category.description}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            {getShortcutsForPlatform(category.shortcuts).map((shortcut, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {shortcut.description}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    {renderKeyChip(shortcut.key)}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Precisa de mais ajuda?
        </Typography>
        <Typography variant="body2" paragraph>
          Se você não encontrou o atalho que procura ou precisa de assistência adicional, visite nossa{' '}
          <Typography component="span" color="primary" sx={{ cursor: 'pointer' }}>
            Central de Ajuda
          </Typography>
          {' '}ou entre em contato com nosso suporte.
        </Typography>
      </Paper>
    </Container>
  );
};

export default KeyboardShortcutsPage; 