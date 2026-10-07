import { copyFile, lstat, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DEFAULT_REPOSITORY = 'tkv00/tkv00';
const BAD_BRANCHES = new Set(['main', 'master', 'head']);

function command(cwd, args, { allowExitCodes = [] } = {}) {
  return new Promise((resolveCommand, reject) => {
    const child = spawn('git', ['-C', cwd, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0 || allowExitCodes.includes(code)) resolveCommand({ code, stdout: stdout.trim(), stderr: stderr.trim() });
      else reject(new Error(`git ${args.join(' ')} failed: ${stderr.trim() || `exit ${code}`}`));
    });
  });
}

function validateRepository(repository) {
  if (typeof repository !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(repository)) {
    throw new Error('repository must be owner/name');
  }
}

async function validateBranch(branch) {
  if (typeof branch !== 'string' || branch.length === 0 || branch.startsWith('-') || BAD_BRANCHES.has(branch.toLowerCase())) {
    throw new Error('protected or invalid branch');
  }
  await command(process.cwd(), ['check-ref-format', '--branch', branch]);
}

async function regularSvg(path, label) {
  let stat;
  try { stat = await lstat(path); } catch { throw new Error(`${label} is missing`); }
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size === 0) throw new Error(`${label} must be a non-empty regular file`);
  const content = await readFile(path, 'utf8');
  if (!/<svg(?:\s|>)/i.test(content)) throw new Error(`${label} must contain an SVG root`);
}

function remoteFor(repository, remoteUrl) {
  return remoteUrl ?? `git@github.com:${repository}.git`;
}

export async function publishBadge({ root = process.cwd(), repository = DEFAULT_REPOSITORY, branch = 'commitchi-assets', remoteUrl } = {}) {
  validateRepository(repository);
  await validateBranch(branch);
  root = resolve(root);
  const dark = join(root, 'assets/commitchi.svg');
  const light = join(root, 'assets/commitchi-light.svg');
  await regularSvg(dark, 'assets/commitchi.svg');
  await regularSvg(light, 'assets/commitchi-light.svg');

  const remote = remoteFor(repository, remoteUrl);
  const tempParent = await mkdtemp(join(tmpdir(), 'commitchi-publish-'));
  const checkout = join(tempParent, 'checkout');
  try {
    const remoteBranch = await command(tempParent, ['ls-remote', '--exit-code', '--heads', remote, branch], { allowExitCodes: [1, 2] });
    if (remoteBranch.code === 0) {
      await command(tempParent, ['clone', '--depth', '1', '--branch', branch, remote, checkout]);
    } else {
      await mkdir(checkout, { recursive: true });
      await command(tempParent, ['init', '-b', branch, checkout]);
      await command(checkout, ['remote', 'add', 'origin', remote]);
    }

    const targetAssets = join(checkout, 'assets');
    try {
      const targetStat = await lstat(targetAssets);
      if (targetStat.isSymbolicLink() || !targetStat.isDirectory()) throw new Error('target assets path is not a directory');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await mkdir(targetAssets, { recursive: true });
    }
    for (const [source, target] of [[dark, join(targetAssets, 'commitchi.svg')], [light, join(targetAssets, 'commitchi-light.svg')]]) {
      try {
        const targetStat = await lstat(target);
        if (targetStat.isSymbolicLink() || !targetStat.isFile()) throw new Error(`target ${target} is not a regular file`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      await copyFile(source, target);
    }
    await command(checkout, ['add', '--', 'assets/commitchi.svg', 'assets/commitchi-light.svg']);
    const staged = await command(checkout, ['diff', '--cached', '--quiet', '--', 'assets/commitchi.svg', 'assets/commitchi-light.svg'], { allowExitCodes: [1] });
    if (staged.code === 0) return { changed: false, branch };
    await command(checkout, ['config', 'user.name', 'commitchi-bot']);
    await command(checkout, ['config', 'user.email', 'commitchi-bot@users.noreply.github.com']);
    await command(checkout, ['commit', '-m', 'chore: update commitchi badges']);
    await command(checkout, ['push', 'origin', `HEAD:refs/heads/${branch}`]);
    return { changed: true, branch };
  } finally {
    await rm(tempParent, { recursive: true, force: true });
  }
}

async function cli() {
  const root = process.cwd();
  const config = JSON.parse(await readFile(join(root, 'commitchi.config.json'), 'utf8'));
  const result = await publishBadge({ root, repository: config.publicRepository ?? DEFAULT_REPOSITORY, branch: config.publicBranch ?? 'commitchi-assets' });
  console.log(`commitchi-assets: ${result.changed ? 'updated' : 'unchanged'}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cli().catch(error => { console.error(`Commitchi publish stopped: ${error.message}`); process.exitCode = 1; });
}
