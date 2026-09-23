// Checks the built outputs in dist/ against the source files: which tokens each file declares, the CSS blocks,
// the transparent primitive on every platform, and that no description reaches an output.
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const readJson = (path) => JSON.parse(read(path));

const SHARED = 'src/inkhr.tokens.json';
const THEMES = {
  light: {
    file: 'src/modes/light.json',
    selector: ':root',
    className: 'InkTokensLight',
  },
  dark: {
    file: 'src/modes/dark.json',
    selector: '[data-ink-theme="dark"]',
    className: 'InkTokensDark',
  },
};

// Every token in a DTCG file, with its path and its $type (inherited from the nearest group that sets one).
function tokens(node, path = [], inheritedType) {
  const type = node.$type ?? inheritedType;
  if ('$value' in node) return [{ path, type, description: node.$description }];
  return Object.entries(node)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => tokens(child, [...path, key], type));
}

// Names differ by platform (kebab, camel, Pascal); comparing letters and digits only matches them all.
const normalise = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
const key = (token) => normalise(token.path.join(''));
const colour = (list) => list.filter((token) => token.type === 'color');
const sorted = (values) => [...values].sort();

const shared = tokens(readJson(SHARED));
const pair = (theme) =>
  colour([...shared, ...tokens(readJson(THEMES[theme].file))]).map(key);
const modeOnly = (theme) =>
  colour(tokens(readJson(THEMES[theme].file))).map(key);

function cssBlock(theme) {
  const css = read(`dist/css/${theme}.css`).replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = [...css.matchAll(/^(\S[^{]*)\{([^}]*)\}/gm)];
  expect(blocks).toHaveLength(1);
  const [, selector, body] = blocks[0];
  const declarations = [...body.matchAll(/^\s*(--[a-z0-9-]+):\s*(.+);$/gm)].map(
    ([, name, value]) => ({ name, value }),
  );
  return { selector: selector.trim(), declarations };
}

const names = {
  ts: (theme) =>
    [
      ...read(`dist/ts/${theme}.d.ts`).matchAll(
        /^export const (\w+): string;$/gm,
      ),
    ].map((m) => m[1]),
  js: (theme) =>
    [...read(`dist/ts/${theme}.js`).matchAll(/^export const (\w+) = /gm)].map(
      (m) => m[1],
    ),
  swift: (theme) =>
    [
      ...read(`dist/swift/${THEMES[theme].className}.swift`).matchAll(
        /public static let (\w+) = /g,
      ),
    ].map((m) => m[1]),
  kotlin: (theme) =>
    [
      ...read(`dist/kotlin/${THEMES[theme].className}.kt`).matchAll(
        /^\s*val (\w+) = /gm,
      ),
    ].map((m) => m[1]),
};

describe.each(Object.keys(THEMES))('%s theme', (theme) => {
  it('has a file for every platform', () => {
    for (const path of [
      `dist/css/${theme}.css`,
      `dist/ts/${theme}.js`,
      `dist/ts/${theme}.d.ts`,
      `dist/swift/${THEMES[theme].className}.swift`,
      `dist/kotlin/${THEMES[theme].className}.kt`,
    ]) {
      expect(() => read(path), path).not.toThrow();
    }
  });

  it.each(Object.keys(names))(
    'declares exactly the colour tokens of the pair in %s',
    (platform) => {
      expect(sorted(names[platform](theme).map(normalise))).toEqual(
        sorted(pair(theme)),
      );
    },
  );

  it('writes the transparent primitive correctly on the native platforms', () => {
    expect(read(`dist/swift/${THEMES[theme].className}.swift`)).toContain(
      'refColorBaseTransparent = UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 0)',
    );
    expect(read(`dist/kotlin/${THEMES[theme].className}.kt`)).toContain(
      'refColorBaseTransparent = Color(0x00ffffff)',
    );
  });
});

describe('light CSS', () => {
  // tools/name-check derives CSS names this way, so the docs can be checked without a build.
  it('names each variable --ink- plus the token id with dots as hyphens', () => {
    const { declarations } = cssBlock('light');
    const expected = colour([
      ...shared,
      ...tokens(readJson(THEMES.light.file)),
    ]).map((token) => `--ink-${token.path.join('-')}`);
    expect(sorted(declarations.map(({ name }) => name))).toEqual(
      sorted(expected),
    );
  });

  it('declares the colour tokens of the light pair under :root with the ink prefix', () => {
    const { selector, declarations } = cssBlock('light');
    expect(selector).toBe(THEMES.light.selector);
    for (const { name } of declarations) expect(name).toMatch(/^--ink-/);
    expect(
      sorted(
        declarations.map(({ name }) => normalise(name.slice('--ink-'.length))),
      ),
    ).toEqual(sorted(pair('light')));
  });

  it('writes the transparent primitive as rgba', () => {
    const { declarations } = cssBlock('light');
    expect(declarations).toContainEqual({
      name: '--ink-ref-color-base-transparent',
      value: 'rgba(255, 255, 255, 0)',
    });
  });
});

describe('dark CSS', () => {
  it('declares only the colour tokens of the dark file, as references, under the dark selector', () => {
    const { selector, declarations } = cssBlock('dark');
    expect(selector).toBe(THEMES.dark.selector);
    expect(
      sorted(
        declarations.map(({ name }) => normalise(name.slice('--ink-'.length))),
      ),
    ).toEqual(sorted(modeOnly('dark')));
    for (const { name, value } of declarations) {
      expect(name).toMatch(/^--ink-/);
      expect(name).not.toMatch(/^--ink-ref-/);
      expect(value, name).toMatch(/^var\(--ink-ref-[a-z0-9-]+\)$/);
    }
  });
});

describe('every output', () => {
  it('carries no description from the source', () => {
    const descriptions = [SHARED, THEMES.light.file, THEMES.dark.file]
      .flatMap((file) => tokens(readJson(file)))
      .map((token) => token.description)
      .filter(Boolean);
    const files = readdirSync(new URL('dist/', root), { recursive: true })
      .filter((path) => /\.(css|js|ts|swift|kt)$/.test(path))
      .map((path) => [path, read(`dist/${path}`)]);
    expect(files.length).toBeGreaterThan(0);
    for (const [path, content] of files) {
      for (const description of descriptions)
        expect(content.includes(description), path).toBe(false);
    }
  });
});
