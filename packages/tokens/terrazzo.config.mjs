// Gate 1: the rules the token check runs. Setting lint.rules replaces Terrazzo's recommended set, so every rule is
// listed. check.mjs passes the shared file and one theme file on the command line.
import { defineConfig } from '@terrazzo/cli';
import inkhrRules from './lint/inkhr-rules.mjs';

const VALID = [
  'color',
  'dimension',
  'font-family',
  'font-weight',
  'duration',
  'cubic-bezier',
  'number',
  'link',
  'boolean',
  'string',
  'stroke-style',
  'border',
  'transition',
  'shadow',
  'gradient',
  'typography',
];

export default defineConfig({
  tokens: ['./src/inkhr.tokens.json', './src/modes/light.json'],
  plugins: [inkhrRules()],
  lint: {
    rules: {
      ...Object.fromEntries(
        VALID.map((type) => [`core/valid-${type}`, 'error']),
      ),
      'core/required-type': 'error',
      'core/consistent-naming': ['error', { format: 'kebab-case' }],
      'inkhr/descriptions': 'error',
      'inkhr/naming': 'error',
      'inkhr/references': 'error',
      'inkhr/role-reference': 'error',
      'inkhr/known-type': 'error',
      'inkhr/deprecated-replacement': 'error',
      'inkhr/theme-parity': 'error',
    },
  },
});
