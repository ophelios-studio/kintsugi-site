---
title: "kintsugi rescue"
order: 1
description: "Run an interactive wallet rescue from the terminal."
---

The interactive rescue command. Walks you through the five phases (network, wallets, discover, plan, submit) with masked prompts for private keys.

## Synopsis

```bash
kintsugi rescue [options]
```

## Options

| Flag | Description |
|------|-------------|
| `-p, --private-mempool` | Submit through Flashbots Protect instead of the public mempool. Adds 1-3 minutes of latency, hides the transaction from the public mempool. |
| `--etherscan-api-key <key>` | Etherscan v2 API key for higher discovery rate limits. Also accepted as `ETHERSCAN_API_KEY` env var. |
| `--rescue-address <address>` | Override the deployed Rescue contract address (advanced; do not change unless you know why). |
| `--tracker-address <address>` | Override the deployed NonceTracker contract address (advanced). |

## What it does

1. Asks for the network (mainnet or Sepolia).
2. Confirms or accepts overrides for the Rescue and NonceTracker contract addresses.
3. Reads the victim private key from a masked prompt and shows the derived address.
4. Reads the safe destination address.
5. Reads or generates the rescuer wallet, pauses if you generated it so you can fund it.
6. Discovers ERC-20s, NFTs, ERC-1155 balances, and ENS names at the victim address.
7. Multi-select prompts to pick what to rescue.
8. Prints the full batch in execution order with estimated gas and rescuer balance check.
9. On confirmation, signs the EIP-7702 authorization, signs the EIP-712 batch, submits the Type-4 transaction.
10. Waits for inclusion and prints the block number.

## Example

```bash
$ kintsugi rescue --private-mempool
? Network: › Sepolia
? Rescue contract: 0x53c1f40c...21fd5
? NonceTracker contract: 0x717883ab...47963
? Victim private key: ****************
  derived victim address: 0x9658...40B6
? Safe destination address: 0x906709Db5C107981c106490902b505836092f26A
? Rescuer wallet: › Generate a fresh wallet
  fresh rescuer: 0xEcfe5c587cFeAAAc03237DD6d418a75224E7D6B6
  send about 0.005 ETH to that address. Press Enter when funded.
[Enter]
✓ rescuer balance: 0.01 ETH

Discovering assets...
✓ ERC-20: MOCK 100
✓ ERC-721: MockNFT #12, #13, #14

? Select assets to rescue: › all 4 selected (space to toggle)

Batch (4 ops)
  1. transfer MOCK 100 → 0x9067...f26A
  2. transfer MockNFT #12 → 0x9067...f26A
  3. transfer MockNFT #13 → 0x9067...f26A
  4. transfer MockNFT #14 → 0x9067...f26A

Estimated gas: 412 000
Network gas price: 0.0012 gwei
Estimated cost: 0.000000494 ETH

? Sign and submit through Flashbots Protect? (y/N) y

Signing batch...                ✓
Signing 7702 authorization...   ✓
Submitting Type-4 tx...         ✓

  tx: 0xd91f44ce7eecb3e9...1bd027baf3
  https://sepolia.etherscan.io/tx/0xd91f44ce7eecb3e9...

Waiting for inclusion...        ✓ block 10822054

Done. All 4 assets transferred to 0x9067...f26A.
```

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success, batch confirmed on chain |
| 1 | User cancelled, validation failed, or transaction reverted |

## Related

- [kintsugi ui](/cli-reference/ui/) — same flow, browser interface
- [kintsugi status](/cli-reference/status/) — read-only inventory before rescue
- [kintsugi revoke](/cli-reference/revoke/) — clear delegation after rescue
