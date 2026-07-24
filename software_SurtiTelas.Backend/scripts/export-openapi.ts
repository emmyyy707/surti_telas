import { specs } from '../src/config/swagger';
import fs from 'fs';

const outputPath = 'openapi.json';
fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));
console.log(`OpenAPI spec exported to ${outputPath}`);
