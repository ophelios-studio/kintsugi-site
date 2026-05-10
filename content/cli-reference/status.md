---
title: "kintsugi status"
order: 3
description: "Read-only inventory of any wallet."
---

Inspect a wallet without touching it. No keys, no transactions, no signing. Useful before a rescue (to know what's there) and after (to confirm the safe wallet received everything).

## Synopsis

```bash
kintsugi status <address> [options]
```

## Arguments

| Arg | Description |
|-----|-------------|
| `<address>` | The wallet address to inspect. Must be a 0x-prefixed 40-char hex address. |

## Options

| Flag | Description |
|------|-------------|
| `-c, --chain <chain>` | Network to query. `mainnet` or `sepolia`. Default: `mainnet`. |
| `--etherscan-api-key <key>` | Etherscan v2 API key for higher discovery rate limits. |

## What it shows

- ETH balance
- 7702 delegation pointer (if any), with the contract it points to
- ERC-20 token balances (with symbol and decimals)
- ERC-721 / ERC-1155 holdings
- ENS names with registrant/controller status

## Example

```bash
$ kintsugi status 0x9658c3A7e849D2873d19178DF9BC8ca503FC40B6 --chain sepolia

  Wallet: 0x9658c3A7e849D2873d19178DF9BC8ca503FC40B6
  Chain:  sepolia
  ETH:    0
  Code:   0xef0100…  (delegated to 0x53c1f40c…21fd5, the Rescue contract)

  ERC-20
    MOCK   100   0x36d4634e…f63

  ERC-721
    MockNFT #1778366067246
    MockNFT #1778366067247
    MockNFT #1778366067248

  ENS
    (none)
```

If the wallet has the Rescue contract delegation set, that line tells you. Run [`kintsugi revoke`](/cli-reference/revoke/) to clear it.

## Use during a rescue

`status` is purely informational. Run it before `rescue` to sanity-check that the address you're about to rescue actually holds what you expect. Run it on the safe wallet after the rescue to confirm everything landed.

## Related

- [kintsugi rescue](/cli-reference/rescue/)
- [Asset support](/asset-support/eth-erc20/)
