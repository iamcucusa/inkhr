// Runs the token check on the source and on copies of it with one mistake each, and checks which rules fail.
import { execFile } from 'node:child_process';
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const CHECK = fileURLToPath(new URL('../check.mjs', import.meta.url));
const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const TIMEOUT = 30_000;

// Runs the check on a source folder and returns its exit code and the rule names it reported.
async function check(src) {
  let out = '';
  let code = 0;
  try {
    ({ stdout: out } = await promisify(execFile)('node', [
      CHECK,
      '--src',
      src,
    ]));
  } catch (error) {
    code = error.code;
    out = `${error.stdout}${error.stderr}`;
  }
  const rules = [...out.matchAll(/^(?:light|dark)\s+(\S+)\s+/gm)].map(
    (m) => m[1],
  );
  return { code, rules: [...new Set(rules)].sort() };
}

// A copy of the source with the edits applied, one function per file.
function fixture(edits) {
  const dir = mkdtempSync(join(tmpdir(), 'inkhr-tokens-'));
  cpSync(SRC, dir, { recursive: true });
  for (const [file, edit] of Object.entries(edits)) {
    const path = join(dir, file);
    const doc = JSON.parse(readFileSync(path, 'utf8'));
    edit(doc);
    writeFileSync(path, JSON.stringify(doc, null, 2));
  }
  return dir;
}

const colour = (value, description = 'A fixture role.') => ({
  $type: 'color',
  $value: value,
  $description: description,
});
// A well-formed DTCG colour, the value a role must never hold.
const COBALT_700 = {
  colorSpace: 'srgb',
  components: [0.1725, 0.2784, 0.8431],
  hex: '#2C47D7',
};
const LIGHT = 'modes/light.json';
const DARK = 'modes/dark.json';
const SHARED = 'inkhr.tokens.json';

