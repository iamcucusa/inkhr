import { describe, expect, it } from 'vitest';
import { checkMessage } from './check-message.mjs';

// An explicit empty private list keeps the tests independent of the local file.
const rules = (message) =>
  checkMessage(message, []).map((failure) => failure.rule);

describe('checkMessage', () => {
  it('accepts a message with a scope', () => {
    expect(rules('docs(repo): add the commit guide')).toEqual([]);
  });

  it('accepts a message without a scope', () => {
    expect(rules('chore: remove the unused fixture')).toEqual([]);
  });

  it('accepts a body of two lines after a blank line', () => {
    expect(
      rules('fix(tokens): use the dark surface role\n\nOne line.\nTwo.'),
    ).toEqual([]);
  });

  it('rejects a header that is not type(scope): subject', () => {
    expect(rules('added the guide')).toContain('format');
  });

  it('rejects an empty message', () => {
    expect(rules('\n\n')).toContain('format');
  });

  it('rejects an unknown type', () => {
    expect(rules('update(repo): add the commit guide')).toContain('type');
  });

  it('rejects an unknown scope', () => {
    expect(rules('docs(marketing): add the commit guide')).toContain('scope');
  });

  it('rejects a header over 72 characters', () => {
    const header = `docs(repo): ${'a'.repeat(61)}`;
    expect(header).toHaveLength(73);
    expect(rules(header)).toContain('header-length');
  });

  it('accepts a header of exactly 72 characters', () => {
    const header = `docs(repo): ${'a'.repeat(60)}`;
    expect(header).toHaveLength(72);
    expect(rules(header)).toEqual([]);
  });

  it('rejects an uppercase letter after the colon', () => {
    expect(rules('docs(repo): Add the commit guide')).toContain('lowercase');
  });

  it('rejects a trailing period', () => {
    expect(rules('docs(repo): add the commit guide.')).toContain('period');
  });

  it('rejects a body that does not follow a blank line', () => {
    expect(rules('docs(repo): add the guide\nwhy it exists')).toContain(
      'body-blank-line',
    );
  });

  it('rejects a body of three lines', () => {
    expect(rules('docs(repo): add the guide\n\none\ntwo\nthree')).toContain(
      'body-length',
    );
  });

  it('rejects a Co-Authored-By trailer', () => {
    expect(
      rules('docs(repo): add the guide\n\nCo-Authored-By: Someone <a@b.c>'),
    ).toContain('trailer');
  });

  it('rejects a generated-with trailer', () => {
    expect(
      rules('docs(repo): add the guide\n\nGenerated with the coding tool'),
    ).toContain('trailer');
  });

  it('rejects a tool name with a version', () => {
    expect(rules('docs(repo): add the guide\n\nClaude Opus 5')).toContain(
      'trailer',
    );
  });

  it('passes through the messages git writes', () => {
    expect(rules('Merge branch 001-nx-workspace into main')).toEqual([]);
    expect(rules('Revert "docs(repo): add the guide"')).toEqual([]);
    expect(rules('fixup! docs(repo): add the guide')).toEqual([]);
  });

  it('ignores git comment lines and the scissors block', () => {
    const message = [
      'docs(repo): add the guide',
      '# Please enter the commit message.',
      '# ------------------------ >8 ------------------------',
      'diff --git a/AGENTS.md b/AGENTS.md',
      'Co-Authored-By: Someone <a@b.c>',
    ].join('\n');
    expect(rules(message)).toEqual([]);
  });
});
