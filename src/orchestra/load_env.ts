// src/orchestra/load_env.ts

import * as path from 'path';
import * as dotenv from 'dotenv';

export function loadEnv(): void {
  // Load .env file from project root if present
  const envPath = path.resolve(process.cwd(), '.env');
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    // It's okay if .env does not exist; just continue.
    // console.warn('No .env file found, proceeding with existing environment variables.');
  }
}
