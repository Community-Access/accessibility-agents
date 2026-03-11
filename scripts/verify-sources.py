#!/usr/bin/env python3
"""
Verify authoritative sources in accessibility agents.

Scans all markdown files in .claude/agents/, .github/agents/,
claude-code-plugin/agents/, and docs/
for URLs and validates that they return HTTP 200 (or acceptable status codes
like 301/302 for redirects or 403 for temporary blocks).

Usage:
  python scripts/verify-sources.py
  
Environment:
  GITHUB_TOKEN - Optional, for higher rate limits
  TIMEOUT - Seconds to wait for each URL (default: 10)
  MAX_RETRIES - Number of retries for connection errors (default: 1)
"""

import os
import re
import json
import time
import requests
from pathlib import Path
from typing import Dict, List, Tuple
from urllib.parse import urlparse
import sys

# Configuration
TIMEOUT = int(os.environ.get('TIMEOUT', 10))
MAX_RETRIES = int(os.environ.get('MAX_RETRIES', 1))
VALID_STATUSES = {200, 201, 202, 203, 204, 205, 206}  # Success codes
REDIRECT_STATUSES = {301, 302, 303, 304, 307, 308}  # Redirects
# 403/timeout/cloudflare are common for legitimate sites that block bots
BLOCKED_STATUSES = {403, 408, 429, 520, 521, 522, 523, 524}
SKIP_PATTERNS = {
    'example.com',  # Example domains
    'yourdomain.com',
    'your-repo',
    'your-site',
    'yourname',
    'myapp.com',  # Example app domain used in prompts
    'staging.myapp',
    '/acme',
    'owner/repo',
    'OWNER/REPO',
    'localhost',
    'file://',  # File protocols
    '#',  # Anchor links within page
    'raw.githubusercontent.com/community-access/accessibility-agents/main/schemas/',  # Schemas not yet published
}

# Minimum URL length: https://x.xx = 12 chars
MIN_URL_LENGTH = 12

# Session with retries
session = requests.Session()
if token := os.environ.get('GITHUB_TOKEN'):
    session.headers['Authorization'] = f'token {token}'

session.headers['User-Agent'] = 'accessibility-agents-verifier/1.0'


def should_skip_url(url: str) -> bool:
    """Check if URL should be skipped."""
    url_lower = url.lower()
    return any(pattern in url_lower for pattern in SKIP_PATTERNS)


def _is_valid_url(url: str) -> bool:
    """Check if a URL has a valid structure (real domain, sufficient length)."""
    if len(url) < MIN_URL_LENGTH:
        return False
    # Reject placeholder patterns like https://...
    if re.match(r'^https?://\.{2,}', url):
        return False
    parsed = urlparse(url)
    # Must have a netloc (domain) with at least one dot
    if not parsed.netloc or '.' not in parsed.netloc:
        return False
    return True


def extract_urls(file_path: Path) -> List[Tuple[str, int]]:
    """Extract all https:// URLs from a markdown file with line numbers.

    Skips URLs inside fenced code blocks (``` ... ```) to avoid
    false positives from example snippets.
    """
    urls = []
    in_code_block = False
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                # Track fenced code blocks
                stripped = line.strip()
                if stripped.startswith('```'):
                    in_code_block = not in_code_block
                    continue
                if in_code_block:
                    continue

                # Extract URLs using regex (exclude >, <, {, and common delimiters)
                matches = re.findall(r'https://[^\s\)"`\]\}\><]+', line)
                for match in matches:
                    # Clean trailing punctuation and HTML fragments
                    url = match.rstrip('.,;:!?)')
                    url = re.sub(r'</[a-zA-Z]+$', '', url)  # Strip trailing </tag
                    # Skip URLs containing template variables like {owner}
                    if '{' in url or '[' in url:
                        continue
                    # Skip malformed or placeholder URLs
                    if not _is_valid_url(url):
                        continue
                    urls.append((url, line_num))
    except (UnicodeDecodeError, IOError) as e:
        print(f"⚠️ Error reading {file_path}: {e}", file=sys.stderr)
    
    return urls


