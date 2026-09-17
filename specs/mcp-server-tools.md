# InkHR MCP server: tools

Hand-over for the Stage 4 session that builds `packages/mcp-server`. Nothing here is implemented yet. The server gives agents InkHR's components, tokens, patterns and lint rules as queries instead of pasted docs. It is listed in `.mcp.json` next to the Angular CLI MCP server, which covers current Angular practice and workspace tasks. The MCP SDK it is built on is still to choose; see `docs/stack-and-dependencies.md`.

## Tools

| Tool              | Input                        | Returns                                                                                                          |
| ----------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `list_components` | none                         | Component names, a one-line purpose and stability for each                                                       |
| `get_component`   | `name`                       | Inputs with types and defaults, outputs, content slots, style classes, keyboard map and examples                 |
| `get_tokens`      | `tier?`, `prefix?`           | Token names, types, descriptions and current values per theme                                                    |
| `get_pattern`     | `name`                       | The composition recipe: components used and copy rules                                                           |
| `lint_snippet`    | `html`, `css` or `ts` source | Violations under the same rules as CI, with fixes                                                                |
| `render_preview`  | `html`, `theme`, `density`   | A screenshot of the snippet rendered with InkHR in that theme and density, so the agent can check its own output |

## Sources

- `get_component` and `list_components` read `components.json`, emitted by Compodoc.
- `get_tokens` reads the DTCG token files in `packages/tokens/src/`.
- `lint_snippet` applies the rules of `@inkhr/eslint-plugin` and `@inkhr/stylelint-plugin`, the same ones CI runs.
