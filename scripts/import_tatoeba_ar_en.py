#!/usr/bin/env python3
"""Download and prepare Tatoeba-derived English-Arabic sentence pairs for human review.

This does not write to production app files or Supabase. Run from the repo root.
Python standard library only.
"""
from __future__ import annotations
import argparse
import io
import json
import re
import urllib.request
import zipfile
from pathlib import Path

SOURCE_URL = "https://www.manythings.org/anki/ara-eng.zip"
SOURCE_PAGE = "https://www.manythings.org/anki/"
LICENSE = "Tatoeba text: CC BY 2.0 FR; attribute Tatoeba and contributors when supplied."

def clean(value: str) -> str:
    return re.sub(r"\\s+", " ", value.replace("\\ufeff", "").strip())

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=500, help="Maximum reviewed-candidate rows (default: 500)")
    parser.add_argument("--output", default="data/review/tatoeba-ar-en-review.jsonl")
    parser.add_argument("--url", default=SOURCE_URL, help="Optional alternate ZIP URL for mirrors")
    args = parser.parse_args()
    if args.limit < 1:
        parser.error("--limit must be positive")
    request = urllib.request.Request(args.url, headers={"User-Agent": "SeragOS-OpenDataImporter/1.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        archive_bytes = response.read()
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    seen = set()
    written = 0
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        candidates = [n for n in archive.namelist() if not n.endswith("/")]
        if not candidates:
            raise SystemExit("The downloaded ZIP contains no data file.")
        with archive.open(candidates[0]) as raw:
            text = io.TextIOWrapper(raw, encoding="utf-8-sig", errors="replace")
            with output.open("w", encoding="utf-8", newline="\\n") as target:
                for line in text:
                    parts = line.rstrip("\\r\\n").split("\\t")
                    if len(parts) < 2:
                        continue
                    # The published export is English, Arabic, and sometimes attribution.
                    english, arabic = clean(parts[0]), clean(parts[1])
                    attribution = clean(parts[2]) if len(parts) > 2 else ""
                    if not english or not arabic or len(english) < 3 or len(arabic) < 2:
                        continue
                    key = (english.casefold(), arabic)
                    if key in seen:
                        continue
                    seen.add(key)
                    record = {
                        "id": f"tatoeba-review-{written + 1:06d}",
                        "english": english,
                        "arabic": arabic,
                        "source": "Tatoeba via ManyThings",
                        "source_url": SOURCE_PAGE,
                        "attribution": attribution or None,
                        "license_note": LICENSE,
                        "review_status": "needs-human-review",
                    }
                    target.write(json.dumps(record, ensure_ascii=False) + "\\n")
                    written += 1
                    if written >= args.limit:
                        break
    print(f"Wrote {written} candidate pairs to {output}")
    print("These are review candidates, not automatically approved learning content.")

if __name__ == "__main__":
    main()
