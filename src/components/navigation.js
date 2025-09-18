import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            sx={{ mr: 1 }}
          >
            Shortener
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/statistics"
            variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
          >
            Statistics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;