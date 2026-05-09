import { register } from 'module';
import { pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
register(join(__dirname, '_ts-hooks.mjs'), pathToFileURL('./'));
