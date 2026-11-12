// Creates .disclosure-terms.local from the example when it is missing.
// Runs from the prepare script and the SessionStart hook, so every clone has
// the private list after npm install or a first agent session. It never
// overwrites an existing file.
import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXAMPLE_TERMS_FILE, LOCAL_TERMS_FILE } from './disclosure.mjs';

const defaultProjectDir = path.resolve(
  fileURLToPath(new URL('../..', import.meta.url)),
);

// Returns a line saying what it created, or an empty string when it did nothing.
export function initLocalTerms(projectDir = defaultProjectDir) {
  const local = path.join(projectDir, LOCAL_TERMS_FILE);
  const example = path.join(projectDir, EXAMPLE_TERMS_FILE);
  if (existsSync(local) || !existsSync(example)) return '';
  copyFileSync(example, local);
  return `Created ${LOCAL_TERMS_FILE} from the example; replace the placeholders with the real names.`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const created = initLocalTerms();
  if (created) process.stdout.write(`${created}\n`);
}
