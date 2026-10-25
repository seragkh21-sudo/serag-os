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
LICENSE = "Tatoeba text: CC BY 2.0 FR; attribute ManyThings, Tatoeba, and sentence contributors."

def clean(value: str) -> str:
    return re.sub(r"\\s+", " ", value.replace("\\ufeff", "").strip())

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=500, help="Maximum candidate rows (default: 500)")
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
    seen: set[tuple[str, str]] = set()
    written = 0

    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        candidates = [
            name for name in archive.namelist()
            if not name.endswith("/") and not name.startswith("__MACOSX/")
        ]
        if not candidates:
            raise SystemExit("The downloaded ZIP contains no data file.")

        # Do not assume the first ZIP member is the dataset: archives may contain
        # metadata or hidden files. Select the member with the most tab-delimited rows.
        scored = []
        for name in candidates:
            sample = archive.read(name)[:256_000]
            scored.append((sample.count(b"\\t"), archive.getinfo(name).file_size, name))
        tab_count, _, data_name = max(scored)
        if tab_count == 0:
            raise SystemExit(
                "No tab-delimited data found in ZIP. Members: "
                + ", ".join(f"{name} ({archive.getinfo(name).file_size} bytes)" for name in candidates)
            )

        raw = archive.read(data_name)
        decoded = raw.decode("utf-8-sig", errors="replace")
        with output.open("w", encoding="utf-8", newline="\\n") as target:
            for line in decoded.splitlines():
                parts = line.split("\\t")
                if len(parts) < 3:
                    continue
                # ManyThings documents the order as English + TAB + other language + TAB + attribution.
                english, arabic, attribution = clean(parts[0]), clean(parts[1]), clean(parts[2])
                if not english or not arabic or not attribution or len(english) < 3 or len(arabic) < 2:
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
                    "attribution": attribution,
                    "license_note": LICENSE,
                    "review_status": "needs-human-review",
                }
                target.write(json.dumps(record, ensure_ascii=False) + "\\n")
                written += 1
                if written >= args.limit:
                    break

    if written == 0:
        raise SystemExit(f"No attributed English-Arabic rows parsed from ZIP member {data_name!r}.")
    print(f"Read {data_name!r}; wrote {written} attributed candidate pairs to {output}")
    print("These are review candidates, not automatically approved learning content.")

if __name__ == "__main__":
    main()
