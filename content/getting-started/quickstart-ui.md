---
title: "Quickstart (UI)"
order: 4
description: "Drive the same atomic rescue from a friendly localhost browser UI."
---

The web UI runs as a localhost server launched from the CLI. The browser is just a view; the actual signing and transaction submission happen in the local Node process. Private keys never leave it.

## Run

```bash
kintsugi ui
```

You'll see something like:

```text
Kintsugi UI
Local server bound to 127.0.0.1 only.

URL: http://127.0.0.1:38080/#t=4f8a1c2e-...

Press Ctrl-C to stop the server. The browser opens automatically.
```

The token in the URL fragment authenticates this browser tab to the server. Anyone without it gets 401, even on the same machine.

## Walk through

The UI mirrors the CLI's five phases as five steps with a sidebar progress strip across the top.

### 1. Network

Pick mainnet or Sepolia. The Rescue and NonceTracker addresses pre-fill for Sepolia. Paste your Alchemy API key (or a custom RPC URL) so chain reads are fast and discovery works on the wide block ranges.

### 2. Wallets

Three cards, top to bottom:

- **Compromised wallet (victim).** Paste the private key. The input is visually masked and never written to disk.
- **Safe destination.** Paste the address that receives every rescued asset.
- **Rescuer (pays gas).** Paste an existing key or click **Generate a fresh wallet**. If generated, the next page shows you the address and pauses for you to fund it.

### 3. Discover

Kintsugi scans the victim address. ERC-20s, NFTs, and ENS names appear with a check next to each. Toggle off anything you don't want to rescue. You can also add custom contracts manually (low-cap tokens, NFTs from a specific collection).

### 4. Plan

You see the full batch in execution order, the estimated gas, and the rescuer balance. If the rescuer is underfunded, the page polls every few seconds and unlocks the **Sign and submit** button when funds arrive.

### 5. Submit

One click. The UI shows the tx hash with a Sepolia/mainnet explorer link as soon as it broadcasts. It polls until the transaction is mined and shows the final block number.

## Stop the server

`Ctrl+C` in the terminal. The session is wiped from memory. The browser tab will stop responding to API calls (token is gone with the process).

## Next

Read the [UI Walkthrough](/ui-walkthrough/network/) for screenshots of each step, or jump to the [CLI reference](/cli-reference/rescue/) if you want to script the same flow.
