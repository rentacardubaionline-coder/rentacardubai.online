"""
Worker — polls scrape_jobs for pending jobs and runs the scraper.

Runs in two modes (same code):
  - Locally:  python scripts/scraper/worker.py
  - Render:   deployed as a Background Worker, polls 24/7

Env vars required:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
""" 


import asyncio
import os
import sys
from datetime import datetime, timezone

# Allow running from repo root or from scripts/scraper/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env if present (local mode); Render injects env vars directly so this is harmless there
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
except ImportError:
    pass

import urllib.request  # noqa: E402
import json  # noqa: E402
from supabase import create_client, Client  # noqa: E402
from gmaps_scraper import run as run_scraper  # noqa: E402


POLL_INTERVAL_SECONDS = 30


def trigger_auto_process(job_id: str, city_name: str) -> None:
    """
    POST to the Next.js /api/scraper/auto-process endpoint so rows from the
    just-finished job are auto-published (≥5 photos) or deleted (<5 photos).
    """
    base = os.environ.get("PUBLIC_APP_URL", "http://localhost:3000")
    secret = os.environ.get("SCRAPER_WEBHOOK_SECRET")
    if not secret:
        log("⚠ SCRAPER_WEBHOOK_SECRET missing — skipping auto-process")
        return

    url = f"{base.rstrip('/')}/api/scraper/auto-process"
    payload = json.dumps({"jobId": job_id, "cityName": city_name, "minImages": 5}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {secret}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            log(
                f"🪄 Auto-process: imported={body.get('imported', 0)} "
                f"deleted={body.get('deleted', 0)} failed={body.get('failed', 0)} "
                f"scanned={body.get('scanned', 0)}"
            )
    except Exception as e:
        log(f"⚠ Auto-process webhook failed: {e}")


def log(msg: str) -> None:
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}", flush=True)


def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        log("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required")
        sys.exit(1)
    return create_client(url, key)


async def claim_next_job(supabase: Client):
    """
    Fetch the next pending job.
    Uses an UPDATE ... WHERE status='pending' to atomically claim.
    """
    # Find oldest pending job
    res = (
        supabase.table("scrape_jobs")
        .select("id, city_slug, city_name, category")
        .eq("status", "pending")
        .order("created_at")
        .limit(1)
        .execute()
    )
    jobs = res.data or []
    if not jobs:
        return None

    job = jobs[0]

    # Atomically claim it — update only if still pending
    claim = (
        supabase.table("scrape_jobs")
        .update({"status": "running", "started_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", job["id"])
        .eq("status", "pending")
        .execute()
    )

    # If nothing was updated, someone else claimed it. Retry next loop.
    if not claim.data:
        return None

    return job


async def main():
    supabase = get_supabase()
    log("🏁 Worker started — polling scrape_jobs every 30s")

    while True:
        try:
            job = await claim_next_job(supabase)
            if job is None:
                await asyncio.sleep(POLL_INTERVAL_SECONDS)
                continue

            log(f"📦 Claimed job {job['id']} — {job['city_name']} ({job['category']})")
            try:
                await run_scraper(job["id"], job["city_slug"], job["category"])
                log(f"✅ Job {job['id']} complete")
                # Auto-publish results: ≥5 photos → live; <5 photos → deleted
                trigger_auto_process(job["id"], job["city_name"])
            except Exception as e:
                log(f"❌ Job {job['id']} failed: {e}")
                try:
                    supabase.table("scrape_jobs").update({
                        "status": "failed",
                        "error_message": str(e)[:500],
                        "completed_at": datetime.now(timezone.utc).isoformat(),
                    }).eq("id", job["id"]).execute()
                except Exception as update_err:
                    log(f"⚠ Failed to mark job as failed: {update_err}")

            # Small breather between jobs
            await asyncio.sleep(3)

        except KeyboardInterrupt:
            log("👋 Worker stopped by user")
            break
        except Exception as e:
            log(f"⚠ Worker loop error: {e}")
            await asyncio.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    asyncio.run(main())
