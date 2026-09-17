// Creates .disclosure-terms.local from the example when it is missing.
// Runs from the prepare script, so every clone has the private list after
// npm install. It never overwrites an existing file.
import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXAMPLE_TERMS_FILE, LOCAL_TERMS_FILE } from './disclosure.mjs';

const projectDir = path.resolve(
  fileURLToPath(new URL('../..', import.meta.url)),
);
const local = path.join(projectDir, LOCAL_TERMS_FILE);
const example = path.join(projectDir, EXAMPLE_TERMS_FILE);

if (!existsSync(local) && existsSync(example)) {
  copyFileSync(example, local);
  process.stdout.write(
    `Created ${LOCAL_TERMS_FILE} from the example; replace the placeholders with the real names.\n`,
  );
}
