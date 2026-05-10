---
title: "Quickstart (CLI)"
order: 3
description: "Run a full rescue from the terminal in five minutes."
---

If you have your prerequisites lined up, the entire rescue is one command.

## Run

```bash
kintsugi rescue
```

The CLI walks you through five phases.

## 1. Network

Pick the chain the compromised wallet lives on:

```text
? Network: › 
❯ Sepolia (testnet)
  Mainnet
```

Sepolia is for testing. Mainnet is the real thing.

## 2. Deployment addresses

The Rescue and NonceTracker contract addresses on the chain you picked. Defaults are pre-filled for Sepolia. For mainnet, paste the addresses from the [security page](/security/threat-model/).

## 3. Wallets

Three wallets, in order:

- **Victim private key.** Paste it. Input is masked. Kintsugi shows you the derived address to confirm before continuing.
- **Safe address.** Paste the destination address. Kintsugi never asks for its private key.
- **Rescuer.** Choose: paste an existing rescuer key, or generate one. If you generate one, the CLI prints the address and pauses while you fund it. Send about 0.005 ETH and press Enter.

## 4. Discover and select

Kintsugi scans the victim address for ERC-20 tokens, ERC-721 NFTs, ERC-1155 balances, and ENS names. You then pick which to rescue using arrow keys and space:

```text
ERC-20 tokens
  ◉ MOCK   100   0x36d4...ef63
  ◉ USDC    42   0xa0b8...eb48

ERC-721 NFTs
  ◉ MyArt #12   0xd9f1...c8c4
  ◯ MyArt #13   0xd9f1...c8c4
```

By default everything is selected. Toggle off anything you don't want to rescue.

## 5. Plan and submit

The CLI prints the full batch in execution order, then asks for confirmation:

```text
Batch (4 ops)
  1. transfer MOCK 100 → safe
  2. transfer MyArt #12 → safe
  3. transfer ETH 0.0042 → safe
  4. ...

Estimated gas: 412 000
Estimated cost: 0.000402 ETH
Rescuer balance: 0.005 ETH (sufficient)

Sign and submit? (y/N)
```

Type `y` and press Enter. The CLI signs the EIP-7702 authorization, signs the EIP-712 batch, and the rescuer submits one Type-4 transaction.

You'll see the tx hash, then a wait, then a block number when it lands. Most rescues are mined in the next block.

## Done

All selected assets are now in your safe wallet. The compromised wallet is empty.

If you want to clear the EIP-7702 delegation from the victim address (so it returns to a plain EOA), run `kintsugi revoke`. Optional.

## Common flags

```bash
# route through Flashbots Protect (private mempool)
kintsugi rescue --private-mempool

# pre-fill the Etherscan API key
kintsugi rescue --etherscan-api-key YOURKEY

# override deployed contract addresses
kintsugi rescue --rescue-address 0x... --tracker-address 0x...
```

Full reference: [CLI Reference / rescue](/cli-reference/rescue/).

## Next

Prefer a browser? [Run with the UI](/getting-started/quickstart-ui/).
