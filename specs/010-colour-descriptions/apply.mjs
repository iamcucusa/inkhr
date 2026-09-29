// Writes the change of spec 010 into the source from the design workspace export, in two steps. It edits the text,
// not a parsed copy, so every byte outside the listed sentences and the new role stays as it is.
// Usage: node specs/010-colour-descriptions/apply.mjs role|descriptions [--workspace <path>]
//   role          adds sys.action.tertiary.bg to both theme files and the sentence of ref.color.base.transparent
//   descriptions  writes the other listed sentences
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CHANGED,
  FILES,
  NAMES_NEW_ROLE,
  NEW_ROLE,
  ROOT,
  WORKSPACE,
  workspacePath,
} from './changes.mjs';

const step = process.argv[2];
if (!['role', 'descriptions'].includes(step)) {
  console.error('Usage: apply.mjs role|descriptions [--workspace <path>]');
  process.exit(2);
}
const workspace = workspacePath();
const exportText = (file) =>
  execFileSync('git', ['show', `${WORKSPACE}:tokens/${file}`], {
    cwd: workspace,
    encoding: 'utf8',
  });

// The files are indented by two spaces a level. Finds the line of a key path, staying inside each parent.
const indent = (depth) => ' '.repeat(2 * (depth + 1));
function keyLine(text, path) {
  let pos = 0;
  path.forEach((key, depth) => {
    const needle = `\n${indent(depth)}${JSON.stringify(key)}: `;
    const at = text.indexOf(needle, pos);
    const left = new RegExp(`\\n {0,${indent(depth).length - 1}}\\S`);
    if (at === -1 || left.test(text.slice(pos, at)))
      throw new Error(`${path.join('.')}: no key ${key}`);
    pos = at + 1;
  });
  return pos;
}
// The whole "$description" line of a token, without its newline.
function descriptionLine(text, id) {
  const path = id.split('.');
  const start = keyLine(text, [...path, '$description']);
  return [start, text.indexOf('\n', start)];
}
// The lines of a key and its whole value, from its first line to the newline after its closing brace.
function block(text, path) {
  const start = keyLine(text, path);
  const close = `\n${indent(path.length - 1)}}`;
  const end = text.indexOf('\n', text.indexOf(close, start) + 1);
  return [start, end + 1];
}

const written = [];
for (const [part, file] of Object.entries(FILES)) {
  const path = join(ROOT, 'packages/tokens/src', file);
  let text = readFileSync(path, 'utf8');
  const source = exportText(file);
  const ids = CHANGED[part].filter((id) =>
    step === 'role' ? id === NAMES_NEW_ROLE : id !== NAMES_NEW_ROLE,
  );

  for (const id of ids) {
    const [from, to] = descriptionLine(source, id);
    const [start, end] = descriptionLine(text, id);
    text = text.slice(0, start) + source.slice(from, to) + text.slice(end);
  }

  let added = '';
  if (step === 'role' && part !== 'shared') {
    // The role's lines as the export has them, placed before the group that follows it there.
    const path = NEW_ROLE.split('.').slice(0, -1);
    const [from, to] = block(source, path);
    const next = source.slice(to).match(/^\s*"([^"]+)": /)[1];
    const before = keyLine(text, [...path.slice(0, -1), next]);
    text = text.slice(0, before) + source.slice(from, to) + text.slice(before);
    added = `, ${NEW_ROLE} added before sys.${path[1]}.${next}`;
  }

  writeFileSync(path, text);
  written.push(path);
  console.log(`${file}: ${ids.length} sentences${added}`);
}
execFileSync('npx', ['prettier', '--write', ...written], {
  cwd: ROOT,
  stdio: 'inherit',
});
