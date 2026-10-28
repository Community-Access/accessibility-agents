#!/usr/bin/env python3
"""Source currency checker for accessibility-agents.

Reads docs/standards/source-registry.json, fetches each source URL, computes a SHA-256
fingerprint of the response body, and compares it against the stored hash.
If a source has changed or is unreachable, it reports it in one GitHub issue
per source and kind of problem.

One issue, not one per run. The checker used to open a new issue every time a
source failed, and nothing ever updated the registry, so a source that stayed
down filed a fresh "Source Unavailable" issue every week: thirteen of them for
pdf-ua-1 between July and September 2026 (#170 to #204). It now looks for an
open issue with the same title first and updates that issue's body instead.

A refusal is not an outage. pdfa.org and docs.wxwidgets.org answer scripted
requests with 403 from a bot check while serving the page to a browser, so a
401, 403 or 429 is reported as "could not verify; check by hand" and files
nothing. A 404, 410, a 5xx or a failed connection still files an issue.

No workflow runs it at present; run it by hand with GITHUB_TOKEN set. Without
a token it is a dry run and says what it would do.
"""

import hashlib
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

REGISTRY_PATH = Path(__file__).resolve().parents[2] / "docs" / "standards" / "source-registry.json"
GITHUB_API = "https://api.github.com"
REPO = os.environ.get("GITHUB_REPOSITORY", "Community-Access/accessibility-agents")
TOKEN = os.environ.get("GITHUB_TOKEN", "")

FREQUENCY_DAYS = {
    "daily": 1,
    "weekly": 7,
    "monthly": 30,
    "quarterly": 90,
}

# Statuses a site's bot protection gives a script while serving the page to a
# person. They say nothing about whether the source moved.
REFUSED = {401, 403, 429}

BROKEN_LABELS = ["source-broken", "urgent"]
UPDATE_LABELS = ["source-update", "agent-review-needed"]


def load_registry() -> dict:
    with open(REGISTRY_PATH, encoding="utf-8") as f:
        return json.load(f)


def is_due(source: dict, now: datetime | None = None) -> bool:
    """Check if a source is due for a currency check based on its frequency."""
    last = source.get("lastVerified", "")
    freq = source.get("checkFrequency", "monthly")
    if not last:
        return True
    try:
        last_dt = datetime.fromisoformat(last).replace(tzinfo=timezone.utc)
    except ValueError:
        return True
    threshold = timedelta(days=FREQUENCY_DAYS.get(freq, 30))
    return (now or datetime.now(timezone.utc)) - last_dt >= threshold


def fetch_hash(url: str) -> tuple[str, int]:
    """Fetch URL content and return (sha256_hex, status_code)."""
    req = Request(url, headers={"User-Agent": "accessibility-agents-currency-check/1.0"})
    try:
        with urlopen(req, timeout=30) as resp:
            body = resp.read()
            return hashlib.sha256(body).hexdigest(), resp.status
    except HTTPError as e:
        return "", e.code
    except (URLError, OSError):
        return "", 0


def github(method: str, path: str, payload: dict | None = None):
    """One GitHub REST call. Returns the decoded JSON, or None on failure."""
    data = json.dumps(payload).encode() if payload is not None else None
    req = Request(
        f"{GITHUB_API}{path}",
        data=data,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        method=method,
    )
    try:
        with urlopen(req, timeout=30) as resp:
            return json.loads(resp.read() or b"null")
    except (HTTPError, URLError) as e:
        print(f"  GitHub {method} {path} failed: {e}")
        return None


def find_open_issue(title: str, labels: list[str], api=github) -> dict | None:
    """The open issue (not pull request) with exactly this title, if any.

    Filtered by the first label so the scan stays short, and paged, because a
    source that has been down for months may have many issues open already.
    """
    page = 1
    while True:
        items = api(
            "GET",
            f"/repos/{REPO}/issues?state=open&labels={quote(labels[0])}&per_page=100&page={page}",
        )
        if not items:
            return None
        for item in items:
            if "pull_request" not in item and item.get("title") == title:
                return item
        if len(items) < 100:
            return None
        page += 1


