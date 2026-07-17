// ============================================================
// Valida as razões de contraste WCAG de cada role de sintaxe
// contra o fundo do editor (bg0). Falha (exit 1) se algum role
// ficar abaixo do alvo — integrado ao `npm run build`.
//
// Alvos: 4.5:1 para todo role de sintaxe, exceto `comment`,
// que é rebaixado de propósito (3:1).
// ============================================================

import { join } from "node:path";
import { loadPalette } from "../src/lib/palette";

const ALVO_PADRAO = 4.5;
const ALVOS_ESPECIAIS: Record<string, number> = {
  comment: 3.0, // rebaixado de propósito — ver CLAUDE.md
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
const bg0 = p.palette.bg0;

let falhas = 0;
const linhas: string[][] = [];

for (const [role, token] of Object.entries(p.roles.syntax)) {
  const hex = p.palette[token];
  const razao = contraste(hex, bg0);
  const alvo = ALVOS_ESPECIAIS[role] ?? ALVO_PADRAO;
  const ok = razao >= alvo;
  if (!ok) falhas++;
  linhas.push([
    role,
    token,
    hex,
    `${razao.toFixed(2)}:1`,
    `${alvo.toFixed(1)}:1`,
    ok ? "✔" : "✘ ABAIXO",
  ]);
}

// Tabela alinhada por coluna
const cab = ["role", "token", "hex", "contraste", "alvo", "status"];
const larguras = cab.map((c, i) =>
  Math.max(c.length, ...linhas.map((l) => l[i].length))
);
const fmt = (l: string[]) =>
  l.map((celula, i) => celula.padEnd(larguras[i])).join("  ");

console.log(`Contraste de roles.syntax contra bg0 (${bg0}):\n`);
console.log(fmt(cab));
console.log(larguras.map((w) => "-".repeat(w)).join("  "));
for (const l of linhas) console.log(fmt(l));

if (falhas > 0) {
  console.error(
    `\n✘ ${falhas} role(s) abaixo do alvo. Ajuste os tokens em palette/papilio.yaml.`
  );
  process.exit(1);
}
console.log("\n✔ Todos os roles de sintaxe atendem aos alvos de contraste.");
