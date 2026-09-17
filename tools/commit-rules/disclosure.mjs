// The disclosure check. It never reports the text it matched, so a log or a CI
// job never leaks a private name.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CODE_SPAN_EXEMPT_TERMS,
  GENERIC_TERMS,
} from './disclosure-patterns.mjs';

const projectDir = path.resolve(
  fileURLToPath(new URL('../..', import.meta.url)),
);

export const LOCAL_TERMS_FILE = '.disclosure-terms.local';
export const EXAMPLE_TERMS_FILE = '.disclosure-terms.example';

const escape = (term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// "recruiter" also matches "recruiters" and "recruiter's".
export function termPattern(term) {
  return new RegExp(`\\b${escape(term)}(?:'s|es|s)?\\b`, 'i');
}

export function withoutCodeSpans(text) {
  return text.replace(/`[^`]*`/g, ' ');
}

// Returns null when the file is missing, so a caller can tell that apart from
// an empty list.
export function readLocalTerms(file = path.join(projectDir, LOCAL_TERMS_FILE)) {
  if (!existsSync(file)) return null;
  return readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));
}

export function checkDisclosure(text, localTerms = readLocalTerms()) {
  const failures = [];
  const outsideCode = withoutCodeSpans(text);

  const hit =
    GENERIC_TERMS.some((term) => termPattern(term).test(text)) ||
    CODE_SPAN_EXEMPT_TERMS.some((term) => termPattern(term).test(outsideCode));
  if (hit) {
    failures.push({
      rule: 'disclosure',
      detail:
        'the text uses hiring or portfolio vocabulary; describe the domain instead',
    });
  }

  if (localTerms === null) {
    process.stderr.write(
      `  notice: ${LOCAL_TERMS_FILE} is missing, so private names were not checked\n`,
    );
  } else if (localTerms.some((term) => termPattern(term).test(text))) {
    failures.push({
      rule: 'disclosure',
      detail: `the text contains a name from ${LOCAL_TERMS_FILE}`,
    });
  }

  return failures;
}
