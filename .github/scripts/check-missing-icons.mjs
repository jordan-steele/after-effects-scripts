#!/usr/bin/env node

/**
 * 
 * Run with node .github/scripts/check-missing-icons.mjs
 * 
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { dirname, extname, join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

function collectScripts(root) {
  const categoryPattern = /^(\d+)_/;

  return readdirSync(root)
    .filter(name => categoryPattern.test(name))
    .sort((a, b) => {
      const aIndex = Number.parseInt(a.match(categoryPattern)[1], 10);
      const bIndex = Number.parseInt(b.match(categoryPattern)[1], 10);
      return aIndex - bIndex;
    })
    .flatMap(categoryDir => {
      const categoryPath = join(root, categoryDir);
      if (!statSync(categoryPath).isDirectory()) return [];

      return readdirSync(categoryPath)
        .filter(name => extname(name).toLowerCase() === '.jsx' && !/preset/i.test(name))
        .sort()
        .map(name => join(categoryDir, name));
    });
}

function main() {
  const scripts = collectScripts(ROOT);
  const missingIcons = scripts.filter(scriptPath => {
    const iconName = `${basename(scriptPath, extname(scriptPath))}.svg`;
    return !existsSync(join(ROOT, 'icons', iconName));
  });

  if (missingIcons.length === 0) {
    process.stdout.write(`All ${scripts.length} scripts have icons.\n`);
    return;
  }

  process.stdout.write(`Missing icons for ${missingIcons.length} script(s):\n`);
  for (const scriptPath of missingIcons) {
    process.stdout.write(`- ${scriptPath}\n`);
  }

  process.exitCode = 1;
}

main();
