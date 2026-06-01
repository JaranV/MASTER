# Repeated-Build Case Study — Run Protocol

## For Each Run

### 1. Create a fresh run directory (NOTE: this may take some minutes)

```bash
cd Code/
bash ./reset_run.sh <number>
```

This copies AI_GEN to `AI_RUN_XX/` and cleans any prior Claude memory for that run number.

### 2. Start Claude Code

```bash
cd AI_RUN_<number>/
claude
/model Opus
/effort max
```

### 3. Send prompt 1

```
Build the webshop.
```

Everything else is in CLAUDE.md. Wait for Claude to finish.

### 4. Test the output

Open three terminals in `AI_RUN_<number>/`:

- **Backend**: `cd backend && ./mvnw spring-boot:run`
- **Frontend**: `cd frontend && npm run dev`
  - `node_modules` is pre-installed in `AI_GEN/frontend` and copied by `reset_run.sh`, so no `npm install` is needed. If it ever goes missing, run `npm install` once.
- **Stripe webhook forwarder**: `stripe listen --forward-to localhost:8080/api/stripe/webhook`
  - Required so `checkout.session.completed` reaches the backend and orders flip from `PENDING` to `PAID`.
  - Copy the `whsec_...` secret it prints into `backend/src/main/resources/application.properties` as `stripe.webhook-secret` if it differs from the one already there.

Then:

- Open http://localhost:5173 — the storefront
- Open http://localhost:8080/h2-console — the H2 database console
  - JDBC URL: `jdbc:h2:mem:webshop`
  - User: `sa`
  - Password: *(leave blank)*
- Test: product listing, search, cart, discount, phone validation, postal code lookup, Stripe payment

### 5. Fix issues (prompts 2–5)

If something is broken, describe the bug to Claude. Use the same correction prompt across all 10 runs when the same bug appears.

### 6. Score the run

Use `scoring_template.md` to score the 4 probe features on 5 dimensions (0–3).

### 7. Close the session

Exit Claude Code and close the terminal before starting the next run.

## Files

| File | Purpose |
|------|---------|
| `AI_GEN/` | Template — do not modify after study begins |
| `AI_GEN/CLAUDE.md` | All requirements Claude sees |
| `AI_GEN/.claude/settings.local.json` | Sandbox rules (blocks parent directory access) |
| `reset_run.sh` | Creates fresh run directories + cleans Claude memory |
| `scoring_template.md` | Scoring rubric for each run |
| `AI_RUN_01/` .. `AI_RUN_10/` | Created by reset_run.sh, one per session |
