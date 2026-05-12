---
title: "kintsugi ui"
order: 2
description: "Launch the local web UI on a localhost port."
---

Start a local Hono server bound to `127.0.0.1` and open your default browser to the rescue UI. The server holds session state in memory only; private keys never leave the local Node process.

## Synopsis

```bash
kintsugi ui [options]
```

## Options

| Flag | Description |
|------|-------------|
| `-p, --port <port>` | Port to bind to. Default: `38080`. |
| `--no-browser` | Do not open the browser automatically. Useful when running over SSH or inside a sandbox. |

## What it does

1. Generates a random session token (UUID).
2. Starts a Hono HTTP server bound to `127.0.0.1` on the given port.
3. Constructs a URL of the form `http://127.0.0.1:<port>/#t=<token>`.
4. Opens that URL in your default browser (unless `--no-browser`).
5. Serves the React UI bundle plus the JSON API the UI uses to drive `@ophelios/kintsugi-core`.

The token sits in the URL fragment, which is never sent in the HTTP request line. The UI reads it client-side and attaches it as the `X-Kintsugi-Token` header on every API call. Any request without the token returns 401.

## Stopping

`Ctrl+C` in the terminal. The session map is wiped from memory and the server exits.

## Example

```bash
$ kintsugi ui

  Kintsugi UI
  Local server bound to 127.0.0.1 only.

  URL: http://127.0.0.1:38080/#t=4f8a1c2e-...

  Press Ctrl-C to stop the server. The browser opens automatically.
```

The browser tab walks through the same five phases as the CLI: Network → Wallets → Discover → Plan → Submit. See the [UI walkthrough](/ui-walkthrough/network/) for screenshots of each step.

## Custom port

```bash
kintsugi ui --port 4000
```

Pick anything that's free. The CLI will refuse to start if the port is already in use.

## SSH or remote scenarios

```bash
kintsugi ui --no-browser
```

Outputs the URL but does not open a browser. SSH tunnel the port to your local machine:

```bash
ssh -L 38080:127.0.0.1:38080 user@host
```

Then paste the URL into your local browser. The token gating ensures only someone with the URL fragment can use the session.

## Security notes

- Server binds to `127.0.0.1` only. Other machines on the LAN cannot reach it.
- Session token is required on every API call. Without it, all routes return 401.
- Sessions are in-memory; nothing is persisted to disk.
- The UI bundle is served from disk, not generated; no runtime templates with user data.

See the [security threat model](/security/threat-model/) for the full trust analysis.

## Related

- [kintsugi rescue](/cli-reference/rescue/) for the same flow with a terminal interface
- [UI walkthrough](/ui-walkthrough/network/) for screenshots of each step
