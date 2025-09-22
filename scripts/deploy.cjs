const fs = require('fs/promises');
const path = require('path');

async function ensureDistExists(distDir) {
  try {
    const stats = await fs.stat(distDir);
    if (!stats.isDirectory()) {
      throw new Error('dist exists but is not a directory');
    }
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error('dist directory not found. Run "vite build" before deploying.');
    }
    throw error;
  }
}

async function copyDistToDocs(distDir, docsDir) {
  await fs.cp(distDir, docsDir, { recursive: true });
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const distDir = path.join(root, 'dist');
  const docsDir = path.join(root, 'docs');
  const nojekyllPath = path.join(docsDir, '.nojekyll');

  await ensureDistExists(distDir);
  await fs.rm(docsDir, { recursive: true, force: true });
  await fs.mkdir(docsDir, { recursive: true });
  await copyDistToDocs(distDir, docsDir);
  await fs.writeFile(nojekyllPath, '');

  console.log('Deploy folder prepared in docs/.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
