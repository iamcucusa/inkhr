import { describe, expect, it } from 'vitest';
import { mergedRecently, progressBlocks } from './session-start.mjs';

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
