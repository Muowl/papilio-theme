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

- **Contrast checks in both variants.** Primary syntax colours clear 4.5:1
  against the editor background. Comments currently sit at ~4.5:1, with a
  deliberate 3:1 floor for comments and Markdown quotes. Autocomplete matches
  clear 4.5:1 on normal and selected rows. All syntax roles are checked against
  the text-selection background at a project floor of 3:1, preserving syntax
  colours while selected. That transient-state floor is a design choice, not
  WCAG AA compliance for normal text. The build fails if a checked pair falls
  below its floor.
- **A terminal that actually works.** All 16 ANSI slots are distinct — blue and
  cyan are different colours, and every bright variant is visibly brighter than
  its base.
- **Restrained italics.** Comments, parameters and HTML attributes only. Nothing
  else tilts.
- **Full workbench coverage.** ~330 UI colours are set, so VS Code's stock blues
  don't leak into the warm palette — including merge conflicts and the
  IntelliSense icons, which fall back to teal and purple when left unset.
- **Two intensities.** **Papilio** is the default — warm, restrained, built for
  long sessions. **Papilio Blood Blossom** keeps the same lightness ladder and
  hues but turns up the chroma and sinks the background into wine — same
  readability floors, more drama. Both variants pass every gate below.
- **Checked under simulated red-green colour blindness.** The palette uses
  lightness differences as well as hue to separate syntax colours. The build
  tests normal vision plus protanopia and deuteranopia with the Machado 2009
  model at full severity, measuring distance in OKLAB. Distinct syntax tokens
  have a project ΔE floor of 6; pairs involving tokens used only for diff states
  have a lower floor of 2.5, supported by additional visual cues. Key pairs and
  bracket colours have their own checks. These simulations do not cover
  tritanopia or replace usability testing with people. See `scripts/check_cvd.ts`.

## Palette

<!-- palette:start — gerado por `npm run build`; não edite à mão -->

| token | hex | role |
|---|---|---|
| `bg0` | `#191313` | editor background |
| `fg0` | `#ece0d1` | primary text |
| `crimson` | `#ea5356` | keywords, tags, accent |
| `blossom` | `#ffaea9` | strings |
| `ghost` | `#90d0e1` | functions, links |
| `ember` | `#f0a068` | types, regex, escapes |
| `plum` | `#c796d3` | numbers, constants, decorators |
| `dusk` | `#6d84c4` | attributes, terminal blue |
| `gold` | `#c49a5d` | modified state, terminal yellow |
| `muted` | `#897987` | comments |

<!-- palette:end -->

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
