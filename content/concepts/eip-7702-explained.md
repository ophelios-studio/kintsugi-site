---
title: "EIP-7702 in plain English"
order: 2
description: "What set-code transactions are, what they let you do, and why that matters for wallet rescue."
---

EIP-7702 introduced a new transaction type to Ethereum (Type-4, `SetCodeTransaction`) at the Pectra hardfork in May 2025. It lets an externally-owned account (a normal user wallet) temporarily delegate execution to a smart contract.

## What is in a Type-4 transaction

A Type-4 transaction looks like a normal one with extra fields. The important new field is the `authorization_list`. Each entry is a tuple:

```text
(chainId, address, nonce, y_parity, r, s)
```

Signed by some EOA (call it the *authority*). The signature commits the authority to delegating to `address` for one nonce on one chain.

When the transaction is processed:

1. Each authorization in the list is processed sequentially.
2. For each one, the protocol verifies the signature, recovers the authority, and sets the authority's code to the delegation pointer `0xef0100 || address`.
3. The authority's nonce is incremented.
4. After all authorizations have processed, the transaction body executes normally.

Once an EOA has the delegation pointer in its code slot, any call to that EOA is routed to the target contract's bytecode, executing in the EOA's storage and balance context.

The delegation persists until the EOA submits another 7702 authorization (which can point to `address(0)` to clear it).

## The piece that makes it useful for rescue

The sender of the Type-4 transaction does not have to be the authority.

Read that again. The transaction's `from` field, who pays gas, who must have ETH, can be any wallet. The authority just needs to have signed an authorization tuple ahead of time.

For rescue this is everything. A separate rescuer wallet you control can submit a transaction whose `to` is the victim address, embed the victim's signed authorization that points to a small audited rescue contract, and embed calldata that calls into that contract. The victim's bytecode now runs the rescue contract's logic, in the victim's storage and balance, paying nothing for gas.

## What an EIP-7702 authorization signs

The authority signs a hash over `(chainId, address, nonce)`:

- `chainId` binds the authorization to one chain. Must match `block.chainid` at processing time, or the protocol rejects it.
- `address` is the contract to delegate to. The Rescue contract address on that chain.
- `nonce` is the authority's account nonce. Must equal the actual nonce when processed, or the protocol rejects it.

The authority's signature is sufficient. No interaction with the authority is needed at submission time.

## What it does not do

EIP-7702 does not let the rescuer drain the victim wallet. The rescuer can only submit transactions that the victim has authorized. The victim's authorization in Kintsugi is scoped to one specific batch of transfers (signed via EIP-712, see [atomic batches](/concepts/atomic-batches/)) plus the 7702 delegation pointer for one nonce.

EIP-7702 also does not change ownership. The authority still owns the EOA. The delegation can be revoked at any time by the authority signing a new authorization to `address(0)`.

## The trust shape

After an EIP-7702 rescue, the victim address has a delegation pointer to the Rescue contract. That is a single line of code: it does not store any victim assets, it only routes calls. Anyone calling the victim address with `executeBatch(...)` calldata still needs a valid victim EIP-712 signature for the specific batch they want to run.

If you don't want to leave the delegation in place, run `kintsugi revoke` after the rescue. It submits a 7702 authorization pointing the victim back to `address(0)`, restoring it to a pure EOA.

## Further reading

- [EIP-7702 spec](https://eips.ethereum.org/EIPS/eip-7702)
- [The rescuer wallet pattern](/concepts/rescuer-pattern/) (how Kintsugi uses 7702 in practice)
- [Atomic batches](/concepts/atomic-batches/) (what executes inside the delegated call)
