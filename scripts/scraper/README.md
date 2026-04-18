# Google Maps Scraper — RentNowPK

Python scraper that reads pending jobs from `scrape_jobs` (Supabase) and scrapes
Google Maps for businesses of a given category in a given city. Results land in
`scraped_businesses` + `scraped_reviews`, which admins review in the dashboard.

## Two ways to run

### Option A: Local (on your laptop)

Zero infra, you run it when you want.

```bash
# One-time setup
cd scripts/scraper
cp .env.example .env
# Edit .env with your SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY

pip install -r requirements.txt
python -m playwright install chromium
```

Then whenever you want to scrape:

```bash
python worker.py
```

It polls `scrape_jobs` every 30 seconds. Create jobs from admin UI
(`/admin/scraper/jobs`) — the worker picks them up and runs. Leave the terminal
running until jobs finish. Ctrl+C to stop.

### Option B: Render (24/7 cloud, FREE)

Hands-off: worker runs 24/7 on Render's free tier.

1. Push repo to GitHub (you already do for Vercel)
2. Go to [render.com](https://render.com) → sign up with GitHub
3. Click **New → Blueprint**
4. Connect your repo, Render detects `scripts/scraper/render.yaml`
5. Add environment variables in the dashboard:
   - `SUPABASE_URL` → your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY` → your Supabase service role key
6. Click Deploy. Free tier = 750 compute-hours/month (enough for daily scraping)

The worker will sleep after 15 min of no jobs, then wake up automatically when
a new job appears. First job after sleep takes ~45s cold start; subsequent jobs
are instant.

## Direct mode (one-off testing)

Run the scraper for one city without the queue:

```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=...
export JOB_ID=<uuid of an existing scrape_jobs row>
export CITY_SLUG=lahore
export CATEGORY="Car rental"
python gmaps_scraper.py
```

## Files

- `gmaps_scraper.py` — the actual scraper (Playwright + Supabase)
- `worker.py` — polling loop (used by both local + Render)
- `render.yaml` — Render Blueprint config
- `requirements.txt` — Python dependencies
- `.env.example` — template for local mode
