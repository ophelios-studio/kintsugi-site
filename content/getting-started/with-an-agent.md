---
title: "With an agent"
order: 5
description: "Use Kintsugi via an AI coding agent (Claude Code, Cursor, Codex, Cline, Gemini CLI). Install the agent skill once, then ask in plain English."
---

If you don't want to read the docs, you don't have to. Kintsugi ships a free agent skill following the [agentskills.io](https://agentskills.io) spec, so any compatible AI coding agent (Claude Code, Cursor, Codex, Cline, Gemini CLI, and others) can drive the entire flow for you in plain English.

The skill lives in the public repo `ophelios-studio/skills`. It contains:

- A `SKILL.md` that teaches the agent the three-wallet pattern, the atomic-batch model, the ordering rules (unstake before transfer, ENS reclaim before registrant), the discovery scope, the RPC requirements, and every empirical gotcha drawn from the production tool.
- A runnable example (`examples/kintsugi/custom-rescue.ts`) that demonstrates the developer surface for non-standard assets like staked NFTs, vesting positions, LP tokens.

## Install the skill

```bash
npx skills add ophelios-studio/skills --skill kintsugi
```

That installs to `~/.agents/skills/kintsugi/` and symlinks into your agent's skill directory (e.g. `~/.claude/skills/`). The agent will load it automatically when it detects you're working with Kintsugi.

To install every Ophelios skill in one shot:

```bash
npx skills add ophelios-studio/skills
```

## What you can ask

Once the skill is loaded, talk to your agent like you'd talk to a friend who already knows the tool:

> "My MetaMask seed leaked. I have a hardware wallet I trust as the safe destination. Walk me through rescuing the assets."

> "I have NFTs staked in a contract at 0xabc... and the staked tokenIds are 12, 13, 14. Write me a custom-rescue script that unstakes them and moves them to my safe address."

> "I rescued my wallet last week with kintsugi. Should I revoke the 7702 delegation now?"

> "Why does the Network step ask for an Alchemy key when I already have a public RPC URL?"

The agent has the ordering rules, the gotchas, and the contract addresses already memorized. It will know to put the unstake op before the transfer ops, to remind you the safe wallet must be from a brand-new seed, to suggest `--private-mempool` if you suspect a sophisticated sweeper, and so on.

## What you do NOT need

- A subscription to anything. The skill is MIT-licensed in the public repo.
- An account with us. Kintsugi has no accounts.
- A different agent. The skill works with anything that follows the agentskills.io spec.

## Why this exists

Kintsugi is meant to be used in panic. Reading docs in panic is a bad time. An AI agent that already knows the tool well enough to run it for you removes one layer of cognitive load at the worst possible moment.

It's also useful in calm: developers building custom rescue flows for non-standard assets (staked positions, vesting, governance) get a teammate who already knows the API and the ordering rules, instead of paging through `@ophelios/core` source.

## Reading the skill yourself

The skill is just a markdown file. If you want to see exactly what your agent has been taught:

- Online: [github.com/ophelios-studio/skills/blob/main/skills/kintsugi/SKILL.md](https://github.com/ophelios-studio/skills/blob/main/skills/kintsugi/SKILL.md)
- After install: `cat ~/.agents/skills/kintsugi/SKILL.md`

It's about 250 lines. Short enough to skim in 5 minutes. Honest about what auto-discovery covers and what it doesn't.

## Reference

- Skills repo: [github.com/ophelios-studio/skills](https://github.com/ophelios-studio/skills)
- Spec: [agentskills.io](https://agentskills.io)
- Example: [examples/kintsugi/](https://github.com/ophelios-studio/skills/tree/main/examples/kintsugi) in the skills repo
- Custom calls reference: [Asset support / custom calls](/asset-support/custom-calls/)
