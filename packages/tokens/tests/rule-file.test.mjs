// Runs every row of the token rule file: the incorrect form must fail the check the row names, and the correct
// form must pass it. A row naming a check this test does not know fails, so the file cannot cite a missing check.
import { execFile } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterAll, describe, expect, it } from 'vitest';
import { checkNames } from '../../../tools/name-check/check-names.mjs';

const RULE_FILE = fileURLToPath(
  new URL('../../../.claude/skills/inkhr/rules/tokens.md', import.meta.url),
);
const PACKAGE = fileURLToPath(new URL('../', import.meta.url));
const CHECK = join(PACKAGE, 'check.mjs');
const TIMEOUT = 60_000;
const ROLE = ['sys', 'action', 'primary', 'bg'];
const roots = [];
afterAll(() =>
  roots.forEach((root) => rmSync(root, { recursive: true, force: true })),
);

// The rows of the table whose header has "Caught by": [rule, incorrect, correct, check].
function rows() {
  const lines = readFileSync(RULE_FILE, 'utf8').split('\n');
  const header = lines.findIndex((line) => /^\|.*Caught by/.test(line));
  expect(header, 'a table with a "Caught by" column').toBeGreaterThan(-1);
  return lines
    .slice(header + 2)
    .filter((line) => line.startsWith('|'))
    .map((line) =>
      line
        .slice(1, -1)
        .split(' | ')
        .map((cell) => cell.trim()),
    );
}

const spans = (cell) => [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
const span = (cell) => spans(cell)[0];

// A copy of the token source, and the covered types, with an edit applied to both theme files.
function copy(edit = () => {}) {
  const root = mkdtempSync(join(tmpdir(), 'inkhr-rules-'));
  roots.push(root);
  const tokens = join(root, 'packages', 'tokens');
  mkdirSync(tokens, { recursive: true });
  cpSync(join(PACKAGE, 'src'), join(tokens, 'src'), { recursive: true });
  cpSync(join(PACKAGE, 'covered-types.mjs'), join(tokens, 'covered-types.mjs'));
  for (const theme of ['light', 'dark']) {
    const file = join(tokens, 'src', 'modes', `${theme}.json`);
    const source = JSON.parse(readFileSync(file, 'utf8'));
    edit(source);
    writeFileSync(file, JSON.stringify(source, null, 2));
  }
  return root;
}

const at = (source, path) =>
  path.reduce((node, key) => (node[key] ??= {}), source);

async function tokenCheck(root) {
  try {
    await promisify(execFile)('node', [
      CHECK,
      '--src',
      join(root, 'packages', 'tokens', 'src'),
    ]);
    return [];
  } catch (error) {
    return [
      ...String(error.stdout).matchAll(/^(?:light|dark)\s+(\S+)\s+/gm),
    ].map((m) => m[1]);
  }
}

// How each check is run on one form: returns the rules that failed.
const RUNNERS = {
  'core/valid-color': (form) => {
    const { $value } = JSON.parse(`{${span(form)}}`);
    return tokenCheck(copy((source) => (at(source, ROLE).$value = $value)));
  },
  'inkhr/naming': (form, { correct }) => {
    const id = span(form).split('.');
    if (correct) {
      const source = JSON.parse(
        readFileSync(join(PACKAGE, 'src/modes/light.json'), 'utf8'),
      );
      expect(at(source, id).$value, `${span(form)} exists`).toBeDefined();
      return tokenCheck(copy());
    }
    return tokenCheck(
      copy((source) =>
        Object.assign(at(source, id), {
          $type: 'color',
          $value: '{ref.color.cobalt.800}',
          $description: 'A rule file example.',
        }),
      ),
    );
  },
  'inkhr/descriptions': (form, { correct }) =>
    tokenCheck(
      copy((source) => {
        if (correct)
          at(source, ROLE).$description = JSON.parse(
            `{${span(form)}}`,
          ).$description;
        else delete at(source, ROLE).$description;
      }),
    ),
  'check:names': async (form) => {
    const root = copy();
    writeFileSync(join(root, 'doc.md'), `Read \`${span(form)}\`.\n`);
    const { failures } = await checkNames({
      root,
      documents: ['doc.md'],
      pending: [],
    });
    return failures.length ? ['check:names'] : [];
  },
};

describe('the token rule file', () => {
  it('exists', () => {
    expect(existsSync(RULE_FILE)).toBe(true);
  });

  it.concurrent.each(
    existsSync(RULE_FILE) ? rows() : [['missing', '', '', '`none`']],
  )(
    '%s: the incorrect form %s fails and the correct form passes',
    async (_rule, incorrect, correct, caughtBy) => {
      const check = span(caughtBy);
      expect(Object.keys(RUNNERS), `a known check for ${caughtBy}`).toContain(
        check,
      );
      expect(await RUNNERS[check](incorrect, { correct: false })).toContain(
        check,
      );
      expect(await RUNNERS[check](correct, { correct: true })).toEqual([]);
    },
    TIMEOUT,
  );
});
