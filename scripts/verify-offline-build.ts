import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { emberReplayManifest } from '../src/fixtures/replay.ts';

const assert = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const root = process.cwd();
const distRoot = resolve(root, 'dist');

const filesUnder = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  }));
  return files.flat();
};

const assertLocalBuildReference = async (reference: string, owner: string): Promise<void> => {
  if (reference.startsWith('#') || reference.startsWith('data:')) return;
  assert(
    !/^(?:https?:)?\/\//i.test(reference),
    `${owner} depends on a remote build resource: ${reference}`,
  );

  const pathname = reference.split(/[?#]/, 1)[0];
  const target = pathname.startsWith('/')
    ? resolve(distRoot, pathname.slice(1))
    : resolve(dirname(owner), pathname);
  assert(
    target === distRoot || target.startsWith(`${distRoot}${sep}`),
    `${owner} references a path outside the production build: ${reference}`,
  );
  assert((await stat(target)).isFile(), `${owner} references a missing build asset: ${reference}`);
};

const indexPath = resolve(distRoot, 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');
const documentReferences = [...indexHtml.matchAll(/\b(?:href|src)="([^"]+)"/g)]
  .map(match => match[1]);

assert(documentReferences.length >= 3, 'Production index did not expose its expected local assets.');
for (const reference of documentReferences) {
  await assertLocalBuildReference(reference, indexPath);
}

const buildFiles = await filesUnder(distRoot);
const cssFiles = buildFiles.filter(path => extname(path) === '.css');

for (const cssPath of cssFiles) {
  const css = await readFile(cssPath, 'utf8');
  const cssReferences = [...css.matchAll(/url\(([^)]+)\)/g)]
    .map(match => match[1].trim().replace(/^(['"])(.*)\1$/, '$2'));
  for (const reference of cssReferences) {
    await assertLocalBuildReference(reference, cssPath);
  }
}

for (const frame of emberReplayManifest.frames) {
  await assertLocalBuildReference(frame.displayUrl, indexPath);
}

const runtimeFiles = [
  resolve(root, 'index.html'),
  ...(await filesUnder(resolve(root, 'src'))).filter(path => (
    ['.css', '.ts', '.tsx'].includes(extname(path))
  )),
];
const forbiddenRuntimeApis = [
  { pattern: /\bfetch\s*\(/, label: 'fetch' },
  { pattern: /\bXMLHttpRequest\b/, label: 'XMLHttpRequest' },
  { pattern: /\bWebSocket\b/, label: 'WebSocket' },
  { pattern: /\bEventSource\b/, label: 'EventSource' },
  { pattern: /\bsendBeacon\s*\(/, label: 'sendBeacon' },
];

for (const path of runtimeFiles) {
  const source = await readFile(path, 'utf8');
  for (const api of forbiddenRuntimeApis) {
    assert(
      !api.pattern.test(source),
      `${relative(root, path)} contains the remote-capable runtime API ${api.label}.`,
    );
  }
}

console.log(
  `Offline build verified: ${documentReferences.length} document assets, ${cssFiles.length} stylesheet, `
  + `${emberReplayManifest.frames.length} replay frames, and no application network API.`,
);
