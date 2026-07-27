# Papilio

A warm dark theme for VS Code. The canvas is a deep red-brown — not pure black,
not cool grey — with crimson as the signature accent, antique gold on the
details, plum-blossom pink for strings and a ghost-blue counterweight for
functions and links.

The name comes from a butterfly: *Papilio Charontis*.

> Fan-made project, inspired by Hu Tao's palette from Genshin Impact.
> Not affiliated with, endorsed by, or associated with HoYoverse/Cognosphere.
> No official artwork is included in this extension.

## Install

Search for **Papilio** in the Extensions view (`Ctrl+Shift+X`), install, then
pick it with **Preferences: Color Theme** (`Ctrl+K Ctrl+T`).

## What you get

- **Every colour is contrast-checked.** Every syntax colour clears WCAG 4.5:1
  against the editor background; comments sit at ~3.5:1 on purpose, so they
  recede without disappearing. The build fails if a colour ever regresses.
- **A terminal that actually works.** All 16 ANSI slots are distinct — blue and
  cyan are different colours, and every bright variant is visibly brighter than
  its base.
- **Restrained italics.** Comments, parameters and HTML attributes only. Nothing
  else tilts.
- **Full workbench coverage.** ~260 UI colours are set, so VS Code's stock blues
  don't leak into the warm palette in the command palette, find widget, progress
  bars or menus.

## Palette

| token | hex | role |
|---|---|---|
| `bg0` | `#191313` | editor background |
| `fg0` | `#ece0d1` | primary text |
| `crimson` | `#e04a4d` | keywords, tags, accent |
| `blossom` | `#e89a94` | strings |
| `ghost` | `#8ecfdf` | functions, links |
| `gold` | `#c49a5d` | attributes, modified state |
| `ember` | `#e0915a` | types, regex, escapes |
| `plum` | `#c08fcc` | numbers, constants, decorators |
| `dusk` | `#7991d1` | terminal blue |

## Contributing

Colours are generated, never hand-edited. `palette/papilio.yaml` is the single
source of truth: character anchors feed named palette tokens, which feed
semantic roles (`keyword: crimson`). Generators in `src/generators/` turn that
into each target format.

```bash
npm install
npm run build   # validates contrast, then writes themes/ and assets/
```

Press **F5** to try changes in the Extension Development Host. Project rules and
architecture live in [CLAUDE.md](CLAUDE.md).

## Planned variants

- **Papilio** — the default (this one)
- **Papilio Blood Blossom** — saturated, more dramatic
- **Papilio Silk Flower** — a possible light variant

## License

[MIT](LICENSE)
