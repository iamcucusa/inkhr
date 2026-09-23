// Claude Code PostToolUse hook: runs the token check after an agent edits or writes a file under
// packages/tokens/src/, and returns the failures, with their rule names, on exit 2 so the agent fixes them first.
// The settings condition only filters; this script decides for itself which files it checks. A hook error never
// blocks the edit.
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHECK = fileURLToPath(
  new URL('../../packages/tokens/check.mjs', import.meta.url),
);
const SOURCE = join('packages', 'tokens', 'src') + sep;

function readFilePath() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'))?.tool_input?.file_path;
  } catch {
    return undefined;
  }
}

const projectDir = resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
const filePath = readFilePath();
const edited =
  typeof filePath === 'string'
    ? relative(projectDir, resolve(projectDir, filePath))
    : '';

if (!edited.startsWith(SOURCE)) process.exit(0);

execFile(
  process.execPath,
  [CHECK, '--src', join(projectDir, SOURCE)],
  (error, stdout, stderr) => {
    if (!error) process.exit(0);
    const failures = stdout.trim() || stderr.trim();
    if (!failures) process.exit(0);
    process.stderr.write(
      `The token check fails after the edit to ${edited}:\n${failures}\n` +
        'Fix the source so the check passes before you continue. The rules are in packages/tokens/AGENTS.md.\n',
    );
    process.exit(2);
  },
);
