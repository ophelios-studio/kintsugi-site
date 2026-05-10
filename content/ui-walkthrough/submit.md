---
title: "Submit"
order: 5
description: "Step 5 of the UI rescue: watch the Type-4 transaction land."
---

The final step. The server has signed everything, sent the Type-4 transaction, and is now polling the chain for inclusion.

## What you see

A vertical timeline with four checkpoints:

1. **Signing batch and authorization** — instant. The CLI signs the EIP-712 batch and the EIP-7702 authorization in process memory.
2. **Broadcasting Type-4 transaction** — short. The rescuer wallet client sends the transaction to your RPC.
3. **Waiting for inclusion** — usually one block, sometimes a couple. The page polls `/api/submit/status/<hash>` every 4 seconds until the receipt is available.
4. **Done** — block number and gas used appear here. The page also shows a summary of what landed at the safe wallet.

The transaction hash is shown as soon as it broadcasts, with a link to the chain explorer (Sepolia or mainnet Etherscan).

## If the transaction reverts

Possible causes:

- The deadline expired (took longer than expected to fund). Re-run; the new batch gets a fresh deadline.
- A custom call you added is malformed. Remove it and re-run.
- A transfer raced with a manual transaction (very rare). The whole batch reverts atomically; nothing partial happens. Re-run.

The page reports the revert reason and an explorer link. Nothing has been moved.

## After success

- All selected assets are at the safe wallet.
- The victim wallet's ETH balance is still zero.
- The victim wallet has a 7702 delegation pointer to the Rescue contract baked into its code slot.

If you want to clear that delegation, run `kintsugi revoke` from the terminal. Optional. See the [revoke command reference](/cli-reference/revoke/).

## Stop the server

`Ctrl+C` in the terminal that ran `kintsugi ui`. The session is wiped from memory. The browser tab will stop responding to API calls.
