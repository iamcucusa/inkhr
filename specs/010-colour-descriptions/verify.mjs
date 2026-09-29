// Checks the change spec 010 makes: main's source against the branch's and the design workspace's export.
// Usage: node specs/010-colour-descriptions/verify.mjs [--workspace <path>]. Prints one line per failure; exits 1 on any.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CHANGED,
  FILES,
  MAIN,
  NEW_ROLE,
  ROOT,
  WORKSPACE,
  atMain,
  atWorkspace,
  tokens,
  workspacePath,
} from './changes.mjs';

const workspace = workspacePath();
const failures = [];
const fail = (file, message) => failures.push(`${file}  ${message}`);
const without = (token, key) =>
  JSON.stringify(
    Object.fromEntries(Object.entries(token).filter(([k]) => k !== key)),
  );

const sources = {};
for (const [part, file] of Object.entries(FILES)) {
  const main = new Map(tokens(atMain(file)));
  const branchDoc = JSON.parse(
    readFileSync(join(ROOT, 'packages/tokens/src', file), 'utf8'),
  );
  const workspaceDoc = atWorkspace(workspace, file);
  const branch = new Map(tokens(branchDoc));
  const exported = new Map(tokens(workspaceDoc));
  sources[part] = branch;

  // 1. Nothing removed; the only token added is the new role, in the theme files, equal to the workspace's.
  for (const id of main.keys())
    if (!branch.has(id)) fail(file, `${id} is removed`);
  const expectedAdded = part === 'shared' ? [] : [NEW_ROLE];
  const added = [...branch.keys()].filter((id) => !main.has(id));
  for (const id of added)
    if (!expectedAdded.includes(id)) fail(file, `${id} is added`);
  for (const id of expectedAdded) {
    if (!branch.has(id)) fail(file, `${id} is missing`);
    else if (
      JSON.stringify(branch.get(id)) !== JSON.stringify(exported.get(id))
    )
      fail(file, `${id} differs from the workspace's`);
  }

  // 2. Exactly the listed tokens change their $description, and nothing else about any existing token changes.
  const listed = new Set(CHANGED[part]);
  for (const [id, before] of main) {
    const after = branch.get(id);
    if (!after) continue;
    if (without(before, '$description') !== without(after, '$description'))
      fail(file, `${id} changes more than its $description`);
    const changed = before.$description !== after.$description;
    if (changed && !listed.has(id))
      fail(file, `${id} $description changes and is not listed`);
    if (!changed && listed.has(id))
      fail(file, `${id} $description is unchanged`);
  }
  for (const id of listed)
    if (!main.has(id)) fail(file, `${id} is listed but not in main`);
  const order = [...branch.keys()].filter((id) => main.has(id));
  if (JSON.stringify(order) !== JSON.stringify([...main.keys()]))
    fail(file, 'the order of the existing tokens changes');

  // 3. Every changed or new sentence is the workspace's, byte for byte.
  for (const id of [...listed, ...expectedAdded]) {
    const sentence = branch.get(id)?.$description;
    if (sentence !== undefined && sentence !== exported.get(id)?.$description)
      fail(file, `${id} $description is not the workspace's`);
  }

  // 5. The whole file, parsed, is the workspace's export, key order included.
  if (JSON.stringify(branchDoc) !== JSON.stringify(workspaceDoc))
    fail(file, `does not equal the workspace export at ${WORKSPACE}`);
}

// 4. Every role reads the same sentence in both themes.
for (const [id, token] of sources.light) {
  const dark = sources.dark.get(id);
  if (dark && dark.$description !== token.$description)
    fail('modes/*.json', `${id} reads a different sentence in light and dark`);
}

for (const line of failures) console.log(line);
const counts = Object.entries(CHANGED)
  .map(([part, list]) => `${list.length} in ${FILES[part]}`)
  .join(', ');
console.log(
  failures.length
    ? `${failures.length} failures against main ${MAIN} and the workspace ${WORKSPACE}`
    : `ok: ${counts}; ${NEW_ROLE} added in both themes; equal to the workspace export at ${WORKSPACE}`,
);
process.exit(failures.length ? 1 : 0);
