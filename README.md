# Papilio

Tema escuro para VSCode inspirado na paleta da Hu Tao (Genshin Impact):
fundo marrom-avermelhado escuro, carmesim como cor-assinatura, dourado dos
adornos, rosa das flores de ameixeira e o azul-fantasma do Boo Tao.

O nome vem da constelação dela no jogo, *Papilio Charontis* — a borboleta
de Caronte.

Projeto fan-made, sem afiliação com HoYoverse.

## Uso rápido

```bash
npm install
npm run build   # gera themes/papilio-color-theme.json a partir de palette/papilio.yaml
```

Abra a pasta no VSCode e aperte **F5** para testar o tema no
Extension Development Host.

## Como funciona

Toda a identidade visual vive em `palette/papilio.yaml` (âncoras da
personagem → tokens de paleta → roles semânticos). Os geradores em
`src/generators/` transformam esse YAML nos formatos de cada plataforma.
Detalhes e regras do projeto em [CLAUDE.md](CLAUDE.md).

## Variantes (planejadas)

- **Papilio** — o tema padrão (este)
- **Papilio Blood Blossom** — variante saturada, mais dramática
- **Papilio Silk Flower** — possível variante light no futuro
