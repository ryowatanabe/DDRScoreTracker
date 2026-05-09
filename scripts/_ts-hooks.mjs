import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const req = createRequire(import.meta.url);
const babel = req('@babel/core');

const BABEL_CONFIG = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: false }],
    ['@babel/preset-typescript'],
  ],
};

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.js')) {
    const tsSpecifier = specifier.replace(/\.js$/, '.ts');
    try {
      const result = await nextResolve(tsSpecifier, context);
      return result;
    } catch {
      // .ts が見つからなければ .js で試みる
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.ts')) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    const result = babel.transformSync(source, {
      ...BABEL_CONFIG,
      filename: fileURLToPath(url),
    });
    return {
      format: 'module',
      source: result.code,
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}
