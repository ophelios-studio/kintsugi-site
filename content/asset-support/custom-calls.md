---
title: "Custom calls"
order: 4
description: "Add arbitrary contract calls to the rescue batch for unstake, claim, exit, revoke, and other long-tail flows."
---

Kintsugi auto-discovers ETH, ERC-20, ERC-721, ERC-1155, and ENS. Anything outside that surface (staked NFTs, vesting positions, LP positions, governance escrows) needs a custom call.

A custom call is just an op with arbitrary `to`, `value`, and ABI-encoded `data`. You use the `customCall` helper from `@ophelios/kintsugi-core` and place the resulting op in the batch alongside the auto-discovered ones.

## When to use a custom call

- **Unstake before transfer.** NFTs locked in a staking contract need to come back to the victim address before the standard transfer op can move them.
- **Unwrap an LP position.** A Uniswap v3 position NFT can be transferred as-is, but you may want to burn the position first so the underlying tokens land in the victim address before transfer.
- **Claim vested tokens.** Vesting contracts hold the tokens until you call `release()` or similar. Add that call, then transfer the resulting tokens.
- **Revoke an approval.** Call `token.approve(spender, 0)` to clear a stale approval the attacker might exploit later.
- **Exit a position.** Lending market `withdraw`, perps `closePosition`, etc.

If the goal is "get the assets out of the victim", custom calls let you do anything the victim could do, atomically, in one batch.

## API

```ts
import { customCall } from '@ophelios/kintsugi-core'

const op = customCall({
  to: '0xStakingContract',
  abi: [{
    type: 'function',
    name: 'unstake',
    inputs: [{ name: 'tokenIds', type: 'uint256[]' }],
    outputs: [],
    stateMutability: 'nonpayable',
  }],
  functionName: 'unstake',
  args: [[1n, 2n, 3n]],
  value: 0n, // optional, defaults to 0
})
```

The result is a plain `Op` object you can push into your `ops` array.

## Full example: unstake + transfer

```ts
import {
  customCall,
  transferErc721,
  buildBatch,
  signBatch,
  signRescueAuthorization,
  submitRescue,
  type Op,
} from '@ophelios/kintsugi-core'

const stakingAbi = [{
  type: 'function',
  name: 'unstake',
  inputs: [{ name: 'tokenIds', type: 'uint256[]' }],
  outputs: [],
  stateMutability: 'nonpayable',
}] as const

const ops: Op[] = [
  // 1. Unstake first so the NFTs return to the victim address
  customCall({
    to: stakingContract,
    abi: stakingAbi,
    functionName: 'unstake',
    args: [[1n, 2n, 3n]],
  }),
  // 2. Then transfer them out to the safe wallet
  ...[1n, 2n, 3n].map((id) =>
    transferErc721(nftContract, victimAddress, safeAddress, id),
  ),
]

const batch = buildBatch({
  safe: safeAddress,
  ops,
  nonce: trackerNonce,
  chainId: 1n,
})
const signature = await signBatch({ victim, batch, rescueAddress, chainId: 1 })
const authorization = await signRescueAuthorization({
  victim,
  rescueAddress,
  chainId: 1,
  nonce: victimNonce,
})
const txHash = await submitRescue({
  rescuer,
  victimAddress,
  batch,
  signature,
  authorization,
})
```

The op order is the execution order. Place `unstake` before the `transferErc721` ops so the NFTs are in the victim address when the transfers fire. Reverse order would revert (NFTs not yet at the victim).

## Atomicity guarantees apply to custom calls too

Custom calls are part of the same batch as the auto-discovered ops. They get the same atomicity: either every op (custom + standard) succeeds or the whole batch reverts. The sweeper has no opening between an unstake op and the following transfer.

## Where to use custom calls today

Currently custom calls are a TypeScript API on `@ophelios/kintsugi-core`. The CLI and UI auto-discover and build batches without exposing custom calls to non-developers. If you need custom calls for a rescue, write a small TypeScript script that imports `@ophelios/kintsugi-core` and submits your own batch.

Adding a "custom calls" UI panel that accepts contract address + ABI fragment + function call is on the roadmap.
