// Claude Code Stop hook: before an agent finishes, runs the repository tests and the package targets. On a failure
// it refuses once, with the failing commands and their output; on the second try (stop_hook_active) it lets the agent
// finish, because failing tests are sometimes committed on purpose before the code that makes them pass.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const COMMANDS = [
  'npm test',
  'npm run check:names',
  'npx nx run-many -t check typecheck test',
];
const TAIL = 40;

const tail = (text) =>
  String(text ?? '')
    .trim()
    .split('\n')
    .slice(-TAIL)
    .join('\n');

export function beforeDone(input, commands = COMMANDS, cwd = process.cwd()) {
  if (input?.stop_hook_active) return { code: 0, message: '' };
  const failed = [];
  for (const command of commands) {
    try {
      execSync(command, { cwd, stdio: 'pipe', encoding: 'utf8' });
    } catch (error) {
      failed.push(
        `$ ${command}\n${tail(`${error.stdout ?? ''}\n${error.stderr ?? ''}`)}`,
      );
    }
  }
  if (!failed.length) return { code: 0, message: '' };
  return {
    code: 2,
    message:
      `Before you finish, these fail:\n\n${failed.join('\n\n')}\n\n` +
      'Fix them, or finish and say why they fail, for example tests committed before the code that makes them pass.\n',
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    // No input: treat it as a first stop.
  }
  const { code, message } = beforeDone(
    input,
    COMMANDS,
    process.env.CLAUDE_PROJECT_DIR ?? process.cwd(),
  );
  if (message) process.stderr.write(message);
  process.exit(code);
}
