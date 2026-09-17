import { describe, expect, it, vi } from 'vitest';
import { checkDisclosure, termPattern } from './disclosure.mjs';
import { checkMessage } from './check-message.mjs';

const none = [];
const rules = (text, terms) =>
  checkDisclosure(text, terms).map((failure) => failure.rule);

describe('checkDisclosure', () => {
  it('accepts a message about the domain', () => {
    expect(rules('feat(angular): add the leave request form', none)).toEqual(
      [],
    );
  });

  it('rejects a generic term, its plural and its possessive', () => {
    expect(rules('docs: answer the recruiter', none)).toEqual(['disclosure']);
    expect(rules('docs: answer the recruiters', none)).toEqual(['disclosure']);
    expect(rules("docs: use the recruiter's wording", none)).toEqual([
      'disclosure',
    ]);
  });

  it('rejects a multi-word term and possessive framing', () => {
    expect(rules('docs: send to the hiring manager', none)).toEqual([
      'disclosure',
    ]);
    expect(rules('docs: match their stack', none)).toEqual(['disclosure']);
  });

  it('rejects an exempt word used as prose', () => {
    expect(rules('docs: prepare the application', none)).toEqual([
      'disclosure',
    ]);
  });

  it('accepts an exempt word inside a code span', () => {
    expect(rules('fix(angular): boot the `application` once', none)).toEqual(
      [],
    );
  });

  it('rejects a name from the private list, whatever its case', () => {
    expect(rules('docs: rename for Northwind', ['Northwind'])).toEqual([
      'disclosure',
    ]);
    expect(rules('docs: rename for northwind', ['Northwind'])).toEqual([
      'disclosure',
    ]);
  });

  it('notices a missing private list without failing', () => {
    const stderr = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
    expect(rules('docs(repo): add the guide', null)).toEqual([]);
    expect(stderr.mock.calls.join('')).toContain('.disclosure-terms.local');
    stderr.mockRestore();
  });

  it('never reports the text it matched', () => {
    const [failure] = checkDisclosure('docs: rename for Northwind', [
      'Northwind',
    ]);
    expect(failure.detail).not.toContain('Northwind');
    expect(failure.rule).toBe('disclosure');
  });

  it('matches on word boundaries only', () => {
    expect(termPattern('cv').test('service')).toBe(false);
    expect(termPattern('interview').test('an interview')).toBe(true);
  });
});

describe('checkMessage with the disclosure check', () => {
  it('rejects a message that breaks the disclosure rule', () => {
    const failures = checkMessage('docs(repo): tidy before the interview', []);
    expect(failures.map((failure) => failure.rule)).toContain('disclosure');
  });
});
