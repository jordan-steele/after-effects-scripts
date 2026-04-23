#!/usr/bin/env node
/**
 * Manifest generator for Basecamp.
 *
 * Collects script metadata from the numbered category folders and writes
 * manifest.json to the repo root.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { ROOT, collectCatalogScripts } from './lib/catalog.mjs';

function main() {
  const manifest = {
    version: 1,
    generated: new Date().toISOString(),
    scripts: collectCatalogScripts(ROOT),
  };

  const outPath = join(ROOT, 'manifest.json');
  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
  process.stdout.write(`Generated manifest.json with ${manifest.scripts.length} scripts.\n`);
}

main();
