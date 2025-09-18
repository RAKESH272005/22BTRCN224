import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import urlService from '../services/urlService';
import { storage } from '../utils/storage';
import logger from '../utils/logger';

const RedirectHandler = () => {
  const { shortcode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleRedirect = async () => {
      logger.info('Handling redirect request', { shortcode });
      
      if (!shortcode) {
        setError('Invalid short URL');
        setLoading(false);
        return;
      }

      const urlData = urlService.getUrl(shortcode);
      
      if (!urlData) {
        setError('Short URL not found');
        setLoading(false);
        logger.warn('Short URL not found', { shortcode });
        return;
      }

      if (urlService.isExpired(urlData)) {
        setError('This short URL has expired');
        setLoading(false);
        logger.warn('Attempt to access expired URL', { shortcode });
        return;
      }

      // Record the click
      storage.recordClick(shortcode, 'direct', 'Unknown');
      
      logger.info('Redirecting to original URL', { 
        shortcode, 
        originalUrl: urlData.originalUrl 
      });
      
      // Redirect to the original URL
      window.location.href = urlData.originalUrl;
    };

    handleRedirect();
  }, [shortcode, navigate]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Redirecting...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return null;
};

export default RedirectHandler;