// Checks that every token name and CSS variable the docs mention exists: a token id or group in the source, or the
// CSS variable of a covered token, unless a pending pattern covers it. Reads code spans, fenced code blocks and
// "`prefix.*`: a, b" lists; skips a line carrying the skip marker.
// Usage: node tools/name-check/check-names.mjs. Prints `file:line  name` per failure and exits 1 on any.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PENDING } from './pending.mjs';

export const DOCUMENTS = [
  'DESIGN.md',
  'GAPS.md',
  'AGENTS.md',
  'packages/tokens/AGENTS.md',
];
const SOURCES = ['inkhr.tokens.json', 'modes/light.json', 'modes/dark.json'];
const SKIP = '<!-- name-check: skip -->';
const FILE = /\.(md|json|mjs|mts|js|ts|txt|css|html|kt|swift)$/;
const DOTTED = /(?<![\w/@.-])[a-z][a-z0-9-]*(?:\.(?:[a-z0-9-]+|\*))+/g;
const CSS_VAR = /--(?:ink|sys|ref)-[a-z0-9-]+|(?<=var\()--[a-z0-9-]+/g;

// Every token in a DTCG document, with its id and its $type (inherited from the nearest group that sets one).
function tokens(node, type, path = []) {
  const own = node.$type ?? type;
  if ('$value' in node) return [[path.join('.'), own]];
  return Object.entries(node)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => tokens(child, own, [...path, key]));
}

const glob = (pattern) =>
  new RegExp(
    `^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`,
  );

// The names one line mentions.
function mentions(line, inFence) {
  const spans = inFence
    ? [line]
    : [...line.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  const names = [];
  const list = !inFence && line.match(/^\s*-\s*`([a-z0-9.-]+)\.\*`:\s*(.+)$/);
  if (list)
    names.push(
      ...list[2].split(',').map((word) => `${list[1]}.${word.trim()}`),
    );
  for (const span of spans) {
    names.push(
      ...[...span.matchAll(DOTTED)]
        .map(([name]) => name)
        .filter((name) => !FILE.test(name)),
    );
    names.push(...[...span.matchAll(CSS_VAR)].map(([name]) => name));
  }
  return [...new Set(names)];
}

export async function checkNames({
  root,
  documents = DOCUMENTS,
  pending = PENDING,
}) {
  const { COVERED_TYPES } = await import(
    pathToFileURL(join(root, 'packages/tokens/covered-types.mjs')).href
  );
  const source = new Map(
    SOURCES.flatMap((file) =>
      tokens(
        JSON.parse(
          readFileSync(join(root, 'packages/tokens/src', file), 'utf8'),
        ),
      ),
    ),
  );
  const groups = new Set(
    [...source.keys()].flatMap((id) =>
      id
        .split('.')
        .slice(0, -1)
        .map((_, i, parts) => parts.slice(0, i + 1).join('.')),
    ),
  );
  const cssVars = new Set(
    [...source]
      .filter(([, type]) => COVERED_TYPES.includes(type))
      .map(([id]) => `--ink-${id.replaceAll('.', '-')}`),
  );
  const patterns = pending.map(([pattern]) => [pattern, glob(pattern)]);
  const refused = patterns
    .filter(([, re]) =>
      [...source].some(
        ([id, type]) =>
          COVERED_TYPES.includes(type) &&
          (re.test(id) || re.test(`--ink-${id.replaceAll('.', '-')}`)),
      ),
    )
    .map(([pattern]) => pattern);

  const exists = (name) =>
    name.startsWith('--')
      ? cssVars.has(name)
      : source.has(name) ||
        groups.has(name) ||
        (name.endsWith('.*') && groups.has(name.slice(0, -2)));
  const failures = [];
  for (const file of documents) {
    let inFence = false;
    readFileSync(join(root, file), 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (/^\s*```/.test(line)) {
          inFence = !inFence;
          return;
        }
        if (line.includes(SKIP)) return;
        for (const name of mentions(line, inFence)) {
          if (exists(name) || patterns.some(([, re]) => re.test(name)))
            continue;
          failures.push({ file, line: i + 1, name });
        }
      });
  }
  return { refused, failures };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const { refused, failures } = await checkNames({ root });
  for (const pattern of refused)
    console.log(
      `tools/name-check/pending.mjs  ${pattern} matches a covered token`,
    );
  for (const { file, line, name } of failures)
    console.log(`${file}:${line}  ${name}`);
  process.exit(refused.length || failures.length ? 1 : 0);
}
