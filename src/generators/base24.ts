import { PaletteFile, resolve, lighten, darken, ansiBright } from "../lib/palette";

/**
 * Gera o esquema Base24 (ecossistema tinted-theming) a partir da fonte da
 * verdade. Destrava os templates de terminal, tmux, shells etc.
 *
 * Decisões de mapeamento — onde o Base24 diverge do tema VSCode, a régua
 * foi "terminal correto primeiro":
 *
 * - base08–base0E seguem os MESMOS tokens dos slots ANSI do terminal
 *   (roles.terminal), e base12–base17 usam ansiBright(): um terminal
 *   tematizado via Base24 fica idêntico ao terminal integrado do VSCode,
 *   e herda de graça os gates de contraste e unicidade ANSI.
 * - base0B (green) pinta strings nos templates base16/base24, mas aqui é o
 *   jade do `success`: em terminal, verde significa diff/ok — fidelidade de
 *   string (blossom no VSCode) perde para isso de propósito. blossom fica
 *   fora do Base24; é refinamento de sintaxe, não slot ANSI.
 * - base0F ("deprecated"/brown) vai em `error`: o segundo vermelho da
 *   paleta, distinto do crimson de base08 — sinal de "não use isto".
 * - base06/base07 e base10/base11 são degraus derivados de fg0/bg0 com
 *   lighten()/darken(); a palette não tem (nem precisa de) tokens próprios
 *   para extremos que quase nenhum template consome.
 */
export function generateBase24Scheme(p: PaletteFile): string {
  const c = p.palette;
  const ansi = (slot: string) => resolve(p, "terminal", slot);
  const bright = (slot: string) => ansiBright(p, slot);

  const slots: [string, string, string][] = [
    ["base00", c.bg0, "fundo do editor (bg0)"],
    ["base01", c.bg1, "painéis, statusbar (bg1)"],
    ["base02", c.selection, "seleção de texto (selection)"],
    ["base03", c.muted, "comentários (muted)"],
    ["base04", c.fg1, "texto secundário (fg1)"],
    ["base05", c.fg0, "texto principal (fg0)"],
    // fg0 já é claro: degraus pequenos somem na conversão para 8 bits.
    // 0.25/0.5 mantêm o branco QUENTE (nunca #fff puro) com passo visível.
    ["base06", lighten(c.fg0, 0.25), "texto claro (fg0 clareado)"],
    ["base07", lighten(c.fg0, 0.5), "fundo claro / branco quente (fg0 clareado)"],
    ["base08", ansi("red"), "red — a assinatura (crimson, igual ao ANSI red)"],
    ["base09", c.ember, "orange — brasa pyro (ember)"],
    ["base0A", ansi("yellow"), "yellow — bronze antigo (gold)"],
    ["base0B", ansi("green"), "green — jade do diff (success)"],
    ["base0C", ansi("cyan"), "cyan — azul do Boo Tao (ghost)"],
    ["base0D", ansi("blue"), "blue — índigo do céu noturno (dusk)"],
    ["base0E", ansi("magenta"), "magenta — violeta do laço (plum)"],
    ["base0F", c.error, "deprecated — o segundo vermelho (error)"],
    ["base10", darken(c.bg0, 0.15), "fundo mais escuro (bg0 escurecido)"],
    ["base11", darken(c.bg0, 0.3), "fundo mais escuro ainda (bg0 escurecido)"],
    ["base12", bright("red"), "bright red (ANSI bright)"],
    ["base13", bright("yellow"), "bright yellow (ANSI bright)"],
    ["base14", bright("green"), "bright green (ANSI bright)"],
    ["base15", bright("cyan"), "bright cyan (ANSI bright)"],
    ["base16", bright("blue"), "bright blue (ANSI bright)"],
    ["base17", bright("magenta"), "bright magenta (ANSI bright)"],
  ];

  const linhas = slots
    .map(([slot, hex, nota]) => `  ${slot}: "${hex}" # ${nota}`)
    .join("\n");

  return `# Gerado por src/generators/base24.ts a partir de palette/papilio.yaml.
# NÃO editar à mão — rode \`npm run build\`.
system: "base24"
name: "${p.meta.name}"
slug: "${p.meta.slug}"
author: "${p.meta.author}"
variant: "${p.meta.variant}"
palette:
${linhas}
`;
}
