class Logger {
  constructor() {
    this.logs = [];
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };
    
    this.logs.push(logEntry);
    
    // In a real application, this would send to a logging service
    // For this evaluation, we'll store in localStorage
    this.persistLogs();
    
    return logEntry;
  }

  info(message, data = {}) {
    return this.log('INFO', message, data);
  }

  warn(message, data = {}) {
    return this.log('WARN', message, data);
  }

  error(message, data = {}) {
    return this.log('ERROR', message, data);
  }

  persistLogs() {
    try {
      const recentLogs = this.logs.slice(-100); // Keep only last 100 logs
      localStorage.setItem('app_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to persist logs:', error);
    }
  }

  getLogs() {
    try {
      const storedLogs = localStorage.getItem('app_logs');
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (error) {
      console.error('Failed to retrieve logs:', error);
      return [];
    }
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('app_logs');
  }
}

// Create a singleton instance
const logger = new Logger();
export default logger;