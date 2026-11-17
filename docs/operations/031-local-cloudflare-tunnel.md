# Local Cloudflare Tunnel — NovaLight API

> Not a converted source document. Authored during the NovaLight operational-activation session. Numbered `031` per [CLAUDE.md §9](../../CLAUDE.md) (next available slot after ADR-030). The task that requested this document specified an un-numbered path (`docs/operations/local-cloudflare-tunnel.md`); that conflicts with the repository's own numbering convention, so this document uses the convention instead — flagged, not silently resolved.

## Document Metadata

| Field   | Value                                                                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Status  | Point-in-time infrastructure record                                                                                                             |
| Scope   | Local development only — not staging/production. Never used for real user traffic.                                                              |
| Related | [ADR-029](../architecture/029-clerk-identity-mapping-and-provisioning.md), [ADR-030](../architecture/030-authentication-activation-strategy.md) |

## 1. Purpose

Local NovaLight development is not publicly reachable, but Clerk webhooks (`user.created`/`user.updated`/`user.deleted`) require a real HTTPS endpoint to deliver to. This tunnel exposes only `http://localhost:4000` (the `apps/api` dev server) to a stable HTTPS hostname, so the Clerk Dashboard can reach `POST /api/v1/webhooks/clerk` during local testing.

**Not a production substitute.** This is a development convenience. Production deployment uses Railway (per [ADR-011](../architecture/006-initial-architecture-decisions.md) and [021-m1.5-production-foundation-plan.md](../deployment/021-m1.5-production-foundation-plan.md)), not a tunnel.

## 2. Current Configuration

