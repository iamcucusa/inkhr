import { execFile } from 'node:child_process';
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';

const HOOK = fileURLToPath(new URL('./after-token-edit.mjs', import.meta.url));
const SRC = fileURLToPath(
  new URL('../../packages/tokens/src/', import.meta.url),
);
const TIMEOUT = 30_000;

let project;
afterEach(() => project && rmSync(project, { recursive: true, force: true }));

// A project folder holding a copy of the token source, optionally with a dotted state in the light file.
function makeProject({ broken = false } = {}) {
  project = mkdtempSync(join(tmpdir(), 'inkhr-hook-'));
  const src = join(project, 'packages', 'tokens', 'src');
  cpSync(SRC, src, { recursive: true });
  if (broken) {
    const light = join(src, 'modes', 'light.json');
    const doc = JSON.parse(readFileSync(light, 'utf8'));
    doc.sys.action.primary.bg.hover = {
      $type: 'color',
      $value: '{ref.color.cobalt.800}',
      $description: 'A fixture role.',
    };
    writeFileSync(light, JSON.stringify(doc, null, 2));
  }
  return project;
}

// Runs the hook as Claude Code does: the tool input as JSON on stdin, the project in CLAUDE_PROJECT_DIR.
function runHook(filePath) {
  return new Promise((resolve) => {
    const child = execFile(
      process.execPath,
      [HOOK],
      { env: { ...process.env, CLAUDE_PROJECT_DIR: project } },
      (error, stdout, stderr) =>
        resolve({ code: error ? error.code : 0, stderr }),
    );
    child.stdin.end(
      JSON.stringify({
        hook_event_name: 'PostToolUse',
        tool_name: 'Edit',
        tool_input: { file_path: filePath },
      }),
    );
  });
}

describe('after-token-edit', () => {
  it(
    'runs nothing for a file outside the token source',
    async () => {
      makeProject({ broken: true });
      // The source is broken, so a pass here means the check did not run.
      expect(await runHook(join(project, 'README.md'))).toEqual({
        code: 0,
        stderr: '',
      });
    },
    TIMEOUT,
  );

  it(
    'passes an edit that leaves the source valid',
    async () => {
      makeProject();
      const result = await runHook(
        join(project, 'packages/tokens/src/modes/light.json'),
      );
      expect(result.code).toBe(0);
    },
    TIMEOUT,
  );

  it(
    'returns the broken rule to the agent with exit 2',
    async () => {
      makeProject({ broken: true });
      const result = await runHook(
        join(project, 'packages/tokens/src/modes/light.json'),
      );
      expect(result.code).toBe(2);
      expect(result.stderr).toContain('inkhr/naming');
      expect(result.stderr).toContain('sys.action.primary.bg.hover');
    },
    TIMEOUT,
  );
});
