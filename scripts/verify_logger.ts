
import logger from '../src/orchestra/logger';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'logs', 'combined.log');
const TEST_MSG = `Verification Log ${Date.now()}`;

logger.info(TEST_MSG);

// Allow write buffer to flush
setTimeout(() => {
  if (fs.existsSync(LOG_FILE)) {
    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    if (content.includes(TEST_MSG)) {
      console.log('LOGGER_VERIFIED');
      process.exit(0);
    } else {
      console.error('Log message not found in file.');
      process.exit(1);
    }
  } else {
    console.error('Log file not created.');
    process.exit(1);
  }
}, 1000);