// The trial table in specs/004-colour-tokens-check/design.md: each mistake and the rules it fails, or [] for a pass.
const FIXTURES = [
  [
    'a raw hex in a role',
    { [LIGHT]: (d) => (d.sys.action.primary.bg.$value = '#2C47D7') },
    ['core/valid-color', 'inkhr/role-reference'],
  ],
  [
    'a colour object in a role',
    { [LIGHT]: (d) => (d.sys.action.primary.bg.$value = COBALT_700) },
    ['inkhr/role-reference'],
  ],
  [
    'a JSON Pointer reference in a role',
    {
      [LIGHT]: (d) =>
        (d.sys.action.primary.bg.$value = { $ref: '#/ref/color/cobalt/700' }),
    },
    ['inkhr/role-reference'],
  ],
  [
    'a colour object in the duotone tint',
    { [DARK]: (d) => (d.image.treatment.tint.$value = COBALT_700) },
    ['inkhr/role-reference'],
  ],
  [
    'a raw duration in a role',
    {
      [SHARED]: (d) =>
        (d.sys.motion.duration.fast.$value = { value: 120, unit: 'ms' }),
    },
    [],
  ],
  [
    'a reference to a name that does not exist',
    {
      [LIGHT]: (d) =>
        (d.sys.action.primary.bg.$value = '{ref.color.cobalt.750}'),
    },
    ['parser:init'],
  ],
  [
    'a referenced primitive of an unknown type',
    { [SHARED]: (d) => (d.ref.color.cobalt['700'].$type = 'banana') },
    // Light references cobalt 700, so its parser stops; no dark role does, so the dark run reaches the rule.
    ['inkhr/known-type', 'parser:init'],
  ],
  [
    'a colour role without a description',
    { [LIGHT]: (d) => delete d.sys.action.primary.bg.$description },
    ['inkhr/descriptions'],
  ],
  [
    'a duration without a description',
    { [SHARED]: (d) => delete d.ref.motion.duration.base.$description },
    [],
  ],
  [
    'a ref that references a sys role',
    {
      [SHARED]: (d) =>
        (d.ref.color.cobalt['800'].$value = '{sys.action.primary.bg}'),
    },
    ['inkhr/references'],
  ],
  [
    'a sys role that references a sys role',
    {
      [LIGHT]: (d) =>
        (d.sys.action.primary.text.$value = '{sys.action.primary.bg}'),
    },
    ['inkhr/references'],
  ],
  [
    'a dotted state beside the role',
    {
      [LIGHT]: (d) =>
        (d.sys.action.primary.bg.hover = colour('{ref.color.cobalt.800}')),
    },
    ['inkhr/naming'],
  ],
  [
    'a state before the property',
    {
      [LIGHT]: (d) =>
        (d.sys.action.primary.hover = { bg: colour('{ref.color.cobalt.800}') }),
    },
    ['inkhr/naming', 'inkhr/theme-parity'],
  ],
  [
    'a role outside the list',
    {
      [LIGHT]: (d) => (d.sys.button = { bg: colour('{ref.color.cobalt.700}') }),
    },
    ['inkhr/naming', 'inkhr/theme-parity'],
  ],
  [
    'a property outside the list',
    {
      [LIGHT]: (d) =>
        (d.sys.action.primary.background = colour('{ref.color.cobalt.700}')),
    },
    ['inkhr/naming', 'inkhr/theme-parity'],
  ],
  [
    'a state outside the list',
    {
      [LIGHT]: (d) =>
        (d.sys.action.primary['bg-active'] = colour('{ref.color.cobalt.700}')),
    },
    ['inkhr/naming', 'inkhr/theme-parity'],
  ],
  [
    'a property word as a variant',
    {
      [LIGHT]: (d) =>
        (d.sys.action.bg = { text: colour('{ref.color.ink.900}') }),
    },
    ['inkhr/naming', 'inkhr/theme-parity'],
  ],
  [
    'a neutral variant outside the list',
    { [LIGHT]: (d) => (d.sys.text.background = colour('{ref.color.ink.900}')) },
    ['inkhr/naming', 'inkhr/theme-parity'],
  ],
  [
    'a neutral state written with a dot',
    {
      [LIGHT]: (d) =>
        (d.sys.border.strong.hover = colour('{ref.color.ink.700}')),
    },
    ['inkhr/naming'],
  ],
  [
    'a state on a neutral variant that has none',
    {
      [LIGHT]: (d) =>
        (d.sys.text['link-hover'] = colour('{ref.color.cobalt.800}')),
    },
    ['inkhr/naming', 'inkhr/theme-parity'],
  ],
  [
    'a neutral state outside the list',
    {
      [LIGHT]: (d) =>
        (d.sys.border['strong-pressed'] = colour('{ref.color.ink.700}')),
    },
    ['inkhr/naming', 'inkhr/theme-parity'],
  ],
  [
    'the new role in one theme only',
    { [DARK]: (d) => delete d.sys.border['strong-hover'] },
    ['inkhr/theme-parity'],
  ],
  [
    'a role missing from the dark file',
    { [DARK]: (d) => delete d.sys.surface.inverse },
    ['inkhr/theme-parity'],
  ],
  [
    'an invented type that nothing references',
    {
      [SHARED]: (d) =>
        (d.ref.banana = {
          $type: 'banana',
          $value: 1,
          $description: 'A fixture token.',
        }),
    },
    ['inkhr/known-type'],
  ],
  [
    'a deprecation without a replacement',
    { [LIGHT]: (d) => (d.sys.action.primary.bg.$deprecated = true) },
    ['inkhr/deprecated-replacement'],
  ],
  [
    'a deprecation that names its replacement',
    {
      [LIGHT]: (d) =>
        (d.sys.action.primary.bg.$deprecated =
          'Use {sys.action.secondary.bg}.'),
    },
    [],
  ],
  [
    'a segment in camelCase',
    { [SHARED]: (d) => (d.ref.color.cobaltBlue = d.ref.color.cobalt) },
    ['core/consistent-naming', 'inkhr/naming'],
  ],
];

describe('the token check', () => {
  it(
    'passes the source',
    async () => {
      expect(await check(SRC)).toEqual({ code: 0, rules: [] });
    },
    TIMEOUT,
  );

  it.concurrent.each(FIXTURES)(
    'reports %s',
    async (_name, edits, rules) => {
      const dir = fixture(edits);
      try {
        expect(await check(dir)).toEqual({
          code: rules.length ? 1 : 0,
          rules: [...rules].sort(),
        });
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
    TIMEOUT,
  );
});
