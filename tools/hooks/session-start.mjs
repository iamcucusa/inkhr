// Claude Code SessionStart hook: prints the state a session starts from. The Now and Interrupted work blocks of
// PROGRESS.md are typed; the git state and the merged pull requests are derived, and the pull requests beat the
// file. Claude Code adds this output to the session's context. It also switches the git hooks on and creates
// .disclosure-terms.local, so a clone where nobody ran npm install still checks commits. It always exits 0.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initLocalTerms } from '../commit-rules/init-local.mjs';

const BLOCKS = ['## Now', '## Interrupted work'];
const HOOKS_PATH = '.githooks';

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

// Points core.hooksPath at .githooks when it points elsewhere, as the prepare script does. `git` runs git with
// the given arguments and throws when it exits non-zero. Returns a line saying what changed, or an empty string.
export function switchGitHooksOn(git) {
  try {
    git(['rev-parse', '--is-inside-work-tree']);
  } catch {
    return '';
  }
  let current = '';
  try {
    current = git(['config', '--local', 'core.hooksPath']).trim();
  } catch {
    // Unset: git config exits 1.
  }
  if (current === HOOKS_PATH) return '';
  try {
    git(['config', '--local', 'core.hooksPath', HOOKS_PATH]);
    return `Git hooks switched on: core.hooksPath set to ${HOOKS_PATH} (it was ${current ? current : 'unset'}).`;
  } catch (error) {
    return `Git hooks: could not set core.hooksPath (${String(error.message).split('\n')[0]}).`;
  }
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
  const setup = [
    switchGitHooksOn((args) => run('git', args)),
    safe(() => initLocalTerms(cwd), ''),
  ]
    .filter(Boolean)
    .map((line) => `${line}\n`)
    .join('');
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
      `Last ten commits:\n${log}\n\ngit status --porcelain:\n${status}\n\n${merged}\n` +
      (setup ? `\n${setup}` : ''),
  );
  process.exit(0);
}
