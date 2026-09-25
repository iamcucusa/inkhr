// The InkHR rules for gate 1, as a local Terrazzo plugin. Each rule's severity is set in terrazzo.config.mjs.
// The grammar is the one in specs/004-colour-tokens-check/design.md plus the neutral states of spec 007;
// descriptions, naming and role references cover the types in covered-types.mjs, and the other rules cover every token.
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COVERED_TYPES } from '../covered-types.mjs';

const DTCG_TYPES = [
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'number',
  'strokeStyle',
  'border',
  'transition',
  'shadow',
  'gradient',
  'typography',
];
const INKHR_TYPES = ['string', 'asset'];
const THEME_FILES = ['light.json', 'dark.json'];

const HUES = [
  'paper',
  'ink',
  'cobalt',
  'moss',
  'amber',
  'brick',
  'teal',
  'plum',
  'olive',
  'violet',
  'azure',
];
const ROLES = [
  'action',
  'status',
  'data',
  'signal',
  'selected',
  'focus',
  'avatar',
];
const PROPERTIES = ['bg', 'text', 'border', 'icon', 'ring'];
const STATES = ['hover', 'pressed'];
const NEUTRAL = {
  surface: ['page', 'default', 'raised', 'sunken', 'inverse'],
  text: [
    'primary',
    'secondary',
    'tertiary',
    'disabled',
    'link',
    'on-selected',
    'placeholder',
    'inverse',
  ],
  border: ['default', 'strong', 'subtle', 'focus'],
};
// A neutral name takes a state after its variant only where the product draws one.
const NEUTRAL_STATES = { border: { strong: ['hover'] } };

const oneOf = (words) => `(${words.join('|')})`;
// A component variant is one kebab-case word or a number, but never a property word.
const VARIANT = `(\\.(?!${oneOf(PROPERTIES)}(-|\\.|$))[a-z0-9]+(-[a-z0-9]+)*)?`;
const GRAMMAR = [
  /^ref\.color\.base\.(white|black|transparent)$/,
  new RegExp(`^ref\\.color\\.${oneOf(HUES)}\\.\\d+$`),
  new RegExp(
    `^sys\\.${oneOf(ROLES)}${VARIANT}\\.${oneOf(PROPERTIES)}(-${oneOf(STATES)})?$`,
  ),
  ...Object.entries(NEUTRAL).map(
    ([family, variants]) =>
      new RegExp(`^sys\\.${family}\\.${oneOf(variants)}$`),
  ),
  ...Object.entries(NEUTRAL_STATES).flatMap(([family, variants]) =>
    Object.entries(variants).map(
      ([variant, states]) =>
        new RegExp(`^sys\\.${family}\\.${variant}-${oneOf(states)}$`),
    ),
  ),
  /^image\.treatment\.tint$/,
];

const ALIAS = /^\{([^}]+)\}$/;
const covered = (token) => COVERED_TYPES.includes(token.$type);
const rule = (description, message, create) => ({
  meta: { docs: { description }, messages: { broken: message } },
  create,
});

// The names a DTCG document declares: every path that holds a $value.
const names = (node, path = []) =>
  '$value' in node
    ? [path.join('.')]
    : Object.entries(node)
        .filter(([key]) => !key.startsWith('$'))
        .flatMap(([key, child]) => names(child, [...path, key]));

