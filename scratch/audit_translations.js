import fs from 'fs';
import path from 'path';
import { en } from '../src/contexts/translations/en.js';
import { fr } from '../src/contexts/translations/fr.js';
import { ar } from '../src/contexts/translations/ar.js';

// Flatten keys
const flatten = (obj, prefix = '') => {
  let res = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      res = res.concat(flatten(v, fullKey));
    } else {
      res.push(fullKey);
    }
  }
  return res;
};

const enKeys = flatten(en);
const frKeys = flatten(fr);
const arKeys = flatten(ar);

// Find missing in fr / ar
const missingInFr = enKeys.filter(k => !frKeys.includes(k));
const missingInAr = enKeys.filter(k => !arKeys.includes(k));

// Scan codebase for usages
const walkDir = (dir) => {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      if (item !== 'node_modules' && item !== 'dist' && item !== 'dist-web' && item !== '.git') {
        files = files.concat(walkDir(full));
      }
    } else if (full.endsWith('.js') || full.endsWith('.jsx')) {
      files.push(full);
    }
  }
  return files;
};

const allFiles = walkDir('./src');
const fileContents = allFiles.map(f => ({ file: f, content: fs.readFileSync(f, 'utf8') }));

// Filter out translation files themselves for usage check
const nonTranslationFiles = fileContents.filter(f => !f.file.includes('contexts/translations'));

const unusedKeys = [];
for (const key of enKeys) {
  // Check direct key usage or parent key usage
  const isUsed = nonTranslationFiles.some(f => {
    return f.content.includes(`'${key}'`) ||
           f.content.includes(`"${key}"`) ||
           f.content.includes(`\`${key}\``) ||
           (key.startsWith('month_') && f.content.includes('month_')) ||
           (key.startsWith('announcements.') && (f.content.includes('announcements.') || f.content.includes(key.split('.')[1]))) ||
           (key.startsWith('challenge') && f.content.includes('titleKey') || f.content.includes('descKey'));
  });

  if (!isUsed) {
    unusedKeys.push(key);
  }
}

// Find all t('...') calls in JSX
const tCalls = new Set();
const tRegex = /\bt\(\s*['"`]([a-zA-Z0-9_.]+)['"`]/g;
for (const f of nonTranslationFiles) {
  let match;
  while ((match = tRegex.exec(f.content)) !== null) {
    tCalls.add(match[1]);
  }
}

const missingTranslations = [...tCalls].filter(k => !enKeys.includes(k));

console.log(JSON.stringify({
  totalKeys: enKeys.length,
  missingInFr,
  missingInAr,
  unusedKeys,
  missingTranslations
}, null, 2));
