# projects-manager - GitHub Projects v2 Boards

> GitHub Projects v2 command center -- create, configure, and manage project boards, views, custom fields, iterations, and item workflows entirely from the editor. Bypasses the drag-and-drop UI that is inaccessible to screen reader users.

---

## What This Agent Is For

GitHub Projects v2 is a powerful planning tool, but its web UI is built around drag-and-drop cards, visual Kanban swimlanes, and mouse-driven column configuration. For screen reader users, rearranging items, creating custom fields, managing iterations, and switching between board and table views are either impossible or require laborious workarounds.

The projects-manager gives you full control over Projects v2 through conversational commands. Every operation that the web UI performs through drag-and-drop or inline editing is available here through the GraphQL API -- creating projects, adding items, configuring fields, managing iterations, and building filtered views.

Use projects-manager when:

- You need to create a new project board and configure it with custom fields
- You want to add issues or PRs to a project without navigating the web UI
- You need to create or modify iteration cycles for sprint planning
- You want to build filtered views (by status, assignee, label, iteration)
- You need to bulk-update item fields across many issues at once
- The drag-and-drop board UI is not accessible with your assistive technology

---

## How to Launch It

### GitHub Copilot (VS Code)

```text
@projects-manager create a new project board
@projects-manager add all open bugs to the project
@projects-manager create a Status field with To Do, In Progress, Done
@projects-manager set up two-week iterations starting next Monday
@projects-manager show me all items in the current iteration
```

### Claude Code (Terminal)

```bash
/projects-manager create project board
/projects-manager add issues to project
/projects-manager create iteration field
/projects-manager list project items
```

### Via GitHub Hub

```text
@github-hub create a project board for this repo
@github-hub show my project items
```

---

## Capabilities

<details>
<summary>Expand full capability reference</summary>

| Category | What it does | API |
|----------|-------------|-----|
| **Project CRUD** | Create, read, update, close, delete, and reopen projects | GraphQL ProjectV2 mutations |
| **Custom fields** | Create single-select, iteration, number, date, and text fields | GraphQL field mutations |
| **Field options** | Add, rename, reorder, and remove options on single-select fields | GraphQL option mutations |
| **Items** | Add issues and PRs to a project, remove items, archive items | GraphQL item mutations |
| **Field values** | Set status, iteration, priority, or any custom field on items | GraphQL field value mutations |
| **Iterations** | Create iteration fields, define iteration cycles, assign items to sprints | GraphQL iteration mutations |
| **Views** | Create table, board, and roadmap views with filters and group-by | GraphQL view mutations |
| **Bulk operations** | Update fields across multiple items in a single command | Batched GraphQL mutations |
| **Project listing** | List all projects for an org or user with item counts | GraphQL ProjectV2 queries |

</details>

---

## What to Expect - Step by Step

### Creating a Sprint Board

1. **Project creation:**

   ```text
    Creating project "Q2 Sprint Board"...
    Project created: https://github.com/orgs/acme/projects/42
   ```

2. **Field setup.** The agent creates standard fields: Status (To Do, In Progress, In Review, Done), Priority (P0-P3), Sprint (iteration field with two-week cycles).

3. **Item population.** You specify which issues to add -- by label, milestone, or list. The agent adds each item and sets initial field values.

4. **View configuration.** The agent creates a board view grouped by Status and a table view filtered to the current iteration.

5. **Summary.** The agent reports what was created: project URL, field count, item count, and view links.

### Adding Items to a Project

1. The agent queries your repository for matching issues or PRs
2. Each item is added to the project via GraphQL
3. You can set field values (status, priority, iteration) during or after adding
4. The agent confirms each addition with the item title and number

### Managing Iterations

1. The agent creates an iteration field if one does not exist
2. You define cycle length (one week, two weeks, custom) and start date
3. The agent creates iteration instances and names them
4. Items can be assigned to iterations individually or in bulk

---

## Handoffs

<details>
<summary>Expand agent connections</summary>

| Handoff | When | Agent |
|---------|------|-------|
| Route from hub | "manage my project board" or "set up sprints" | [github-hub](github-hub.md) |
| Issue triage | After triaging issues, add them to a project board | [issue-tracker](issue-tracker.md) |
| PR tracking | Track pull requests through project board columns | [pr-review](pr-review.md) |

</details>

---

## Related Agents

| Agent | Relationship |
|-------|-------------|
| [github-hub](github-hub.md) | Parent router -- delegates project commands here |
| [issue-tracker](issue-tracker.md) | Triages issues that feed into project boards |
| [pr-review](pr-review.md) | Reviews PRs that are tracked on project boards |
| [repo-manager](repo-manager.md) | Sets up repo infrastructure that projects organize |
| [analytics](analytics.md) | Provides metrics that inform project planning |

---

## Troubleshooting

<details>
<summary>Show troubleshooting help</summary>

**"The project was not found."**
Projects v2 uses numeric project IDs scoped to an organization or user. Provide the org name and project number: "show project 42 in the acme org."

**"Permission denied when creating a project."**
You need the `project` scope on your token and admin or write access to the organization. Check your token permissions with `gh auth status`.

**"I cannot add an issue from another repository."**
Projects v2 supports cross-repo items within the same organization. Specify the full repo: "add acme/frontend#123 to the project."

**"Field values are not sticking."**
Single-select field values must match an existing option exactly. Ask: "show me the options for the Status field" to see valid values.

</details>