export default function inkhrRules() {
  return {
    name: 'inkhr-rules',
    lint() {
      return {
        'inkhr/descriptions': rule(
          'Every token of a covered type has a $description.',
          '{{ id }} has no $description',
          ({ tokens, report }) => {
            for (const token of Object.values(tokens)) {
              if (covered(token) && !token.$description) {
                report({
                  messageId: 'broken',
                  data: { id: token.id },
                  node: token.source.node,
                });
              }
            }
          },
        ),

        'inkhr/naming': rule(
          'Every token of a covered type matches the naming grammar.',
          '{{ id }} is outside the naming grammar',
          ({ tokens, report }) => {
            for (const token of Object.values(tokens)) {
              if (
                covered(token) &&
                !GRAMMAR.some((shape) => shape.test(token.id))
              ) {
                report({
                  messageId: 'broken',
                  data: { id: token.id },
                  node: token.source.node,
                });
              }
            }
          },
        ),

        'inkhr/references': rule(
          'A ref references nothing; a sys token that references something references a ref.',
          '{{ id }} references {{ target }}; {{ why }}',
          ({ tokens, report }) => {
            for (const token of Object.values(tokens)) {
              // originalValue keeps the alias as written, which aliasOf resolves away.
              const raw = token.originalValue?.$value;
              const target =
                typeof raw === 'string' ? raw.match(ALIAS)?.[1] : undefined;
              if (!target) continue;
              let why;
              if (token.id.startsWith('ref.'))
                why = 'a ref never references anything';
              else if (
                token.id.startsWith('sys.') &&
                !target.startsWith('ref.')
              )
                why = 'a sys token references a ref';
              if (why) {
                report({
                  messageId: 'broken',
                  data: { id: token.id, target: `{${target}}`, why },
                  node: token.source.node,
                });
              }
            }
          },
        ),

        // Only the value as written tells a reference from a value; the parser resolves the alias away.
        'inkhr/role-reference': rule(
          'Every token of a covered type outside ref references a token.',
          '{{ id }} holds a value, not a reference; point it at a ref primitive in braces',
          ({ tokens, report }) => {
            for (const token of Object.values(tokens)) {
              if (!covered(token) || token.id.startsWith('ref.')) continue;
              const raw = token.originalValue?.$value;
              if (typeof raw === 'string' && ALIAS.test(raw)) continue;
              report({
                messageId: 'broken',
                data: { id: token.id },
                node: token.source.node,
              });
            }
          },
        ),

        'inkhr/known-type': rule(
          'Every $type is a DTCG 2025.10 type, string or asset.',
          '{{ id }} has $type {{ type }}, which is not a DTCG type, string or asset',
          ({ tokens, report }) => {
            for (const token of Object.values(tokens)) {
              if (![...DTCG_TYPES, ...INKHR_TYPES].includes(token.$type)) {
                report({
                  messageId: 'broken',
                  data: { id: token.id, type: token.$type },
                  node: token.source.node,
                });
              }
            }
          },
        ),

        'inkhr/deprecated-replacement': rule(
          'A $deprecated token names the token that replaces it.',
          '{{ id }} is $deprecated without naming its replacement in braces',
          ({ tokens, report }) => {
            for (const token of Object.values(tokens)) {
              const deprecated = token.$deprecated;
              if (deprecated === undefined || deprecated === false) continue;
              if (!(
                typeof deprecated === 'string' && /\{[^}]+\}/.test(deprecated)
              )) {
                report({
                  messageId: 'broken',
                  data: { id: token.id },
                  node: token.source.node,
                });
              }
            }
          },
        ),

        // Loading both theme files in one run silently drops one, so this rule reads the other theme file itself.
        'inkhr/theme-parity': rule(
          'The two theme files declare the same names.',
          '{{ id }} is in {{ here }} and missing from {{ there }}',
          ({ tokens, sources, report }) => {
            const files = sources.map((source) =>
              fileURLToPath(source.filename),
            );
            const theme = files.find((file) =>
              THEME_FILES.includes(basename(file)),
            );
            if (!theme) return;
            const read = (file) =>
              new Set(names(JSON.parse(readFileSync(file, 'utf8'))));
            const mine = read(theme);
            for (const other of THEME_FILES.filter(
              (file) => file !== basename(theme),
            )) {
              const theirs = read(join(dirname(theme), other));
              for (const id of mine) {
                if (!theirs.has(id)) {
                  report({
                    messageId: 'broken',
                    data: { id, here: basename(theme), there: other },
                    node: tokens[id]?.source.node,
                  });
                }
              }
              for (const id of theirs) {
                if (!mine.has(id))
                  report({
                    messageId: 'broken',
                    data: { id, here: other, there: basename(theme) },
                  });
              }
            }
          },
        ),
      };
    },
  };
}
