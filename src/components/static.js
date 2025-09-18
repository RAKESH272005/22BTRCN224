import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import urlService from '../services/urlService';
import { storage } from '../utils/storage';
import logger from '../utils/logger';

const Statistics = () => {
  const [urls, setUrls] = useState([]);
  const [clicks, setClicks] = useState({});

  useEffect(() => {
    const loadData = () => {
      const urlData = urlService.getAllUrls();
      const clickData = storage.getClicks();

      setUrls(urlData);
      setClicks(clickData);

      logger.info('Loaded statistics data', {
        urlCount: urlData.length,
        clickDataCount: Object.keys(clickData).length
      });
    };

    loadData();
  }, []);

  const handleRedirect = (shortcode) => {
    logger.info('Redirecting to URL from statistics', { shortcode });
    window.location.href = `http://localhost:3000/${shortcode}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      logger.info('Copied URL to clipboard', { text });
    }).catch(err => {
      logger.error(`Failed to copy to clipboard: ${err.message}`);
    });
  };

  const isUrlExpired = (url) => {
    return urlService.isExpired(url);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          URL Statistics
        </Typography>

        {urls.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ mt: 4 }}>
            No shortened URLs yet. Create some on the Shortener page!
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Short URL</TableCell>
                  <TableCell>Original URL</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Clicks</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {urls.map((url) => (
                  <TableRow key={url.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2">
                          {`http://localhost:3000/${url.shortcode}`}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(`http://localhost:3000/${url.shortcode}`)}
                          sx={{ ml: 1 }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {url.originalUrl}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {url.createdAt ? new Date(url.createdAt).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {url.expiresAt ? new Date(url.expiresAt).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {clicks[url.shortcode] ? clicks[url.shortcode].length : 0}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isUrlExpired(url) ? 'Expired' : 'Active'}
                        color={isUrlExpired(url) ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleRedirect(url.shortcode)}
                        disabled={isUrlExpired(url)}
                        title={isUrlExpired(url) ? 'URL has expired' : 'Visit URL'}
                      >
                        <OpenInNewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {Object.keys(clicks).length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Click Analytics
            </Typography>

            {Object.entries(clicks).map(([shortcode, clickData], index) => (
              <Accordion key={`${shortcode}-${index}`}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    {shortcode} - {clickData.length} clicks
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Source</TableCell>
                          <TableCell>Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clickData.map((click) => (
                          <TableRow key={click.id}>
                            <TableCell>
                              {click.timestamp ? new Date(click.timestamp).toLocaleString() : 'N/A'}
                            </TableCell>
                            <TableCell>{click.source || 'Unknown'}</TableCell>
                            <TableCell>{click.location || 'Unknown'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Statistics;
