import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import urlService from '../services/urlService';
import logger from '../utils/logger';

const UrlShortener = () => {
  const [urls, setUrls] = useState([{ originalUrl: '', validity: '', shortcode: '' }]);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState({});

  const handleAddUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, { originalUrl: '', validity: '', shortcode: '' }]);
      logger.info('Added new URL input field');
    }
  };

  const handleRemoveUrl = (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
      logger.info('Removed URL input field', { index });
    }
  };

  const handleInputChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
    
    // Clear error for this field
    if (errors[$]{index}-${field}]) {
      const newErrors = { ...errors };
      delete newErrors[${index}-${field}];
      setErrors(newErrors);
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    let isValid = true;

    urls.forEach((url, index) => {
      if (!url.originalUrl) {
        newErrors[${index}-originalUrl] = 'URL is required';
        isValid = false;
      } else if (!urlService.isValidUrl(url.originalUrl)) {
        newErrors[${index}-originalUrl] = 'Invalid URL format';
        isValid = false;
      }

      if (url.validity && (isNaN(url.validity) || url.validity <= 0)) {
        newErrors[${index}-validity] = 'Validity must be a positive number';
        isValid = false;
      }

      if (url.shortcode && !/^[a-zA-Z0-9_-]{4,}$/.test(url.shortcode)) {
        newErrors[${index}-shortcode] = 'Shortcode must be at least 4 characters and contain only letters, numbers, hyphens, and underscores';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    logger.info('Attempting to shorten URLs');

    if (!validateInputs()) {
      logger.warn('URL shortening failed validation');
      return;
    }

    const newResults = [];
    const allSuccessful = urls.every((url, index) => {
      const result = urlService.createShortUrl(
        url.originalUrl,
        url.validity ? parseInt(url.validity) : 30,
        url.shortcode || null
      );

      if (result.success) {
        newResults.push(result.data);
        logger.info('URL shortened successfully', { shortcode: result.data.shortcode });
      } else {
        setErrors(prev => ({
          ...prev,
          [${index}-submit]: result.error
        }));
        logger.error('URL shortening failed', { error: result.error });
        return false;
      }
      
      return true;
    });

    if (allSuccessful) {
      setResults(newResults);
      setUrls([{ originalUrl: '', validity: '', shortcode: '' }]);
      logger.info('All URLs shortened successfully', { count: newResults.length });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          URL Shortener
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }} align="center">
          Shorten up to 5 URLs at once. Leave validity empty for default 30 minutes.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {urls.map((url, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Original URL"
                    value={url.originalUrl}
                    onChange={(e) => handleInputChange(index, 'originalUrl', e.target.value)}
                    error={!!errors[${index}-originalUrl]}
                    helperText={errors[${index}-originalUrl]}
                    placeholder="https://example.com"
                    required
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    type="number"
                    value={url.validity}
                    onChange={(e) => handleInputChange(index, 'validity', e.target.value)}
                    error={!!errors[$]{index}-validity]}
                    helperText={errors[${index}-validity] || "Optional - defaults to 30 minutes"}
                  />
                </Grid>
                
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode"
                    value={url.shortcode}
                    onChange={(e) => handleInputChange(index, 'shortcode', e.target.value)}
                    error={!!errors[${index}-shortcode]}
                    helperText={errors[${index}-shortcode] || "Optional - auto-generated if empty"}
                  />
                </Grid>
                
                <Grid item xs={1}>
                  {urls.length > 1 && (
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveUrl(index)}
                      aria-label="Remove URL"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
              
              {errors[${index}-submit] && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors[${index}-submit]}
                </Alert>
              )}
            </Box>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleAddUrl}
              disabled={urls.length >= 5}
              startIcon={<AddIcon />}
            >
              Add Another URL
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              size="large"
            >
              Shorten URLs
            </Button>
          </Box>
        </Box>

        {results.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Shortened URLs
            </Typography>
            
            {results.map((result) => (
              <Card key={result.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    http://localhost:3000/{result.shortcode}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Original: {result.originalUrl}
                  </Typography>
                  
                  <Typography variant="body2">
                    Expires: {new Date(result.expiresAt).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default UrlShortener;