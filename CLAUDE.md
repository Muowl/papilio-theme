# papilio-theme

Tema de editor inspirado na paleta da Hu Tao (Genshin Impact). VSCode é o
primeiro alvo; a arquitetura já prevê outras plataformas.

## Arquitetura — regra central

`palette/papilio.yaml` é a **única fonte da verdade**. O fluxo é:

```
palette/papilio.yaml  →  src/generate.ts  →  themes/*.json + assets/logo.* (e futuros alvos)
```

- `anchors`: cores brutas da personagem (referência, não consumidas por geradores)
- `palette`: tokens nomeados com hex final, ajustados para tela
- `roles`: mapeamento semântico (ex: `keyword: crimson`) — decisões de design vivem aqui

**Regras invioláveis:**
1. Nenhum gerador pode conter hex hardcoded. Toda cor entra primeiro em `palette:`.
2. Decisão do tipo "strings agora são douradas" muda em `roles:`, nunca no gerador.
3. Arquivos em `themes/` e `assets/` são gerados — nunca editar à mão.
   (A logo — o fantasminha Papilio — vive em `src/generators/logo.ts` e
   também tira as cores da palette.)

## Comandos

```bash
npm install          # primeira vez
npm run build        # gera themes/ a partir do YAML
npm run watch        # regenera ao salvar
```

## Testar no VSCode

Abrir a pasta no VSCode e apertar F5 (Extension Development Host abre com o
tema disponível em "Preferences: Color Theme"). Após mudar o YAML, rodar
`npm run build` e recarregar a janela do host (Ctrl+R).

## Refinar cores a partir de imagens

Colocar imagens de referência da personagem em `references/` (art oficial em
alta resolução > screenshots comprimidos) e rodar:

```bash
pip install Pillow
python scripts/extract_colors.py references/*.png --colors 10
```

As cores extraídas alimentam `anchors:` no YAML. A passagem de âncora para
`palette:` é **curadoria manual** — priorizar legibilidade sobre fidelidade
(um tom bonito na personagem pode ser ilegível como cor de sintaxe).

## Diretrizes de design

- Fundo `bg0` é marrom-avermelhado escuro, não preto puro nem cinza frio.
- `crimson` é a cor-assinatura: usar com parcimônia (keywords, accent) para
  não saturar. Se tudo é vermelho, nada é.
- `ghost` (azul do Boo Tao) é o contraponto frio — funções e links.
- Contraste alvo: cores de sintaxe legíveis sobre `bg0` em sessões longas
  (mirar ~4.5:1; comentários podem ficar abaixo de propósito, ~3:1).
- Itálico apenas em: comentários, parâmetros, atributos HTML.

## Roadmap

- [x] Fase 1 — Gerador VSCode funcional (workbench + tokenColors + semantic)
- [x] Fase 2 — Refinar âncoras com imagens reais em `references/` + polir
      contraste (criar `scripts/check_contrast.ts` que valida razões WCAG
      de cada role de sintaxe contra bg0 e falha o build se degradar)
- [ ] Fase 3 — Variante "Papilio Blood Blossom" (mais saturada, para quem quer drama)
- [ ] Fase 4 — Export Base24/Tinted8 (ecossistema tinted-theming) em
      `src/generators/base24.ts` → destrava terminal, tmux, etc.
- [ ] Fase 5 — Alvos diretos: Windows Terminal, Zen Browser (aproveitar o
      aprendizado do zen-lucid-tabs)
- [ ] Publicação: empacotar com vsce. ATENÇÃO — projeto fan-made: o nome
      público e a descrição não podem sugerir afiliação com HoYoverse;
      não incluir artes oficiais no repositório nem no marketplace.

## Nomenclatura

"Papilio" é a marca do tema (constelação da Hu Tao: *Papilio Charontis*).
Variantes usam termos do lore dela: "Papilio Blood Blossom" (saturada),
"Papilio Silk Flower" (light, se existir). Novas variantes seguem o padrão
`Papilio <termo do lore>`. O nome público nunca deve sugerir afiliação
com HoYoverse — a inspiração fica declarada só na descrição.

## Convenções

- TypeScript estrito, ESM, executado via tsx (sem etapa de compilação).
- Commits em inglês, convencional (`feat:`, `fix:`, `chore:`).
- Comentários e docs em pt-BR.
