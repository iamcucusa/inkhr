import { describe, expect, it } from 'vitest';
import {
  mergedRecently,
  progressBlocks,
  switchGitHooksOn,
} from './session-start.mjs';

const PROGRESS = `# Progress

Intro.

## Now

Stage 0. Next action: task 6.

## Specs

| Stage | Spec |

## Interrupted work

Empty when every task ended in a commit.

## Stages

| Stage | Covers |
`;

describe('progressBlocks', () => {
  it('keeps the Now and Interrupted work blocks and nothing else', () => {
    const blocks = progressBlocks(PROGRESS);
    expect(blocks).toContain('## Now\n\nStage 0. Next action: task 6.');
    expect(blocks).toContain(
      '## Interrupted work\n\nEmpty when every task ended in a commit.',
    );
    expect(blocks).not.toContain('## Specs');
    expect(blocks).not.toContain('## Stages');
  });
});

describe('mergedRecently', () => {
  it('lists the merged pull requests, labelled as derived', () => {
    const gh = () =>
      JSON.stringify([
        {
          number: 4,
          headRefName: '003-colour-tokens-build',
          mergedAt: '2026-09-23T09:25:53Z',
          title: 'feat(tokens): build the colour tokens',
        },
      ]);
    const text = mergedRecently(gh);
    expect(text).toContain('derived');
    expect(text).toContain(
      '#4 003-colour-tokens-build merged 2026-09-23: feat(tokens): build the colour tokens',
    );
  });

  it('says the list is unavailable when gh fails', () => {
    const gh = () => {
      throw new Error('gh: command not found');
    };
    expect(mergedRecently(gh)).toContain('unavailable');
  });
});

describe('switchGitHooksOn', () => {
  // A fake git: answers from `config`, records what was set, throws on demand.
  const fakeGit = ({ hooksPath, inside = true, failSet = false }) => {
    const calls = [];
    const git = (args) => {
      calls.push(args.join(' '));
      if (args[0] === 'rev-parse') {
        if (!inside) throw new Error('not a git repository');
        return 'true\n';
      }
      if (args.length === 3) {
        if (hooksPath === undefined) throw new Error('exit 1');
        return `${hooksPath}\n`;
      }
      if (failSet) throw new Error('could not lock config file');
      return '';
    };
    return { git, calls };
  };
  const SET = 'config --local core.hooksPath .githooks';

  it('sets core.hooksPath when it is unset and says so', () => {
    const { git, calls } = fakeGit({});
    expect(switchGitHooksOn(git)).toContain('it was unset');
    expect(calls).toContain(SET);
  });

  it('replaces another value and names it', () => {
    const { git, calls } = fakeGit({ hooksPath: '.husky' });
    expect(switchGitHooksOn(git)).toContain('it was .husky');
    expect(calls).toContain(SET);
  });

  it('does nothing when the hooks are already on', () => {
    const { git, calls } = fakeGit({ hooksPath: '.githooks' });
    expect(switchGitHooksOn(git)).toBe('');
    expect(calls).not.toContain(SET);
  });

  it('does nothing outside a git checkout', () => {
    const { git, calls } = fakeGit({ inside: false });
    expect(switchGitHooksOn(git)).toBe('');
    expect(calls).not.toContain(SET);
  });

  it('reports a failure instead of throwing', () => {
    const { git } = fakeGit({ failSet: true });
    expect(switchGitHooksOn(git)).toContain('could not set core.hooksPath');
  });
});
