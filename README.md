# KP-Website

Personal portfolio: public list pages (blogs, works, projects) plus a private command center.

## Features

- **Public site** — Home nav, themed list pages, inline anonymous inbox, controller mode for live edits
- **Command center** — Dashboard for blog, works, projects, journal, and messages
- **AWS-ready** — Amplify + RDS + S3 + CloudFront (see [docs/AWS-DEPLOY.md](docs/AWS-DEPLOY.md))

## Quick start

```bash
npm install
cp .env.example .env
# Set DATABASE_URL and secrets (see .env.example)
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content management

| What | Where |
|------|-------|
| Add/edit on the live site | Enter passcode in home inbox → controller mode on list pages |
| Works (external links) | `/dashboard/canvas` or controller mode on `/works` |
| Blog posts | `/dashboard/blog` |
| Projects | `/dashboard/projects` |
| Inbox messages | `/dashboard/messages` |
| Contact email / LinkedIn | Controller mode on home |

## Environment

See `.env.example` for all variables. Production checklist: [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md).