| Item              | Value                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tunnel name       | `novalight-local`                                                                                                                                   |
| Tunnel ID         | `2e8d3b59-6c27-4e1d-9f38-a0245a3affbe`                                                                                                              |
| Public hostname   | `https://novalight.cafinocafe.ir`                                                                                                                   |
| DNS mode          | Named tunnel with a real CNAME route (the operator owns `cafinocafe.ir` in Cloudflare; the tunnel subdomain is unrelated to the domain's other use) |
| Origin service    | `http://localhost:4000` (single ingress rule; all other paths on this hostname 404)                                                                 |
| Config file       | `~/.cloudflared/config.yml` (i.e. `C:\Users\<user>\.cloudflared\config.yml`)                                                                        |
| Credentials file  | `~/.cloudflared/2e8d3b59-6c27-4e1d-9f38-a0245a3affbe.json` — **treat as a secret; never commit or print its contents**                              |
| Clerk webhook URL | `https://novalight.cafinocafe.ir/api/v1/webhooks/clerk`                                                                                             |

`config.yml` contents (no secrets in this file itself — the credentials file it references is the sensitive part):

```yaml
tunnel: 2e8d3b59-6c27-4e1d-9f38-a0245a3affbe
credentials-file: C:\Users\<user>\.cloudflared\2e8d3b59-6c27-4e1d-9f38-a0245a3affbe.json

ingress:
  - hostname: novalight.cafinocafe.ir
    service: http://localhost:4000
  - service: http_status:404
```

## 3. Installation (already done on this machine)

```powershell
winget install --id Cloudflare.cloudflared -e
```

Installed to `C:\Program Files (x86)\cloudflared\cloudflared.exe`. `winget` updates the machine `PATH`, but an already-open shell won't see it until restarted — use the full path or open a new terminal.

## 4. Authentication (already done on this machine)

```powershell
cloudflared tunnel login
```

Opens a browser to `dash.cloudflare.com/argotunnel` — pick the zone/account to authorize. Success is confirmed by the CLI printing "You have successfully logged in" **and** `~/.cloudflared/cert.pem` existing. Being logged into the Cloudflare dashboard in a browser is not sufficient — this specific authorization step must be completed.

## 5. Starting / Stopping the Tunnel

**Start** (foreground, blocks the terminal):

```powershell
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel run novalight-local
```

**Stop:** Ctrl+C in the terminal running it, or terminate the background process if started detached.

The API server itself (`http://localhost:4000`) must also be running (`npm run dev --workspace=@novalight/api` or the monorepo-wide `npm run dev`) — the tunnel only forwards traffic, it doesn't start the API.

## 6. Restart Procedure

1. Stop the tunnel process (Ctrl+C, or kill the background PID).
2. Confirm the API dev server is still running on port 4000 (`curl http://localhost:4000/api/v1/health`).
3. Re-run `cloudflared tunnel run novalight-local`. The hostname and DNS route do not change across restarts — only ephemeral edge connection IDs change.

## 7. Update Procedure

```powershell
winget upgrade --id Cloudflare.cloudflared -e
```

Cloudflared does **not** auto-update on Windows (confirmed in this session's startup log: `cloudflared will not automatically update on Windows systems`). Re-run the upgrade command periodically. No tunnel/DNS reconfiguration is needed after an upgrade — the tunnel ID and credentials file are unaffected.

## 8. Removing the Tunnel

```powershell
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel route dns --overwrite-dns novalight-local <no-longer-used>   # optional: only if repointing, not removing
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel delete novalight-local
```

Deleting the tunnel invalidates the credentials file (`~/.cloudflared/2e8d3b59-6c27-4e1d-9f38-a0245a3affbe.json`) — delete that file too once the tunnel is removed. The DNS CNAME (`novalight.cafinocafe.ir`) should be removed separately from the Cloudflare dashboard (DNS → Records) if it isn't cleaned up automatically.

## 9. Troubleshooting

| Symptom                                                                         | Likely cause                                                  | Fix                                                                                                                                                         |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cloudflared: command not found` in a new shell                                 | `PATH` not refreshed in that session                          | Use the full path, or open a new terminal window                                                                                                            |
| `Cannot determine default origin certificate path`                              | Not authenticated yet                                         | Run `cloudflared tunnel login`, verify `cert.pem` exists                                                                                                    |
| Public hostname returns `502`/`503`                                             | API dev server not running on port 4000                       | Start `npm run dev --workspace=@novalight/api`, re-check `curl http://localhost:4000/api/v1/health`                                                         |
| Public hostname returns `404` on a path that should exist                       | `ingress` rule hostname mismatch, or path not under `/api/v1` | Check `config.yml` hostname matches exactly; confirm the route exists in `apps/api/src/routes/index.ts`                                                     |
| Clerk webhook shows delivery failures in the Dashboard                          | Tunnel not running, or signing secret mismatch                | Confirm tunnel is up (`curl` the health endpoint first); re-check `CLERK_WEBHOOK_SIGNING_SECRET` in `apps/api/.env` matches the Dashboard's endpoint secret |
| `http://` (no `s`) requests are served directly instead of redirecting to HTTPS | **Known gap, not yet fixed** — see §10                        | Enable "Always Use HTTPS" for the `cafinocafe.ir` zone, or add a Configuration Rule scoped to `novalight.cafinocafe.ir`, in the Cloudflare dashboard        |

## 10. Known Security Gap (flagged, not fixed this session)

Verified during setup: `curl http://novalight.cafinocafe.ir/api/v1/health` returned `HTTP 200` directly, rather than a redirect to HTTPS. Cloudflare's zone-level "Always Use HTTPS" setting is not enabled for this domain (it's an existing domain used for other purposes, not configured specifically for this tunnel). This does not expose credentials in transit for this endpoint (`/health` has no sensitive data), but it means the tunnel currently accepts unencrypted client-to-edge requests rather than enforcing HTTPS end-to-end as intended. **Action required (manual, dashboard-only):** enable "Always Use HTTPS" for `cafinocafe.ir`, or scope a Configuration Rule to `novalight.cafinocafe.ir` specifically to avoid changing behavior for the domain's other, unrelated use. Not fixed automatically here since it's a zone-wide dashboard setting outside `cloudflared`'s CLI surface, and the domain has other, unrelated traffic this session has no context on.

## 11. Security Posture (verified this session)

- Ingress restricted to exactly one hostname → `http://localhost:4000`; all other paths on that hostname return `404` (confirmed via `curl`).
- No other local port or service is exposed — the `ingress` list in `config.yml` has no wildcard rule.
- Credentials file permissions are OS-default (Windows ACLs on the user's own profile directory); not broadened.
- No secret values (credentials file content, `CLERK_WEBHOOK_SIGNING_SECRET`, etc.) were printed during setup or in this document.
