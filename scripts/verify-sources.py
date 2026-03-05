#!/usr/bin/env python3
"""
Verify authoritative sources in accessibility agents.

Scans all markdown files in .claude/agents/, .github/agents/, and docs/
for URLs and validates that they return HTTP 200 (or acceptable status codes
like 301/302 for redirects or 403 for temporary blocks).

Usage:
  python scripts/verify-sources.py
  
Environment:
  GITHUB_TOKEN - Optional, for higher rate limits
  TIMEOUT - Seconds to wait for each URL (default: 10)
"""

import os
import re
import json
import requests
from pathlib import Path
from typing import Dict, List, Tuple
import sys

# Configuration
TIMEOUT = int(os.environ.get('TIMEOUT', 10))
VALID_STATUSES = {200, 201, 202, 203, 204, 205, 206}  # Success codes
REDIRECT_STATUSES = {301, 302, 303, 304, 307, 308}  # Redirects
SKIP_PATTERNS = {
    'example.com',  # Example domains
    'yourdomain.com',
    'localhost',
    'file://',  # File protocols
    '#',  # Anchor links within page
}

# Session with retries
session = requests.Session()
if token := os.environ.get('GITHUB_TOKEN'):
    session.headers['Authorization'] = f'token {token}'

session.headers['User-Agent'] = 'accessibility-agents-verifier/1.0'


def should_skip_url(url: str) -> bool:
    """Check if URL should be skipped."""
    return any(pattern in url.lower() for pattern in SKIP_PATTERNS)


def extract_urls(file_path: Path) -> List[Tuple[str, int]]:
    """Extract all https:// URLs from a markdown file with line numbers."""
    urls = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                # Extract URLs using regex
                matches = re.findall(r'https://[^\s\)"`\]\}]+', line)
                for match in matches:
                    # Clean trailing punctuation
                    url = match.rstrip('.,;:!?)')
                    urls.append((url, line_num))
    except (UnicodeDecodeError, IOError) as e:
        print(f"⚠️ Error reading {file_path}: {e}", file=sys.stderr)
    
    return urls


def validate_url(url: str) -> Tuple[int, str | None]:
    """
    Validate a URL and return (status_code, final_url).
    
    Returns:
      (status_code, final_url if redirect else None)
    """
    if should_skip_url(url):
        return -1, None  # Skip marker
    
    try:
        response = session.head(url, timeout=TIMEOUT, allow_redirects=False)
        
        # Try GET if HEAD fails (some servers don't support HEAD)
        if response.status_code == 405:
            response = session.get(url, timeout=TIMEOUT, allow_redirects=False, stream=True)
        
        if response.status_code in REDIRECT_STATUSES:
            final_url = response.headers.get('Location', '')
            return response.status_code, final_url
        
        return response.status_code, None
    
    except requests.Timeout:
        return 408, None  # Timeout
    except requests.ConnectionError:
        return 0, None  # Connection error
    except Exception as e:
        return -1, None  # Unexpected error


def main():
    """Main validation function."""
    results = {
        'valid': 0,
        'redirects': 0,
        'broken': 0,
        'skipped': 0,
        'valid_links': [],
        'redirect_links': [],
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
            status, final_url = validate_url(url)
            
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
