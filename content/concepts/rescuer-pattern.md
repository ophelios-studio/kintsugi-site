---
title: "The rescuer wallet pattern"
order: 3
description: "Three wallets, one transaction. The shape that breaks the sweeper."
---

Kintsugi uses three wallets in every rescue. Knowing what each does (and what each does not do) clarifies the trust model and makes the flow easier to reason about.

## The three roles

| Wallet | Holds | Signs | Pays gas | Receives assets |
|--------|-------|-------|----------|-----------------|
| Victim | nothing during rescue | EIP-7702 authorization + EIP-712 batch | no | no |
| Rescuer | small amount of ETH | the Type-4 transaction itself | yes | no |
| Safe | nothing before, everything after | nothing | no | yes |

## Victim

The compromised wallet. You have its private key (and the attacker probably does too). It signs two things off chain:

1. An EIP-7702 authorization that delegates the victim address to the Rescue contract for exactly one nonce on one chain.
2. An EIP-712 batch authorization that lists the exact ops to run (transfer this token, this NFT, this ENS, etc.), pinned to a deadline and a tracker nonce.

The victim never receives ETH at any point during the rescue. There is nothing for a sweeper to take.

## Rescuer

A wallet you control with about 0.005 ETH on the target chain. Its job is to submit and pay for the Type-4 transaction. The transaction's `to` is the victim address. The 7702 authorization in the transaction is the victim's. The calldata is `Rescue.executeBatch(batch, victimSignature)`.

The rescuer signs only the outer Type-4 transaction. It cannot construct a different batch and run it; the EIP-712 signature in the calldata is the victim's, and the Rescue contract checks it against the victim's address. If the rescuer ever tried to substitute a different batch, signature verification would fail and the contract would revert.

The CLI can generate a fresh rescuer wallet for you and pause while you fund it. After the rescue, the rescuer holds whatever ETH it had minus gas; you can drain that to your safe wallet and forget the wallet exists. The rescuer is not collateral or a custodian; it's a payer.

## Safe

A brand-new wallet you generated from a brand-new seed. It does nothing during the rescue itself. After the rescue, it owns every asset that was at the victim address and Kintsugi was asked to move.

The safe must come from a clean seed. Reusing a seed (or any address derivation that touches the compromised seed) re-exposes the recovered assets.

## Why three and not one

A single-wallet rescue is what fails today: you would send the victim ETH for gas (sweeper takes it), transfer assets (no gas, reverts), end of story.

A two-wallet rescue (rescuer pays gas, transfers assets to the rescuer wallet) is technically possible but co-mingles roles. The rescuer would now hold the recovered assets, which means it has to be cold storage, which means you don't want it generating one-shot rescue transactions and leaving its key warm.

Three wallets keeps roles clean. The rescuer key is one-shot warm; the safe key is cold; the victim key is burned the moment the rescue is done.

## The atomicity guarantee

All of this happens in one transaction. Either every transfer in the batch lands at the safe wallet, or none of them do (the contract reverts the whole batch on any failure). There is no partial state, no mid-flight drain opportunity, no "transferred 3 of 5 NFTs and then ran out of gas."

That is what makes the pattern sweeper-proof in practice. The sweeper has no observable opening between "victim has no ETH" and "all assets are at the safe wallet."

## Diagram

```text
    ┌─────────────┐    sign    ┌────────────────────┐
    │  victim PK  │ ──────────▶│ EIP-712 batch      │
    │  (warm)     │            │ EIP-7702 auth      │
    └─────────────┘            └────────────────────┘
                                         │
                                         ▼
    ┌─────────────┐  build &   ┌────────────────────┐
    │  rescuer PK │  submit    │  Type-4 tx         │
    │  (warm)     │ ──────────▶│  to: victim addr   │
    └─────────────┘            │  paid by rescuer   │
                               └────────────────────┘
                                         │
                                         ▼
                               ┌────────────────────┐
                               │  Rescue.executeBatch│
                               │  (delegated call,   │
                               │  victim's storage)  │
                               └────────────────────┘
                                         │
                                         ▼
                               ┌────────────────────┐
                               │   safe wallet      │
                               │   (cold)           │
                               └────────────────────┘
```

## Further reading

- [EIP-7702 in plain English](/concepts/eip-7702-explained/)
- [Atomic batches](/concepts/atomic-batches/)
- [The NonceTracker](/concepts/nonce-tracker/) (replay protection)
