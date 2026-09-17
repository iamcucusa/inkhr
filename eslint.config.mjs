import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
];
