// ============================================================
// Valida as razões de contraste WCAG do tema. Falha (exit 1) se
// algo ficar abaixo do alvo — integrado ao `npm run build`.
//
// Cobre três frentes:
//   1. roles.syntax contra o fundo do editor (bg0)
//   2. roles.terminal contra o fundo do terminal (roles.ui.terminal-bg)
//   3. pares de UI que o gerador monta à mão (texto sobre chapa)
//
// Alvo padrão 4.5:1. Exceções deliberadas ficam em ALVOS_ESPECIAIS.
// ============================================================

import { join } from "node:path";
import { loadPalette, lighten, ansiBright } from "../src/lib/palette";

const ALVO_PADRAO = 4.5;
const ALVOS_ESPECIAIS: Record<string, number> = {
  comment: 3.0, // rebaixado de propósito — ver CLAUDE.md
  quote: 3.0,   // citação de markdown é secundária, mesma lógica do comentário
  black: 1.0,   // ANSI black é uma chapa de fundo, não texto
  // bright-black precisa de alvo PRÓPRIO. Ele não é chapa: é o cinza que CLIs
  // usam para texto esmaecido. Antes o alvo era calculado uma vez por slot e
  // reaproveitado na linha do bright, então bright-black herdava a isenção do
  // black e passava com 2.76:1 reportando ✔.
  "bright-black": 3.0,
};

/** Luminância relativa WCAG (sRGB linearizado). */
function luminancia(hex: string): number {
  const canais = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

/** Razão de contraste WCAG entre duas cores. */
function contraste(a: string, b: string): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

const PALETTE_PATH = join(import.meta.dirname, "..", "palette", "papilio.yaml");
const p = loadPalette(PALETTE_PATH);
const c = p.palette;
const termBg = c[p.roles.ui["terminal-bg"]];

let falhas = 0;

/** Imprime uma tabela alinhada e contabiliza as falhas. */
function tabela(titulo: string, linhas: string[][]): void {
  const cab = ["item", "cor", "fundo", "contraste", "alvo", "status"];
  const larguras = cab.map((h, i) =>
    Math.max(h.length, ...linhas.map((l) => l[i].length))
  );
  const fmt = (l: string[]) =>
    l.map((celula, i) => celula.padEnd(larguras[i])).join("  ");
  console.log(`\n${titulo}\n`);
  console.log(fmt(cab));
  console.log(larguras.map((w) => "-".repeat(w)).join("  "));
  for (const l of linhas) console.log(fmt(l));
}

/** Monta a linha de um par cor/fundo e marca falha se ficar abaixo do alvo. */
function linha(nome: string, hex: string, fundo: string, alvo: number): string[] {
  const razao = contraste(hex, fundo);
  const ok = razao >= alvo;
  if (!ok) falhas++;
  return [
    nome, hex, fundo,
    `${razao.toFixed(2)}:1`,
    `${alvo.toFixed(1)}:1`,
    ok ? "✔" : "✘ ABAIXO",
  ];
}

// 1. Sintaxe contra o fundo do editor
tabela(
  `roles.syntax contra bg0 (${c.bg0}):`,
  Object.entries(p.roles.syntax).map(([role, token]) =>
    linha(`${role} (${token})`, c[token], c.bg0, ALVOS_ESPECIAIS[role] ?? ALVO_PADRAO)
  )
);

// 2. Terminal contra o próprio fundo — inclui os bright derivados
const linhasTerm: string[][] = [];
for (const [slot, token] of Object.entries(p.roles.terminal)) {
  linhasTerm.push(
    linha(`${slot} (${token})`, c[token], termBg, ALVOS_ESPECIAIS[slot] ?? ALVO_PADRAO)
  );
  // alvo resolvido de novo para o bright: os dois têm exigências diferentes
  linhasTerm.push(
    linha(
      `bright-${slot}`,
      ansiBright(p, slot),
      termBg,
      ALVOS_ESPECIAIS[`bright-${slot}`] ?? ALVO_PADRAO
    )
  );
}
tabela(`roles.terminal contra ${p.roles.ui["terminal-bg"]} (${termBg}):`, linhasTerm);

// Nenhum par de slots ANSI pode repetir cor — era exatamente o bug de
// azul == ciano que motivou este bloco.
const ansi = new Map<string, string>();
for (const [slot, token] of Object.entries(p.roles.terminal)) {
  ansi.set(slot, c[token]);
  ansi.set(`bright-${slot}`, ansiBright(p, slot));
}
const vistos = new Map<string, string>();
for (const [slot, hex] of ansi) {
  const anterior = vistos.get(hex);
  if (anterior) {
    console.error(`✘ ANSI duplicado: ${anterior} e ${slot} são ambos ${hex}`);
    falhas++;
  }
  vistos.set(hex, slot);
}

// 3. Pares de UI montados no gerador (texto sobre chapa colorida).
// 3:1 é o piso para texto de apoio; texto de leitura fica em 4.5:1.
tabela(`pares de UI:`, [
  linha("texto do botão", c.bg0, c[p.roles.ui.accent], ALVO_PADRAO),
  linha("badge", c.bg0, c[p.roles.ui.accent], ALVO_PADRAO),
  linha("statusbar debug", c.bg0, c.ember, ALVO_PADRAO),
  linha("statusbar erro", c.bg0, c.error, ALVO_PADRAO),
  linha("statusbar aviso", c.bg0, c.warning, ALVO_PADRAO),
  linha("texto da sidebar", c.fg1, c.bg1, ALVO_PADRAO),
  linha("aba inativa", c.muted, c.bg1, 3.0),
  linha("número de linha", c.muted, c.bg0, 3.0),
  linha("code lens", c.muted, c.bg0, 3.0),
  linha("inlay hint", c.fg1, c.bg0, ALVO_PADRAO),
  linha("inlay hint tipo", c.ember, c.bg0, ALVO_PADRAO),
  linha("title bar inativa", c.muted, c.bg1, 3.0),
  linha("placeholder do input", lighten(c.muted, 0.12), c.bg2, 3.0),
  linha("texto sobre seleção", c.fg0, c.selection, ALVO_PADRAO),
  // Consumidores de `muted` sobre bg2 que passavam despercebidos por não
  // estarem nesta tabela — o gate só enxerga o que está listado aqui.
  linha("descrição do peek view", c.muted, c.bg2, 3.0),
  linha("descrição em lista focada", c.muted, c.bg2, 3.0),
]);

if (falhas > 0) {
  console.error(`\n✘ ${falhas} problema(s). Ajuste palette/papilio.yaml.`);
  process.exit(1);
}
console.log("\n✔ Contraste e unicidade ANSI dentro dos alvos.");
