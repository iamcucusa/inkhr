# Progress

State across sessions, for people and agents. Read this, then `git log --oneline -15`, then run `npm test` before new work. One row per spec; the row changes in the same commit as the work it reports. Tasks are ticked in the spec's `tasks.md`, decisions live in the design workspace's `docs/decisions.md`, and the colour work and its order are in that workspace's `docs/stage-0-colours-slice-1-plan.md`; this file points at them and repeats nothing.

## Now

Stage 0, colour slice 1 done: specs 003 to 005 merged on 23 September 2026, and spec 006, which closes a gap found in gate 1 after the slice, on 24 September 2026. Specs 007 to 009, the field hover role, the dark boundary step and the non-colour cues, are in progress on one branch, from decision 26 in the design workspace. Next action: the tasks below, then colour slice 2 (the contrast gate) or the next token group, as the design lead chooses.

## Specs

| Stage | Spec                     | Status       | Next action                           | Who   | Updated    |
| ----- | ------------------------ | ------------ | ------------------------------------- | ----- | ---------- |
| 0     | `007-field-hover-role`   | in review    | pull request, with 008 and 009        | agent | 2026-09-25 |
| 0     | `008-dark-boundary-step` | in review    | pull request, with 007 and 009        | agent | 2026-09-25 |
| 0     | `009-colour-never-alone` | implementing | task 2, the design guide and the gaps | agent | 2026-09-25 |

Status, and who sets it: not started (nobody yet); drafted (the agent, in the commit that adds the spec folder); approved (the design lead, or the agent in its next commit on the design lead's word); tests committed (the agent, with the failing tests); implementing (the agent; each task commit moves Next action to the next task); in review (the agent, in the last commit before the pull request opens); blocked (the agent or a person; Next action names what unblocks it and who).

No status says the work landed. `in review` is the last one written, and the row leaves this table once the work merges, in whatever commit comes next. Git and the pull requests beat this table: a row either of them contradicts is wrong, and where they disagree the lower status wins, because a false finished costs more than a false in progress.

## Interrupted work

Empty when every task ended in a commit. Otherwise: spec and task, the `git status --porcelain` output, the last command run and what it said, what is broken, the next step. Cleared in the commit that finishes the task.

## Loop measurement

Human correction rounds after a spec was approved, the measure decision 17 sets at two or fewer. Counted in each pull request.

| Spec                         | Rounds | Pull request |
| ---------------------------- | ------ | ------------ |
| `003-colour-tokens-build`    | 1      | #4           |
| `004-colour-tokens-check`    | 1      | #5           |
| `005-colour-tokens-names`    | 0      | #6           |
| `006-colour-role-references` | 0      | #8           |

## Stages

| Stage       | Covers                                                | Status                                                                           |
| ----------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| 0           | tokens, checks, agent files, hooks, the Angular spike | in progress: colour slice 1 done; colour slice 2 and the other token groups next |
| 1 and later | the Roadmap board                                     | not started                                                                      |

## Rules for this file

- A person never ticks tasks here, never pastes file lists, and never writes reasons; those go to the spec, the pull request or the decision log.
- Blocked at any step: Status `blocked`, Next action names the question, Who names the role that answers it.
- A session that stops inside a task fills Interrupted work, quoting `git status --porcelain` rather than a recalled list.
