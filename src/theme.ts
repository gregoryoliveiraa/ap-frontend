import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1E4562', // Azul marinho
      light: '#3A6180', // Azul marinho mais claro
      dark: '#0F2A44', // Azul marinho mais escuro
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#E07750', // Laranja
      light: '#F29675', // Laranja mais claro
      dark: '#B85934', // Laranja mais escuro
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1E4562',
      secondary: '#5F6A73',
    },
    error: {
      main: '#D32F2F',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FFC107',
    },
    info: {
      main: '#3A6180', // Azul compatível com a nova identidade visual
    },
  },
  typography: {
    fontFamily: [
      'Montserrat',
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
      color: '#1E4562',
    },
    h2: {
      fontWeight: 700,
      color: '#1E4562',
    },
    h3: {
      fontWeight: 700,
      color: '#1E4562',
    },
    h4: {
      fontWeight: 600,
      color: '#1E4562',
    },
    h5: {
      fontWeight: 600,
      color: '#1E4562',
    },
    h6: {
      fontWeight: 600,
      color: '#1E4562',
    },
    subtitle1: {
      fontWeight: 500,
      color: '#5F6A73',
    },
    subtitle2: {
      fontWeight: 500,
      color: '#5F6A73',
    },
    body1: {
      color: '#1E4562',
    },
    body2: {
      color: '#5F6A73',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          fontFamily: 'Montserrat, sans-serif',
          boxShadow: 'none',
          padding: '8px 16px',
        },
        contained: {
          backgroundColor: '#1E4562',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#0F2A44',
            boxShadow: '0px 4px 8px rgba(30, 69, 98, 0.25)',
          },
        },
        containedSecondary: {
          backgroundColor: '#E07750',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#B85934',
            boxShadow: '0px 4px 8px rgba(224, 119, 80, 0.25)',
          },
        },
        outlined: {
          borderColor: '#1E4562',
          color: '#1E4562',
          borderWidth: 2,
          '&:hover': {
            borderColor: '#0F2A44',
            color: '#0F2A44',
            backgroundColor: 'rgba(30, 69, 98, 0.04)',
            borderWidth: 2,
          },
        },
        outlinedSecondary: {
          borderColor: '#E07750',
          color: '#E07750',
          borderWidth: 2,
          '&:hover': {
            borderColor: '#B85934',
            color: '#B85934',
            backgroundColor: 'rgba(224, 119, 80, 0.04)',
            borderWidth: 2,
          },
        },
        text: {
          color: '#1E4562',
          '&:hover': {
            color: '#0F2A44',
            backgroundColor: 'rgba(30, 69, 98, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 69, 98, 0.03)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E4562',
          color: '#ffffff',
          boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#1E4562',
          textDecoration: 'none',
          fontWeight: 500,
          '&:hover': {
            color: '#0F2A44',
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#1E4562',
          '&:hover': {
            backgroundColor: 'rgba(30, 69, 98, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        filled: {
          backgroundColor: 'rgba(30, 69, 98, 0.08)',
          color: '#1E4562',
          '&:hover': {
            backgroundColor: 'rgba(30, 69, 98, 0.12)',
          },
        },
        outlined: {
          borderColor: '#1E4562',
          color: '#1E4562',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#1E4562',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1E4562',
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#1E4562',
          '&.Mui-checked': {
            color: '#1E4562',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#1E4562',
          '&.Mui-checked': {
            color: '#1E4562',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#1E4562',
            '& + .MuiSwitch-track': {
              backgroundColor: '#1E4562',
            },
          },
        },
      },
    },
  },
}); 