import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: 'rgba(124, 58, 237, 1)', // Roxo principal
      light: 'rgba(139, 92, 246, 1)', // Roxo mais claro
      dark: 'rgba(109, 40, 217, 1)', // Roxo mais escuro
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2E3B55', // Azul escuro
      light: '#5E6C88',
      dark: '#001027',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#2E3B55',
      secondary: 'rgba(124, 58, 237, 1)',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      color: 'rgba(124, 58, 237, 1)',
    },
    h2: {
      fontWeight: 700,
      color: 'rgba(124, 58, 237, 1)',
    },
    h3: {
      fontWeight: 700,
      color: 'rgba(124, 58, 237, 1)',
    },
    h4: {
      fontWeight: 600,
      color: '#2E3B55',
    },
    h5: {
      fontWeight: 600,
      color: '#2E3B55',
    },
    h6: {
      fontWeight: 600,
      color: '#2E3B55',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
        contained: {
          backgroundColor: 'rgba(124, 58, 237, 1)',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: 'rgba(109, 40, 217, 1)',
          },
        },
        outlined: {
          borderColor: 'rgba(124, 58, 237, 1)',
          color: 'rgba(124, 58, 237, 1)',
          '&:hover': {
            borderColor: 'rgba(109, 40, 217, 1)',
            color: 'rgba(109, 40, 217, 1)',
            backgroundColor: 'rgba(124, 58, 237, 0.04)',
          },
        },
        text: {
          color: 'rgba(124, 58, 237, 1)',
          '&:hover': {
            color: 'rgba(109, 40, 217, 1)',
            backgroundColor: 'rgba(124, 58, 237, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#2E3B55',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: 'rgba(124, 58, 237, 1)',
          '&:hover': {
            color: 'rgba(109, 40, 217, 1)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: 'rgba(124, 58, 237, 1)',
          '&:hover': {
            backgroundColor: 'rgba(124, 58, 237, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(124, 58, 237, 0.08)',
          color: 'rgba(124, 58, 237, 1)',
        },
      },
    },
  },
}); 