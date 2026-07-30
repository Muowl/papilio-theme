# Gramáticas vendorizadas

Cópias das gramáticas TextMate que o VS Code publica, usadas por
`scripts/check_tokens.ts` para tokenizar os fixtures com o mesmo motor do
editor. **Não editar à mão** — para atualizar, baixe de novo do repositório
`microsoft/vscode` (branch `main`):

| arquivo | origem |
| --- | --- |
| `css.tmLanguage.json` | `extensions/css/syntaxes/` |
| `less.tmLanguage.json` | `extensions/less/syntaxes/` |
| `scss.tmLanguage.json` | `extensions/scss/syntaxes/` |
| `html.tmLanguage.json` | `extensions/html/syntaxes/` |
| `html-derivative.tmLanguage.json` | `extensions/html/syntaxes/` |
| `TypeScriptReact.tmLanguage.json` | `extensions/typescript-basics/syntaxes/` |

Licença: MIT (VS Code); cada gramática mantém a licença do projeto upstream
de onde o VS Code a importa. Uso aqui é somente para teste.

Atualizar as gramáticas pode mudar nomes de escopo — se `npm run check`
quebrar depois de uma atualização, os escopos reais de cada caso aparecem
no diagnóstico da falha.
