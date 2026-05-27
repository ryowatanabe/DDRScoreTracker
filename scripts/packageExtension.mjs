import { existsSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');
const require = createRequire(import.meta.url);
const { version } = require('../package.json');
const distDir = join(rootDir, 'dist');
const outputPath = join(rootDir, `DDRScoreTracker-v${version}.zip`);

if (!existsSync(distDir)) {
  console.error('Error: dist/ not found. Run `yarn build` first.');
  process.exit(1);
}

// Zip dist/ contents with no "dist/" prefix so manifest.json is at zip root (required by Chrome Web Store).
const pyCode = `
import zipfile, os, sys
zip_path = sys.argv[1]
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        for f in files:
            path = os.path.join(root, f)
            zf.write(path)
`;

execFileSync('python3', ['-c', pyCode, outputPath], { cwd: distDir, stdio: 'inherit' });
console.log(`Created: ${outputPath}`);
