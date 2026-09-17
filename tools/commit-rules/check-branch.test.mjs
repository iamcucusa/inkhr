import { describe, expect, it } from 'vitest';
import { checkBranch } from './check-branch.mjs';

const rules = (name) => checkBranch(name).map((failure) => failure.rule);

describe('checkBranch', () => {
  it('accepts a spec branch named after its folder', () => {
    expect(rules('002-commit-rules')).toEqual([]);
  });

  it('accepts a type branch', () => {
    expect(rules('fix/tokens-dark-contrast')).toEqual([]);
    expect(rules('build/deps-angular-22-2')).toEqual([]);
  });

  it('rejects a tool prefix', () => {
    expect(rules('claude/some-work')).toContain('format');
  });

  it('rejects uppercase and underscores', () => {
    expect(rules('Feature_X')).toContain('format');
  });

  it('rejects an unknown type segment', () => {
    expect(rules('feature/dark-mode')).toContain('format');
  });

  it('rejects a name over 50 characters', () => {
    expect(rules(`fix/${'a'.repeat(50)}`)).toContain('branch-length');
  });

  it('passes through main and the release branch', () => {
    expect(rules('main')).toEqual([]);
    expect(rules('changeset-release/main')).toEqual([]);
  });
});
