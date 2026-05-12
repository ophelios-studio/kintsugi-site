---
title: "Atomic batches and ordering"
order: 5
description: "What happens inside Rescue.executeBatch and why the order of ops matters."
---

A Kintsugi rescue executes one function on the audited Rescue contract:

```solidity
function executeBatch(Batch calldata batch, bytes calldata signature) external;
```

The contract walks through the validation checks, then loops over the ops in `batch.ops` and executes them in order. Any failure reverts the entire batch.

## The Batch struct

```solidity
struct Op {
    address to;
    uint256 value;
    bytes data;
}

struct Batch {
    address safe;
    Op[] ops;
    uint256 nonce;
    uint256 deadline;
    uint256 chainId;
}
```

`safe` is informational (Kintsugi pins it for clarity but every transfer in `ops` already encodes the destination). `nonce` matches the NonceTracker. `deadline` is a Unix timestamp past which the signature is invalid. `chainId` must match the chain it's running on.

## The validation order

Inside `executeBatch`:

1. `block.chainid == batch.chainId` (cross-chain replay).
2. `block.timestamp <= batch.deadline` (liveness bound).
3. The batch nonce equals `NonceTracker.nonceOf(address(this))` (replay protection).
4. The EIP-712 signature recovers an address equal to `address(this)`. Under 7702 delegated execution, that is the victim's address.

If any check fails, the contract reverts before any op runs. If all pass, the nonce is incremented, then the loop runs.

## Atomicity

Atomicity is at the EVM transaction level. The whole batch lives inside one Type-4 transaction. If any single op reverts, the entire transaction reverts and *all* state changes are rolled back, including the nonce increment. From the chain's perspective the rescue never happened.

Practically:

- You never end up with 3 of 5 NFTs transferred and the rest stuck.
- A failing transfer (insufficient approval, contract bug, paused token) cancels the rescue cleanly. You can re-build the batch with that op removed and try again. The nonce did not increment so no replay risk.
- A sweeper cannot insert itself between two ops in the batch because the EVM does not interleave intra-transaction execution with other transactions.

## Order matters

The contract executes ops in array order. That has two implications.

### Pre-transfer setup

If an asset needs to be unstaked, unwrapped, or claimed before transfer, the setup op must come first.

Example: a staked NFT collection where the NFTs live in a staking contract until unstaked. The batch is:

```text
1. unstake(tokenIds = [1, 2, 3])     # NFTs return to victim address
2. transferFrom(victim, safe, 1)     # NFT 1 → safe
3. transferFrom(victim, safe, 2)     # NFT 2 → safe
4. transferFrom(victim, safe, 3)     # NFT 3 → safe
```

If you place the transfers before the unstake, they revert (the NFTs are still at the staking contract).

### ENS reclaim before registrant transfer

Unwrapped .eth 2LD names need their controller reclaimed before the registrant is transferred. Kintsugi does this automatically when you select an unwrapped 2LD; the resulting batch contains both ops in the correct order.

### Custom ops

For assets Kintsugi doesn't auto-discover (vesting positions, LP positions, exotic NFTs), you can compose your own ops with `customCall` from `@ophelios/kintsugi-core` and place them where they need to be in the array. See the [custom calls](/asset-support/custom-calls/) page.

## Gas

The whole batch consumes gas in one transaction. Kintsugi estimates this with a per-op heuristic before submission and shows you the expected cost. The rescuer wallet must cover it. Real cost is usually within ~15% of the estimate.

If a batch is too expensive to fit in one block, you can run it in chunks: rescue the most valuable assets first, then submit a second rescue with the remainder. Each rescue is its own batch with its own NonceTracker increment.

## Deadline

The signature is valid until `batch.deadline`. The CLI defaults to a generous window (about an hour from sign time) so a slow funding step doesn't expire the signature. If you wait too long and miss the deadline, re-build and re-sign. Fast operation, no funds at risk.

## Further reading

- [The NonceTracker](/concepts/nonce-tracker/)
- [The rescuer wallet pattern](/concepts/rescuer-pattern/)
- [Asset support: custom calls](/asset-support/custom-calls/)
