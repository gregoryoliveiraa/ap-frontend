import { createTheme } from '@mui/material/styles';

// Define primary and secondary colors
const primary = {
  main: '#5D5FEF', // Azul violeta moderno
  light: '#8B8EFF',
  dark: '#3A3CB9',
  contrastText: '#ffffff',
};

const secondary = {
  main: '#2E3B55', // Azul escuro
  light: '#5E6C88',
  dark: '#001027',
  contrastText: '#ffffff',
};

// Create a theme instance
const theme = createTheme({
  palette: {
    primary,
    secondary,
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
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#5D5FEF',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#5D5FEF',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      color: '#5D5FEF',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2E3B55',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2E3B55',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#2E3B55',
    },
  },
  shape: {
    borderRadius: 8,
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
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
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

export default theme;