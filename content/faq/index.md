---
title: "FAQ"
order: 1
description: "Common questions about Kintsugi."
---

## Why no fees

A wallet rescue tool that charges money in the worst moment of someone's crypto life is a wallet rescue tool taking advantage of panic. We won't do that. The contracts are not upgradeable, so a future rug-pull on this stance is structurally impossible.

The only money you spend is gas, paid to your rescuer wallet, never routed through us.

## Why open source

Two reasons. First, you should not have to trust an opaque binary with a private key you've already lost control of. Open source means anyone can audit `Rescue.sol`, `NonceTracker.sol`, and the entire library before running it. Second, a good rescue tool should be common infrastructure. Closed-source tools that gate this behind a paywall actively harm users.

## Can I bring my own rescuer wallet

Yes. The CLI accepts a rescuer private key directly via the `--rescuer-pk` style flag (interactive prompt). The rescuer just needs about 0.005 ETH on the target chain. If you don't have one, the CLI generates a fresh one and pauses while you fund it.

## What chains does it support today

Sepolia (verified, used for live test rescues) and Mainnet (pending audit; addresses will be filled in once audit completes). L2 deployments come after mainnet stabilizes.

## What if the rescuer disappears mid-tx

There is no "mid-tx" state on Ethereum. A transaction is atomic: either it lands and the entire batch succeeds, or it doesn't and nothing happens. If the rescuer wallet runs out of gas mid-rescue, the transaction reverts; nothing moves; the rescuer keeps whatever is left of its balance. You can fund and re-run.

If the rescuer's RPC connection drops between sign and broadcast, the transaction never goes out. Same outcome: nothing moves, re-run.

## What if my private key is on a hardware wallet

Hardware wallet support (Ledger, Trezor) is on the roadmap but not shipped yet. The CLI today accepts software-style private keys via masked prompt. If your compromised wallet is on a hardware device you still trust, wait for HW support before rescuing, or do the rescue with the seed phrase converted to a software key and then immediately transfer to a fresh HW wallet.

## Will Kintsugi work after my next 7702 delegation change

Yes. Each rescue uses a fresh 7702 authorization signed at rescue time, with the victim's current account nonce. If you set a different delegation later, the next rescue (if you ever need one) signs a new authorization that supersedes whatever was there. The NonceTracker is per-victim and isn't affected by delegation changes.

## Can the attacker run their own rescue with my key

The attacker has your private key, so they can sign anything you can. They could in principle construct a Kintsugi batch that transfers your assets to *their* wallet (not yours). That is no different from any other transaction the attacker could already submit; it does not give them a new capability.

What Kintsugi gives YOU is a rescue path that does not require holding ETH at the victim. The attacker still has the same race they had before.

In practice: if you suspect a key compromise, run the rescue immediately. The window matters less because the rescue itself doesn't open new attack surface.

## Does Kintsugi work for Smart Wallets / AAs

Account-abstraction wallets (Safe, Argent, Sapient) usually have their own recovery flows and a different compromise model. Kintsugi targets EOAs and EIP-7702-delegated EOAs. AA accounts (with custom validation logic) are out of scope.

## Will it leave a trace in my wallet

After a rescue, the victim address has an EIP-7702 delegation pointer to the Rescue contract baked into its code slot. That is a single line of bytecode that does not store anything on its own. Block explorers will show the address as "contract" instead of "EOA."

Run `kintsugi revoke` after the rescue to clear the delegation and return the address to a pure EOA. Optional but cosmetic.

## Why does my Etherscan show "delegated" after a rescue

That's the EIP-7702 delegation pointer. See the question above. Run `kintsugi revoke` to clear it.

## Is this safe to use on a wallet that still has a lot of value

The Sepolia version is verified and has been used for live test rescues. The Mainnet version is pending audit. If you're rescuing high-value assets, wait for the audit to publish before using mainnet, or test the flow on Sepolia first to confirm you're comfortable with the operation.

## What happens to the victim wallet's old approvals

If the victim address had granted token approvals to other contracts (DEX routers, staking contracts), those approvals stay in place after the rescue. The attacker could still spend allowances the victim previously granted. To clean up, you can include `approve(spender, 0)` ops in the rescue batch via [custom calls](/asset-support/custom-calls/), or run them separately afterward (less urgent because the relevant assets are already at the safe wallet).

## Where do I report bugs

[GitHub issues](https://github.com/ophelios-studio/kintsugi/issues) for non-security. [Security advisories](https://github.com/ophelios-studio/kintsugi/security/advisories/new) or `security@ophelios.com` for vulnerabilities. See [Reporting a vulnerability](/security/reporting/).

## Who built this

[Ophelios Studio](https://ophelios.com).
