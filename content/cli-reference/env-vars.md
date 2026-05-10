---
title: "Environment variables"
order: 5
description: "Optional env vars that pre-fill flag values."
---

The CLI reads a few environment variables as defaults. All are optional; flags on the command line always win.

| Var | Equivalent flag | Used by |
|-----|-----------------|---------|
| `ETHERSCAN_API_KEY` | `--etherscan-api-key` | `rescue`, `status` |
| `ALCHEMY_API_KEY` | (UI Network step input) | `ui` |
| `KINTSUGI_RPC_URL` | (UI Network step input) | `ui`, `rescue` (advanced) |

## Example

```bash
export ALCHEMY_API_KEY=your_alchemy_key_here
export ETHERSCAN_API_KEY=your_etherscan_key_here

kintsugi ui
```

## Why prefer the UI fields over env vars

For a one-shot rescue, paste the keys into the UI inputs. They live in process memory only, vanish when you `Ctrl+C` the server. Env vars persist in your shell history and rc files, which is a slightly larger blast radius than necessary.

The env vars exist mostly for scripted or repeated use (a security researcher running many test rescues against Sepolia, for example).

## What is never read from env

- Private keys (victim, rescuer, safe). Always entered interactively.
- The safe destination address. Always entered interactively.

These are deliberately not env-driven to avoid the foot-gun of a stale key in an `.env.local` getting reused on the wrong wallet.
