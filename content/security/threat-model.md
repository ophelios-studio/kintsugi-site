---
title: "Threat model"
order: 1
description: "What Kintsugi defends against, and what it explicitly does not."
---

Kintsugi solves one problem: moving assets out of an EVM wallet whose private key is compromised, when a sweeper bot is watching that wallet for any incoming gas.

## In scope

The attacker has the victim's private key. They can sign any transaction the victim could. They have a sweeper bot pointed at the victim address that drains any ETH that lands there in the next block.

Kintsugi assumes the victim is running the rescue from a clean machine they trust, with a freshly-generated safe wallet they trust, and a separate rescuer wallet they control.

Under these assumptions, Kintsugi guarantees:

- Every selected asset transfers to the safe wallet in one Type-4 transaction.
- The victim wallet's ETH balance never rises above zero during the rescue.
- The sweeper has no observable opening between batch start and batch end.
- The signature scope is bound to a specific batch on a specific chain with a deadline; it cannot be reused or replayed.

## What it does NOT defend against

- **A compromised victim machine that signs an attacker-controlled batch.** If the rescue itself is signed on the same machine the attacker controls, all bets are off. Use a clean machine.
- **A compromised safe wallet.** If you derive the safe from the compromised seed (or any seed the attacker has access to), recovered assets land back in the attacker's hands. Generate the safe from a new seed.
- **A compromised rescuer wallet.** The rescuer pays gas. If its key is compromised, the attacker can use the rescuer's gas, but the rescue still succeeds for the victim's assets (the rescuer is not authorized to sign the inner batch).
- **An attacker who somehow obtains both the EIP-712 batch signature AND the EIP-7702 authorization tuple before they are submitted.** With both, they could front-run the rescue. Mitigation: use Flashbots Protect (`--private-mempool` flag) when paranoia is warranted.
- **Malicious resolver / record cleanup on rescued ENS names.** Kintsugi transfers ownership; it does not automatically wipe records the attacker may have set. Audit the resolver after the rescue and run `setResolver` to clear or reattach. See [Asset support: ENS](/asset-support/ens/).

## Trust assumptions

Running Kintsugi requires trusting:

- The Solidity source of `Rescue.sol` and `NonceTracker.sol` (auditable, MIT, ~150 lines combined).
- The deployed bytecode at the published addresses on each chain (verifiable on Etherscan).
- The `viem` library, OpenZeppelin Contracts, and the Ethereum execution layer.

No other parties are trusted at runtime. The CLI runs locally, never sends private keys anywhere, never depends on any Kintsugi-operated server. There is no central API, no telemetry, no analytics, no signup.

## Network exposure

When you run `kintsugi ui`, Kintsugi binds an HTTP server to `127.0.0.1` only. Other machines on your LAN cannot reach it. The browser tab uses a session token (UUID) in the URL fragment as bearer authentication on every API call. Without that token, all API routes return 401.

When you run `kintsugi rescue` (CLI mode), there is no server at all. Just the local Node process talking to your RPC.

The RPC URL you provide is the only outbound connection. Kintsugi makes no other network calls.

## Atomicity

A batch is atomic at the EVM transaction level: every op succeeds or the entire transaction reverts. If any op reverts, the rescue's state changes are rolled back AND the nonce stays unconsumed (so the same signature can be re-used after fixing the failing op).

## Reporting a vulnerability

See [Reporting a vulnerability](/security/reporting/).
