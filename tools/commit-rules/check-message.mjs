// Checks one commit message. Used by the commit-msg hook, pre-push, CI and the
// Claude Code hook, so every layer gives the same verdict.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  BODY_MAX_LINES,
  HEADER,
  HEADER_MAX_LENGTH,
  MESSAGE_PASS_THROUGH,
  SCOPES,
  TRAILERS,
  TYPES,
} from './rules.mjs';

// Drops git's comment lines and everything below its scissors line.
export function stripComments(message) {
  const lines = [];
  for (const line of message.split('\n')) {
    if (line.startsWith('# ------------------------ >8')) break;
    if (line.startsWith('#')) continue;
    lines.push(line);
  }
  while (lines.length > 0 && lines.at(-1).trim() === '') lines.pop();
  return lines;
}

export function checkMessage(message) {
  const lines = stripComments(message);
  const header = lines[0] ?? '';
  const failures = [];
  const fail = (rule, detail) => failures.push({ rule, detail });

  if (header.trim() === '') {
    fail('format', 'the message is empty');
    return failures;
  }
  if (MESSAGE_PASS_THROUGH.some((pattern) => pattern.test(header))) {
    return failures;
  }

  const match = HEADER.exec(header);
  if (!match) {
    fail(
      'format',
      'the header is not "type(scope): subject" or "type: subject"',
    );
  } else {
    const { type, scope, subject } = match.groups;
    if (!TYPES.includes(type)) {
      fail('type', `"${type}" is not one of: ${TYPES.join(', ')}`);
    }
    if (scope !== undefined && !SCOPES.includes(scope)) {
      fail('scope', `"${scope}" is not one of: ${SCOPES.join(', ')}`);
    }
    if (subject[0] !== subject[0].toLowerCase()) {
      fail('lowercase', 'the subject starts with an uppercase letter');
    }
    if (subject.endsWith('.')) {
      fail('period', 'the subject ends with a period');
    }
  }
  if (header.length > HEADER_MAX_LENGTH) {
    fail(
      'header-length',
      `the header is ${header.length} characters, over ${HEADER_MAX_LENGTH}`,
    );
  }

  if (lines.length > 1) {
    if (lines[1].trim() !== '') {
      fail('body-blank-line', 'the body does not follow a blank line');
    }
    const body = lines.slice(2).filter((line) => line.trim() !== '');
    if (body.length > BODY_MAX_LINES) {
      fail(
        'body-length',
        `the body is ${body.length} lines, over ${BODY_MAX_LINES}`,
      );
    }
  }

  for (const line of lines.slice(1)) {
    if (TRAILERS.some((pattern) => pattern.test(line.trim()))) {
      fail('trailer', 'the message has a trailer or tool attribution');
      break;
    }
  }

  return failures;
}

export function report(failures, subject) {
  if (failures.length === 0) return;
  process.stderr.write(`${subject} breaks the commit rules:\n`);
  for (const { rule, detail } of failures) {
    process.stderr.write(`  ${rule}: ${detail}\n`);
  }
  process.stderr.write('  Rules and examples: docs/commit-guide.md\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = process.argv[2];
  const message =
    source === undefined || source === '-'
      ? readFileSync(0, 'utf8')
      : readFileSync(source, 'utf8');
  const failures = checkMessage(message);
  report(failures, 'The commit message');
  process.exit(failures.length === 0 ? 0 : 1);
}
