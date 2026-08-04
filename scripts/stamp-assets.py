#!/usr/bin/env python3
"""Stamp every local asset URL in the pages with a hash of that file's contents.

A returning visitor's browser caches assets by URL. Ship new HTML against an
unchanged asset URL and it will happily pair the new markup with the copy it
already has, which renders as a broken page — or, for an image, as a silently
outdated one. Hashing the contents into the query string means a changed file is
always a new URL, and an unchanged file keeps its cached copy.

Covers stylesheets, scripts, and images alike. Each file gets its own hash, so
editing the CSS doesn't force a re-download of the JS or the logos.

Left alone: links to other pages, anchors, mailto:, and anything absolute.
Idempotent — running it twice changes nothing. Safe to run by hand.
"""

import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# src="..." or href="..." — capture the path and any stamp already on it.
REF = re.compile(r'(?P<attr>\b(?:src|href)=")(?P<path>[^"?#]+)(?P<query>\?v=[^"#]*)?(?P<rest>[^"]*)"')


def is_stampable(path):
    """Local, existing, non-page file — the things a browser caches by URL."""
    if path.startswith(("http://", "https://", "//", "mailto:", "#", "data:")):
        return False
    if path.endswith(".html"):
        return False
    return (ROOT / path).is_file()


def main():
    cache = {}

    def hash_for(path):
        if path not in cache:
            cache[path] = hashlib.sha256((ROOT / path).read_bytes()).hexdigest()[:8]
        return cache[path]

    changed = []
    for page in sorted(ROOT.glob("*.html")):
        original = page.read_text()

        def stamp(m):
            path = m.group("path")
            if not is_stampable(path):
                return m.group(0)
            return f'{m.group("attr")}{path}?v={hash_for(path)}{m.group("rest")}"'

        text = REF.sub(stamp, original)
        if text != original:
            page.write_text(text)
            changed.append(page.name)

    if changed:
        print(f"stamp-assets: stamped {len(cache)} assets -> {', '.join(changed)}")
    else:
        print(f"stamp-assets: already current ({len(cache)} assets)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
