import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { checkNames } from './check-names.mjs';

const TOKENS = fileURLToPath(
  new URL('../../packages/tokens/', import.meta.url),
);

let root;
afterEach(() => root && rmSync(root, { recursive: true, force: true }));

// A repository copy with the token source, the covered types and one document, doc.md.
function makeRoot(doc, { rename } = {}) {
  root = mkdtempSync(join(tmpdir(), 'inkhr-names-'));
  const tokens = join(root, 'packages', 'tokens');
  mkdirSync(tokens, { recursive: true });
  cpSync(join(TOKENS, 'src'), join(tokens, 'src'), { recursive: true });
  cpSync(join(TOKENS, 'covered-types.mjs'), join(tokens, 'covered-types.mjs'));
  if (rename) {
    for (const theme of ['light', 'dark']) {
      const file = join(tokens, 'src', 'modes', `${theme}.json`);
      const source = JSON.parse(readFileSync(file, 'utf8'));
      source.sys.text[rename[1]] = source.sys.text[rename[0]];
      delete source.sys.text[rename[0]];
      writeFileSync(file, JSON.stringify(source, null, 2));
    }
  }
  writeFileSync(join(root, 'doc.md'), doc);
  return root;
}

const run = (doc, options = {}) =>
  checkNames({
    root: makeRoot(doc, options),
    documents: ['doc.md'],
    pending: options.pending ?? [],
  });

describe('checkNames', () => {
  it('names the file, line and name of a colour name that does not exist', async () => {
    const result = await run('# Title\n\nNever read `color.cobalt.700`.\n');
    expect(result.failures).toEqual([
      { file: 'doc.md', line: 3, name: 'color.cobalt.700' },
    ]);
  });

  it('accepts a token id, a group with .* and an --ink- variable', async () => {
    const result = await run(
      'Use `sys.text.primary`, `sys.text.*` and `var(--ink-sys-text-primary)`.\n',
    );
    expect(result).toEqual({ refused: [], failures: [] });
  });

  it('rejects a CSS variable without the --ink- prefix', async () => {
    const result = await run('Read `var(--sys-text-primary)`.\n');
    expect(result.failures.map((f) => f.name)).toEqual(['--sys-text-primary']);
  });

  it('reads fenced code blocks', async () => {
    const result = await run(
      '```css\n.a {\n  color: var(--sys-text-primary);\n}\n```\n',
    );
    expect(result.failures).toEqual([
      { file: 'doc.md', line: 3, name: '--sys-text-primary' },
    ]);
  });

  it('accepts a name a pending pattern covers, and only then', async () => {
    const doc = 'Spacing reads `space.4` and `var(--space-4)`.\n';
    expect(
      (
        await run(doc, {
          pending: [
            ['space.*', 'spacing'],
            ['--space-*', 'spacing'],
          ],
        })
      ).failures,
    ).toEqual([]);
    expect((await run(doc)).failures.map((f) => f.name)).toEqual([
      'space.4',
      '--space-4',
    ]);
  });

  it('refuses a pending pattern that matches a covered token', async () => {
    const result = await run('Nothing here.\n', {
      pending: [['sys.text.*', 'typography']],
    });
    expect(result.refused).toEqual(['sys.text.*']);
  });

  it('expands a prefix list and fails a word that does not exist', async () => {
    const result = await run('- `sys.signal.*`: bg, bg-hover, active\n');
    expect(result.failures.map((f) => f.name)).toEqual(['sys.signal.active']);
  });

  it('skips a line with the skip marker', async () => {
    const result = await run(
      'Wrong: `sys.button.bg`. <!-- name-check: skip -->\n',
    );
    expect(result.failures).toEqual([]);
  });

  it('fails a document when a role it names is renamed in the source', async () => {
    const result = await run('Links read `sys.text.link`.\n', {
      rename: ['link', 'hyperlink'],
    });
    expect(result.failures).toEqual([
      { file: 'doc.md', line: 1, name: 'sys.text.link' },
    ]);
  });

  it('ignores file names', async () => {
    const result = await run('Read `GAPS.md` and `components.json`.\n');
    expect(result.failures).toEqual([]);
  });
});
