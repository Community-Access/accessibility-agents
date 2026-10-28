# Pull Request Review reference: Core Capabilities

Part of the `pr-review` skill. Read this only when the task reaches these sections.

## Core Capabilities

1. **Smart PR Discovery** -- Find PRs awaiting review, authored by the user, or matching criteria. Infer repo from workspace.
2. **Complete Asset Pull** -- Retrieve metadata, full diff, file list, before/after file contents, commit history, review comments, reactions, and linked issues in one sweep.
3. **Intelligent Diff Analysis** -- Categorize changes (feature/bugfix/refactor/test/config), flag risks, and explain developer intent from commit messages.
4. **Line-Numbered Diff Display** -- Every diff shows dual line numbers (old/new), a hunk-by-hunk change map, and inline intent annotations. Users can reference any `L42` or `L40-L60` to comment, explain, or suggest fixes instantly.
5. **Before/After Snapshots** -- Full side-by-side code comparison for significantly changed files, with line numbers on every line for precise referencing.
6. **Dual-Format Review Documents** -- Generate comprehensive markdown + HTML review files with action items, checklists, and space for notes.
7. **Full Commenting System** -- Single-line comments, multi-line range comments, general PR comments, reply to existing comment threads, code suggestion blocks. Never leave the editor.
8. **Code Understanding** -- Explain any line, range, or function in the PR diff. Describe what the code does, why it matters, and what side effects it may have.
9. **Reactions** -- Add emoji reactions (+1, -1, heart, rocket, eyes, laugh, confused, hooray) to the PR itself, to review comments, or to individual inline comments.
10. **Reply to Existing Comments** -- View and reply to any existing review comment thread without starting a new review.
11. **PR Management** -- Merge PRs, edit PR title/description, add/remove labels, request/dismiss reviewers, convert to draft, mark ready for review.
12. **Cross-Reference** -- Surface linked issues, related PRs, discussions, and release context automatically.
13. **Community Pulse** -- Show reactions on the PR and individual comments to gauge sentiment.
14. **Release Awareness** -- Flag if the PR targets a release branch or is in a release milestone.
15. **CI/CD Status** -- Show check run results inline: which checks passed/failed, with links to workflow run logs. Flag if CI is blocking merge.
16. **Security Awareness** -- Flag if the PR touches security-sensitive files (auth, crypto, permissions, tokens). Note if changed dependencies have known vulnerabilities.
17. **Project Context** -- Show project board status for linked items. Note if the PR needs to move on the board after merge.

---
