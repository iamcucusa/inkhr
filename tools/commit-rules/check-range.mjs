// Checks every commit message in a range, for pre-push and CI.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkMessage, report } from './check-message.mjs';

const git = (args) => execFileSync('git', args, { encoding: 'utf8' });

export function commitsIn(range) {
  return git(['rev-list', range])
    .split('\n')
    .filter((line) => line !== '');
}

export function checkRange(range) {
  let broken = 0;
  for (const sha of commitsIn(range)) {
    const failures = checkMessage(git(['log', '-1', '--format=%B', sha]));
    if (failures.length > 0) {
      broken += 1;
      report(failures, `Commit ${sha.slice(0, 8)}`);
    }
  }
  return broken;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const range = process.argv[2];
  if (range === undefined) {
    process.stderr.write('usage: check-range.mjs <base>..<head>\n');
    process.exit(2);
  }
  process.exit(checkRange(range) === 0 ? 0 : 1);
}
