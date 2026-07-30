# Changelog

All notable changes to Papilio are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **Export Base24** (`src/generators/base24.ts` → `themes/papilio-base24.yaml`),
  fase 4 do roadmap: destrava os templates do ecossistema tinted-theming
  (terminal, tmux, shells). base08–base0E e base12–base17 espelham os slots
  ANSI de `roles.terminal` (com `ansiBright`), então um terminal tematizado
  via Base24 fica idêntico ao terminal integrado do VSCode e herda os gates
  de contraste e unicidade. Divergência deliberada: base0B (strings nos
  templates) é o jade do `success`, não o blossom — em terminal, verde
  significa diff/ok, e correção de terminal vence fidelidade de string.

- **O tema agora é testado token a token** (`scripts/check_tokens.ts`, parte do
  `npm run check`): os fixtures de `tests/fixtures/` são tokenizados com o motor
  do próprio VS Code (vscode-textmate + vscode-oniguruma) e as gramáticas
  publicadas (vendorizadas em `tests/grammars/`), e 37 asserções travam cor
  final e itálico de cada trecho — o "Inspect Editor Tokens and Scopes"
  automatizado. Contra o gerador anterior à correção do LESS, o check reprova
  exatamente os 7 casos que a correção cobre; contra o atual, passam todos.
- **Gate de separação perceptual sob daltonismo** (`scripts/check_cvd.ts`,
  parte do `npm run check`): simula protanopia e deuteranopia (matrizes de
  Machado et al. 2009, severidade 1.0) e mede ΔE como distância OKLAB × 100 —
  a mesma matemática que calibrou a escada de luminosidade, antes viva só em
  scripts descartáveis. Três frentes: piso global 6.0 entre cores de sintaxe
  (roles de estado de diff isentos, como o YAML já documentava), pisos
  nomeados para os pares que o design cita textualmente, e o conjunto de
  brackets — agora a constante compartilhada `BRACKETS` em `src/lib/palette.ts`,
  que o gerador pinta e o check mede — contra o bracket de erro.
  `--matriz` imprime todos os pares para inspeção ao ajustar a palette.

  O gate também pôs número no custo do clareamento do crimson, que o commit
  original não mediu: tag × pontuação sob **deuteranopia** caiu de 7.7 para
  6.7, e comentário × crimson sob protanopia de 8.6 para 7.1. Ambos seguem
  acima dos pisos (6.0 e 6.5) e agora estão travados contra regressão.

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

- **Bracket pair colours rearranged** to `dusk, gold, ghost, blossom, plum, fg1`.
  Level 1 was `crimson` while an unmatched bracket is `error` — two reds at
  ΔE 3.0 in ordinary vision, so the error signal looked like a normal level-1
  bracket. Levels 2 and 5 were `gold` and `ember`, the pairing CLAUDE.md forbids
  without a second channel of distinction; brackets have none. The worst pair in
  the set goes from **ΔE 2.9 to 6.2**. Taking crimson out of the most-repeated
  glyph on screen also serves the "use it sparingly" rule.

### Fixed

- **A search hit made the code under it unreadable.** `editor.findMatchBackground`
  was `gold` at alpha 0.35; composited over `bg0` that plate drops comments to
  **2.34:1**. Every translucent plate drawn behind text had the same blind spot —
  merge headers reached 2.49:1, the peek-view match 2.42:1 — because the contrast
  gate only ever measured opaque colours against `bg0`. Alphas are now set a step
  below the ceiling that still clears 3:1, and the find match gains a solid border
  so it stays easy to spot without flooding the text.
- **Brackets nested six deep were invisible.** The theme defined
  `editorBracketHighlight.foreground1` through `5`, but VS Code registers
  `foreground6` with a default of `#00000000` — fully transparent. Level 6 now
  resolves to `fg1`, so the deepest level falls back to the punctuation colour.
- **Every class selector in a `.less` file was italic.** The rule that stops CSS
  selectors from inheriting the HTML-attribute italic listed only `.css`-suffixed
  scopes. LESS uses its own `.less` suffix throughout, so nothing matched it, and
  SCSS leaked through `%placeholder` and the `&__elem` parent-selector suffix —
  which is how BEM writes nearly every selector. Verified against VS Code's
  published grammars rather than by inspection.
- The contrast gate now checks that `cursor` still matches `crimson`. The palette
  format only takes literal hex, so `cursor` repeats the signature colour by hand
  and nothing stopped the two from drifting apart on the next adjustment — the
  same failure mode already guarded for the README and `galleryBanner` tables.
- The contrast gate now measures text over composited plates, using the alpha
  table in `src/lib/palette.ts` that the generator reads too, so the two cannot
  diverge.

### Fixed (cont.)

- **Matched characters in quick open and the suggest widget were 4.35:1** over
  `bg2`, short of the 4.5 floor. They now have their own role,
  `ui.list-highlight`, set to `ember`: passes every list background with room
  to spare, keeps crimson scarce, and the highlight reads as a pyro spark.
  Lightening crimson again was rejected — the colour-blindness gate showed the
  last lightening already cost separation (tag × punctuation 7.7 → 6.7 under
  deuteranopia).
- **The "quieter tag colour" question is settled, with data.** Desaturated
  candidates (terracotta `#dd7a68`, clay `#d08b76`) were rendered side by side
  with the current crimson and measured: tag × punctuation collapses to
  ΔE 4.6 and 2.7 under protanopia (named floor: 10). Desaturating a warm red
  slides it exactly onto `fg1`'s warm grey for the users the lightness ladder
  protects. `tag: crimson` stays; the decision is recorded in the YAML.

### Known issues

Found while auditing; not addressed here.

- `editorWhitespace` and the indent guides are `bg3` over `bg0`, **1.36:1**.
  Near-invisible with whitespace rendering on. May well be deliberate.
- SCSS keyframe stops (`from`, `to`, `50%`) and `@forward` module names resolve
  to `dusk` + italic through the generic attribute rule. Odd, but distinct from
  the selector bug fixed above.

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
