// Generic hiring and portfolio vocabulary, committed because it names nobody.
// Proper nouns belong in .disclosure-terms.local, which is never committed.
//
// Each entry matches case-insensitively, on word boundaries, together with its
// "s", "es" and "'s" forms, so plurals and possessives need no entry of their own.
export const GENERIC_TERMS = [
  'recruiter',
  'recruiting',
  'interview',
  'hiring manager',
  'take-home',
  'coding challenge',
  'candidate',
  'applicant',
  'job offer',
  'resume',
  'portfolio',
  'screening',
  'my employer',
  'the client',
  'their stack',
];

// Words that also have an innocent technical meaning. They are only a slip
// outside a code span: `application` in backticks is a program, not a job.
export const CODE_SPAN_EXEMPT_TERMS = ['application', 'assessment'];
