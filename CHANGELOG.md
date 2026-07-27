# Changelog

All notable changes to Papilio are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [0.1.0] — Unreleased

First public release.

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
