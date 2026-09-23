import { describe, expect, it } from 'vitest';
import { beforeDone } from './before-done.mjs';

const PASS = `node -e "process.exit(0)"`;
const FAIL = `node -e "console.error('3 tests failed'); process.exit(1)"`;

describe('beforeDone', () => {
  it('lets the agent finish when every command passes', () => {
    expect(beforeDone({ stop_hook_active: false }, [PASS, PASS])).toEqual({
      code: 0,
      message: '',
    });
  });

  it('refuses once with the failing command and its output', () => {
    const result = beforeDone({ stop_hook_active: false }, [PASS, FAIL]);
    expect(result.code).toBe(2);
    expect(result.message).toContain(FAIL);
    expect(result.message).toContain('3 tests failed');
  });

  it('lets the agent finish on the second try without running anything', () => {
    expect(beforeDone({ stop_hook_active: true }, [FAIL])).toEqual({
      code: 0,
      message: '',
    });
  });
});
