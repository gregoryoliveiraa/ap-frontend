import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Verificar se o login com Google está desabilitado
const isGoogleLoginDisabled = import.meta.env.VITE_DISABLE_GOOGLE_LOGIN === 'true';

const AppWithProviders = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {isGoogleLoginDisabled ? (
      <App />
    ) : (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        <App />
      </GoogleOAuthProvider>
    )}
  </ThemeProvider>
);

root.render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 