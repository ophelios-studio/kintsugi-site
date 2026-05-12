---
title: "Trust assumptions"
order: 2
description: "Who and what you have to trust to run Kintsugi safely."
---

A short, honest enumeration of every party and component that has any effect on a rescue, and what trusting them looks like.

## You trust the source code

`@ophelios/kintsugi-core` is the headless TypeScript library that builds and signs everything. `@ophelios/kintsugi-cli` and `@ophelios/kintsugi-ui` are surfaces over it. All three are MIT-licensed, in one public monorepo, with no minified or obfuscated bundles.

The Solidity contracts (`Rescue.sol` + `NonceTracker.sol`) are about 150 lines combined. They have no admin functions, no upgrades, no pausability, no ownership concept. What's deployed is what's audited.

You can verify the deployed bytecode matches the source on Etherscan. The source is in the repo.

## You trust your RPC provider

Kintsugi reads chain state and submits the Type-4 transaction through whatever RPC URL you configure. A malicious RPC could:

- Lie about the victim's current ETH balance, NonceTracker value, or token holdings (read-only lies; would cause your batch to revert)
- Refuse to broadcast your transaction
- Front-run your transaction by leaking it to a sweeper before broadcasting

The mitigation is to use an RPC you trust. Alchemy and Infura are reputable mainstream choices. A custom RPC URL is also fine if you trust the operator (or run the node yourself).

The `--private-mempool` flag routes the submission through Flashbots Protect, which sidesteps the public mempool and makes a third-party leak harder.

## You trust your safe wallet

The safe wallet is the destination for everything. If its key is compromised, recovered assets land in the attacker's hands a second time.

Generate the safe wallet from a brand-new seed, ideally on a hardware wallet, never on the compromised machine. Do not reuse any seed phrase the compromised machine touched.

## You trust the machine running Kintsugi

The CLI handles your private keys in process memory. If the machine has a keylogger or memory scraper, those keys can leak.

Run from a clean machine. If your normal machine is the one that got compromised, use a fresh USB boot or another physical device.

## You DO NOT have to trust:

- **A Kintsugi-operated server.** There isn't one. Nothing phones home.
- **The rescuer wallet.** The rescuer can only pay gas and submit the outer transaction. It cannot construct or substitute the inner batch (signature verification fails) and never receives rescued assets.
- **A web wallet extension.** Kintsugi does not use wallet-connect or any browser extension wallet. It signs in-process using the keys you paste into the prompt.
- **A third-party indexer (mostly).** Discovery is the one place we use third-party APIs (Alchemy, Etherscan, ENS subgraph). A bad indexer could cause Kintsugi to omit assets from auto-discovery, but it cannot cause a rescue to do something you didn't authorize. The on-chain `getLogs` fallback is available for paranoid setups.

## What "trustless" means here, honestly

The contracts are non-custodial. The library is local. The CLI is local. There is no entity in this stack that holds your funds or your keys.

But the rescue flow still requires you to trust the audited code, your RPC provider, your machine, and your safe seed. "Trustless" doesn't mean "zero trust"; it means "trust shifted to verifiable components you can inspect."

## Reporting a vulnerability

See [Reporting a vulnerability](/security/reporting/).
