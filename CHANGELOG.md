# Changelog

All notable changes to Papilio are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- **`crimson` lightened from `#df494d` to `#ea5356`** (OKLCH L 0.62 → 0.65).
  It was the tightest colour in the theme: **4.54:1** against `bg0`, clearing the
  4.5 floor by 0.04 with no headroom left for any future adjustment. Now
  **5.13:1**. Hue (23°) and chroma (0.186) are untouched, so the character
  reading does not move — this is a lightness change only. It affects every role
  built on the signature colour: `keyword`, `tag`, `builtin`, `ui.accent`,
  `cursor` and ANSI red (plus `bright-red`, derived).

  The ceiling is set by colour blindness, not by contrast. In `<div>` the tag sits
  directly against `punctuation` (`fg1`), and that separation decays as crimson
  lightens: ΔE 13.9 → 10.9 under simulated protanopia. Past L ≈ 0.66 it drops
  below 10 and the red channel saturates at `ff`, dragging the hue off 23°.
  L 0.65 takes +13% contrast while staying short of that knee. `tag` × `type`
  (the JSX component case) stays at ΔE 12.3 under deuteranopia, still far above
  the 6.4 the palette already accepts for `gold` × `ember`.

### Fixed

- The contrast gate now checks that `cursor` still matches `crimson`. The palette
  format only takes literal hex, so `cursor` repeats the signature colour by hand
  and nothing stopped the two from drifting apart on the next adjustment — the
  same failure mode already guarded for the README and `galleryBanner` tables.

## [0.1.0] — 2026-07-27

First public release.

### Changed

- **Lightness ladder.** The palette's hues were chosen from the reference art,
  but its lightness values had never been designed — six syntax tokens sat
  between OKLCH L 0.70 and 0.77. Red-green colour blindness collapses hues
  20–90° onto a single axis, leaving only lightness to separate them, so the
  warm cluster fused: `type` × `attribute` measured ΔE **0.6** under simulated
  protanopia, i.e. literally the same colour. Every token now occupies a
  deliberate step ordered by semantic weight. **No hue moved**, so the character
  reading is unchanged; the worst syntax pair went from 0.6 to **8.0** and the
  number of colliding pairs from 3 to **0**.
- `attribute` now resolves to `dusk` instead of `gold`. Taking gold out of the
  dense syntax set is what made the ladder solvable — six warm colours do not
  fit the available lightness range. `dusk` is the night sky of the official
  art and was previously used only for ANSI blue.
- `muted` moved from red-brown to the plum-mauve of the hair shadows (hue 330),
  leaving the warm cluster. `keyword` × `comment` went from 2.9 to 8.6 under
  protanopia, and comments now clear 4.5:1 instead of 3.52:1.
- `warning` moved off hue 76, where it was identical to `gold`.
- `success` darkened into a more discreet jade, separating it from gold and ember.

### Fixed

- **The contrast gate passed `bright-black` at 2.76:1 while reporting ✔.** The
  target was resolved once per ANSI slot and reused for the bright line, so
  `bright-black` inherited the deliberate exemption granted to `black` (which
  is a background plate, not text). Bright-black is the grey CLIs use for dim
  text, so it now has its own 3:1 floor — and is mapped to `muted` via a new
  `roles.terminal-bright` override instead of being derived from `bg3`.
- Contrast pairs the gate could not see: `muted` over `bg2` was checked only for
  the input placeholder, while the peek-view description and focused quick-pick
  rows used the same pair at 2.98:1. Both are now in the table.
- `merge.*` (13 keys) and `symbolIcon.*` (33 keys) were entirely absent, so
  conflict resolution fell back to the VS Code default teal and blue, and the
  IntelliSense popup opened with purple `#B180D7` and blue `#75BEFF` icons on
  every keystroke — the two loudest cold leaks in a deliberately warm theme.
  Also added `icon.foreground`, `editorLightBulb*`, `diffEditor.diagonalFill`
  and `editor.lineHighlightBorder`.
- `lighten()` and `alpha()` emitted malformed hex when handed an out-of-range
  amount or an 8-digit colour. Both now validate their input and clamp.

### Added

- Dark theme for VS Code: workbench, TextMate `tokenColors` and semantic
  highlighting, all generated from `palette/papilio.yaml`.
- 16 distinct ANSI terminal slots. Blue and cyan are separate colours, and each
  bright variant is derived by lightening its base.
- `plum` and `dusk` palette tokens, sampled from the cool hues in the reference
  art (the hat ribbon at hue ~288°, the night sky at hue ~224°). Numbers and
  constants moved to `plum`, which frees `gold` and widens hue separation
  across syntax.
- Markup coverage for diffs and patches (`markup.inserted` / `deleted` /
  `changed`), Markdown quotes and lists, template-literal interpolation,
  decorators, namespaces and `this`/`self`.
- Contrast validation extended to the terminal palette and to workbench colour
  pairs, plus a check that no two ANSI slots share a colour. The build fails on
  any regression.
- Syntax colours checked against simulated red-green colour blindness. Decorators
  moved to `plum` because `gold` and `ember` converge under deuteranopia and
  `@decorator` sits next to the class name it decorates.

### Fixed

- CSS class and id selectors no longer inherit the italic intended for HTML
  attributes.
- Input placeholder text was at 2.98:1 against its own background; it now
  clears 3:1.
