# AWS Deployment Guide

Step-by-step guide to deploy KP-Website using **only AWS**: Amplify Hosting, RDS PostgreSQL, S3, and CloudFront.

**Time estimate:** 2–4 hours first time.

---

## Overview

```
Visitors → Amplify (Next.js SSR + API routes)
              ↓
         RDS PostgreSQL (content, messages, settings)
              ↓
         S3 (private uploads) → CloudFront (public image URLs)
```

| AWS service | Purpose |
|-------------|---------|
| **Amplify Hosting** | Host the Next.js app (frontend + API) |
| **RDS PostgreSQL** | Database |
| **S3** | Store uploaded images |
| **CloudFront** | Serve images publicly (S3 bucket stays private) |
| **Route 53** (optional) | Custom domain DNS |
| **ACM** (optional) | Free SSL certificate for custom domain |

---

## Phase 0 — Prerequisites

1. **AWS account** with billing enabled
2. **GitHub repo** with this project pushed
3. **Local tools:** Node 20, `psql` (or use RDS Query Editor)
4. **Domain** (optional) — you can start on the default `*.amplifyapp.com` URL

---

## Phase 1 — Generate secrets (do this locally)

From the project folder:

```bash
npm install

# Your controller-mode / dashboard passcode (pick something strong)
npm run hash-passcode -- "your-secret-passcode-here"
# Copy the bcrypt hash output → OWNER_PASSCODE_HASH

# JWT signing secret
openssl rand -hex 32
# Copy output → JWT_SECRET
```

Keep these safe. You will paste them into Amplify later.

---

## Phase 2 — RDS PostgreSQL

### 2.1 Create the database

1. AWS Console → **RDS** → **Create database**
2. **Engine:** PostgreSQL 15 or 16
3. **Template:** Free tier (or Production if you prefer)
4. **DB instance:** `db.t4g.micro` is enough to start
5. **DB identifier:** e.g. `kp-website`
6. **Master username / password:** save these
7. **Public access:** **Yes** (simplest for Amplify; lock down with security group)
8. **VPC security group:** create new → note the group name
9. Create database

### 2.2 Allow Amplify to connect

1. RDS → your instance → **Connectivity & security**
2. Click the **VPC security group**
3. **Inbound rules** → **Edit**
4. Add rule: **PostgreSQL (5432)** from **Anywhere (0.0.0.0/0)**  
   *(Tighten later to Amplify IP ranges if you use VPC integration.)*

### 2.3 Build your connection string

```
postgresql://USERNAME:PASSWORD@ENDPOINT.rds.amazonaws.com:5432/kp_website?sslmode=require
```

Replace `USERNAME`, `PASSWORD`, and `ENDPOINT` from the RDS console.

### 2.4 Run migrations

Connect with `psql` or RDS Query Editor and run each file in order:
<!-- postgresql://postgres:M2YNmaWfBkMW6zB@kp-website.cu9sgcc6qnnn.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require -->
```bash
psql "postgresql://postgres:M2YNmaWfBkMW6zB@kp-website.cu9sgcc6qnnn.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require" -f drizzle/0000_initial.sql
psql "postgresql://postgres:M2YNmaWfBkMW6zB@kp-website.cu9sgcc6qnnn.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require" -f drizzle/0001_extensions.sql
psql "postgresql://postgres:M2YNmaWfBkMW6zB@kp-website.cu9sgcc6qnnn.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require" -f drizzle/0002_display_dates.sql
psql "postgresql://postgres:M2YNmaWfBkMW6zB@kp-website.cu9sgcc6qnnn.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require" -f drizzle/0003_site_settings.sql
```

---

## Phase 3 — S3 + CloudFront (media uploads)

### 3.1 Create S3 bucket

1. **S3** → **Create bucket**
2. Name: e.g. `kp-website-media-yourname`
3. **Block all public access:** ON (bucket stays private)
4. Create

### 3.2 CORS (for browser uploads)

Bucket → **Permissions** → **CORS**:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
  }
]
```

Update `AllowedOrigins` after you know your Amplify URL.

### 3.3 IAM user for uploads

1. **IAM** → **Users** → **Create user** (e.g. `kp-website-s3`)
2. Attach policy (scoped to your bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

3. Create **access key** → save `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### 3.4 CloudFront distribution

1. **CloudFront** → **Create distribution**
2. **Origin:** your S3 bucket
3. **Origin access:** Origin access control (OAC) — create new OAC
4. Copy the bucket policy CloudFront suggests → paste into S3 bucket policy
5. Create distribution
6. Note the domain: `https://dxxxxxxxx.cloudfront.net` → `AWS_CLOUDFRONT_URL`

