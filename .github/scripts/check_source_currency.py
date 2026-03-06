#!/usr/bin/env python3
"""Source currency checker for accessibility-agents.

Reads SOURCE_REGISTRY.json, fetches each source URL, computes a SHA-256
fingerprint of the response body, and compares it against the stored hash.
If a source has changed or is unreachable, opens a GitHub issue.

Run by: .github/workflows/source-currency-check.yml (weekly)
"""

import hashlib
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

REGISTRY_PATH = Path(__file__).resolve().parent.parent / "agents" / "SOURCE_REGISTRY.json"
GITHUB_API = "https://api.github.com"
REPO = os.environ.get("GITHUB_REPOSITORY", "Community-Access/accessibility-agents")
TOKEN = os.environ.get("GITHUB_TOKEN", "")

FREQUENCY_DAYS = {
    "daily": 1,
    "weekly": 7,
    "monthly": 30,
    "quarterly": 90,
}


def load_registry() -> dict:
    with open(REGISTRY_PATH, encoding="utf-8") as f:
        return json.load(f)


def is_due(source: dict) -> bool:
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
    return datetime.now(timezone.utc) - last_dt >= threshold


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


def create_issue(title: str, body: str, labels: list[str]) -> bool:
    """Create a GitHub issue via the REST API."""
    if not TOKEN:
        print(f"  [DRY RUN] Would create issue: {title}")
        return True

    import urllib.request
    url = f"{GITHUB_API}/repos/{REPO}/issues"
    payload = json.dumps({"title": title, "body": body, "labels": labels}).encode()
    req = Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        method="POST",
    )
    try:
        with urlopen(req, timeout=30) as resp:
            if resp.status in (200, 201):
                result = json.loads(resp.read())
                print(f"  Created issue #{result.get('number', '?')}: {title}")
                return True
            print(f"  Failed to create issue (HTTP {resp.status})")
            return False
    except (HTTPError, URLError) as e:
        print(f"  Error creating issue: {e}")
        return False


def main() -> int:
    registry = load_registry()
    sources = registry.get("sources", [])
    issues_created = 0
    sources_checked = 0
    sources_skipped = 0

    print(f"Source Currency Check - {len(sources)} sources registered")
    print("=" * 60)

    for source in sources:
        sid = source.get("id", "unknown")
        url = source.get("url", "")

        if not is_due(source):
            sources_skipped += 1
            print(f"  [{sid}] Not due yet, skipping")
            continue

        sources_checked += 1
        print(f"  [{sid}] Checking {url}...")

        new_hash, status = fetch_hash(url)

        if status == 0 or status >= 400:
            # Source is unreachable
            title = f"Source Unavailable: {sid}"
            body = (
                f"## Source Currency Alert\n\n"
                f"The source **{sid}** is unreachable.\n\n"
                f"- **URL:** {url}\n"
                f"- **HTTP Status:** {status if status else 'Connection failed'}\n"
                f"- **Last Verified:** {source.get('lastVerified', 'never')}\n"
                f"- **Affected Agents:** {', '.join(source.get('agents', []))}\n\n"
                f"### Action Required\n\n"
                f"1. Verify the URL is still correct\n"
                f"2. Find the new URL if the resource moved\n"
                f"3. Update SOURCE_REGISTRY.json\n"
                f"4. Update affected agent files if source URLs changed\n"
            )
            create_issue(title, body, ["source-broken", "urgent"])
            issues_created += 1
            continue

        stored_hash = source.get("sha256", "")
        if stored_hash and new_hash != stored_hash:
            # Content changed
            title = f"Source Update Detected: {sid}"
            body = (
                f"## Source Currency Alert\n\n"
                f"The content of **{sid}** has changed since last verification.\n\n"
                f"- **URL:** {url}\n"
                f"- **Previous SHA-256:** `{stored_hash[:16]}...`\n"
                f"- **Current SHA-256:** `{new_hash[:16]}...`\n"
                f"- **Version:** {source.get('version', 'unknown')}\n"
                f"- **Last Verified:** {source.get('lastVerified', 'never')}\n"
                f"- **Affected Agents:** {', '.join(source.get('agents', []))}\n\n"
                f"### Action Required\n\n"
                f"1. Review the source for relevant changes\n"
                f"2. Update affected agents if guidance changed\n"
                f"3. Update SHA-256 and lastVerified in SOURCE_REGISTRY.json\n"
                f"4. Update version number if a new spec version was published\n"
            )
            create_issue(title, body, ["source-update", "agent-review-needed"])
            issues_created += 1
        elif not stored_hash:
            # First run -- store the hash (informational only)
            print(f"  [{sid}] Initial fingerprint: {new_hash[:16]}...")
        else:
            print(f"  [{sid}] No change detected")

    print("\n" + "=" * 60)
    print(f"Checked: {sources_checked} | Skipped: {sources_skipped} | Issues: {issues_created}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
