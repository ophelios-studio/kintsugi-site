---
title: "Smart-contract self-audit"
order: 4
description: "The security analysis the maintainer did before deploying Kintsugi to mainnet, published in full."
---

A formal third-party audit costs USD 20-80k and takes weeks. The maintainer is one person, the contract surface is 179 lines, the design is intentionally minimal, and the test suite is comprehensive. A paid audit remains on the roadmap, but this self-audit is published now so users have something substantive to read before mainnet deploy, instead of "trust me."

The contract is immutable post-deploy: no admin keys, no upgrade path. An audit adds no operational dependency. It would only buy additional confidence in the bytecode that ships.

External review is welcome and encouraged. See [Reporting](/security/reporting/).

## TL;DR

The Rescue contract grants the executor (the rescuer) only the same powers the victim's EOA already has. It just lets those powers be exercised atomically with no sweeper-observable ETH-balance window. **There are no critical or high-severity contract-level findings.**

The single Medium item is an off-chain UX rule for any tool that builds batches: surface every operation's `to` and decoded `data` to the signer, not just the cosmetic `safe` field. Kintsugi's own CLI and UI already do this; this audit elevates the rule to a permanent invariant for any re-implementation.

## The full audit document

The complete audit, with line references, Slither tooling output, and the disposition of every detector finding, is in the repository as `AUDIT.md`:

[Read AUDIT.md on GitHub](https://github.com/ophelios-studio/kintsugi/blob/main/AUDIT.md)

A summary follows below.

## Threat model

The attacker we care about:

- has the victim's private key;
- has a sweeper bot watching the victim wallet;
- can run a malicious "Kintsugi" front-end (CLI, UI, or agent skill);
- can watch the public mempool;
- can deploy their own contracts on the same chain;
- cannot break ECDSA, cannot break the EIP-712 standard, cannot break solc 0.8.28.

The question this audit answers: does the existence of the deployed Rescue contract grant such an attacker any new capability they didn't already have?

## Defensive properties confirmed

- **Strict signature verification.** OpenZeppelin's `ECDSA.tryRecover` rejects high-s malleable signatures, invalid v values, and bad-length inputs. The recovered signer must equal `address(this)` (the victim under EIP-7702 delegation).
- **Cross-chain replay impossible.** The `_DOMAIN_SEPARATOR` is immutable and embeds `block.chainid` at deploy time, AND the contract checks `block.chainid == batch.chainId` at execution. Belt and suspenders.
- **No storage on the Rescue contract.** All state is `immutable` (in bytecode) or in the external `NonceTracker`. Under 7702 delegation no storage slot of the victim is ever written by the Rescue code.
- **Nonces isolated per victim.** The `NonceTracker` is keyed by `msg.sender`, which under delegation is the victim. No one can advance another account's nonce.
- **Atomic-or-revert.** Any single op revert reverts the whole transaction including the nonce bump. No partial state is ever observable.
- **Direct calls to the deployed Rescue address are useless.** Without 7702 delegation, `address(this)` would be the deployed Rescue contract (no private key). The signature check always fails.
- **No admin / no pause / no upgrade / no ownership.** Truly trustless. Once deployed, no one (including the maintainer) can change behavior, drain funds, or freeze it.
- **Sweeper-bot bypass is structurally guaranteed.** The victim's ETH balance never has to rise above zero during the rescue. Tested explicitly.
- **Front-running is harmless.** A mempool watcher copying the auth_list and executeBatch payload would just complete the same rescue (assets still go to the victim-signed safe address). They cannot redirect funds without a new signature.
- **Re-entrancy safe.** The nonce is bumped *before* the calls loop. Re-entry would require a fresh signature with the new nonce.

## The one Medium finding

**M1: `Batch.safe` is signed but not enforced.**

The `safe` field is part of the signed EIP-712 struct (so it's visible to wallet sign-prompts) but the contract does NOT check that operations actually transfer to it. This is a deliberate design choice to keep ops fully general.

A malicious off-brand "Kintsugi UI" could show the user `safe = trustedAddress` while the actual ops drain elsewhere. A user who only reads the `safe` field gets drained.

**The mitigation is a strict off-chain rule:** any tool that builds and shows a Kintsugi batch must surface every op's `to` address and decoded `data` to the signer. Kintsugi's own CLI and UI explicitly render every op's recipient and decoded calldata at the plan-review step.

## Static analysis

[Slither](https://github.com/crytic/slither) was run against `Rescue.sol` and reported eight findings, all reviewed:

- `arbitrary-send-eth`, `low-level-calls`, `calls-loop`: expected by design (the contract executes arbitrary victim-signed operations)
- `unused-return` (×2): false positive (the values ARE used or the side effect is the point)
- `reentrancy-events`: not exploitable (nonce bumped before the loop)
- `timestamp`: standard EIP-712 deadline pattern
- `naming-convention`: style preference (matches OpenZeppelin's `UPPER_CASE` for immutables)

## Symbolic execution

[Mythril](https://github.com/Consensys/mythril) was run against the compiled deployed bytecode and reported two findings, both reviewed:

- **SWC-110 ("assertion violation")**: false positive. Mythril flags any reachable `0xfe` (`INVALID`) opcode, but Solidity 0.8 uses the standard `Panic(uint256)` revert path for enum-out-of-range and similar built-in checks. The path Mythril found is inside OpenZeppelin's `ECDSA.tryRecover` and cannot be triggered in practice.
- **SWC-116 ("dependence on predictable environment variable")**: false positive (mislabeled). Mythril flags `block.chainid` read in the constructor; this is the standard EIP-712 domain-separator pattern.

Full disposition tables for both tools are in `AUDIT.md`. None require code changes.

## What the audit does NOT cover

Two operational risks remain regardless of audit status:

1. **A compromised key remains compromised.** If the victim's key is in the attacker's hands, the attacker can drain via direct `transfer` calls without ever touching Kintsugi.
2. **Off-chain tool integrity.** The contract executes whatever the victim signs. If victims download a malicious lookalike "Kintsugi" tool, the contract dutifully drains them. Defenses: pinning the agent-skill source repo (`ophelios-studio/skills`), using only the canonical npm package (`@kintsugi/cli`), and the per-op review rule above.

## Found something we missed?

Open an issue on the repo or follow the [responsible-disclosure process](/security/reporting/). Even small clarifications are welcome.
