// Claude Code SessionStart hook: prints the state a session starts from. The Now and Interrupted work blocks of
// PROGRESS.md are typed; the git state and the merged pull requests are derived, and the pull requests beat the
// file. Claude Code adds this output to the session's context. It always exits 0.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BLOCKS = ['## Now', '## Interrupted work'];

// The named blocks of PROGRESS.md, each from its heading to the next one.
export function progressBlocks(text) {
  const sections = text.split(/^(?=## )/m);
  return sections
    .filter((section) =>
      BLOCKS.some((heading) => section.startsWith(`${heading}\n`)),
    )
    .map((section) => section.trim())
    .join('\n\n');
}

export function mergedRecently(gh) {
  const heading =
    'Merged recently (derived from the pull requests, not typed):';
  try {
    const pulls = JSON.parse(gh());
    const lines = pulls.map(
      (pull) =>
        `- #${pull.number} ${pull.headRefName} merged ${String(pull.mergedAt).slice(0, 10)}: ${pull.title}`,
    );
    return `${heading}\n${lines.join('\n') || '- none'}`;
  } catch (error) {
    return `${heading} unavailable (${String(error.message).split('\n')[0]}).`;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cwd = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const run = (command, args) =>
    execFileSync(command, args, {
      cwd,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 15_000,
    });
  const safe = (fn, fallback) => {
    try {
      return fn();
    } catch {
      return fallback;
    }
  };
  const progress = safe(
    () => progressBlocks(readFileSync(join(cwd, 'PROGRESS.md'), 'utf8')),
    'PROGRESS.md: unavailable.',
  );
  const log = safe(
    () => run('git', ['log', '--oneline', '-10']).trim(),
    'unavailable',
  );
  const status = safe(
    () => run('git', ['status', '--porcelain']).trim() || 'clean',
    'unavailable',
  );
  const merged = mergedRecently(() =>
    run('gh', [
      'pr',
      'list',
      '--state',
      'merged',
      '--limit',
      '5',
      '--json',
      'number,headRefName,mergedAt,title',
    ]),
  );
  process.stdout.write(
    `Session start: the state of this repository.\n\n${progress}\n\n` +
      `Last ten commits:\n${log}\n\ngit status --porcelain:\n${status}\n\n${merged}\n`,
  );
  process.exit(0);
}
