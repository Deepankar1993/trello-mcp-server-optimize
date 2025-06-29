import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const packageInfo = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8')
);