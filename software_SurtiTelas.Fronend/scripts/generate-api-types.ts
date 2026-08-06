import { generate } from 'openapi-typescript-codegen';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const openApiUrl = process.env.VITE_OPENAPI_URL ?? 'http://localhost:3000/api/docs';
const outputDir = resolve(__dirname, '../src/generated/api');

async function main() {
  try {
    await generate({
      input: openApiUrl,
      output: outputDir,
      client: 'fetch',
      useOptions: true,
      generateClient: true,
      generateServices: true,
      generateModels: true,
      generateHooks: false,
      generateApi: true,
      prettier: true,
      sortTypes: true,
      exportCore: false,
      exportServices: true,
      exportModels: true,
      exportHooks: false,
      exportApi: true,
      silent: false,
    });

    writeFileSync(resolve(outputDir, 'README.md'), `# Generated API types\n\nDO NOT EDIT. Generated from ${openApiUrl}\n`);
    console.log('Tipos generados en', outputDir);
  } catch (error) {
    console.error('No se pudieron generar los tipos desde OpenAPI:', error);
    process.exit(1);
  }
}

main();
