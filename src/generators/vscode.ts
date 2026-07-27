import { PaletteFile, resolve, alpha, lighten, ansiBright } from "../lib/palette";

/**
 * Gera o JSON de tema do VSCode a partir da fonte da verdade.
 * Regra do projeto: NENHUM hex hardcoded aqui — tudo vem de p.palette
 * ou de resolve()/alpha()/lighten().
 */
export function generateVscodeTheme(p: PaletteFile): object {
  const c = p.palette;
  const syn = (role: string) => resolve(p, "syntax", role);
  const ui = (role: string) => resolve(p, "ui", role);
  const ansi = (slot: string) => resolve(p, "terminal", slot);
  const bright = (slot: string) => ansiBright(p, slot);

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
      // O default desenha uma borda #282828 por cima do realce quente da linha
      // atual. Transparente para não sobrar contorno cinza.
      "editor.lineHighlightBorder": alpha(c.bg2, 0),
      "editor.rangeHighlightBackground": alpha(c.bg2, 0.6),
      "editor.hoverHighlightBackground": alpha(c.ghost, 0.12),
      "editorLineNumber.foreground": c.muted,
      "editorLineNumber.activeForeground": c.fg1,
      // CodeLens e inlay hints: texto de apoio no editor — sem isto o VS Code
      // cai no azul/cinza frio do default e fura a tela quente.
      "editorCodeLens.foreground": c.muted,
      "editorInlayHint.foreground": c.fg1,
      "editorInlayHint.background": alpha(c.bg2, 0.7),
      "editorInlayHint.typeForeground": c.ember,
      "editorInlayHint.typeBackground": alpha(c.bg2, 0.7),
      "editorInlayHint.parameterForeground": c.fg1,
      "editorInlayHint.parameterBackground": alpha(c.bg2, 0.7),
      "editorIndentGuide.background1": c.bg3,
      "editorIndentGuide.activeBackground1": c.muted,
      "editorWhitespace.foreground": c.bg3,
      "editorBracketMatch.background": alpha(c.ghost, 0.15),
      "editorBracketMatch.border": c.ghost,
      "editorStickyScroll.background": c.bg1,
      "editorStickyScrollHover.background": c.bg2,
      "editorLink.activeForeground": ui("link"),

      // Minimap e overview ruler
      "minimap.findMatchHighlight": alpha(c.gold, 0.5),
      "minimap.selectionHighlight": c.selection,
      "minimapSlider.background": alpha(c.bg3, 0.4),
      "minimapSlider.hoverBackground": alpha(c.bg3, 0.6),
      "minimapSlider.activeBackground": alpha(c.muted, 0.5),
      "editorOverviewRuler.border": c.bg3,
      "editorOverviewRuler.errorForeground": c.error,
      "editorOverviewRuler.warningForeground": c.warning,
      "editorOverviewRuler.infoForeground": c.info,
      "editorOverviewRuler.findMatchForeground": alpha(c.gold, 0.6),
      "editorOverviewRuler.addedForeground": c.success,
      "editorOverviewRuler.modifiedForeground": c.gold,
      "editorOverviewRuler.deletedForeground": c.error,

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
      "diffEditor.insertedLineBackground": alpha(c.success, 0.08),
      "diffEditor.removedLineBackground": alpha(c.error, 0.08),
      "diffEditor.border": c.bg3,
      // Sem isto a hachura das regiões vazias do diff lado a lado sai no
      // cinza #cccccc33 do default — a maior mancha fria da tela de diff.
      "diffEditor.diagonalFill": alpha(c.bg3, 0.5),
      "diffEditor.unchangedRegionBackground": c.bg1,
      "diffEditor.unchangedRegionForeground": c.muted,
      "diffEditorGutter.insertedLineBackground": alpha(c.success, 0.12),
      "diffEditorGutter.removedLineBackground": alpha(c.error, 0.12),

      // Diagnósticos
      "editorError.foreground": c.error,
      "editorWarning.foreground": c.warning,
      "editorInfo.foreground": c.info,
      // A lâmpada de quick-fix aparece o tempo todo. Os defaults são #FFCC00
      // (amarelo puro, briga com o gold) e #75BEFF (azul frio) no auto-fix.
      "editorLightBulb.foreground": c.gold,
      "editorLightBulbAutoFix.foreground": c.success,
      "editorLightBulbAi.foreground": c.plum,

      // Merge de conflitos — 12 chaves que estavam todas ausentes. Os defaults
      // do VS Code são teal (current) e azul (incoming), em blocos grandes no
      // meio do editor: era o maior vazamento frio do tema.
      "merge.currentHeaderBackground": alpha(c.crimson, 0.4),
      "merge.currentContentBackground": alpha(c.crimson, 0.16),
      "merge.incomingHeaderBackground": alpha(c.dusk, 0.4),
      "merge.incomingContentBackground": alpha(c.dusk, 0.16),
      "merge.commonHeaderBackground": alpha(c.bg3, 0.7),
      "merge.commonContentBackground": alpha(c.bg3, 0.35),
      "merge.border": c.bg3,
      "editorOverviewRuler.currentContentForeground": alpha(c.crimson, 0.6),
      "editorOverviewRuler.incomingContentForeground": alpha(c.dusk, 0.6),
      "editorOverviewRuler.commonContentForeground": alpha(c.muted, 0.6),

      // Painel de variáveis do debugger: os defaults são literalmente as cores
      // do Dark+ (#c586c0 roxo, #4e94ce azul, #b5cea8 verde).
      "debugTokenExpression.name": syn("property"),
      "debugTokenExpression.value": c.fg1,
      "debugTokenExpression.string": syn("string"),
      "debugTokenExpression.number": syn("number"),
      "debugTokenExpression.boolean": syn("constant"),
      "debugTokenExpression.error": c.error,
      "debugConsole.infoForeground": c.info,
      "debugConsole.warningForeground": c.warning,
      "debugConsole.errorForeground": c.error,
      "debugConsole.sourceForeground": c.muted,
      "debugConsoleInputIcon.foreground": ui("accent"),
      // Shell integration é padrão em pwsh e bash; o default é um teal #1B81A8
      // na gutter do terminal.
      "terminalCommandDecoration.defaultBackground": c.muted,
      "terminalCommandDecoration.successBackground": c.success,
      "terminalCommandDecoration.errorBackground": c.error,
      "minimap.errorHighlight": alpha(c.error, 0.7),
      "minimap.warningHighlight": alpha(c.warning, 0.7),
      "list.dropBackground": alpha(c.bg2, 0.8),
      "welcomePage.tileBackground": c.bg1,
      "welcomePage.tileHoverBackground": c.bg2,
      "welcomePage.tileBorder": c.bg3,
      "welcomePage.progress.background": c.bg3,
      "welcomePage.progress.foreground": ui("accent"),
      "mergeEditor.change.background": alpha(c.gold, 0.14),
      "mergeEditor.change.word.background": alpha(c.gold, 0.3),
      "mergeEditor.conflict.unhandledUnfocused.border": alpha(c.error, 0.5),
      "mergeEditor.conflict.unhandledFocused.border": c.error,
      "mergeEditor.conflict.handledUnfocused.border": alpha(c.success, 0.4),
      "mergeEditor.conflict.handledFocused.border": c.success,

      // Workbench: chrome geral
      "foreground": c.fg1,
      "focusBorder": ui("accent"),
      "selection.background": c.selection,
      "descriptionForeground": c.muted,
      "errorForeground": c.error,
      "textLink.foreground": ui("link"),
      "textLink.activeForeground": c.fg0,
      "textPreformat.foreground": syn("string"),
      "textBlockQuote.background": c.bg1,
      "textBlockQuote.border": ui("accent"),
      "textSeparator.foreground": c.bg3,
      "sash.hoverBorder": ui("accent"),
      "progressBar.background": ui("accent"),
      "editorGroup.border": c.bg3,
      "editorGroupHeader.noTabsBackground": c.bg1,
      // Alimenta setas de árvore, ícones de toolbar e controles de dobra.
      // Default #C5C5C5: cinza frio espalhado por toda a chrome.
      "icon.foreground": c.fg1,
      "editorGutter.foldingControlForeground": c.muted,

      // Ícones do IntelliSense, do Outline e do breadcrumb. Estavam todos
      // ausentes, então o autocomplete abria com roxo #B180D7 e azul #75BEFF
      // do Dark+ a cada tecla — a lacuna mais visível que sobrava.
      // Seguem os mesmos roles da sintaxe, para o ícone combinar com o token.
      "symbolIcon.classForeground": syn("type"),
      "symbolIcon.interfaceForeground": syn("type"),
      "symbolIcon.structForeground": syn("type"),
      "symbolIcon.enumeratorForeground": syn("type"),
      "symbolIcon.typeParameterForeground": syn("type"),
      "symbolIcon.functionForeground": syn("function"),
      "symbolIcon.methodForeground": syn("function"),
      "symbolIcon.constructorForeground": syn("function"),
      "symbolIcon.eventForeground": syn("function"),
      "symbolIcon.variableForeground": syn("variable"),
      "symbolIcon.fieldForeground": syn("property"),
      "symbolIcon.propertyForeground": syn("property"),
      "symbolIcon.objectForeground": syn("property"),
      "symbolIcon.keyForeground": syn("property"),
      "symbolIcon.constantForeground": syn("constant"),
      "symbolIcon.enumeratorMemberForeground": syn("constant"),
      "symbolIcon.numberForeground": syn("number"),
      "symbolIcon.booleanForeground": syn("constant"),
      "symbolIcon.nullForeground": syn("constant"),
      "symbolIcon.stringForeground": syn("string"),
      "symbolIcon.textForeground": c.fg0,
      "symbolIcon.keywordForeground": syn("keyword"),
      "symbolIcon.operatorForeground": syn("operator"),
      "symbolIcon.moduleForeground": syn("namespace"),
      "symbolIcon.namespaceForeground": syn("namespace"),
      "symbolIcon.packageForeground": syn("namespace"),
      "symbolIcon.arrayForeground": c.fg1,
      "symbolIcon.unitForeground": c.fg1,
      "symbolIcon.referenceForeground": c.fg1,
      "symbolIcon.snippetForeground": c.fg1,
      "symbolIcon.colorForeground": c.fg1,
      "symbolIcon.fileForeground": c.fg1,
      "symbolIcon.folderForeground": c.fg1,

      // Sidebar / activity bar
      "activityBar.background": c.bg1,
      "activityBar.foreground": c.fg0,
      "activityBar.inactiveForeground": c.muted,
      "activityBarBadge.background": ui("accent"),
      "activityBarBadge.foreground": c.bg0,
      "sideBar.background": c.bg1,
      "sideBar.foreground": c.fg1,
      "sideBar.border": c.bg3,
      "sideBarTitle.foreground": c.fg0,
      "sideBarSectionHeader.background": c.bg1,
      "sideBarSectionHeader.foreground": c.fg1,
      "sideBarSectionHeader.border": c.bg3,

      // Listas e árvores
      "list.activeSelectionBackground": c.bg2,
      "list.activeSelectionForeground": c.fg0,
      "list.inactiveSelectionBackground": alpha(c.bg2, 0.7),
      "list.inactiveSelectionForeground": c.fg0,
      "list.focusBackground": c.bg2,
      "list.focusForeground": c.fg0,
      "list.focusOutline": ui("accent"),
      "list.hoverBackground": alpha(c.bg2, 0.5),
      "list.hoverForeground": c.fg0,
      "list.highlightForeground": ui("accent"),
      "list.focusHighlightForeground": ui("accent"),
      "list.errorForeground": c.error,
      "list.warningForeground": c.warning,
      "tree.indentGuidesStroke": c.bg3,
      "tree.inactiveIndentGuidesStroke": alpha(c.bg3, 0.5),

      // Barra de status
      "statusBar.background": c.bg1,
      "statusBar.foreground": c.fg1,
      "statusBar.border": c.bg3,
      "statusBar.debuggingBackground": c.ember,
      "statusBar.debuggingForeground": c.bg0,
      "statusBar.noFolderBackground": c.bg1,
      "statusBarItem.remoteBackground": ui("accent"),
      "statusBarItem.remoteForeground": c.bg0,
      "statusBarItem.hoverBackground": alpha(c.bg3, 0.6),
      "statusBarItem.activeBackground": alpha(c.bg3, 0.9),
      "statusBarItem.errorBackground": c.error,
      "statusBarItem.errorForeground": c.bg0,
      "statusBarItem.warningBackground": c.warning,
      "statusBarItem.warningForeground": c.bg0,

      // Barra de título / abas
      "titleBar.activeBackground": c.bg1,
      "titleBar.activeForeground": c.fg1,
      "titleBar.inactiveBackground": c.bg1,
      "titleBar.inactiveForeground": c.muted,
      "editorGroupHeader.tabsBackground": c.bg1,
      "tab.activeBackground": c.bg0,
      "tab.activeForeground": c.fg0,
      "tab.activeBorderTop": ui("accent"),
      "tab.inactiveBackground": c.bg1,
      "tab.inactiveForeground": c.muted,
      "tab.border": c.bg1,
      "tab.unfocusedActiveForeground": c.fg1,
      "tab.unfocusedInactiveForeground": c.muted,
      "tab.hoverBackground": c.bg2,
      "tab.activeModifiedBorder": c.gold,
      "breadcrumb.background": c.bg0,
      "breadcrumb.foreground": c.muted,
      "breadcrumb.focusForeground": c.fg0,
      "breadcrumb.activeSelectionForeground": ui("accent"),
      "breadcrumbPicker.background": c.bg1,

      // Painéis, terminal
      "panel.background": c.bg1,
      "panel.border": c.bg3,
      "panelTitle.activeForeground": c.fg0,
      "panelTitle.activeBorder": ui("accent"),
      "panelTitle.inactiveForeground": c.muted,
      "panelInput.border": c.bg3,
      "terminal.background": ui("terminal-bg"),
      "terminal.foreground": c.fg0,
      "terminal.selectionBackground": alpha(c.selection, 0.7),
      "terminalCursor.foreground": c.cursor,
      "terminal.border": c.bg3,
      // 16 slots ANSI, todos distintos: 8 bases vêm de roles.terminal e
      // cada bright é a base clareada. Azul e ciano deixaram de colidir.
      "terminal.ansiBlack": ansi("black"),
      "terminal.ansiRed": ansi("red"),
      "terminal.ansiGreen": ansi("green"),
      "terminal.ansiYellow": ansi("yellow"),
      "terminal.ansiBlue": ansi("blue"),
      "terminal.ansiMagenta": ansi("magenta"),
      "terminal.ansiCyan": ansi("cyan"),
      "terminal.ansiWhite": ansi("white"),
      "terminal.ansiBrightBlack": bright("black"),
      "terminal.ansiBrightRed": bright("red"),
      "terminal.ansiBrightGreen": bright("green"),
      "terminal.ansiBrightYellow": bright("yellow"),
      "terminal.ansiBrightBlue": bright("blue"),
      "terminal.ansiBrightMagenta": bright("magenta"),
      "terminal.ansiBrightCyan": bright("cyan"),
      "terminal.ansiBrightWhite": bright("white"),

      // Inputs, botões, dropdowns
      "input.background": c.bg2,
      "input.foreground": c.fg0,
      "input.border": c.bg3,
      // muted puro fica em 2.98:1 sobre bg2 — clareado só o bastante para 3:1
      "input.placeholderForeground": lighten(c.muted, 0.12),
      "inputOption.activeBorder": ui("accent"),
      "inputOption.activeForeground": c.fg0,
      "inputOption.activeBackground": alpha(ui("accent"), 0.25),
      "inputValidation.errorBackground": c.bg2,
      "inputValidation.errorBorder": c.error,
      "inputValidation.warningBackground": c.bg2,
      "inputValidation.warningBorder": c.warning,
      "inputValidation.infoBackground": c.bg2,
      "inputValidation.infoBorder": c.info,
      "button.background": ui("accent"),
      "button.foreground": c.bg0,
      "button.hoverBackground": c.ember,
      "button.secondaryBackground": c.bg3,
      "button.secondaryForeground": c.fg0,
      "button.secondaryHoverBackground": c.selection,
      "extensionButton.prominentBackground": ui("accent"),
      "extensionButton.prominentForeground": c.bg0,
      "extensionButton.prominentHoverBackground": c.ember,
      "dropdown.background": c.bg2,
      "dropdown.foreground": c.fg0,
      "dropdown.border": c.bg3,
      "checkbox.background": c.bg2,
      "checkbox.foreground": c.fg0,
      "checkbox.border": c.bg3,

      // Menus e rótulos de atalho
      "menu.background": c.bg1,
      "menu.foreground": c.fg1,
      "menu.border": c.bg3,
      "menu.selectionBackground": c.bg2,
      "menu.selectionForeground": c.fg0,
      "menu.separatorBackground": c.bg3,
      "menubar.selectionBackground": c.bg2,
      "menubar.selectionForeground": c.fg0,
      "keybindingLabel.background": c.bg2,
      "keybindingLabel.foreground": c.fg0,
      "keybindingLabel.border": c.bg3,
      "keybindingLabel.bottomBorder": c.bg3,

      // Quick open / command palette
      "quickInput.background": c.bg1,
      "quickInput.foreground": c.fg1,
      "quickInputTitle.background": c.bg2,
      "quickInputList.focusBackground": c.bg2,
      "quickInputList.focusForeground": c.fg0,
      "pickerGroup.foreground": ui("accent"),
      "pickerGroup.border": c.bg3,

      // Settings UI
      "settings.headerForeground": c.fg0,
      "settings.modifiedItemIndicator": c.gold,
      "settings.focusedRowBackground": alpha(c.bg2, 0.5),
      "settings.rowHoverBackground": alpha(c.bg2, 0.3),

      // Debug
      "debugToolBar.background": c.bg2,
      "debugToolBar.border": c.bg3,
      "debugIcon.breakpointForeground": c.error,
      "debugIcon.breakpointDisabledForeground": c.muted,
      "editor.stackFrameHighlightBackground": alpha(c.gold, 0.2),
      "editor.focusedStackFrameHighlightBackground": alpha(c.success, 0.2),

      // Testes
      "testing.iconPassed": c.success,
      "testing.iconFailed": c.error,
      "testing.iconQueued": c.warning,
      "testing.iconSkipped": c.muted,

      // Widgets (autocomplete, hover, peek)
      "editorWidget.background": c.bg1,
      "editorWidget.foreground": c.fg1,
      "editorWidget.border": c.bg3,
      "editorSuggestWidget.background": c.bg1,
      "editorSuggestWidget.foreground": c.fg1,
      "editorSuggestWidget.border": c.bg3,
      "editorSuggestWidget.selectedBackground": c.bg2,
      "editorSuggestWidget.selectedForeground": c.fg0,
      "editorSuggestWidget.highlightForeground": ui("accent"),
      "editorSuggestWidget.focusHighlightForeground": ui("accent"),
      "editorHoverWidget.background": c.bg1,
      "editorHoverWidget.foreground": c.fg1,
      "editorHoverWidget.border": c.bg3,
      "peekView.border": ui("accent"),
      "peekViewTitle.background": c.bg2,
      "peekViewTitleLabel.foreground": c.fg0,
      "peekViewTitleDescription.foreground": c.muted,
      "peekViewEditor.background": c.bg1,
      "peekViewEditor.matchHighlightBackground": alpha(c.gold, 0.3),
      "peekViewResult.background": c.bg1,
      "peekViewResult.selectionBackground": c.bg2,
      "peekViewResult.selectionForeground": c.fg0,
      "peekViewResult.lineForeground": c.fg1,
      "peekViewResult.fileForeground": c.fg0,
      "peekViewResult.matchHighlightBackground": alpha(c.gold, 0.3),

      // Git decorations
      "gitDecoration.modifiedResourceForeground": c.gold,
      "gitDecoration.addedResourceForeground": c.success,
      "gitDecoration.deletedResourceForeground": c.error,
      "gitDecoration.untrackedResourceForeground": c.ghost,
      "gitDecoration.ignoredResourceForeground": c.muted,
      "gitDecoration.conflictingResourceForeground": c.ember,
      "gitDecoration.stageModifiedResourceForeground": c.gold,
      "gitDecoration.stageDeletedResourceForeground": c.error,
      // Defaults #73C991 (verde do Dark+) e #8db9e2 (azul frio).
      "gitDecoration.renamedResourceForeground": c.success,
      "gitDecoration.submoduleResourceForeground": c.plum,

      // Notebooks
      "notebook.cellEditorBackground": c.bg0,
      "notebook.focusedCellBorder": ui("accent"),
      "notebook.cellBorderColor": c.bg3,

      // Notificações, badge, scrollbar
      "badge.background": ui("accent"),
      "badge.foreground": c.bg0,
      "notificationCenterHeader.background": c.bg2,
      "notifications.background": c.bg1,
      "notifications.border": c.bg3,
      "notificationLink.foreground": ui("link"),
      "notificationsErrorIcon.foreground": c.error,
      "notificationsWarningIcon.foreground": c.warning,
      "notificationsInfoIcon.foreground": c.info,
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

      // this / self / super: variável na gramática, palavra-chave na cabeça de quem lê
      { scope: ["variable.language"],
        settings: { foreground: syn("builtin") } },

      { scope: ["entity.name.namespace", "entity.name.module", "storage.modifier.package"],
        settings: { foreground: syn("namespace") } },

      { scope: ["meta.decorator", "entity.name.function.decorator", "punctuation.decorator"],
        settings: { foreground: syn("decorator") } },

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

      // As marcas ${ } destacam-se do corpo da template string
      { scope: ["punctuation.definition.template-expression",
                "punctuation.section.embedded"],
        settings: { foreground: syn("interpolation") } },
      // ...mas o que está DENTRO delas volta a ser código normal
      { scope: ["meta.embedded", "meta.template.expression"],
        settings: { foreground: syn("variable") } },

      // Markdown / markup
      { scope: ["markup.heading", "entity.name.section"],
        settings: { foreground: syn("keyword"), fontStyle: "bold" } },
      { scope: ["markup.bold"], settings: { fontStyle: "bold" } },
      { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
      { scope: ["markup.inline.raw", "markup.fenced_code"],
        settings: { foreground: syn("string") } },
      { scope: ["markup.underline.link"],
        settings: { foreground: syn("function") } },
      { scope: ["markup.quote"],
        settings: { foreground: syn("quote") } },
      { scope: ["markup.list punctuation.definition.list", "beginning.punctuation.definition.list"],
        settings: { foreground: syn("keyword") } },

      // Diffs e patches
      { scope: ["markup.inserted", "meta.diff.header.to-file"],
        settings: { foreground: syn("inserted") } },
      { scope: ["markup.deleted", "meta.diff.header.from-file"],
        settings: { foreground: syn("deleted") } },
      { scope: ["markup.changed"],
        settings: { foreground: syn("changed") } },
      { scope: ["meta.diff.range", "punctuation.definition.range.diff"],
        settings: { foreground: syn("function") } },

      // JSON keys
      { scope: ["support.type.property-name.json"],
        settings: { foreground: syn("function") } },

      // CSS. O fontStyle vazio é obrigatório: seletores de classe/id são
      // entity.other.attribute-name, e sem isto herdariam o itálico da regra
      // de atributo HTML — o guia de estilo restringe itálico a comentário,
      // parâmetro e atributo HTML.
      { scope: ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css",
                "entity.other.attribute-name.pseudo-class.css", "entity.other.attribute-name.pseudo-element.css"],
        settings: { foreground: syn("type"), fontStyle: "" } },
      { scope: ["support.type.property-name.css"],
        settings: { foreground: syn("variable") } },
      { scope: ["keyword.other.unit.css", "constant.numeric.css"],
        settings: { foreground: syn("number") } },

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
      "variable.defaultLibrary": syn("builtin"),
      "parameter": { foreground: syn("parameter"), italic: true },
      "property": syn("property"),
      "comment": { foreground: syn("comment"), italic: true },
      "namespace": syn("namespace"),
      "typeParameter": syn("type"),
      "decorator": syn("decorator"),
      "number": syn("number"),
      "string": syn("string"),
      "keyword": syn("keyword"),
    },
  };
}