def validate_url(url: str) -> Tuple[int, str | None]:
    """
    Validate a URL and return (status_code, final_url).
    
    Returns:
      (status_code, final_url if redirect else None)
    
    Retries on connection errors up to MAX_RETRIES times.
    """
    if should_skip_url(url):
        return -1, None  # Skip marker
    
    last_error_status = 0
    for attempt in range(1 + MAX_RETRIES):
        try:
            response = session.head(url, timeout=TIMEOUT, allow_redirects=False)
            
            # Try GET if HEAD fails (some servers don't support HEAD)
            if response.status_code in (405, 403):
                response = session.get(url, timeout=TIMEOUT, allow_redirects=False, stream=True)
            
            if response.status_code in REDIRECT_STATUSES:
                final_url = response.headers.get('Location', '')
                return response.status_code, final_url
            
            return response.status_code, None
        
        except requests.Timeout:
            last_error_status = 408
        except requests.ConnectionError:
            last_error_status = 0
        except Exception:
            return -1, None  # Unexpected error, skip

        # Wait briefly before retry
        if attempt < MAX_RETRIES:
            time.sleep(2)
    
    # After retries exhausted, connection errors are treated as blocked
    # (transient network issues in CI should not fail the build)
    if last_error_status == 0:
        return 0, None
    return last_error_status, None


def main():
    """Main validation function."""
    url_cache: Dict[str, Tuple[int, str | None]] = {}

    results = {
        'valid': 0,
        'redirects': 0,
        'blocked': 0,
        'broken': 0,
        'skipped': 0,
        'valid_links': [],
        'redirect_links': [],
        'blocked_links': [],
        'broken_links': [],
    }
    
    # Find all markdown files
    search_dirs = [
        Path('.claude/agents'),
        Path('.github/agents'),
        Path('docs'),
        Path('claude-code-plugin/agents'),
    ]
    
    all_files = []
    for search_dir in search_dirs:
        if search_dir.exists():
            all_files.extend(search_dir.glob('**/*.md'))
    
    if not all_files:
        print("No markdown files found to validate.")
        return 0
    
    print(f"Scanning {len(all_files)} markdown files for authoritative sources...")
    
    # Extract and validate all URLs
    for file_path in sorted(all_files):
        urls = extract_urls(file_path)
        
        for url, line_num in urls:
            if url in url_cache:
                status, final_url = url_cache[url]
            else:
                status, final_url = validate_url(url)
                url_cache[url] = (status, final_url)
            
            if status == -1:
                # Skipped
                results['skipped'] += 1
            elif status in VALID_STATUSES:
                # Valid
                results['valid'] += 1
                results['valid_links'].append({
                    'file': str(file_path),
                    'line': line_num,
                    'url': url,
                })
            elif status in REDIRECT_STATUSES:
                # Redirect
                results['redirects'] += 1
                results['redirect_links'].append({
                    'file': str(file_path),
                    'line': line_num,
                    'url': url,
                    'final_url': final_url,
                    'status': status,
                })
            elif status in BLOCKED_STATUSES or status == 0:
                # Blocked by server or connection error (not truly broken)
                results['blocked'] += 1
                results['blocked_links'].append({
                    'file': str(file_path),
                    'line': line_num,
                    'url': url,
                    'status': status,
                })
            else:
                # Broken or error
                results['broken'] += 1
                results['broken_links'].append({
                    'file': str(file_path),
                    'line': line_num,
                    'url': url,
                    'status': status,
                })
    
    # Write results
    with open('source-validation-results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    # Print summary
    print(f"\n✅ Valid:      {results['valid']}")
    print(f"⚠️  Redirects: {results['redirects']}")
    print(f"🚫 Blocked:    {results['blocked']}")
    print(f"❌ Broken:     {results['broken']}")
    print(f"⏭️  Skipped:    {results['skipped']}")
    
    if results['broken'] > 0:
        print(f"\n❌ {results['broken']} broken link(s) found:")
        for link in results['broken_links']:
            status_label = {
                0: 'Connection Error',
                408: 'Timeout',
                404: 'Not Found',
                403: 'Forbidden',
                500: 'Server Error',
            }.get(link['status'], f'HTTP {link["status"]}')
            print(f"  {link['file']}:{link['line']} - {link['url']} ({status_label})")
        return 1
    
    if results['redirects'] > 0:
        print(f"\n⚠️  {results['redirects']} redirect(s) to review:")
        for link in results['redirect_links'][:5]:  # Show first 5
            print(f"  {link['file']}:{link['line']} - HTTP {link['status']} → {link['final_url']}")
        if len(results['redirect_links']) > 5:
            print(f"  ... and {len(results['redirect_links']) - 5} more")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
