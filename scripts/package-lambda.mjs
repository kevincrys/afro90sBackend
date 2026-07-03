import { createWriteStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { ZipArchive } from 'archiver';
import { FLOWS, isValidFlow } from './flows.mjs';

async function packageFlow(flow) {
  const distDir = join('resources', flow, 'dist');
  const outPath = join('resources', flow, 'lambda.zip');

  try {
    await stat(distDir);
  } catch {
    console.error(`Missing ${distDir}/ — run "npm run bundle -- ${flow}" first`);
    process.exit(1);
  }

  const output = createWriteStream(outPath);
  const archive = new ZipArchive({ zlib: { level: 9 } });

  archive.on('error', (error) => {
    throw error;
  });

  await new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
    archive.pipe(output);
    archive.directory(distDir, false);
    archive.finalize();
  });

  console.log(`Created ${outPath} (${archive.pointer()} bytes)`);
}

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const flows = requested.length > 0 ? requested : FLOWS;

for (const flow of flows) {
  if (!isValidFlow(flow)) {
    console.error(`Invalid flow: ${flow} (expected one of: ${FLOWS.join(', ')})`);
    process.exit(1);
  }
  await packageFlow(flow);
}
