# Progress

State across sessions, for people and agents. Read this, then `git log --oneline -15`, then run `npm test` before new work. One row per spec; the row changes in the same commit as the work it reports. Tasks are ticked in the spec's `tasks.md`, decisions live in the design workspace's `docs/decisions.md`, and the colour work and its order are in that workspace's `docs/stage-0-colours-slice-1-plan.md`; this file points at them and repeats nothing.

## Now

Stage 0, colour slice 1. Phase: spec 003 approved, task 2 of 9 done. Next action: write the failing tests (task 3).

## Specs

| Stage | Spec                       | Status      | Next action                       | Who   | Updated    |
| ----- | -------------------------- | ----------- | --------------------------------- | ----- | ---------- |
| 0     | `003-colour-tokens-build`  | approved    | Write the failing tests (task 3)  | agent | 2026-09-23 |
| 0     | 004, gate 1 and the hooks  | not started | Draft the spec once 003 is merged | agent | 2026-09-23 |
| 0     | 005, names and agent files | not started | Draft the spec once 004 is merged | agent | 2026-09-23 |

Status, and who sets it: not started (nobody yet); drafted (the agent, in the commit that adds the spec folder); approved (the design lead, or the agent in its next commit on the design lead's word); tests committed (the agent, with the failing tests); implementing (the agent; each task commit moves Next action to the next task); in review (the agent, in the last commit before the pull request opens); blocked (the agent or a person; Next action names what unblocks it and who).

No status says the work landed. `in review` is the last one written, and the row leaves this table once the work merges, in whatever commit comes next. Git and the pull requests beat this table: a row either of them contradicts is wrong, and where they disagree the lower status wins, because a false finished costs more than a false in progress.

## Interrupted work

Empty when every task ended in a commit. Otherwise: spec and task, the `git status --porcelain` output, the last command run and what it said, what is broken, the next step. Cleared in the commit that finishes the task.

## Stages

| Stage       | Covers                                                | Status                                                           |
| ----------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| 0           | tokens, checks, agent files, hooks, the Angular spike | in progress, colour slice first, the other token groups after it |
| 1 and later | the Roadmap board                                     | not started                                                      |

## Rules for this file

- A person never ticks tasks here, never pastes file lists, and never writes reasons; those go to the spec, the pull request or the decision log.
- Blocked at any step: Status `blocked`, Next action names the question, Who names the role that answers it.
- A session that stops inside a task fills Interrupted work, quoting `git status --porcelain` rather than a recalled list.
