#!/usr/bin/env node
/**
 * Manifest generator for Basecamp.
 *
 * Walks the numbered category folders (01_App, 02_Project, …), parses the
 * JSDoc header from the first 30 lines of every .jsx file, computes a
 * SHA-256 content hash, finds a matching .svg icon in the global icons
 * folder, and writes manifest.json to the repo root.
 *
 * Standard AE-Dispatch Tier-2 tags parsed:
 *   @name  @author  @version  @destination  @thumbnail
 *   @min-ae-version  @max-ae-version  @category  @tags  @description
 *
 * Basecamp-specific tags also parsed (stored but ignored by AE Dispatch):
 *   @label  @shift-click  @cmd-click  @alt-click  @icon-text  @changelog
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

// ─── Helpers ────────────────────────────────────────────────────────────────

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Derive a stable slug from a @name value.
 * "Render Hi-Res" → "render-hi-res"
 * "Key Before & After" → "key-before-after"
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parse the JSDoc block from the first 30 lines of a .jsx file.
 * Returns an object keyed by tag name (without @), values are trimmed strings.
 * Multi-word tag names use the tag as-is (e.g. "shift-click").
 */
function parseJSDoc(content) {
  const lines = content.split('\n').slice(0, 30);
  const meta = {};

  let inBlock = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!inBlock) {
      if (line.startsWith('/**')) inBlock = true;
      continue;
    }
    if (line === '*/') break;

    // Strip leading " * " or " *"
    const stripped = line.replace(/^\*\s?/, '');

    const tagMatch = stripped.match(/^@([\w-]+)\s*(.*)/);
    if (tagMatch) {
      const tag = tagMatch[1];
      const value = tagMatch[2].trim();
      meta[tag] = value;
    }
  }

  return meta;
}

/**
 * Walk numbered category dirs (e.g. 01_App, 02_Project) and collect all
 * top-level .jsx files that are NOT named "*preset*" (case-insensitive).
 * Returns array of absolute file paths, sorted by:
 *   1. Category folder index (numeric prefix)
 *   2. Script file name (alphabetical within category)
 */
function collectScripts(root) {
  const catPattern = /^(\d+)_/;
  const entries = readdirSync(root)
    .filter(name => catPattern.test(name))
    .sort((a, b) => {
      const na = parseInt(a.match(catPattern)[1], 10);
      const nb = parseInt(b.match(catPattern)[1], 10);
      return na - nb;
    });

  const scripts = [];

  for (const catDir of entries) {
    const catPath = join(root, catDir);
    if (!statSync(catPath).isDirectory()) continue;

    const catIndex = parseInt(catDir.match(catPattern)[1], 10);

    const jsxFiles = readdirSync(catPath)
      .filter(name => extname(name).toLowerCase() === '.jsx' && !/preset/i.test(name))
      .sort();

    for (const jsxFile of jsxFiles) {
      scripts.push({
        absPath: join(catPath, jsxFile),
        catIndex,
        catDir,
      });
    }
  }

  return scripts;
}

/**
 * Find a matching .svg file in the global icons folder (if any).
 * Returns a repo-root-relative POSIX path, or null.
 */
function findIcon(scriptAbsPath, root) {
  const iconName = `${basename(scriptAbsPath, extname(scriptAbsPath))}.svg`;
  const abs = join(root, 'icons', iconName);
  if (!existsSync(abs)) return null;
  return relative(root, abs).replace(/\\/g, '/');
}

/**
 * Find .ffx preset files that match the script basename (if any).
 * Returns an array of { file, sha256 } objects with repo-root-relative POSIX
 * paths, or an empty array.
 */
function findPresets(scriptAbsPath, root) {
  const scriptAbsDir = dirname(scriptAbsPath);
  const scriptBase = basename(scriptAbsPath, extname(scriptAbsPath));
  const files = readdirSync(scriptAbsDir).filter(
    f => extname(f).toLowerCase() === '.ffx' && basename(f, extname(f)) === scriptBase
  );
  return files.map(f => {
    const abs = join(scriptAbsDir, f);
    const content = readFileSync(abs);
    return {
      file: relative(root, abs).replace(/\\/g, '/'),
      sha256: sha256(content),
    };
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const scripts = collectScripts(ROOT);
  const items = [];

  for (const { absPath, catIndex } of scripts) {
    const content = readFileSync(absPath, 'utf8');
    const meta = parseJSDoc(content);

    // @name is required; skip files without it
    if (!meta.name) {
      process.stderr.write(`SKIP (no @name): ${relative(ROOT, absPath)}\n`);
      continue;
    }

    const slug = slugify(meta.name);
    const hash = sha256(content);
    const relPath = relative(ROOT, absPath).replace(/\\/g, '/');
    const iconPath = findIcon(absPath, ROOT);

    // Order key: zero-padded category index + "/" + script file name (for stable sort)
    const order = `${String(catIndex).padStart(2, '0')}/${basename(absPath, extname(absPath))}`;

    const entry = {
      slug,
      name: meta.name,
      version: meta.version || '1.0.0',
      author: meta.author || '',
      category: meta.category || '',
      description: meta.description || '',
      destination: meta.destination || 'script',
      label: meta.label || null,
      path: relPath,
      hash,
      order,
    };

    // Optional standard tags
    if (meta.thumbnail) entry.thumbnail = meta.thumbnail;
    if (meta['min-ae-version']) entry.minAEVersion = meta['min-ae-version'];
    if (meta['max-ae-version']) entry.maxAEVersion = meta['max-ae-version'];
    if (meta.tags) entry.tags = meta.tags.split(',').map(t => t.trim()).filter(Boolean);

    // Basecamp-specific optional tags
    if (meta['shift-click']) entry.shiftClick = meta['shift-click'];
    if (meta['cmd-click']) entry.cmdClick = meta['cmd-click'];
    if (meta['alt-click']) entry.altClick = meta['alt-click'];
    if (meta['icon-text']) entry.iconText = meta['icon-text'];
    if (meta.changelog) entry.changelog = meta.changelog;

    // Icon
    if (iconPath) entry.icon = iconPath;

    // Preset files (.ffx)
    const presets = findPresets(absPath, ROOT);
    if (presets.length > 0) entry.presets = presets;

    items.push(entry);
  }

  // Sort by order key for deterministic output
  items.sort((a, b) => a.order.localeCompare(b.order));

  const manifest = {
    version: 1,
    generated: new Date().toISOString(),
    scripts: items,
  };

  const outPath = join(ROOT, 'manifest.json');
  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
  process.stdout.write(`Generated manifest.json with ${items.length} scripts.\n`);
}

main();
