// Claude Code PreToolUse hook: checks the message of a `git commit` command
// before git runs, so the agent is told which rule it broke and can fix it.
// A command whose message cannot be read passes through to the commit-msg hook.
import { fileURLToPath } from 'node:url';
import { checkMessage } from './check-message.mjs';

// -m "..." / -m '...' / --message=... , and heredocs: -m "$(cat <<'EOF' ... EOF)"
export function extractMessage(command) {
  // `git commit` as a command, not the words inside a quoted string: it must
  // start the command or follow a separator, and git's own flags may precede
  // the subcommand, as in `git -C . commit`.
  const invocation =
    /(?:^|[\n;&|]\s*)git\s+(?:-{1,2}[\w-]+(?:=\S+)?\s+(?:[^\s-]\S*\s+)?)*commit(?:\s|$)/;
  if (!invocation.test(command)) return undefined;

  const heredoc = /<<-?\s*'?(\w+)'?\n([\s\S]*?)\n\s*\1\b/.exec(command);
  if (heredoc) return heredoc[2];

  const parts = [];
  const flag = /(?:-m|--message=?)\s*(["'])([\s\S]*?)\1/g;
  let match;
  while ((match = flag.exec(command)) !== null) parts.push(match[2]);
  return parts.length === 0 ? undefined : parts.join('\n\n');
}

export function readHookInput(raw) {
  try {
    return JSON.parse(raw)?.tool_input?.command;
  } catch {
    return undefined;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { readFileSync } = await import('node:fs');
  const command = readHookInput(readFileSync(0, 'utf8'));
  const message = command === undefined ? undefined : extractMessage(command);

  if (message !== undefined) {
    const failures = checkMessage(message);
    if (failures.length > 0) {
      process.stderr.write('This commit message breaks the commit rules:\n');
      for (const { rule, detail } of failures) {
        process.stderr.write(`  ${rule}: ${detail}\n`);
      }
      process.stderr.write(
        'Propose a corrected message; rules and examples: docs/commit-guide.md\n',
      );
      process.exit(2);
    }
  }

  process.exit(0);
}
