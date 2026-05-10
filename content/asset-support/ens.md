---
title: "ENS names"
order: 3
description: "How Kintsugi rescues unwrapped 2LDs, wrapped names, and subdomains."
---

ENS is the asset class that gets the most ignored by sweeper bots and is also the most personally valuable for many people. Kintsugi handles all three subtypes.

## Unwrapped .eth 2LDs

The classical setup: you registered `yourname.eth` on the BaseRegistrar, never wrapped it. Two on-chain records describe ownership:

- The registrant: an ERC-721 NFT held by the BaseRegistrar contract
- The controller: the registry record that controls resolver, records, and subdomains

A complete transfer requires moving both. Kintsugi does this in two ops, **in this order**, in the same batch:

```text
1. baseRegistrar.reclaim(tokenId, safe)        # controller → safe
2. baseRegistrar.safeTransferFrom(victim, safe, tokenId)   # registrant → safe
```

Order matters. If you do the safeTransferFrom first, the registrant moves to safe and the original owner (victim) can no longer reclaim, leaving the controller stuck at victim. Kintsugi's batch builder always emits these two ops in the correct sequence.

After both ops, the safe wallet owns the name fully and can manage it (set resolver, transfer subdomains, sell, etc).

## Wrapped names

If you wrapped the name (via the NameWrapper contract), the registrant and controller are bundled into a single ERC-1155 token. One op moves both:

```text
nameWrapper.safeTransferFrom(victim, safe, namehash(name), 1, "0x")
```

This applies to wrapped 2LDs and to wrapped subdomains.

## Unwrapped subdomains

A subdomain like `alice.thing.eth` where `thing.eth` is owned by a separate parent owner. Ownership is just a registry record:

```text
ensRegistry.setOwner(namehash(alice.thing.eth), safe)
```

Kintsugi includes this op when you select the subdomain in discovery.

**Caveat**: the parent name's owner can override this transfer at any time via `setSubnodeOwner`. The op is durable only when the parent is cooperative (i.e., not the same compromised wallet, or if it is, you've moved the parent first in the same batch).

## Optional cleanup ops

After the rescue, you may want to:

- **Drop the resolver** so any malicious records (addr, text, contenthash) the attacker set are no longer resolvable. Op: `registry.setResolver(namehash(name), 0x0)`. Then optionally re-attach the latest PublicResolver from the safe wallet.
- **Clear the reverse record** so apps no longer label the compromised victim address with your old ENS name. Op: `reverseRegistrar.setName('')`.

These are one-line ops you can include in the rescue batch via [custom calls](/asset-support/custom-calls/), or run separately from the safe wallet after the rescue.

## Discovery

ENS names show up in the [Discovery](/ui-walkthrough/discover/) step under the **ENS names** section. Kintsugi enumerates them via the official ENS subgraph, which is comprehensive for mainnet and Sepolia. Each entry is labeled with its subtype (unwrapped 2LD, wrapped, subdomain) so you know which mechanism applies.

If a name doesn't show up in discovery (rare; usually means the subgraph is lagging), add the corresponding ops via custom calls.

## What about ENS on L2s

Kintsugi targets Ethereum mainnet and Sepolia. ENS deployments on L2s (the upcoming Namechain, Base, etc.) use different contract addresses; not currently supported. Coming when L2 mainnets stabilize.
