# Launch Checklist

## Infrastructure

- [ ] RDS reachable from Amplify (`DATABASE_URL?sslmode=require`)
- [ ] Migrations `0000`–`0003` applied
- [ ] S3 + CloudFront for media (`AWS_CLOUDFRONT_URL`)
- [ ] All Amplify env vars set (see `.env.example`)

## Security

- [ ] `OWNER_PASSCODE_HASH` + `JWT_SECRET` set
- [ ] `AUTH_BYPASS` is **not** `true`
- [ ] `NEXT_PUBLIC_APP_URL` = live `https://` domain

## Smoke tests

- [ ] `GET /api/health` → database connected
- [ ] Home + list pages load
- [ ] Inbox message → `/dashboard/messages`
- [ ] Passcode → controller mode; **+** / **edit** work on list pages
- [ ] Contact link edits persist after refresh
- [ ] `/dashboard/canvas` (Works) lists external links for `/works`

## Known limits

- Rate limits are in-memory (fine for personal portfolio scale).
- Demo cards show when DB is empty — add real content before launch.
