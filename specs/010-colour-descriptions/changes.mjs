// What spec 010 changes, read by verify.mjs and apply.mjs: the commits it is measured against and the tokens it touches.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

// main when the spec was written, and the design workspace export the sentences come from.
export const MAIN = '83485c3';
export const WORKSPACE = '789e6ef';

export const FILES = {
  shared: 'inkhr.tokens.json',
  light: 'modes/light.json',
  dark: 'modes/dark.json',
};

const steps = (hue, list) => list.map((step) => `ref.color.${hue}.${step}`);

// The tokens whose $description changes, per file.
export const SHARED = [
  'ref.color.base.black',
  'ref.color.base.transparent',
  'ref.color.paper.400',
  ...steps('ink', [600, 700, 800, 850, 975]),
  ...steps('cobalt', [400, 500]),
  ...steps('moss', [50, 100, 200, 300, 400, 500, 800, 900, 950]),
  ...steps('amber', [50, 100, 200, 300, 400, 500, 800, 900, 950]),
  ...steps('brick', [50, 100, 200, 500, 700, 800, 900, 950]),
  'ref.color.olive.200',
  'sys.size.target',
];
export const ROLES = [
  'sys.text.tertiary',
  'sys.border.default',
  'sys.border.strong',
  'sys.action.primary.bg-hover',
  'sys.action.secondary.bg-hover',
  'sys.signal.bg',
  'sys.signal.bg-hover',
  'sys.status.success.border',
  'sys.status.warning.border',
  'sys.status.danger.border',
  'sys.status.info.border',
  'sys.status.info.icon',
  'sys.selected.bg',
  'sys.selected.border',
  'sys.data.1.bg',
  'sys.data.2.bg',
  'sys.data.3.bg',
  'sys.data.4.bg',
  'sys.data.5.bg',
  'sys.data.6.bg',
  'image.treatment.tint',
];
export const CHANGED = { shared: SHARED, light: ROLES, dark: ROLES };

// The one token added, in both theme files, and the sentence that names it.
export const NEW_ROLE = 'sys.action.tertiary.bg';
export const NAMES_NEW_ROLE = 'ref.color.base.transparent';

export const ROOT = resolve(
  dirname(new URL(import.meta.url).pathname),
  '../..',
);
const git = (cwd, args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 26 });

// The design workspace checkout: --workspace <path>, INKHR_DESIGN, or inkhr-design beside the main checkout.
export function workspacePath(argv = process.argv) {
  const flag = argv.indexOf('--workspace');
  if (flag !== -1) return resolve(argv[flag + 1]);
  if (process.env.INKHR_DESIGN) return resolve(process.env.INKHR_DESIGN);
  const common = git(ROOT, [
    'rev-parse',
    '--path-format=absolute',
    '--git-common-dir',
  ]).trim();
  const beside = join(dirname(dirname(common)), 'inkhr-design');
  if (!existsSync(beside))
    throw new Error(
      `No design workspace at ${beside}; pass --workspace <path>.`,
    );
  return beside;
}

// The three files as main, the branch and the workspace have them, parsed.
export const atMain = (file) =>
  JSON.parse(git(ROOT, ['show', `${MAIN}:packages/tokens/src/${file}`]));
export const atWorkspace = (workspace, file) =>
  JSON.parse(git(workspace, ['show', `${WORKSPACE}:tokens/${file}`]));

// Every token in a DTCG document, in file order: [id, token].
export function tokens(node, path = []) {
  if ('$value' in node) return [[path.join('.'), node]];
  return Object.entries(node)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => tokens(child, [...path, key]));
}
