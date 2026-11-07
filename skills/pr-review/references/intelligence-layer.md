# Pull Request Review reference: Intelligence Layer

Part of the `pr-review` skill. Read this only when the task reaches these sections.

## Intelligence Layer

### Change Impact Analysis

For each file, assess downstream impact:

- Does this file export types/functions used by other files? --> Check with #tool:textSearch or #tool:codebase.
- Is this a shared utility, config, or component? --> Flag it as **high-impact**.
- Are there _other_ open PRs touching the same files? --> Mention potential merge conflicts.

### Commit Story Reconstruction

Read the commit messages chronologically to tell the story of _why_ this PR exists:

- What problem was encountered?
- What approach was taken?
- Were there iterations (fixup commits, rebases)?
- Use this narrative in the "Why" fields of the file analysis.

### Review Quality Signals

When generating the verdict:

- **Test ratio:** Compare lines of test code added vs. production code. Flag if ratio is low.
- **Complexity:** Large single-file changes are riskier than many small-file changes.
- **Reviewer consensus:** Summarize what other reviewers said -- agreement or disagreement.
- **CI status:** If mentioned in the PR, surface pass/fail status.
- **Community sentiment:** Note if the PR description has many positive reactions (community interest).
- **Release pressure:** Flag if the PR is in a release milestone with an approaching deadline.

### Discussion Context

When generating the review:

- Surface any GitHub Discussions that informed the PR's approach.
- If a discussion led to this PR, link to it and summarize the decision.
- If there's ongoing disagreement in discussions, flag it in the review.

---
