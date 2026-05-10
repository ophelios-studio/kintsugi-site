---
title: "The NonceTracker"
order: 4
description: "Replay protection that survives delegated execution without writing to victim storage."
---

The NonceTracker is a small singleton contract that exists for one reason: to give Kintsugi a per-victim replay nonce that is safe even when the rescue contract is running as a 7702 delegate inside the victim's storage.

## Why a separate contract

When the Rescue contract code runs delegated at the victim's address, any storage write goes to the victim's storage, not to the Rescue contract's storage. That creates a problem for replay protection.

The naive design would store a per-victim nonce inside the Rescue contract:

```solidity
mapping(address => uint256) nonces;
function executeBatch(...) {
    require(batch.nonce == nonces[address(this)], "bad nonce");
    nonces[address(this)]++;
    // ...
}
```

Run that delegated and `nonces[address(this)]++` writes into the victim's storage at whatever slot the mapping computes. If the victim later sets a 7702 delegation to a different contract that happens to use the same slot, that contract can read or overwrite Kintsugi's nonce. Replay protection is gone.

## What the NonceTracker does

The NonceTracker is its own contract at its own address. Its only state is a mapping:

```solidity
mapping(address => uint256) public nonceOf;
function increment() external returns (uint256) {
    return ++nonceOf[msg.sender];
}
```

When the Rescue contract code (running delegated at the victim's address) calls `NonceTracker.increment()`, the NonceTracker's `msg.sender` is the victim's address. The increment writes to slot `nonceOf[victim]` inside the NonceTracker's storage. The victim's storage is never touched.

No party other than the victim's own address can increment that slot, because the key is `msg.sender`, not a parameter. There is no way to forge a nonce increment from another address.

## How it integrates with the batch

The Rescue contract reads `NonceTracker.nonceOf(address(this))` (where `address(this)` is the victim during delegated execution), checks the batch nonce matches, increments the tracker, then executes the batch. Any failure reverts the increment along with the rest of the call (since reverts roll back all state changes).

The CLI reads the current tracker nonce when building the batch, signs against that value, and the chain enforces it on execution.

## Cross-chain replay

The tracker also pairs with the EIP-712 domain separator (which pins the verifying contract to the deployed Rescue address on each chain) and with the explicit `chainId` field in the batch. A signature valid on Sepolia is rejected on mainnet because the domain separator differs and the in-batch chainId differs.

A victim could, in theory, have the same delegation set on multiple chains. The signature still won't replay across them.

## Why this matters even if you trust Kintsugi

You should still want the rescue contract to be incapable of replay. The whole point of the rescuer pattern is that the victim signs a small, scoped, time-bound authorization. If the Rescue contract were replayable, a stolen-then-rescued wallet's batch signature could be re-submitted by anyone after the fact. The combination of NonceTracker + deadline + EIP-712 domain pinning closes that.

## Further reading

- [Atomic batches](/concepts/atomic-batches/)
- [The threat model](/security/threat-model/)
