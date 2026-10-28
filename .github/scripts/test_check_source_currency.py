"""Tests for check_source_currency.py.

The checker opened a new "Source Unavailable" issue on every run while a
source stayed down, thirteen times for pdf-ua-1 (#170 to #204). These tests
pin the two fixes: an open issue with the same title is updated rather than
duplicated, and a bot-check refusal (401, 403, 429) files nothing.

Run: python3 -m unittest discover -s .github/scripts -p "test_*.py"
"""

import importlib.util
import unittest
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("check_source_currency", HERE / "check_source_currency.py")
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)

SOURCE = {
    "id": "pdf-ua-1",
    "url": "https://pdfa.org/resource/iso-14289-pdfua/",
    "lastVerified": "2026-10-28",
    "agents": ["pdf-accessibility"],
    "checkFrequency": "quarterly",
}


class FakeGitHub:
    """Enough of the issues API to see what the checker asked for."""

    def __init__(self, issues=None):
        self.issues = list(issues or [])
        self.calls = []

    def __call__(self, method, path, payload=None):
        self.calls.append((method, path, payload))
        if method == "GET":
            page = int(path.rsplit("page=", 1)[1])
            return self.issues[(page - 1) * 100 : page * 100]
        if method == "POST":
            issue = {"number": 900 + len(self.issues), **payload}
            self.issues.append(issue)
            return issue
        if method == "PATCH":
            number = int(path.rsplit("/", 1)[1])
            for issue in self.issues:
                if issue["number"] == number:
                    issue.update(payload)
                    return issue
        return None

    def writes(self):
        return [c for c in self.calls if c[0] != "GET"]


class ReportIssue(unittest.TestCase):
    def setUp(self):
        self.title = "Source Unavailable: pdf-ua-1"
        self.body = checker.unavailable_body(SOURCE, 404)

    def test_opens_one_issue_when_none_is_open(self):
        api = FakeGitHub()
        self.assertEqual(checker.report_issue(self.title, self.body, checker.BROKEN_LABELS, api), "created")
        self.assertEqual([c[0] for c in api.writes()], ["POST"])

    def test_a_second_run_does_not_open_a_second_issue(self):
        api = FakeGitHub()
        checker.report_issue(self.title, self.body, checker.BROKEN_LABELS, api)
        self.assertEqual(checker.report_issue(self.title, self.body, checker.BROKEN_LABELS, api), "unchanged")
        self.assertEqual(len(api.issues), 1)
        self.assertEqual(len(api.writes()), 1)

    def test_a_changed_report_updates_the_open_issue(self):
        api = FakeGitHub([{"number": 204, "title": self.title, "body": "old"}])
        self.assertEqual(checker.report_issue(self.title, self.body, checker.BROKEN_LABELS, api), "updated")
        self.assertEqual(api.writes(), [("PATCH", f"/repos/{checker.REPO}/issues/204", {"body": self.body})])

    def test_an_issue_on_a_later_page_is_found(self):
        others = [{"number": n, "title": f"Source Unavailable: other-{n}", "body": ""} for n in range(100)]
        api = FakeGitHub(others + [{"number": 204, "title": self.title, "body": self.body}])
        self.assertEqual(checker.report_issue(self.title, self.body, checker.BROKEN_LABELS, api), "unchanged")

    def test_a_pull_request_with_the_same_title_is_not_reused(self):
        api = FakeGitHub([{"number": 5, "title": self.title, "body": self.body, "pull_request": {}}])
        self.assertEqual(checker.report_issue(self.title, self.body, checker.BROKEN_LABELS, api), "created")

    def test_another_source_title_is_not_reused(self):
        api = FakeGitHub([{"number": 166, "title": "Source Unavailable: wxwidgets-docs", "body": ""}])
        self.assertEqual(checker.report_issue(self.title, self.body, checker.BROKEN_LABELS, api), "created")


class CheckSource(unittest.TestCase):
    def run_with(self, status, digest="", source=SOURCE):
        filed = []
        outcome = checker.check_source(
            source,
            fetch=lambda url: (digest, status),
            report=lambda title, body, labels: filed.append(title),
        )
        return outcome, filed

    def test_a_bot_check_refusal_files_nothing(self):
        for status in (401, 403, 429):
            self.assertEqual(self.run_with(status), ("refused", []), status)

    def test_a_missing_page_files_an_unavailable_issue(self):
        for status in (404, 410, 500, 0):
            self.assertEqual(self.run_with(status), ("unavailable", ["Source Unavailable: pdf-ua-1"]), status)

    def test_changed_content_files_an_update_issue(self):
        source = {**SOURCE, "sha256": "a" * 64}
        self.assertEqual(self.run_with(200, "b" * 64, source), ("changed", ["Source Update Detected: pdf-ua-1"]))

    def test_unchanged_content_files_nothing(self):
        source = {**SOURCE, "sha256": "a" * 64}
        self.assertEqual(self.run_with(200, "a" * 64, source), ("ok", []))


class Registry(unittest.TestCase):
    def test_every_source_has_an_id_and_an_https_url(self):
        ids = set()
        for source in checker.load_registry()["sources"]:
            self.assertTrue(source.get("id"))
            self.assertNotIn(source["id"], ids, "duplicate id would share one issue title")
            ids.add(source["id"])
            self.assertTrue(source.get("url", "").startswith("https://"), source["id"])

    def test_is_due_follows_the_frequency(self):
        now = datetime(2026, 11, 1, tzinfo=timezone.utc)
        self.assertFalse(checker.is_due({"lastVerified": "2026-10-28", "checkFrequency": "monthly"}, now))
        self.assertTrue(checker.is_due({"lastVerified": "2026-09-01", "checkFrequency": "monthly"}, now))
        self.assertTrue(checker.is_due({}, now))


if __name__ == "__main__":
    unittest.main()
