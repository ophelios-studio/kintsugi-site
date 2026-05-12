---
title: "Install"
order: 1
description: "Install the kintsugi CLI in under a minute."
---

Kintsugi runs entirely on your machine. Nothing is hosted, nothing phones home. You install one CLI and use it from any terminal.

## Requirements

You need Node.js 20 or newer.

```bash
node --version
```

If that prints anything below `v20`, install a recent Node from [nodejs.org](https://nodejs.org) or via a version manager like `nvm` or `mise`.

## Install the CLI

```bash
npm install -g @ophelios/cli
```

That installs the `kintsugi` binary globally. Verify:

```bash
kintsugi --help
```

You should see the available commands: `rescue`, `ui`, `status`, `revoke`.

## Install from source

If you prefer to read every line before running it (recommended for a tool that signs transactions on a wallet you've lost control of), clone the repo and link it locally:

```bash
git clone https://github.com/ophelios-studio/kintsugi
cd kintsugi
npm install
npm --workspace @ophelios/core run build
npm --workspace @ophelios/cli run build
npm --workspace @ophelios/cli link
kintsugi --help
```

The `link` step makes the local `kintsugi` command available on your PATH the same way a global npm install would.

## Update

```bash
npm install -g @ophelios/cli@latest
```

There is no auto-update. Releases are tagged on GitHub.

## Uninstall

```bash
npm uninstall -g @ophelios/cli
```

Kintsugi writes nothing to disk, so removing the binary is the only cleanup needed.

## Next

Make sure you have what you need before starting a rescue: see [Prerequisites](/getting-started/prerequisites/).
