import logger from './logger';

const STORAGE_KEYS = {
  URLS: 'shortened_urls',
  CLICKS: 'url_clicks'
};

export const storage = {
  // Save URLs to localStorage
  saveUrls(urls) {
    try {
      localStorage.setItem(STORAGE_KEYS.URLS, JSON.stringify(urls));
      logger.info('URLs saved to storage', { count: urls.length });
      return true;
    } catch (error) {
      logger.error('Failed to save URLs to storage', { error: error.message });
      return false;
    }
  },

  // Get URLs from localStorage
  getUrls() {
    try {
      const urls = localStorage.getItem(STORAGE_KEYS.URLS);
      return urls ? JSON.parse(urls) : [];
    } catch (error) {
      logger.error('Failed to retrieve URLs from storage', { error: error.message });
      return [];
    }
  },

  // Save click data to localStorage
  saveClicks(clicks) {
    try {
      localStorage.setItem(STORAGE_KEYS.CLICKS, JSON.stringify(clicks));
      return true;
    } catch (error) {
      logger.error('Failed to save clicks to storage', { error: error.message });
      return false;
    }
  },

  // Get click data from localStorage
  getClicks() {
    try {
      const clicks = localStorage.getItem(STORAGE_KEYS.CLICKS);
      return clicks ? JSON.parse(clicks) : {};
    } catch (error) {
      logger.error('Failed to retrieve clicks from storage', { error: error.message });
      return {};
    }
  },

  // Record a click for a shortcode
  recordClick(shortcode, source = 'direct', location = 'Unknown') {
    try {
      const clicks = this.getClicks();
      const clickId = Date.now().toString();
      
      if (!clicks[shortcode]) {
        clicks[shortcode] = [];
      }
      
      clicks[shortcode].push({
        id: clickId,
        timestamp: new Date().toISOString(),
        source,
        location
      });
      
      this.saveClicks(clicks);
      logger.info('Click recorded', { shortcode, source, location });
      
      return clickId;
    } catch (error) {
      logger.error('Failed to record click', { 
        shortcode, 
        error: error.message 
      });
      return null;
    }
  }
};