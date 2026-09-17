// Checks one branch name. Used by pre-push and CI.
import { fileURLToPath } from 'node:url';
import {
  BRANCH_MAX_LENGTH,
  BRANCH_OTHER,
  BRANCH_PASS_THROUGH,
  BRANCH_SPEC,
} from './rules.mjs';
import { report } from './check-message.mjs';
import { checkDisclosure, readLocalTerms } from './disclosure.mjs';

export function checkBranch(name, localTerms = readLocalTerms()) {
  const failures = [];
  const fail = (rule, detail) => failures.push({ rule, detail });

  if (BRANCH_PASS_THROUGH.some((pattern) => pattern.test(name))) {
    return failures;
  }
  if (!BRANCH_SPEC.test(name) && !BRANCH_OTHER.test(name)) {
    fail(
      'format',
      `"${name}" is neither "NNN-slug" for a spec nor "type/slug"; lowercase words joined by hyphens`,
    );
  }
  if (name.length > BRANCH_MAX_LENGTH) {
    fail(
      'branch-length',
      `the name is ${name.length} characters, over ${BRANCH_MAX_LENGTH}`,
    );
  }
  failures.push(...checkDisclosure(name.replace(/-/g, ' '), localTerms));

  return failures;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const name = process.argv[2] ?? '';
  const failures = checkBranch(name);
  report(failures, 'The branch name');
  process.exit(failures.length === 0 ? 0 : 1);
}
