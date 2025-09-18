import { storage } from '../utils/storage';
import logger from '../utils/logger';

class UrlService {
  constructor() {
    this.urls = storage.getUrls();
  }

  // Generate a unique shortcode
  generateShortcode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  // Check if a shortcode is available
  isShortcodeAvailable(shortcode) {
    return !this.urls.some(url => url.shortcode === shortcode);
  }

  // Validate URL format
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Create a shortened URL
  createShortUrl(originalUrl, validityMinutes = 30, customShortcode = null) {
    logger.info('Creating short URL', { originalUrl, validityMinutes, customShortcode });

    // Validate inputs
    if (!this.isValidUrl(originalUrl)) {
      const error = 'Invalid URL format';
      logger.error(error, { originalUrl });
      return { success: false, error };
    }

    if (validityMinutes && (isNaN(validityMinutes) || validityMinutes <= 0)) {
      const error = 'Validity must be a positive number';
      logger.error(error, { validityMinutes });
      return { success: false, error };
    }

    let shortcode = customShortcode;

    // Generate shortcode if not provided
    if (!shortcode) {
      shortcode = this.generateShortcode();
    } else {
      // Validate custom shortcode
      if (!/^[a-zA-Z0-9_-]{4,}$/.test(shortcode)) {
        const error = 'Shortcode must be at least 4 characters and contain only letters, numbers, hyphens, and underscores';
        logger.error(error, { shortcode });
        return { success: false, error };
      }

      // Check if shortcode is available
      if (!this.isShortcodeAvailable(shortcode)) {
        const error = 'Shortcode is already in use';
        logger.error(error, { shortcode });
        return { success: false, error };
      }
    }

    // Ensure shortcode is unique
    while (!this.isShortcodeAvailable(shortcode)) {
      shortcode = this.generateShortcode();
    }

    // Calculate expiry time
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + validityMinutes * 60000);

    // Create URL object
    const urlData = {
      id: Date.now().toString(),
      originalUrl,
      shortcode,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      clicks: 0
    };

    // Save to storage
    this.urls.push(urlData);
    storage.saveUrls(this.urls);

    logger.info('Short URL created successfully', { shortcode });
    
    return { 
      success: true, 
      data: urlData 
    };
  }

  // Get URL by shortcode
  getUrl(shortcode) {
    const url = this.urls.find(u => u.shortcode === shortcode);
    
    if (url) {
      logger.info('URL retrieved by shortcode', { shortcode });
    } else {
      logger.warn('URL not found for shortcode', { shortcode });
    }
    
    return url;
  }

  // Get all URLs
  getAllUrls() {
    logger.info('Retrieved all URLs', { count: this.urls.length });
    return this.urls;
  }

  // Check if a URL is expired
  isExpired(url) {
    return new Date() > new Date(url.expiresAt);
  }
}

// Create a singleton instance
const urlService = new UrlService();
export default urlService;