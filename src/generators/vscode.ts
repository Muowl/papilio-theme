import { PaletteFile, resolve, alpha } from "../lib/palette";

/**
 * Gera o JSON de tema do VSCode a partir da fonte da verdade.
 * Regra do projeto: NENHUM hex hardcoded aqui — tudo vem de p.palette
 * ou de resolve()/alpha().
 */
export function generateVscodeTheme(p: PaletteFile): object {
  const c = p.palette;
  const syn = (role: string) => resolve(p, "syntax", role);
  const ui = (role: string) => resolve(p, "ui", role);

  return {
    $schema: "vscode://schemas/color-theme",
    name: p.meta.name,
    type: p.meta.variant,
    semanticHighlighting: true,

    colors: {
      // Editor
      "editor.background": c.bg0,
      "editor.foreground": c.fg0,
      "editorCursor.foreground": c.cursor,
      "editor.selectionBackground": c.selection,
      "editor.selectionHighlightBackground": alpha(c.selection, 0.6),
      "editor.wordHighlightBackground": alpha(c.bg3, 0.7),
      "editor.findMatchBackground": alpha(c.gold, 0.35),
      "editor.findMatchHighlightBackground": alpha(c.gold, 0.18),
      "editor.lineHighlightBackground": alpha(c.bg2, 0.5),
      "editorLineNumber.foreground": c.muted,
      "editorLineNumber.activeForeground": c.fg1,
      "editorIndentGuide.background1": c.bg3,
      "editorIndentGuide.activeBackground1": c.muted,
      "editorWhitespace.foreground": c.bg3,
      "editorBracketMatch.background": alpha(c.ghost, 0.15),
      "editorBracketMatch.border": c.ghost,

      // Bracket pair colorization
      "editorBracketHighlight.foreground1": c.crimson,
      "editorBracketHighlight.foreground2": c.gold,
      "editorBracketHighlight.foreground3": c.ghost,
      "editorBracketHighlight.foreground4": c.blossom,
      "editorBracketHighlight.foreground5": c.ember,
      "editorBracketHighlight.unexpectedBracket.foreground": c.error,

      // Gutter / diff
      "editorGutter.addedBackground": c.success,
      "editorGutter.modifiedBackground": c.gold,
      "editorGutter.deletedBackground": c.error,
      "diffEditor.insertedTextBackground": alpha(c.success, 0.12),
      "diffEditor.removedTextBackground": alpha(c.error, 0.12),

      // Diagnósticos
      "editorError.foreground": c.error,
      "editorWarning.foreground": c.warning,
      "editorInfo.foreground": c.info,

      // Workbench: chrome geral
      "foreground": c.fg1,
      "focusBorder": ui("accent"),
      "selection.background": c.selection,
      "descriptionForeground": c.muted,
      "errorForeground": c.error,
      "textLink.foreground": ui("link"),
      "textLink.activeForeground": c.fg0,

      // Sidebar / activity bar
      "activityBar.background": c.bg1,
      "activityBar.foreground": c.fg0,
      "activityBar.inactiveForeground": c.muted,
      "activityBarBadge.background": ui("accent"),
      "activityBarBadge.foreground": c.bg0,
      "sideBar.background": c.bg1,
      "sideBar.foreground": c.fg1,
      "sideBarTitle.foreground": c.fg0,
      "sideBarSectionHeader.background": c.bg1,
      "sideBarSectionHeader.foreground": c.fg1,

      // Listas
      "list.activeSelectionBackground": c.bg2,
      "list.activeSelectionForeground": c.fg0,
      "list.inactiveSelectionBackground": alpha(c.bg2, 0.7),
      "list.hoverBackground": alpha(c.bg2, 0.5),
      "list.highlightForeground": ui("accent"),
      "list.errorForeground": c.error,
      "list.warningForeground": c.warning,

      // Barra de status
      "statusBar.background": c.bg1,
      "statusBar.foreground": c.fg1,
      "statusBar.border": c.bg3,
      "statusBar.debuggingBackground": c.ember,
      "statusBar.debuggingForeground": c.bg0,
      "statusBar.noFolderBackground": c.bg1,
      "statusBarItem.remoteBackground": ui("accent"),
      "statusBarItem.remoteForeground": c.bg0,

      // Barra de título / abas
      "titleBar.activeBackground": c.bg1,
      "titleBar.activeForeground": c.fg1,
      "titleBar.inactiveBackground": c.bg1,
      "editorGroupHeader.tabsBackground": c.bg1,
      "tab.activeBackground": c.bg0,
      "tab.activeForeground": c.fg0,
      "tab.activeBorderTop": ui("accent"),
      "tab.inactiveBackground": c.bg1,
      "tab.inactiveForeground": c.muted,
      "tab.border": c.bg1,

      // Painéis, terminal
      "panel.background": c.bg1,
      "panel.border": c.bg3,
      "panelTitle.activeForeground": c.fg0,
      "panelTitle.activeBorder": ui("accent"),
      "terminal.background": c.bg1,
      "terminal.foreground": c.fg0,
      "terminal.ansiBlack": c.bg3,
      "terminal.ansiRed": c.crimson,
      "terminal.ansiGreen": c.success,
      "terminal.ansiYellow": c.gold,
      "terminal.ansiBlue": c.ghost,
      "terminal.ansiMagenta": c.blossom,
      "terminal.ansiCyan": c.ghost,
      "terminal.ansiWhite": c.fg0,
      "terminal.ansiBrightBlack": c.muted,
      "terminal.ansiBrightRed": c.error,
      "terminal.ansiBrightGreen": c.success,
      "terminal.ansiBrightYellow": c.warning,
      "terminal.ansiBrightBlue": c.ghost,
      "terminal.ansiBrightMagenta": c.blossom,
      "terminal.ansiBrightCyan": c.ghost,
      "terminal.ansiBrightWhite": c.fg0,

      // Inputs, botões, dropdowns
      "input.background": c.bg2,
      "input.foreground": c.fg0,
      "input.border": c.bg3,
      "input.placeholderForeground": c.muted,
      "button.background": ui("accent"),
      "button.foreground": c.bg0,
      "button.hoverBackground": c.ember,
      "dropdown.background": c.bg2,
      "dropdown.border": c.bg3,

      // Widgets (autocomplete, hover, peek)
      "editorWidget.background": c.bg1,
      "editorWidget.border": c.bg3,
      "editorSuggestWidget.background": c.bg1,
      "editorSuggestWidget.selectedBackground": c.bg2,
      "editorSuggestWidget.highlightForeground": ui("accent"),
      "editorHoverWidget.background": c.bg1,
      "editorHoverWidget.border": c.bg3,
      "peekView.border": ui("accent"),
      "peekViewEditor.background": c.bg1,
      "peekViewResult.background": c.bg1,

      // Git decorations
      "gitDecoration.modifiedResourceForeground": c.gold,
      "gitDecoration.addedResourceForeground": c.success,
      "gitDecoration.deletedResourceForeground": c.error,
      "gitDecoration.untrackedResourceForeground": c.ghost,
      "gitDecoration.ignoredResourceForeground": c.muted,

      // Notificações, badge, scrollbar
      "badge.background": ui("accent"),
      "badge.foreground": c.bg0,
      "notificationCenterHeader.background": c.bg2,
      "notifications.background": c.bg1,
      "scrollbarSlider.background": alpha(c.bg3, 0.5),
      "scrollbarSlider.hoverBackground": alpha(c.bg3, 0.8),
      "scrollbarSlider.activeBackground": alpha(c.muted, 0.6),
      "widget.shadow": alpha(c.bg0, 0.6),
    },

    tokenColors: [
      { scope: ["comment", "punctuation.definition.comment"],
        settings: { foreground: syn("comment"), fontStyle: "italic" } },

      { scope: ["keyword", "keyword.control", "storage.type", "storage.modifier"],
        settings: { foreground: syn("keyword") } },

      { scope: ["string", "string.quoted", "punctuation.definition.string"],
        settings: { foreground: syn("string") } },

      { scope: ["constant.numeric"],
        settings: { foreground: syn("number") } },

      { scope: ["constant.language", "constant.character", "variable.other.constant", "support.constant"],
        settings: { foreground: syn("constant") } },

      { scope: ["entity.name.function", "support.function", "meta.function-call entity.name.function"],
        settings: { foreground: syn("function") } },

      { scope: ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.other.inherited-class"],
        settings: { foreground: syn("type") } },

      { scope: ["variable", "meta.definition.variable"],
        settings: { foreground: syn("variable") } },

      { scope: ["variable.parameter"],
        settings: { foreground: syn("parameter"), fontStyle: "italic" } },

      { scope: ["variable.other.property", "support.variable.property", "meta.object-literal.key"],
        settings: { foreground: syn("property") } },

      { scope: ["keyword.operator"],
        settings: { foreground: syn("operator") } },

      { scope: ["punctuation", "meta.brace"],
        settings: { foreground: syn("punctuation") } },

      { scope: ["entity.name.tag"],
        settings: { foreground: syn("tag") } },

      { scope: ["entity.other.attribute-name"],
        settings: { foreground: syn("attribute"), fontStyle: "italic" } },

      { scope: ["string.regexp"],
        settings: { foreground: syn("regexp") } },

      { scope: ["constant.character.escape"],
        settings: { foreground: syn("escape") } },

      // Markdown / markup
      { scope: ["markup.heading", "entity.name.section"],
        settings: { foreground: syn("keyword"), fontStyle: "bold" } },
      { scope: ["markup.bold"], settings: { fontStyle: "bold" } },
      { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
      { scope: ["markup.inline.raw", "markup.fenced_code"],
        settings: { foreground: syn("string") } },
      { scope: ["markup.underline.link"],
        settings: { foreground: syn("function") } },

      // JSON keys
      { scope: ["support.type.property-name.json"],
        settings: { foreground: syn("function") } },

      // CSS
      { scope: ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css"],
        settings: { foreground: syn("type") } },
      { scope: ["support.type.property-name.css"],
        settings: { foreground: syn("variable") } },

      { scope: ["invalid", "invalid.illegal"],
        settings: { foreground: p.palette.error } },
    ],

    semanticTokenColors: {
      "function": syn("function"),
      "method": syn("function"),
      "class": syn("type"),
      "interface": syn("type"),
      "type": syn("type"),
      "enum": syn("type"),
      "enumMember": syn("constant"),
      "variable.readonly": syn("constant"),
      "parameter": { foreground: syn("parameter"), italic: true },
      "property": syn("property"),
      "comment": { foreground: syn("comment"), italic: true },
    },
  };
}
