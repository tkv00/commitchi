import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { publishBadge } from './publish.mjs';

const run = (cwd, args) => new Promise((resolve, reject) => {
  const child = spawn('git', ['-C', cwd, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  child.on('error', reject);
  child.on('close', code => code === 0 ? resolve(stdout.trim()) : reject(new Error(stderr || `git exited ${code}`)));
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'commitchi-publish-'));
  const bare = join(root, 'remote.git');
  const source = join(root, 'source');
  await mkdir(join(source, 'assets'), { recursive: true });
  await writeFile(join(source, 'assets/commitchi.svg'), '<svg id="dark"/>');
  await writeFile(join(source, 'assets/commitchi-light.svg'), '<svg id="light"/>');
  await run(root, ['init', '--bare', bare]);
  const seed = join(root, 'seed');
  await mkdir(seed);
  await run(seed, ['init', '-b', 'main']);
  await run(seed, ['config', 'user.email', 'test@example.com']);
  await run(seed, ['config', 'user.name', 'Test']);
  await writeFile(join(seed, 'README.md'), 'private source');
  await run(seed, ['add', 'README.md']);
  await run(seed, ['commit', '-m', 'source']);
  await run(seed, ['remote', 'add', 'origin', bare]);
  await run(seed, ['push', 'origin', 'main']);
  return { root, source, bare, seed };
}

test('creates a dedicated branch containing only the two public badge assets', async () => {
  const f = await fixture();
  try {
    const result = await publishBadge({ root: f.source, repository: 'owner/public', remoteUrl: f.bare });
    assert.deepEqual(result, { changed: true, branch: 'commitchi-assets' });
    const files = (await run(f.root, ['--git-dir', f.bare, 'ls-tree', '-r', '--name-only', 'commitchi-assets'])).split('\n');
    assert.deepEqual(files.sort(), ['assets/commitchi-light.svg', 'assets/commitchi.svg']);
    assert.equal(await readFile(join(f.seed, 'README.md'), 'utf8'), 'private source');
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('is byte-idempotent and preserves other branch contents', async () => {
  const f = await fixture();
  try {
    await publishBadge({ root: f.source, repository: 'owner/public', remoteUrl: f.bare });
    const before = await run(f.root, ['--git-dir', f.bare, 'rev-parse', 'commitchi-assets']);
    const result = await publishBadge({ root: f.source, repository: 'owner/public', remoteUrl: f.bare });
    const after = await run(f.root, ['--git-dir', f.bare, 'rev-parse', 'commitchi-assets']);
    assert.deepEqual(result, { changed: false, branch: 'commitchi-assets' });
    assert.equal(after, before);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('updates an existing badge branch without deleting unrelated files', async () => {
  const f = await fixture();
  try {
    await run(f.seed, ['switch', '-c', 'commitchi-assets']);
    await mkdir(join(f.seed, 'assets'), { recursive: true });
    await writeFile(join(f.seed, 'assets/legacy.txt'), 'keep me');
    await run(f.seed, ['add', 'assets/legacy.txt']);
    await run(f.seed, ['commit', '-m', 'legacy badge metadata']);
    await run(f.seed, ['push', 'origin', 'commitchi-assets']);
    await publishBadge({ root: f.source, repository: 'owner/public', remoteUrl: f.bare });
    const clone = join(f.root, 'verify');
    await run(f.root, ['clone', '--branch', 'commitchi-assets', f.bare, clone]);
    assert.equal(await readFile(join(clone, 'assets/legacy.txt'), 'utf8'), 'keep me');
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('rejects protected branches before attempting remote access', async () => {
  const f = await fixture();
  try {
    await assert.rejects(publishBadge({ root: f.source, repository: 'bad value', branch: 'main', remoteUrl: join(f.root, 'missing') }), /branch|repository/i);
    await assert.rejects(publishBadge({ root: f.source, repository: 'owner/public', branch: 'master', remoteUrl: join(f.root, 'missing') }), /branch/i);
    await assert.rejects(publishBadge({ root: f.source, repository: 'owner/public', branch: '-bad', remoteUrl: join(f.root, 'missing') }), /branch/i);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});
