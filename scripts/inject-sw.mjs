import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(directory, entry.name)) : join(directory, entry.name)));
  return files.flat();
}

const root = new URL('../dist/', import.meta.url);
const rootPath = root.pathname;
const indexPath = join(rootPath, 'index.html');
let index = await readFile(indexPath, 'utf8');
const scriptMatch = index.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
const styleMatch = index.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);
if (!scriptMatch || !styleMatch) throw new Error('Could not find built app assets to inline');
const script = (await readFile(join(rootPath, scriptMatch[1]), 'utf8')).replace(/\n?\/\/# sourceMappingURL=.*$/, '');
const style = await readFile(join(rootPath, styleMatch[1]), 'utf8');
// Replacement callbacks keep minified `$&`, `$1`, and similar sequences in the
// JavaScript/CSS literal. Passing these strings directly to replace() would
// interpret them as replacement patterns and corrupt the built document.
index = index
  .replace(scriptMatch[0], () => `<script type="module">${script.replaceAll('</script', '<\\/script')}</script>`)
  .replace(styleMatch[0], () => `<style>${style.replaceAll('</style', '<\\/style')}</style>`);
await writeFile(indexPath, index);

const files = (await walk(rootPath))
  // Azure consumes this deployment file instead of serving it. Including it
  // makes cache.addAll reject and prevents the service worker from installing.
  .filter((file) => !file.endsWith('sw.js') && !file.endsWith('.map') && !file.endsWith('staticwebapp.config.json'))
  .map((file) => `/${relative(rootPath, file)}`);
const swPath = join(rootPath, 'sw.js');
const source = await readFile(swPath, 'utf8');
await writeFile(swPath, source.replace('__PRECACHE__', JSON.stringify(['/', ...files])));
