---
title: "NFTs (ERC-721 and ERC-1155)"
order: 2
description: "How Kintsugi rescues single and multi-token NFTs."
---

Kintsugi handles both NFT standards: ERC-721 (one tokenId per owner) and ERC-1155 (multiple tokenIds with quantities).

## ERC-721

Each NFT is one transfer op:

```text
op.to = nftContract
op.data = transferFrom(victim, safe, tokenId)
```

Kintsugi uses `transferFrom` rather than `safeTransferFrom` for ERC-721 because the safe variant calls back into the destination, and Kintsugi has no way to be sure the safe wallet is a contract that accepts NFTs (since the safe is typically a freshly-generated EOA, the callback wouldn't matter, but `transferFrom` is the simpler path).

### Discovery

- With an Alchemy key: Alchemy's NFT API v3 endpoint `getNFTsForOwner` returns the full list of currently-owned NFTs across collections, with metadata.
- Without Alchemy: Kintsugi falls back to on-chain `Transfer` event scanning per-collection. You give it a contract address (via the **Scan a whole collection** button), it walks the event log in 45 000-block chunks, computes ownership, and returns currently-held tokenIds.

The on-chain scan is the safety net. It works on any RPC, including private nodes, and doesn't depend on a third-party indexer.

### Manual entry

For NFTs from a collection you know but Alchemy doesn't index, use **+ Add** in the NFTs section. Paste the contract address, a name (informational), and the tokenId. Kintsugi will include the corresponding `transferFrom` op.

## ERC-1155

ERC-1155 contracts hold multiple tokenIds per owner, each with a balance. Kintsugi transfers each `(contract, tokenId)` pair as one op:

```text
op.to = erc1155Contract
op.data = safeTransferFrom(victim, safe, id, amount, "0x")
```

The `data` parameter is empty bytes (`0x`); Kintsugi does not rely on any onERC1155Received hook chain.

### Discovery

ERC-1155 discovery is included in the same Alchemy NFT call as ERC-721, with `tokenType` distinguishing them. The on-chain fallback works the same way for both standards (different event signature, same chunked scan).

## Atomicity

All NFT transfers happen in the same batch as the ERC-20 and ENS transfers. Either every selected NFT lands at the safe wallet or the whole batch reverts (and nothing moves). There is no scenario where you end up with 3 of 5 NFTs transferred and the rest stuck.

## Soulbound or paused

Some NFTs are non-transferable (soulbound, restricted), and others are paused. Those ops will revert. The whole batch reverts on any single failure, so the rest of your assets do not move either. Remove the offending NFT from the selection and re-run.

In practice this is rare. The vast majority of ERC-721 and ERC-1155 contracts implement standard transfer.

## Staked NFTs

NFTs locked in a staking contract aren't at the victim address; they're at the staking contract, which holds them on behalf of the victim. To rescue them you need to unstake first (returning them to the victim address) and then transfer.

Use a [custom call](/asset-support/custom-calls/) to insert an `unstake` op at the start of the batch, before the NFT transfer ops. The unstake-then-transfer sequence is one batch and one transaction, so the sweeper has no opening to insert itself between unstake and transfer.
