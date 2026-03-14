# Accessibility Testing CI Workflow Template

Copy this workflow into your project at `.github/workflows/a11y-tests.yml` and adjust the configuration to match your setup.

## GitHub Actions Workflow

```yaml
name: Accessibility Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  a11y-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Start dev server
        run: npm run dev &
        env:
          CI: true

      - name: Wait for server
        run: npx wait-on http://localhost:3000 --timeout 30000

      - name: Run accessibility tests
        run: npx playwright test tests/a11y/ --reporter=list

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: a11y-test-results
          path: test-results/
          retention-days: 14
```

## Configuration Notes

### Dev Server

Replace `npm run dev` with your actual dev server command. Common alternatives:

- `npm start`
- `npx vite --port 3000`
- `npx next dev`
- `npx serve dist`

### Base URL

Update `http://localhost:3000` in both the `wait-on` step and your `playwright.config.ts` to match your dev server port.

### Browser Selection

The template installs only Chromium for speed. `@axe-core/playwright` is most reliable with Chromium. If you need multi-browser testing for structural checks (keyboard, focus), add `-p firefox` or `-p webkit` to the install step.

### PR Comments (Optional)

Add this step after the test run to post results as a PR comment:

```yaml
      - name: Comment on PR
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const results = fs.readFileSync('test-results/results.json', 'utf8');
            const parsed = JSON.parse(results);
            const failed = parsed.suites?.flatMap(s => s.specs?.filter(t => t.ok === false)) || [];
            if (failed.length > 0) {
              const body = `## Accessibility Test Failures\n\n${failed.length} test(s) failed:\n\n` +
                failed.map(f => `- **${f.title}**`).join('\n');
              await github.rest.issues.createComment({
                ...context.repo,
                issue_number: context.payload.pull_request.number,
                body
              });
            }
```

### Running Locally

```bash
# Install
npm install -D playwright @axe-core/playwright
npx playwright install chromium

# Start your dev server, then:
npx playwright test tests/a11y/

# Run specific test file
npx playwright test tests/a11y/axe-rule-tests.spec.ts

# Run with UI mode for debugging
npx playwright test tests/a11y/ --ui
```
