import { build, context } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const isWatch = process.argv.includes('--watch');
const isProduction = process.env.ELEVENTY_ENV === 'prod';

const sharedOptions = {
  absWorkingDir: rootDir,
  bundle: true,
  entryNames: '[name]',
  entryPoints: {
    graph: 'src/client/graph.js',
    site: 'src/client/site.js',
  },
  format: 'iife',
  legalComments: 'none',
  minify: isProduction,
  outdir: 'dist/scripts',
  platform: 'browser',
  sourcemap: isProduction ? false : 'inline',
  target: ['es2020'],
};

if (isWatch) {
  const ctx = await context(sharedOptions);
  await ctx.watch();
  // Keep the process alive for esbuild watch mode.
  await new Promise(() => {});
} else {
  await build(sharedOptions);
}
