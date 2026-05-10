---
title: "kintsugi revoke"
order: 4
description: "Clear a 7702 delegation from a victim wallet, returning it to a pure EOA."
---

After a rescue, the victim wallet has an EIP-7702 delegation pointer to the Rescue contract baked into its code slot. That delegation does nothing on its own (the Rescue contract requires a fresh victim signature to do anything), but you may want to clear it for cleanliness or to use the victim address again as a plain EOA.

## Synopsis

```bash
kintsugi revoke [options]
```

## Options

| Flag | Description |
|------|-------------|
| `-c, --chain <chain>` | Network. `mainnet` or `sepolia`. Default: `mainnet`. |

## What it does

1. Asks for the victim private key (masked).
2. Asks for the rescuer wallet that will pay gas.
3. Constructs an EIP-7702 authorization that points to `address(0)` on the chosen chain for the victim's current nonce.
4. Submits a Type-4 transaction containing only that authorization.

After confirmation, the victim address has no code. It is once again a pure EOA.

## When to use it

Always optional. Only useful if:

- You plan to use the victim address again as a regular wallet (rare; you should usually treat it as burned).
- You want a clean on-chain footprint with no delegation pointer visible in block explorers.
- You're auditing a rescue and want to confirm `kintsugi revoke` works end-to-end.

## When not to use it

- Right after a rescue where you have nothing left to recover. The delegation does no harm sitting there. The Rescue contract still requires a valid victim EIP-712 signature for any future call. The attacker, who also has the victim key, can run their own batch only if you pre-signed one for them (you didn't).
- If you don't have a rescuer wallet ready. Revoke needs gas just like rescue does. Don't try to fund the victim to pay for its own revoke; the sweeper takes that ETH.

## Example

```bash
$ kintsugi revoke --chain sepolia
? Victim private key: ****************
  derived victim address: 0x9658...40B6
? Rescuer private key: ****************
  rescuer balance: 0.005 ETH

Submitting Type-4 tx with auth → 0x0000...0000

  tx: 0xa1b2c3d4...
  https://sepolia.etherscan.io/tx/0xa1b2c3d4...

Waiting for inclusion...        ✓ block 10822060

Done. Victim address is now a pure EOA.
```

## Related

- [kintsugi rescue](/cli-reference/rescue/)
- [EIP-7702 in plain English](/concepts/eip-7702-explained/)
