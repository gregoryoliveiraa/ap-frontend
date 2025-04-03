import React from 'react';
import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
  const location = useLocation();
  
  // Don't show footer on document editor page
  const hideFooter = location.pathname.includes('/documents/') && 
    (location.pathname.includes('/new') || /\/documents\/[^/]+$/.test(location.pathname));
    
  // Set min height based on whether it's a full page or a page with footer
  const minHeight = hideFooter ? 'calc(100vh - 64px)' : 'auto';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          minHeight,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Box>
      {!hideFooter && <Footer />}
    </Box>
  );
};

export default Layout; 