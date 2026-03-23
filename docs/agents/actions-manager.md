# actions-manager - GitHub Actions Workflow Management

> GitHub Actions command center -- view workflow runs, read logs, re-run failed jobs, manage workflows, and debug CI failures entirely from the editor. Bypasses the deeply nested, visually-dependent Actions UI that is largely inaccessible to screen readers.

---

## What This Agent Is For

The GitHub Actions web UI is one of the most difficult parts of GitHub to navigate with a screen reader. Workflow runs are nested inside expandable sections, log output is rendered in a virtual-scroll container that announces nothing useful, and re-running a failed job requires finding small icon buttons with no accessible labels.

The actions-manager makes every Actions operation available through plain-text commands. You can list runs, read logs, re-run failures, and debug CI issues without ever opening the browser. All output is structured as tables and annotated text that works with any assistive technology.

Use actions-manager when:

- A CI run has failed and you need to read the failure logs
- You want to re-run a specific failed job without re-running the entire workflow
- You need to check which workflows ran on a branch or pull request
- You want to download or inspect build artifacts
- You need to enable, disable, or trigger a workflow dispatch
- You want a summary of recent CI health across your repository

---

## How to Launch It

### GitHub Copilot (VS Code)

```text
@actions-manager show recent workflow runs
@actions-manager why did CI fail on this PR?
@actions-manager re-run the failed jobs on run 12345
@actions-manager show logs for the "test" job
@actions-manager list artifacts from the latest build
```

### Claude Code (Terminal)

```bash
/actions-manager show failed runs
/actions-manager read logs for run 12345
/actions-manager re-run failed jobs
/actions-manager list workflow files
```

### Via GitHub Hub

```text
@github-hub why did CI fail?
@github-hub re-run the failed build
```

---

## Capabilities

<details>
<summary>Expand full capability reference</summary>

| Category | What it does | API |
|----------|-------------|-----|
| **List runs** | Show recent workflow runs filtered by branch, event, status, or actor | REST API workflow runs |
| **Run details** | Display timing, status, trigger event, and commit info for a run | REST API run details |
| **Job details** | List jobs within a run with individual status and duration | REST API workflow jobs |
| **Log reading** | Download and display job logs with failure annotation extraction | REST API job logs |
| **Re-run failed** | Re-run only the failed jobs in a run, not the entire workflow | REST API re-run endpoint |
| **Re-run all** | Re-run all jobs in a workflow run | REST API re-run endpoint |
| **Cancel run** | Cancel an in-progress workflow run | REST API cancel endpoint |
| **Artifacts** | List, download, and inspect artifacts from a workflow run | REST API artifacts |
| **Workflow management** | Enable, disable, list, and trigger workflows via dispatch | REST API workflow endpoints |
| **Failure diagnosis** | Extract error messages, failed steps, and annotations from logs | Log parsing and annotation API |

</details>

---

## What to Expect - Step by Step

### Diagnosing a CI Failure

1. **Run identification:**

   ```text
    Fetching recent failed runs for main branch...
    Found 1 failed run: #4521 "CI" triggered by push (3 minutes ago)
   ```

2. **Job breakdown.** The agent lists all jobs in the run with their status. Passed jobs are noted briefly; failed jobs are highlighted with the failing step name.

3. **Log extraction.** The agent downloads the failed job's logs and extracts the relevant error. You see the actual failure message, not pages of setup output.

4. **Diagnosis.** Based on the error, the agent suggests what went wrong (test failure, dependency issue, linting error, timeout) and what to do next.

5. **Re-run option.** If the failure looks transient (network timeout, flaky test), the agent offers to re-run only the failed jobs.

### Re-Running Failed Jobs

1. The agent identifies the most recent failed run (or you specify one)
2. It confirms which jobs failed and which passed
3. Only failed jobs are re-run, saving time and compute
4. The agent reports the new run URL so you can track progress

### Listing Artifacts

1. The agent queries the specified run for artifacts
2. Each artifact is listed with its name, size, and expiration date
3. You can request a download of any artifact
4. The agent extracts and summarizes artifact contents when possible

---

## Handoffs

<details>
<summary>Expand agent connections</summary>

| Handoff | When | Agent |
|---------|------|-------|
| Route from hub | "check CI status" or "why did the build fail" | [github-hub](github-hub.md) |
| PR context | After diagnosing a CI failure on a PR, hand off for code review | [pr-review](pr-review.md) |
| Issue creation | When a CI failure reveals a bug, create an issue to track it | [issue-tracker](issue-tracker.md) |

</details>

---

## Related Agents

| Agent | Relationship |
|-------|-------------|
| [github-hub](github-hub.md) | Parent router -- delegates CI and workflow commands here |
| [pr-review](pr-review.md) | Reviews PRs whose CI status this agent inspects |
| [issue-tracker](issue-tracker.md) | Creates issues for bugs discovered through CI failures |
| [repo-manager](repo-manager.md) | Scaffolds the workflow files that this agent monitors |
| [security-dashboard](security-dashboard.md) | Triages security alerts that may surface through CI scans |

---

## Troubleshooting

<details>
<summary>Show troubleshooting help</summary>

**"No workflow runs found."**
Runs are scoped to a repository. Make sure you are in a git repository and the remote points to GitHub. If filtering by branch, check the branch name is correct.

**"Cannot re-run -- the run is too old."**
GitHub only allows re-runs within 30 days of the original run. For older failures, trigger a new run instead: "dispatch the CI workflow on main."

**"Logs are too large to display."**
For very large log files, the agent extracts only the failed step output. Ask: "show only the error lines from run 12345" for a focused view.

**"Permission denied when re-running."**
You need write access to the repository to re-run workflows. Check your permissions with `gh auth status`.

</details>
