---
title: "Known limits"
order: 3
description: "What Kintsugi does not (yet) do, and the workarounds in the meantime."
---

Honest enumeration of the gaps. Anything on this list is on the roadmap or has a manual workaround.

## No third-party audit

The contracts have not been formally audited by a paid third party. The maintainer published a detailed self-audit (see [Smart-contract self-audit](/security/self-audit/)) before deploying to mainnet, with the Slither static-analysis output and the disposition of every finding. External review is welcome and encouraged.

A paid audit is on the roadmap but is not a blocker: the contracts are immutable post-deploy (no admin, no upgrade, no pause), so an audit would only buy additional confidence in the bytecode that ships, not change the operational risk profile.

## No hardware wallet integration yet

The CLI accepts private keys via masked prompts. There is no Ledger/Trezor support for either the EIP-712 batch signature or the EIP-7702 authorization. Both signing flows require integrations specific to each hardware wallet vendor.

This matters if your compromised wallet is on a hardware device you still trust. For pure software wallets (MetaMask seed compromised), the current paste-the-key path is fine.

Workaround: none. Hardware wallet support is high-priority on the roadmap.

## No L2 support yet

Mainnet and Sepolia only. L2s (Base, Arbitrum, Optimism, Polygon zkEVM) need their own deployments of `Rescue.sol` and `NonceTracker.sol`, plus per-chain ENS deployments where applicable.

Workaround for L2 victims: the rescue pattern is generic and works on any chain that supports EIP-7702. If you're a developer comfortable with Hardhat, you can deploy the contracts to your L2 yourself (the deploy script is in the repo) and pass `--rescue-address` and `--tracker-address` flags to the CLI.

## No browser extension yet

Kintsugi is a CLI plus a localhost web UI. There is no browser extension wallet to sign rescues from. The localhost UI covers the same use case but requires running the CLI to launch it.

A browser extension would let users sign without a CLI install, but introduces a much bigger attack surface (extension store compromise, cross-extension snooping). Not on the immediate roadmap.

## No staked-position auto-discovery

Kintsugi auto-discovers ETH, ERC-20, ERC-721, ERC-1155, and ENS. Anything held by a staking contract, vesting contract, or LP position is invisible to the discovery scan because the assets are at those contracts, not the victim address.

Workaround: use [custom calls](/asset-support/custom-calls/) to add unstake/exit/withdraw ops to the batch, followed by transfer ops on the resulting tokens. The whole sequence runs atomically.

A "common protocols" custom-call library (auto-detect Uniswap v3 LPs, Lido stETH wrapping, Aave aTokens, etc.) is on the medium-term roadmap.

## No custom-call UI panel yet

Custom calls are a TypeScript API today. They are not exposed in the UI's Discovery panel. Developers can write a small script importing `@ophelios/core` to compose batches with custom calls; non-developers cannot.

Workaround: pair with someone who can write 30 lines of TypeScript, or wait for the UI panel.

## No multi-rescue coordination

Each `kintsugi rescue` invocation is one rescue against one victim. If you are recovering from a wallet compromise that affected multiple addresses (a corporate setup, a multi-account wallet), you run the CLI once per address. There is no batch-of-batches mode.

This is intentional: multi-victim rescue would multiply the attack surface and introduces ordering questions that are easier to handle one at a time.

## No automatic resolver/record cleanup on ENS

Kintsugi transfers ENS ownership but does not automatically clear malicious records the attacker may have set on a resolver (text records, contenthash, etc.). The new safe wallet should audit and reset records after the rescue.

Helper functions exist in `@ophelios/core` (`setResolver`, `clearReverseRecord`) and can be added to the rescue batch via custom calls if you want them executed atomically.

## What about social-recovery accounts?

Social-recovery wallets (Argent, Safe with guardians, Sapient AAs) usually have their own recovery flow and don't have the same compromise model. Kintsugi targets EOAs and EIP-7702-delegated EOAs. AA accounts (with custom validation logic) are out of scope.