---

## Phase 4 — Amplify Hosting

### 4.1 Connect the repo

1. **Amplify** → **New app** → **Host web app**
2. Connect **GitHub** → select `KP-Website` repo
3. Branch: `main` (or your deploy branch)
4. Amplify detects `amplify.yml` automatically
5. **Do not deploy yet** — add environment variables first

### 4.2 Environment variables

Amplify → App → **Environment variables** → add all of these:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your RDS connection string |
| `OWNER_PASSCODE_HASH` | From `npm run hash-passcode` |
| `JWT_SECRET` | From `openssl rand -hex 32` |
| `JWT_EXPIRY` | `7d` |
| `NEXT_PUBLIC_APP_URL` | `https://main.xxxxx.amplifyapp.com` (update after first deploy) |
| `NEXT_PUBLIC_EMAIL` | Your public email |
| `NEXT_PUBLIC_LINKEDIN_URL` | Your LinkedIn URL |
| `AWS_REGION` | e.g. `us-east-1` |
| `AWS_ACCESS_KEY_ID` | IAM user key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret |
| `AWS_S3_BUCKET_NAME` | Bucket name |
| `AWS_CLOUDFRONT_URL` | `https://dxxxxxxxx.cloudfront.net` |

**Never set `AUTH_BYPASS=true` in production.**

### 4.3 Deploy

1. **Save and deploy**
2. Wait for build (~5–10 min)
3. Open the Amplify URL
4. If deploy fails on env validation, check CloudWatch build logs for missing vars

### 4.4 Update URLs after first deploy

1. Set `NEXT_PUBLIC_APP_URL` to your real Amplify (or custom) URL
2. Update S3 CORS `AllowedOrigins` with that URL
3. Redeploy Amplify (or wait for next push)

---

## Phase 5 — Custom domain (optional)

1. Amplify → **Domain management** → add your domain
2. Follow DNS instructions (Route 53 or your registrar)
3. Amplify provisions SSL via ACM automatically
4. Update `NEXT_PUBLIC_APP_URL` to `https://yourdomain.com`
5. Update S3 CORS origins
6. Redeploy

---

## Phase 6 — Post-deploy verification

Use [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md). Quick smoke test:

```text
GET https://your-domain.com/api/health     → { "status": "ok", "database": "connected" }
GET https://your-domain.com/               → home loads
GET https://your-domain.com/blogs          → list page loads
POST message in home inbox                 → appears in /dashboard/messages
Enter passcode in inbox                    → controller mode on list pages
```

Log into dashboard: go to `/dashboard` (redirects to home if not logged in — use passcode in inbox first, or POST `/api/auth`).

---

## Phase 7 — Ongoing operations

| Task | How |
|------|-----|
| **Monitor uptime** | Ping `GET /api/health` (UptimeRobot, CloudWatch Synthetics, etc.) |
| **Backups** | RDS automated backups (enable retention ≥ 7 days) |
| **Deploy updates** | `git push` → Amplify auto-builds |
| **Rotate passcode** | `npm run hash-passcode -- new-pass` → update `OWNER_PASSCODE_HASH` → redeploy |
| **Add content** | Controller mode on site, or `/dashboard` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails: missing env vars | Add all required vars in Amplify; check build logs |
| `database: disconnected` on `/api/health` | Check `DATABASE_URL`, RDS security group, `sslmode=require` |
| Images upload but don't display | Set `AWS_CLOUDFRONT_URL`; verify CloudFront OAC + bucket policy |
| Can't log in / controller mode | Verify `OWNER_PASSCODE_HASH` matches your passcode |
| 401 on dashboard APIs | Log in via inbox passcode first (sets session cookie) |
| CORS error on image upload | Update S3 CORS with your live domain |

---

## Content management reference

| Task | Where |
|------|-------|
| Live add/edit (blogs, works, projects) | Passcode in home inbox → **+** / **edit** on list pages |
| Works (external links) | `/dashboard/canvas` |
| Blog CMS | `/dashboard/blog` |
| Projects CMS | `/dashboard/projects` |
| Inbox messages | `/dashboard/messages` |
| Contact email / LinkedIn | Controller mode on home |

---

## Monthly cost (rough)

| Service | Typical |
|---------|---------|
| Amplify Hosting | ~$0–5 (low traffic) |
| RDS `db.t4g.micro` | ~$12–15 |
| S3 + CloudFront | ~$1–3 |
| **Total** | **~$15–25/mo** |

Free tier may reduce this in the first year.
