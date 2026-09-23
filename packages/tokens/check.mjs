// Gate 1: checks the shared file with one theme file at a time, never both theme files together, and prints each
// failure on one line: theme, rule, message. Exits 1 if either pair fails.
// Usage: node check.mjs [--src <dir>]. Other arguments, such as the file names lint-staged passes, are ignored.
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const THEMES = ['light', 'dark'];
const here = (relative) => fileURLToPath(new URL(relative, import.meta.url));
const TZ = fileURLToPath(
  new URL('../bin/cli.js', import.meta.resolve('@terrazzo/cli')),
);
const CONFIG = here('terrazzo.config.mjs');

const args = process.argv.slice(2);
const srcIndex = args.indexOf('--src');
const src = srcIndex >= 0 ? resolve(args[srcIndex + 1]) : here('src');

// Terrazzo prints a source excerpt under every error; keep the lines that name a rule, and point each at the file
// and line its excerpt marks, since Terrazzo's own rules do not always name the token.
function failures(output, files) {
  const lines = output.replace(/\x1b\[[0-9;]*m/g, '').split('\n');
  const texts = files.map((file) => [
    file,
    readFileSync(file, 'utf8').split('\n'),
  ]);
  const found = [];
  lines.forEach((line, i) => {
    const match = line.match(/^(?:✗\s+)?(lint|parser):([^:\s]+):\s+(.*)$/);
    if (!match || (match[1] === 'lint' && match[2] === 'lint')) return;
    const [, kind, id, message] = match;
    let where = '';
    for (const next of lines.slice(i + 1)) {
      if (/^(?:✗\s+)?(lint|parser):/.test(next)) break;
      const marked = next.match(/^>\s*(\d+)\s*\|(.*)$/);
      if (!marked) continue;
      const hit = texts.find(
        ([, text]) => text[marked[1] - 1] === marked[2].replace(/^ /, ''),
      );
      if (hit) where = ` (${relative(src, hit[0])}:${marked[1]})`;
      break;
    }
    found.push([
      kind === 'parser' ? `parser:${id}` : id,
      message.trim() + where,
    ]);
  });
  return [...new Map(found.map((line) => [line.join(' '), line])).values()];
}

async function checkPair(theme) {
  const files = [
    join(src, 'inkhr.tokens.json'),
    join(src, 'modes', `${theme}.json`),
  ];
  try {
    await promisify(execFile)(process.execPath, [
      TZ,
      'check',
      '--quiet',
      '-c',
      CONFIG,
      ...files,
    ]);
    return [];
  } catch (error) {
    const found = failures(
      `${error.stdout ?? ''}\n${error.stderr ?? ''}`,
      files,
    );
    return found.length
      ? found
      : [
          [
            'terrazzo',
            String(error.stderr || error.message)
              .trim()
              .split('\n')[0],
          ],
        ];
  }
}

const results = await Promise.all(THEMES.map(checkPair));
let failed = false;
THEMES.forEach((theme, i) => {
  for (const [rule, message] of results[i]) {
    console.log(`${theme.padEnd(6)} ${rule.padEnd(30)} ${message}`);
    failed = true;
  }
});
process.exit(failed ? 1 : 0);
