---
title: "Reporting a vulnerability"
order: 4
description: "How to disclose a security issue in Kintsugi responsibly."
---

If you find a vulnerability that lets an attacker drain a victim, drain a rescuer, replay a signature, or otherwise subvert the rescue guarantees, please tell us before publishing.

## Where to send

- **Email**: `security@ophelios.com` (preferred for sensitive details)
- **GitHub**: open a [private security advisory](https://github.com/ophelios-studio/kintsugi/security/advisories/new) on the repo

Please do not file public issues for security problems. Anything you can demonstrate against the deployed Sepolia contracts, the contract source, the TypeScript library, or the local server's session/auth mechanics qualifies.

## What to include

- A short description of the vulnerability and its impact (what an attacker gains).
- Concrete steps to reproduce, or a proof of concept.
- The affected commit hash, contract address, or version.
- Your preferred attribution (your name/handle if you want credit, or anonymous).

## Response

We aim to acknowledge within 72 hours and triage within a week. For confirmed issues, we'll work with you on a coordinated disclosure timeline. Critical issues that affect deployed contracts will be addressed first.

There is no formal bug bounty program at this time. Kintsugi is open source and operates on a no-fees stance, so monetary compensation is not in the budget. We do credit reporters publicly (with permission) in release notes and acknowledge significant contributions in the README.

## Out of scope

- Issues in third-party libraries (viem, OpenZeppelin) should be reported to the respective project maintainers. We will follow up on any that affect Kintsugi specifically.
- Issues that require a fully compromised victim machine (keylogger, memory scraper). This is part of the threat model and not something the rescue contract or library can defend against.
- Issues that require a malicious RPC provider. Pick a trusted RPC; this is in the threat model.
- Self-XSS or other "if the user does X" client-side vectors. The localhost UI does not accept arbitrary user content.

## Hardening reports welcome

Even non-vulnerability hardening suggestions are welcome on the public issue tracker. Things like "this code path could be tightened by X" or "the docs don't cover Y" help the project, no urgency required.
