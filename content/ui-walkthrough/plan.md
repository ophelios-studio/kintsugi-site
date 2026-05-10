---
title: "Plan"
order: 4
description: "Step 4 of the UI rescue: review the batch and check rescuer funding."
---

Kintsugi shows the full batch in execution order, an estimated gas cost, and the rescuer's current balance. This is your last chance to verify before signing.

## Batch list

Each line in the batch is one op (one transfer or setup call). The order is the execution order. Per-op breakdown:

- **transfer ERC-20**: token symbol, amount in human-readable units, destination
- **transfer ERC-721**: collection name, tokenId, destination
- **transfer ERC-1155**: id, amount, destination
- **ENS unwrapped 2LD**: a `reclaim` op (controller) followed by a `safeTransferFrom` (registrant)
- **ENS wrapped**: one `safeTransferFrom` on the NameWrapper
- **ENS subdomain**: one `setOwner` on the registry
- **custom call**: shows the target contract and a hex preview of the calldata

If anything looks wrong (wrong token, wrong amount, wrong destination), go back to the previous step and adjust.

## Gas estimate

Kintsugi does a heuristic gas estimate based on per-op type plus the EIP-7702 + EIP-712 fixed overhead. Real cost is usually within 15% of the estimate. The current network gas price is read from the chain.

The line `Estimated cost: <amount> ETH` is what the rescuer wallet needs to cover.

## Rescuer funding status

Below the gas estimate is the rescuer wallet card with three columns:

- **Send ETH to this address** (with a copy button)
- **Current balance** (live-polled every 4 seconds)
- **Required (estimate)**
- **Status**: `Funded ✓` when balance >= required, `Underfunded` otherwise

If you generated a fresh rescuer in the Wallets step, this is where you fund it. Send the required amount (round up generously) from another wallet. The page polls the chain every 4 seconds, so the status flips to **Funded** within a few seconds of the deposit confirming.

The **Sign and submit** button is disabled until the status is **Funded**.

## Sign and submit

Click **Sign and submit**. The server signs the EIP-7702 authorization and the EIP-712 batch (using the victim key in process memory), then constructs and submits the Type-4 transaction. Move on to the [Submit](/ui-walkthrough/submit/) step.
