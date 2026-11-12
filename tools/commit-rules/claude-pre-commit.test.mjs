import { describe, expect, it } from 'vitest';
import {
  extractMessage,
  extractMessages,
  readHookInput,
} from './claude-pre-commit.mjs';
import { checkMessage } from './check-message.mjs';

describe('extractMessages', () => {
  it('keeps each command separate instead of merging a script', () => {
    const script = [
      'git commit -m "docs(repo): add the guide"',
      'echo done',
      'git commit -m "chore: tidy"',
    ].join('\n');
    expect(extractMessages(script)).toEqual([
      'docs(repo): add the guide',
      'chore: tidy',
    ]);
  });

  it('reads a multi-line heredoc passed with -F -', () => {
    const command = [
      "git add -A && git commit -F - <<'EOF'",
      'Docs(repo): Add the guide.',
      '',
      'One line.',
      'EOF',
    ].join('\n');
    expect(extractMessages(command)).toEqual([
      'Docs(repo): Add the guide.\n\nOne line.',
    ]);
  });

  it('rejects a bad heredoc message and passes a good one', () => {
    const commit = (message) =>
      `git commit -F - <<'EOF'\n${message}\nEOF\necho done`;
    const [bad] = extractMessages(commit('Update files.'));
    expect(checkMessage(bad)).not.toEqual([]);
    const [good] = extractMessages(commit('docs(repo): add the guide'));
    expect(good).toBe('docs(repo): add the guide');
    expect(checkMessage(good)).toEqual([]);
  });

  it('reads a commit after a separator in a script', () => {
    expect(extractMessages('git add -A && git commit -m "Bad."')).toEqual([
      'Bad.',
    ]);
  });

  it('returns nothing for a script with no commit', () => {
    expect(extractMessages('npm test && npm run format:check')).toEqual([]);
  });
});

describe('extractMessage', () => {
  it('reads a -m message', () => {
    expect(extractMessage('git commit -m "docs(repo): add the guide"')).toBe(
      'docs(repo): add the guide',
    );
  });

  it('reads single quotes and --message', () => {
    expect(extractMessage("git commit -m 'chore: tidy'")).toBe('chore: tidy');
    expect(extractMessage('git commit --message="chore: tidy"')).toBe(
      'chore: tidy',
    );
  });

  it('joins repeated -m values as header and body', () => {
    expect(extractMessage('git commit -m "fix: a" -m "why"')).toBe(
      'fix: a\n\nwhy',
    );
  });

  it('reads a heredoc message', () => {
    const command = [
      "git commit -m \"$(cat <<'EOF'",
      'docs(repo): add the guide',
      '',
      'One line.',
      'EOF',
      ')"',
    ].join('\n');
    expect(extractMessage(command)).toBe(
      'docs(repo): add the guide\n\nOne line.',
    );
  });

  it('reads a commit with flags before the subcommand', () => {
    expect(extractMessage('git -C . commit -q -m "chore: tidy"')).toBe(
      'chore: tidy',
    );
  });

  it('returns nothing for a command that is not a commit', () => {
    expect(extractMessage('git status --short')).toBeUndefined();
    expect(extractMessage('npm test')).toBeUndefined();
  });

  it('ignores the words git commit inside a quoted string', () => {
    const command =
      'python3 -c \'print("Bash(git commit --no-verify*) -m \\"docs: x\\"")\'';
    expect(extractMessage(command)).toBeUndefined();
  });

  it('reads a commit after a separator', () => {
    expect(extractMessage('git add -A && git commit -m "chore: tidy"')).toBe(
      'chore: tidy',
    );
  });

  it('returns nothing when the message cannot be read', () => {
    expect(extractMessage('git commit')).toBeUndefined();
    expect(extractMessage('git commit -F message.txt')).toBeUndefined();
  });
});

describe('readHookInput', () => {
  it('takes the command from the hook input', () => {
    expect(readHookInput('{"tool_input":{"command":"git status"}}')).toBe(
      'git status',
    );
  });

  it('returns nothing for input it cannot parse', () => {
    expect(readHookInput('not json')).toBeUndefined();
    expect(readHookInput('{}')).toBeUndefined();
  });
});
