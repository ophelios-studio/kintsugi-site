---
title: "Prerequisites"
order: 2
description: "What you need ready before starting a wallet rescue."
---

A rescue takes about five minutes. Lining up these four things first will make the actual flow stress-free.

## A clean machine

If your old machine is the one that got compromised, do not run a rescue on it. The attacker may still have access. Use a separate, freshly imaged machine, or boot from a clean USB. Kintsugi does not protect you from a keylogger watching you type the victim key.

## The compromised wallet's private key

You need the raw private key of the wallet you're rescuing.

In MetaMask: open the account menu, click **Account details**, then **Show private key**. You will be asked for your password.

Never paste the key into a website. Kintsugi only ever asks for it inside its local CLI prompt or its localhost-bound UI. The key stays in the local Node process memory and is never written to disk.

## A safe destination wallet

This is where every rescued asset will land. It must be a brand-new wallet generated from a brand-new seed phrase. Do not reuse the compromised seed, do not reuse a seed you've stored anywhere the compromised machine could see.

Generate it on a clean machine, ideally with a hardware wallet. You only need its address for the rescue. The CLI never asks for the safe wallet's private key.

## A clean rescuer wallet with about 0.005 ETH

The rescuer wallet pays gas and submits the Type-4 transaction. It needs to be a wallet you control, with a small amount of ETH on the same chain you are rescuing on.

If you do not already have one, the CLI can generate a fresh rescuer for you and pause while you fund it. Send roughly 0.005 ETH from an exchange or another clean wallet. On Sepolia, faucet ETH works.

The rescuer wallet is involved only as a payer; it never holds rescued assets and never signs anything that moves them. After the rescue, you can drain its small remaining balance and forget it.

## A funded RPC endpoint

Kintsugi needs an authenticated RPC to read the chain quickly and to discover assets. The free public endpoints rate-limit and reject the wide block ranges Kintsugi scans.

The simplest path is a free Alchemy account: sign up at [dashboard.alchemy.com](https://dashboard.alchemy.com) and copy the API key for your target network. The UI and CLI both accept the bare key.

You can also bring your own RPC URL (Infura, QuickNode, your own node).

## What you do not need

- A second seed phrase to "verify" anything (no one should ever ask).
- Custom approvals or sign-in flows on third-party sites.
- Any wallet connection in the browser. Kintsugi never asks for a wallet connect.

## Next

Pick your starting surface: [the guided UI](/getting-started/quickstart-ui/) or [the terminal CLI](/getting-started/quickstart-cli/).