def report_issue(title: str, body: str, labels: list[str], api=github) -> str:
    """File the problem once: update the open issue with this title, or open one.

    Returns what it did: "created", "updated", "unchanged", "dry-run" or
    "failed".
    """
    if not TOKEN and api is github:
        print(f"  [DRY RUN] Would open or update issue: {title}")
        return "dry-run"

    existing = find_open_issue(title, labels, api)
    if existing:
        number = existing.get("number")
        if (existing.get("body") or "").strip() == body.strip():
            print(f"  Issue #{number} already reports this: {title}")
            return "unchanged"
        if api("PATCH", f"/repos/{REPO}/issues/{number}", {"body": body}) is None:
            return "failed"
        print(f"  Updated issue #{number}: {title}")
        return "updated"

    result = api("POST", f"/repos/{REPO}/issues", {"title": title, "body": body, "labels": labels})
    if result is None:
        return "failed"
    print(f"  Created issue #{result.get('number', '?')}: {title}")
    return "created"


def unavailable_body(source: dict, status: int) -> str:
    sid = source.get("id", "unknown")
    return (
        f"## Source Currency Alert\n\n"
        f"The source **{sid}** is unreachable.\n\n"
        f"- **URL:** {source.get('url', '')}\n"
        f"- **HTTP Status:** {status if status else 'Connection failed'}\n"
        f"- **Last Verified:** {source.get('lastVerified', 'never')}\n"
        f"- **Affected Agents:** {', '.join(source.get('agents', []))}\n\n"
        f"### Action Required\n\n"
        f"1. Verify the URL is still correct\n"
        f"2. Find the new URL if the resource moved\n"
        f"3. Update docs/standards/source-registry.json\n"
        f"4. Update affected agent files if source URLs changed\n\n"
        f"The checker updates this issue on later runs rather than opening another one.\n"
    )


def changed_body(source: dict, stored_hash: str, new_hash: str) -> str:
    sid = source.get("id", "unknown")
    return (
        f"## Source Currency Alert\n\n"
        f"The content of **{sid}** has changed since last verification.\n\n"
        f"- **URL:** {source.get('url', '')}\n"
        f"- **Previous SHA-256:** `{stored_hash[:16]}...`\n"
        f"- **Current SHA-256:** `{new_hash[:16]}...`\n"
        f"- **Version:** {source.get('version', 'unknown')}\n"
        f"- **Last Verified:** {source.get('lastVerified', 'never')}\n"
        f"- **Affected Agents:** {', '.join(source.get('agents', []))}\n\n"
        f"### Action Required\n\n"
        f"1. Review the source for relevant changes\n"
        f"2. Update affected agents if guidance changed\n"
        f"3. Update SHA-256 and lastVerified in docs/standards/source-registry.json\n"
        f"4. Update version number if a new spec version was published\n\n"
        f"The checker updates this issue on later runs rather than opening another one.\n"
    )


def check_source(source: dict, fetch=fetch_hash, report=report_issue) -> str:
    """Check one source. Returns ok, refused, unavailable, changed or initial."""
    sid = source.get("id", "unknown")
    url = source.get("url", "")
    print(f"  [{sid}] Checking {url}...")
    new_hash, status = fetch(url)

    if status in REFUSED:
        print(
            f"  [{sid}] HTTP {status}: the site refused an automated request. "
            f"This is usually a bot check, not a moved page; verify it in a browser."
        )
        return "refused"

    if status == 0 or status >= 400:
        report(f"Source Unavailable: {sid}", unavailable_body(source, status), BROKEN_LABELS)
        return "unavailable"

    stored_hash = source.get("sha256", "")
    if stored_hash and new_hash != stored_hash:
        report(f"Source Update Detected: {sid}", changed_body(source, stored_hash, new_hash), UPDATE_LABELS)
        return "changed"
    if not stored_hash:
        print(f"  [{sid}] Initial fingerprint: {new_hash[:16]}...")
        return "initial"
    print(f"  [{sid}] No change detected")
    return "ok"


def main() -> int:
    registry = load_registry()
    sources = registry.get("sources", [])
    counts: dict[str, int] = {}
    skipped = 0

    print(f"Source Currency Check - {len(sources)} sources registered")
    print("=" * 60)

    for source in sources:
        if not is_due(source):
            skipped += 1
            print(f"  [{source.get('id', 'unknown')}] Not due yet, skipping")
            continue
        outcome = check_source(source)
        counts[outcome] = counts.get(outcome, 0) + 1

    print("\n" + "=" * 60)
    summary = ", ".join(f"{k}: {v}" for k, v in sorted(counts.items())) or "none checked"
    print(f"Skipped: {skipped} | {summary}")
    if counts.get("refused"):
        print("Refused sources were not filed; check them by hand and update lastVerified.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
