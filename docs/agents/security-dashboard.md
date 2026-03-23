# security-dashboard - Security Alert Triage

> GitHub security alerts command center -- triage Dependabot, code scanning, and secret scanning alerts entirely from the editor. Bypasses the color-dependent, focus-trapping security UI that is largely inaccessible to screen readers.

---

## What This Agent Is For

GitHub's security tab packs three distinct scanning systems into a single interface that relies heavily on color-coded severity badges, icon-only dismiss buttons, and dropdown menus that trap focus. For screen reader users, triaging a dozen Dependabot alerts can take longer than fixing the vulnerabilities themselves.

The security-dashboard brings all three scanning domains -- Dependabot alerts, code scanning alerts, and secret scanning alerts -- into a single conversational interface. Every alert can be listed, filtered, inspected, dismissed, or escalated without leaving the editor.

Use security-dashboard when:

- You need to review open Dependabot alerts and decide which to update or dismiss
- A code scanning run has flagged potential vulnerabilities and you need to triage them
- A secret has been detected in your repository and you need to assess exposure
- You want a summary of your repository's overall security posture
- You need to filter alerts by severity, package, or scanning tool
- You want to dismiss alerts with a reason or create issues for follow-up

---

## How to Launch It

### GitHub Copilot (VS Code)

```text
@security-dashboard show all open security alerts
@security-dashboard list critical Dependabot alerts
@security-dashboard triage code scanning results
@security-dashboard check for exposed secrets
@security-dashboard summarize security posture for this repo
```

### Claude Code (Terminal)

```bash
/security-dashboard show dependabot alerts
/security-dashboard list code scanning alerts
/security-dashboard check secret scanning
/security-dashboard security summary
```

### Via GitHub Hub

```text
@github-hub check security alerts
@github-hub are there any exposed secrets?
```

---

## Capabilities

<details>
<summary>Expand full capability reference</summary>

| Category | What it does | API |
|----------|-------------|-----|
| **Dependabot alerts** | List, filter, inspect, dismiss, and reopen Dependabot alerts | REST API Dependabot alerts |
| **Dependabot details** | Show CVE, severity, affected package, patched version, and advisory link | REST API alert details |
| **Code scanning alerts** | List, filter, inspect, and dismiss code scanning results | REST API code scanning alerts |
| **Code scanning details** | Show rule ID, severity, file location, and suggested fix | REST API alert instances |
| **Secret scanning alerts** | List, filter, inspect, and resolve secret scanning detections | REST API secret scanning alerts |
| **Secret details** | Show secret type, commit, file path, and exposure timeline | REST API alert details |
| **Severity filtering** | Filter any alert type by critical, high, medium, or low severity | Query parameters |
| **Dismissal with reason** | Dismiss alerts with a documented reason (false positive, won't fix, used in tests) | REST API dismiss endpoint |
| **Security summary** | Aggregate counts across all three domains with severity breakdown | Combined queries |
| **Issue escalation** | Create a tracking issue for alerts that need follow-up work | Handoff to issue-tracker |

</details>

---

## What to Expect - Step by Step

### Full Security Review

1. **Overview scan:**

   ```text
    Fetching security alerts for acme/backend...
    Dependabot: 3 critical, 5 high, 12 medium
    Code scanning: 1 high, 4 medium
    Secret scanning: 1 active alert
   ```

2. **Dependabot triage.** The agent lists critical alerts first, showing the vulnerable package, current version, patched version, and CVE summary. For each alert, you decide: update, dismiss (with reason), or create an issue.

3. **Code scanning review.** Each alert is shown with its rule name, severity, file location, and a snippet of the flagged code. You can dismiss false positives or mark alerts for fix.

4. **Secret scanning response.** Active secret alerts are shown with the secret type, the commit that introduced it, and whether the secret is still present in HEAD. The agent guides you through revocation steps.

5. **Summary report.** The agent produces a final tally: alerts resolved, alerts remaining, and recommended next actions.

### Triaging Dependabot Alerts

1. The agent lists all open alerts sorted by severity (critical first)
2. For each alert, it shows the package name, vulnerability description, and fix availability
3. You can dismiss with a reason: "false positive," "used in tests," or "risk accepted"
4. For alerts with available patches, the agent shows the upgrade path
5. Alerts needing code changes are escalated to issue-tracker

### Responding to a Secret Leak

1. The agent shows the secret type (API key, token, password) and where it was committed
2. It reports whether the secret is still present in the current branch
3. The agent provides revocation guidance specific to the secret type
4. After revocation, the agent helps you resolve the alert

---

## Handoffs

<details>
<summary>Expand agent connections</summary>

| Handoff | When | Agent |
|---------|------|-------|
| Route from hub | "check security" or "any vulnerabilities?" | [github-hub](github-hub.md) |
| PR for fix | After identifying a vulnerability, review the fix PR | [pr-review](pr-review.md) |
| Issue tracking | Create tracking issues for alerts requiring code changes | [issue-tracker](issue-tracker.md) |

</details>

---

## Related Agents

| Agent | Relationship |
|-------|-------------|
| [github-hub](github-hub.md) | Parent router -- delegates security commands here |
| [pr-review](pr-review.md) | Reviews PRs that fix security vulnerabilities |
| [issue-tracker](issue-tracker.md) | Tracks issues created from security alerts |
| [actions-manager](actions-manager.md) | Monitors CI runs that include security scanning steps |
| [repo-manager](repo-manager.md) | Configures Dependabot and security scanning workflows |

---

## Troubleshooting

<details>
<summary>Show troubleshooting help</summary>

**"No Dependabot alerts found."**
Dependabot must be enabled for the repository. Check Settings > Code security and analysis. If it was just enabled, alerts may take a few minutes to appear.

**"Code scanning alerts are empty."**
Code scanning requires a configured workflow (e.g., CodeQL). Ask repo-manager to scaffold a code scanning workflow if none exists.

**"Secret scanning is not available."**
Secret scanning is available on public repos and on private repos with GitHub Advanced Security. Check your plan and settings.

**"I dismissed an alert by mistake."**
Use "show dismissed alerts" to find it, then "reopen alert #N" to restore it.

</details>
