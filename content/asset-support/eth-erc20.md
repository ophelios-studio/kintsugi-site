---
title: "ETH and ERC-20"
order: 1
description: "How Kintsugi rescues fungible tokens from a compromised wallet."
---

The most basic asset class. The victim wallet sweeps both during the rescue.

## ETH

The victim wallet's native ETH balance, if any, is transferred to the safe wallet inside the same Type-4 transaction. Because the rescuer pays gas, the victim never needs to top up. ETH appears in the batch as a final transfer with `value` set to the full balance and an empty `data` field.

If the victim's ETH balance is zero (the typical case after a sweeper has been active), Kintsugi skips the ETH op entirely.

## ERC-20

Standard ERC-20 tokens are transferred via the contract's `transfer(to, amount)` function. Kintsugi reads the current balance from the chain at batch-build time, then encodes a transfer op for each selected token.

If a token has a non-standard `transfer` (returns nothing, returns false on failure, has fees, requires allowlist), the op may revert. Most ERC-20s in the wild are standard.

### Discovery

In the [Discovery](/ui-walkthrough/discover/) step:

- With an Alchemy key: tokens come from `alchemy_getTokenBalances` (filtered to non-zero) and `alchemy_getTokenMetadata` for symbol + decimals.
- Without Alchemy: Etherscan v2 enumerates ERC-20 transfer events to/from the victim, then per-contract `balanceOf` calls confirm current ownership.

### Manual entry

For tokens neither Alchemy nor Etherscan indexes (a freshly-deployed ERC-20, a private launch), use **+ Add** in the ERC-20 section. Paste the contract address, symbol, decimals, and the raw balance.

You can read the raw balance by calling `balanceOf(victim)` on the token contract via any explorer's read tab.

## ETH wrapping

Kintsugi does not auto-unwrap WETH (or wstETH, etc.) before transfer. WETH is treated as a regular ERC-20 and moved as such. After the rescue, you can unwrap from the safe wallet at your leisure.

If you need to unwrap inside the same batch (rare; usually unnecessary), use a [custom call](/asset-support/custom-calls/).

## Tokens with fees-on-transfer

Some ERC-20s burn or redirect a percentage on every transfer. Kintsugi transfers the full balance, and the recipient (safe wallet) receives whatever the contract chooses to actually credit. The transferred-vs-received gap is intrinsic to the token, not a Kintsugi behavior.

If you need to disable a fee mechanism before transfer (some allow exempting an address), do that with a [custom call](/asset-support/custom-calls/) placed before the transfer in the batch.

## Tokens that require approval-then-transferFrom

Standard ERC-20 transfers from the holder use `transfer(to, amount)`, no approval needed. Kintsugi uses this path. Edge case: a token that overrides `transfer` to require allowance from the caller (very unusual) would fail. We have not seen one in the wild.
