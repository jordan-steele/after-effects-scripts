import { createHash } from 'crypto';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..', '..', '..');

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

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

function collectScripts(root) {
  const categoryPattern = /^(\d+)_/;
  const entries = readdirSync(root)
    .filter(name => categoryPattern.test(name))
    .sort((a, b) => {
      const aIndex = Number.parseInt(a.match(categoryPattern)[1], 10);
      const bIndex = Number.parseInt(b.match(categoryPattern)[1], 10);
      return aIndex - bIndex;
    });

  const scripts = [];

  for (const categoryDir of entries) {
    const categoryPath = join(root, categoryDir);
    if (!statSync(categoryPath).isDirectory()) continue;

    const categoryIndex = Number.parseInt(categoryDir.match(categoryPattern)[1], 10);
    const jsxFiles = readdirSync(categoryPath)
      .filter(name => extname(name).toLowerCase() === '.jsx' && !/preset/i.test(name))
      .sort();

    for (const jsxFile of jsxFiles) {
      scripts.push({
        absPath: join(categoryPath, jsxFile),
        categoryIndex,
      });
    }
  }

  return scripts;
}

function findIcon(scriptAbsPath, root) {
  const iconName = `${basename(scriptAbsPath, extname(scriptAbsPath))}.svg`;
  const iconPath = join(root, 'icons', iconName);
  if (!existsSync(iconPath)) return null;
  return relative(root, iconPath).replace(/\\/g, '/');
}

function findPresets(scriptAbsPath, root) {
  const scriptDir = dirname(scriptAbsPath);
  const scriptBase = basename(scriptAbsPath, extname(scriptAbsPath));
  const presetFiles = readdirSync(scriptDir).filter(
    file => extname(file).toLowerCase() === '.ffx' && basename(file, extname(file)) === scriptBase
  );

  return presetFiles.map(file => {
    const absPath = join(scriptDir, file);
    const content = readFileSync(absPath);
    return {
      file: relative(root, absPath).replace(/\\/g, '/'),
      sha256: sha256(content),
    };
  });
}

export function collectCatalogScripts(root = ROOT) {
  const scripts = collectScripts(root);
  const items = [];

  for (const { absPath, categoryIndex } of scripts) {
    const content = readFileSync(absPath, 'utf8');
    const meta = parseJSDoc(content);

    if (!meta.name) {
      process.stderr.write(`SKIP (no @name): ${relative(root, absPath)}\n`);
      continue;
    }

    const entry = {
      slug: slugify(meta.name),
      name: meta.name,
      version: meta.version || '1.0.0',
      author: meta.author || '',
      category: meta.category || '',
      description: meta.description || '',
      destination: meta.destination || 'script',
      label: meta.label || null,
      path: relative(root, absPath).replace(/\\/g, '/'),
      hash: sha256(content),
      order: `${String(categoryIndex).padStart(2, '0')}/${basename(absPath, extname(absPath))}`,
    };

    if (meta.thumbnail) entry.thumbnail = meta.thumbnail;
    if (meta['min-ae-version']) entry.minAEVersion = meta['min-ae-version'];
    if (meta['max-ae-version']) entry.maxAEVersion = meta['max-ae-version'];
    if (meta.tags) entry.tags = meta.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    if (meta['shift-click']) entry.shiftClick = meta['shift-click'];
    if (meta['cmd-click']) entry.cmdClick = meta['cmd-click'];
    if (meta['alt-click']) entry.altClick = meta['alt-click'];
    if (meta['icon-text']) entry.iconText = meta['icon-text'];
    if (meta.changelog) entry.changelog = meta.changelog;

    const iconPath = findIcon(absPath, root);
    if (iconPath) entry.icon = iconPath;

    const presets = findPresets(absPath, root);
    if (presets.length > 0) entry.presets = presets;

    items.push(entry);
  }

  items.sort((a, b) => a.order.localeCompare(b.order));
  return items;
}
