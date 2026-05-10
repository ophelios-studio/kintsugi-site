---
title: "The sweeper problem"
order: 1
description: "Why normal asset recovery from a compromised wallet usually fails."
---

A wallet is compromised the moment its private key leaves your control. Drainer bots, infostealer malware, exfiltrated keychains, a careless paste into a phishing site. The attacker now signs everything you can.

The natural response is to move the assets out before the attacker does. That is where the sweeper problem starts.

## What a sweeper bot does

After a successful key compromise, the attacker (or the marketplace they sold the keys to) deploys a sweeper bot pointed at the victim address. The bot has one job: grab any ETH that lands there and transfer it out before the victim can use it for gas.

In practice the bot watches the mempool and the latest block. The moment a transaction confirms ETH at the victim address, the bot submits a high-priority transaction in the same block (or the next one) draining that ETH to an attacker-controlled address.

This breaks every normal recovery path:

- **Send the victim ETH for gas, then transfer assets out**: the gas is gone in the same block. The asset transfer never happens.
- **Submit a Flashbots bundle with funding plus transfers**: the relay does per-transaction balance validation against pre-bundle state, so any transaction in the bundle whose `gasLimit * maxFeePerGas + value` exceeds the victim's pre-bundle balance is rejected. Inter-transaction funding does not survive validation.
- **Use a pre-funded victim**: if the victim already has gas, the attacker has presumably already drained whatever was sweepable.

You end up watching tokens, NFTs, and ENS names sit in a wallet you cannot reach.

## Why some assets get left behind

Sweeper bots optimize for fast liquidation. They drain ETH and the most liquid ERC-20s first because those convert to attacker stablecoins in seconds. Anything that takes effort to fence usually gets ignored:

- **ENS names.** They have to be transferred, listed, and bought. Slow.
- **Long-tail NFTs.** Markets are thin. Resale takes work.
- **Low-cap tokens.** No deep liquidity, no easy exit.
- **Vesting positions, in-game items, memberships.** Often not even transferable directly.

These are frequently the most personally valuable holdings, and they sit visible to everyone, untouched, on a wallet the sweeper still gates.

## Why timing tricks do not work

You might think you can wait the bot out. Bots do not get bored. They run for months. They poll cheaply.

You might think you can race the bot. The bot has a head start (it is already pointed at the address) and pays whatever priority fee it needs. You will lose the priority race in any block.

You might think you can use a private mempool to hide the funding transaction. That helps if the bot only watches the public mempool, but does not help if the bot reacts to confirmed balance changes in the next block (which is the typical pattern).

The fundamental problem is that any path requiring the victim to hold ETH at any point creates an opening. The fix is to remove that requirement.

## What changes the picture

Two Ethereum upgrades made a different solution viable:

- **EIP-712** (typed data signatures). The victim can sign a structured message authorizing a specific batch of transfers, off chain.
- **EIP-7702** (set-code transactions). After the Pectra hardfork in May 2025, an EOA can delegate execution to a contract via a signed authorization, and a *different* account can be the sender that pays gas.

Combine the two and you can build a single transaction that:

1. Is sent and paid for by a separate rescuer wallet.
2. Carries a 7702 authorization that delegates the victim address to a small audited rescue contract.
3. Carries an EIP-712 signature from the victim authorizing a specific batch of transfers.
4. Executes every transfer atomically, with the victim never holding ETH at any point.

That is what Kintsugi builds. Read the [rescuer wallet pattern](/concepts/rescuer-pattern/) for the structure, [EIP-7702 in plain English](/concepts/eip-7702-explained/) for the protocol mechanics, and [atomic batches](/concepts/atomic-batches/) for what happens inside the rescue contract.
