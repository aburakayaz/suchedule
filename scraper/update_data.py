"""
Scrape the most recent terms listed on Banner and write the website's data files:

    data/<term>.min.json   course data of one term (same format as scrape.py output)
    data/terms.json        the selectable terms, a content hash per term (for cache busting)
                           and the default term

Usage: python scraper/update_data.py [--count N] [--terms 202602 202601 ...]
"""
import argparse
import datetime
import hashlib
import json
import os
from typing import Dict, List

import requests
from bs4 import BeautifulSoup

from scrape import SUcheduleCourseScraper

TERMS_URL = "https://suis.sabanciuniv.edu/prod/bwckschd.p_disp_dyn_sched"
DATA_DIR = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data"))
MANIFEST = os.path.join(DATA_DIR, "terms.json")


def fetch_terms() -> List[Dict[str, str]]:
    """
    Terms offered on Banner, newest first, e.g. {"term": "202601", "name": "Fall 2026-2027"}.
    """
    page = requests.get(TERMS_URL, timeout=60)
    page.raise_for_status()
    source = BeautifulSoup(page.content, "html.parser")

    terms = []
    for option in source.select("select[name=p_term] option"):
        code = (option.get("value") or "").strip()
        if code.isdigit():
            name = option.text.replace("(View only)", "").strip()
            terms.append({"term": code, "name": name})

    return sorted(terms, key=lambda t: t["term"], reverse=True)


def term_by_date(today: datetime.date) -> str:
    """
    Term in progress on the given date: Fall from August, Spring until April, Summer in between.
    """
    year = today.year if today.month >= 8 else today.year - 1
    suffix = 1 if today.month >= 8 else 2 if today.month <= 4 else 3
    return f"{year}{suffix:02d}"


def write_if_changed(path: str, content: str) -> bool:
    if os.path.exists(path):
        with open(path, encoding="utf-8") as file:
            if file.read() == content:
                return False

    with open(path, "w", encoding="utf-8") as file:
        file.write(content)

    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--count", type=int, default=4, help="number of most recent terms to publish (default 4)")
    parser.add_argument("--terms", nargs="+", help="publish exactly these term codes instead of the most recent ones")
    args = parser.parse_args()

    available = fetch_terms()
    if args.terms:
        names = {t["term"]: t["name"] for t in available}
        selected = [{"term": code, "name": names.get(code, code)} for code in sorted(args.terms, reverse=True)]
    else:
        selected = available[:args.count]

    os.makedirs(DATA_DIR, exist_ok=True)
    published = []

    for term in selected:
        print(f"Scraping {term['term']} ({term['name']})")
        data = SUcheduleCourseScraper(term=int(term["term"])).scrape()

        if not data["courses"]:
            print(f"  No courses published for {term['term']}, skipping it.")
            continue

        content = json.dumps(data, ensure_ascii=False)
        changed = write_if_changed(os.path.join(DATA_DIR, f"{term['term']}.min.json"), content)
        print(f"  {len(data['courses'])} courses, {'updated' if changed else 'unchanged'}.")

        published.append({
            "term": term["term"],
            "name": term["name"],
            "hash": hashlib.sha1(content.encode("utf-8")).hexdigest()[:10],
        })

    if not published:
        raise SystemExit("No term has any courses; leaving data/ untouched.")

    # Drop data of terms that are no longer published
    keep = {f"{t['term']}.min.json" for t in published}
    for name in os.listdir(DATA_DIR):
        if name.endswith(".min.json") and name not in keep:
            os.remove(os.path.join(DATA_DIR, name))
            print(f"Removed {name}")

    codes = [t["term"] for t in published]
    current = term_by_date(datetime.date.today())
    default = current if current in codes else next((c for c in codes if c <= current), codes[0])

    manifest = json.dumps({"default": default, "terms": published}, ensure_ascii=False, indent=2) + "\n"
    write_if_changed(MANIFEST, manifest)
    print(f"Published {', '.join(codes)} (default {default})")


if __name__ == "__main__":
    main()
