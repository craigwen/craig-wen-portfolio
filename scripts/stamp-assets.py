#!/usr/bin/env python3
"""Stamp style.css / app.js URLs in every page with a hash of their contents.

A returning visitor's browser caches assets by URL. Ship new HTML against an
unchanged asset URL and it will happily pair the new markup with the stylesheet
it already has, which renders as a broken page. Hashing the contents into the
query string means a changed file is always a new URL, and an unchanged file
keeps its cached copy.

Each asset gets its own hash, so editing CSS doesn't force a JS re-download.
Idempotent: running it twice in a row changes nothing. Safe to run by hand.
"""

import hashlib
import pathlib
import re
import sys

ASSETS = ("style.css", "app.js")
ROOT = pathlib.Path(__file__).resolve().parent.parent


def short_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:8]


def main():
    versions = {}
    for name in ASSETS:
        path = ROOT / name
        if not path.exists():
            print(f"stamp-assets: {name} not found, skipping", file=sys.stderr)
            continue
        versions[name] = short_hash(path)

    if not versions:
        return 0

    changed = []
    for page in sorted(ROOT.glob("*.html")):
        original = page.read_text()
        text = original
        for name, version in versions.items():
            # Matches the bare filename or an existing ?v=... stamp.
            pattern = re.compile(re.escape(name) + r"(?:\?v=[A-Za-z0-9._-]*)?")
            text = pattern.sub(f"{name}?v={version}", text)
        if text != original:
            page.write_text(text)
            changed.append(page.name)

    stamps = " ".join(f"{n}?v={v}" for n, v in versions.items())
    if changed:
        print(f"stamp-assets: {stamps} -> {', '.join(changed)}")
    else:
        print(f"stamp-assets: already current ({stamps})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
