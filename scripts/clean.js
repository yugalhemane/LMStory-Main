import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const directoriesToIgnore = ['.git', '.vscode', '.gemini'];
const itemsToDelete = ['dist', 'coverage', 'node_modules'];

function clean(dir) {
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (itemsToDelete.includes(entry.name) || entry.name.endsWith('.tsbuildinfo')) {
      console.log(`Removing: ${fullPath}`);
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else if (entry.isDirectory() && !directoriesToIgnore.includes(entry.name)) {
      clean(fullPath);
    }
  }
}

console.log('Starting cleanup...');
clean(rootDir);
console.log('Cleanup complete.');
