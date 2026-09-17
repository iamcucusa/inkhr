// Checks every commit message in a range, for pre-push and CI.
// Takes anything git rev-list accepts: "base..head", or "<sha> --not --remotes"
// for a branch the remote does not have yet.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkMessage, report } from './check-message.mjs';

const git = (args) => execFileSync('git', args, { encoding: 'utf8' });

export function commitsIn(revisions) {
  return git(['rev-list', ...revisions])
    .split('\n')
    .filter((line) => line !== '');
}

export function checkRange(revisions) {
  let broken = 0;
  for (const sha of commitsIn(revisions)) {
    const failures = checkMessage(git(['log', '-1', '--format=%B', sha]));
    if (failures.length > 0) {
      broken += 1;
      report(failures, `Commit ${sha.slice(0, 8)}`);
    }
  }
  return broken;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const revisions = process.argv.slice(2);
  if (revisions.length === 0) {
    process.stderr.write(
      'usage: check-range.mjs <base>..<head> | <sha> --not --remotes\n',
    );
    process.exit(2);
  }
  process.exit(checkRange(revisions) === 0 ? 0 : 1);
}
