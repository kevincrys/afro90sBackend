import * as esbuild from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { FLOWS, isValidFlow } from './flows.mjs';

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const flows = requested.length > 0 ? requested : FLOWS;

for (const flow of flows) {
  if (!isValidFlow(flow)) {
    console.error(`Invalid flow: ${flow} (expected one of: ${FLOWS.join(', ')})`);
    process.exit(1);
  }

  const entry = join('resources', flow, 'src', 'handler.ts');
  const outFile = join('resources', flow, 'dist', 'handler.js');

  await mkdir(dirname(outFile), { recursive: true });

  await esbuild.build({
    entryPoints: [entry],
    outfile: outFile,
    bundle: true,
    platform: 'node',
    target: 'node24',
    format: 'cjs',
    minify: true,
    sourcemap: true,
    logLevel: 'info',
  });

  console.log(`Bundled ${outFile}`);
}
