// Claude Code PostToolUse hook: formats the file an agent just edited.
// Never blocks the edit: every outcome exits 0, and errors go to stderr.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

function readFilePath() {
  try {
    const input = JSON.parse(readFileSync(0, 'utf8'));
    return input?.tool_input?.file_path;
  } catch {
    return undefined;
  }
}

const projectDir = path.resolve(
  process.env.CLAUDE_PROJECT_DIR ?? process.cwd(),
);
const filePath = readFilePath();

if (typeof filePath === 'string' && filePath !== '') {
  const absolute = path.resolve(projectDir, filePath);
  const relative = path.relative(projectDir, absolute);
  const insideProject =
    relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);

  if (insideProject && existsSync(absolute)) {
    const prettier = path.join(projectDir, 'node_modules', '.bin', 'prettier');
    try {
      execFileSync(prettier, ['--write', '--ignore-unknown', relative], {
        cwd: projectDir,
        stdio: ['ignore', 'ignore', 'pipe'],
      });
    } catch (error) {
      process.stderr.write(
        `format-edited-file: prettier failed on ${relative}: ${error.stderr ?? error.message}\n`,
      );
    }
  }
}

process.exit(0);
