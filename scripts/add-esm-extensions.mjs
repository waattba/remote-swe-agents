#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Add .js extensions to all relative imports in .js/.mjs files
// This is necessary for Node.js ESM which requires explicit file extensions
function addExtensions(dir) {
  const files = fs.readdirSync(dir, { recursive: true });
  
  for (const file of files) {
    if (!file.endsWith('.js') && !file.endsWith('.mjs')) continue;
    
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Match imports like: from './file' or from '../file' (without extension)
    const newContent = content.replace(
      /from\s+(['"])(\.[^'"]+?)(['"])/g,
      (match, q1, importPath, q2) => {
        // Don't add extension if it already has one
        if (importPath.endsWith('.js') || importPath.endsWith('.mjs') || importPath.endsWith('.json')) {
          return match;
        }
        // Don't add extension to node modules (shouldn't happen in relative imports)
        if (!importPath.startsWith('.')) {
          return match;
        }
        modified = true;
        return `from ${q1}${importPath}.js${q2}`;
      }
    );
    
    if (modified) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Fixed: ${filePath}`);
    }
  }
}

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node add-esm-extensions.mjs <directory>');
  process.exit(1);
}

addExtensions(dir);
