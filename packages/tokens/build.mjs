// Builds the shared file with one theme file at a time into dist/: CSS, TypeScript, Swift and Kotlin.
// Never both theme files together: the second silently overrides the first on every shared name.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';
import { COVERED_TYPES } from './covered-types.mjs';

const THEMES = {
  light: { selector: ':root', className: 'InkTokensLight' },
  dark: { selector: '[data-ink-theme="dark"]', className: 'InkTokensDark' },
};

const path = (relative) => fileURLToPath(new URL(relative, import.meta.url));
const covered = (token) => COVERED_TYPES.includes(token.$type);
const options = { formatting: { commentStyle: 'none' } };

for (const [theme, { selector, className }] of Object.entries(THEMES)) {
  const modeFile = path(`src/modes/${theme}.json`);
  // The dark block declares only its own tokens; the primitives it refers to come from :root.
  const cssFilter =
    theme === 'light'
      ? covered
      : (token) => covered(token) && resolve(token.filePath) === modeFile;

  const sd = new StyleDictionary({
    usesDtcg: true,
    source: [path('src/inkhr.tokens.json'), modeFile],
    platforms: {
      css: {
        transformGroup: 'css',
        prefix: 'ink',
        buildPath: path('dist/css/'),
        files: [
          {
            destination: `${theme}.css`,
            format: 'css/variables',
            filter: cssFilter,
            options: { ...options, selector, outputReferences: true },
          },
        ],
      },
      ts: {
        transformGroup: 'js',
        buildPath: path('dist/ts/'),
        files: [
          {
            destination: `${theme}.js`,
            format: 'javascript/es6',
            filter: covered,
            options,
          },
          {
            destination: `${theme}.d.ts`,
            format: 'typescript/es6-declarations',
            filter: covered,
            options,
          },
        ],
      },
      swift: {
        transformGroup: 'ios-swift',
        buildPath: path('dist/swift/'),
        files: [
          {
            destination: `${className}.swift`,
            format: 'ios-swift/class.swift',
            filter: covered,
            options: { ...options, className },
          },
        ],
      },
      kotlin: {
        transformGroup: 'compose',
        buildPath: path('dist/kotlin/'),
        files: [
          {
            destination: `${className}.kt`,
            format: 'compose/object',
            filter: covered,
            options: { ...options, className, packageName: 'inkhr.tokens' },
          },
        ],
      },
    },
  });

  await sd.buildAllPlatforms();
}
