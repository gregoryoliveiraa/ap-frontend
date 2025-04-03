import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#5D5FEF', // Azul violeta moderno
      light: '#8B8EFF',
      dark: '#3A3CB9',
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
      secondary: '#5D5FEF',
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
      color: '#5D5FEF',
    },
    h2: {
      fontWeight: 700,
      color: '#5D5FEF',
    },
    h3: {
      fontWeight: 700,
      color: '#5D5FEF',
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
          backgroundColor: '#5D5FEF',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#3A3CB9',
          },
        },
        outlined: {
          borderColor: '#5D5FEF',
          color: '#5D5FEF',
          '&:hover': {
            borderColor: '#3A3CB9',
            color: '#3A3CB9',
            backgroundColor: 'rgba(93, 95, 239, 0.04)',
          },
        },
        text: {
          color: '#5D5FEF',
          '&:hover': {
            color: '#3A3CB9',
            backgroundColor: 'rgba(93, 95, 239, 0.04)',
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
          color: '#5D5FEF',
          '&:hover': {
            color: '#3A3CB9',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#5D5FEF',
          '&:hover': {
            backgroundColor: 'rgba(93, 95, 239, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(93, 95, 239, 0.08)',
          color: '#5D5FEF',
        },
      },
    },
  },
}); 