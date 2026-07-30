// ============================================================
// Valida as razões de contraste WCAG do tema. Falha (exit 1) se
// algo ficar abaixo do alvo — integrado ao `npm run build`.
//
// Roda para a BASE e para cada variante (overlays em palette/):
// uma variante nova nasce coberta sem tocar neste arquivo.
//
// Cobre quatro frentes por paleta:
//   1. roles.syntax contra o fundo do editor (bg0)
//   2. roles.terminal contra o fundo do terminal (roles.ui.terminal-bg)
//   3. pares de UI que o gerador monta à mão (texto sobre chapa)
//   3b. texto sobre chapas semitransparentes compostas
// ...e, só para a base, as cópias manuais de hex (README, package.json).
//
// Alvo padrão 4.5:1. Exceções deliberadas ficam em ALVOS_ESPECIAIS.
// ============================================================

import { join } from "node:path";
import { readFileSync } from "node:fs";
import {
  PaletteFile, loadAllPalettes, lighten, ansiBright, CHAPAS, chapaComposta,
} from "../src/lib/palette";

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

function rodaPaleta(p: PaletteFile): void {
  const c = p.palette;
  const termBg = c[p.roles.ui["terminal-bg"]];
  const nome = p.meta.name;

  // 1. Sintaxe contra o fundo do editor
  tabela(
    `[${nome}] roles.syntax contra bg0 (${c.bg0}):`,
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
  tabela(`[${nome}] roles.terminal contra ${p.roles.ui["terminal-bg"]} (${termBg}):`, linhasTerm);

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
      console.error(`✘ [${nome}] ANSI duplicado: ${anterior} e ${slot} são ambos ${hex}`);
      falhas++;
    }
    vistos.set(hex, slot);
  }

  // 3. Pares de UI montados no gerador (texto sobre chapa colorida).
  // 3:1 é o piso para texto de apoio; texto de leitura fica em 4.5:1.
  tabela(`[${nome}] pares de UI:`, [
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
    // Caracteres casados do quick open/suggest: precisam passar em TODOS os
    // fundos de lista (widget bg1, linha ativa bg2). Era o Known issue do
    // accent a 4.35:1.
    linha("realce de busca em lista (bg1)", c[p.roles.ui["list-highlight"]], c.bg1, ALVO_PADRAO),
    linha("realce de busca em lista (bg2)", c[p.roles.ui["list-highlight"]], c.bg2, ALVO_PADRAO),
  ]);

  // 3b. Texto sobre as chapas semitransparentes.
  // O gate media tudo contra bg0, mas um realce de busca ou um bloco de merge
  // desenha uma chapa ATRÁS do código: o que o olho lê é a cor composta. O find
  // match estava em alpha 0.35 e derrubava comentário para 2.34:1 enquanto esta
  // tabela inteira reportava ✔, simplesmente por não existir.
  //
  // Piso 3.0 e não 4.5: a chapa é transitória e sempre acompanhada de outro
  // sinal (borda, gutter, cursor). O que não se aceita é o realce APAGAR o texto
  // que ele deveria estar destacando.
  const PISO_CHAPA = 3.0;
  tabela(
    `[${nome}] texto sobre chapas compostas:`,
    Object.keys(CHAPAS).flatMap((nomeChapa) => {
      const composta = chapaComposta(p, nomeChapa);
      // muted (comentário) e dusk (atributo) são os tokens mais escuros que
      // aparecem por cima de código — se eles passam, o resto passa.
      return [
        linha(`${nomeChapa} / comentário`, c.muted, composta, PISO_CHAPA),
        linha(`${nomeChapa} / atributo`, c[p.roles.syntax.attribute], composta, PISO_CHAPA),
      ];
    })
  );

  // `cursor` repete o hex do `crimson` à mão (a palette só aceita hex literal,
  // não referências). Nada impedia os dois de divergirem no próximo ajuste —
  // mesma classe de bug do README. Vale para cada variante.
  if (c.cursor.toLowerCase() !== c.crimson.toLowerCase()) {
    console.error(
      `\n✘ [${nome}] palette — cursor ${c.cursor} ≠ crimson ${c.crimson} (cursor deve acompanhar crimson)`
    );
    falhas++;
  }
}

const raiz = join(import.meta.dirname, "..");
const paletas = loadAllPalettes(join(raiz, "palette"));
for (const { p } of paletas) rodaPaleta(p);

// 4. Cópias manuais de hex fora do YAML — só a BASE aparece no README e no
// package.json. O gerador é limpo, mas esses dois repetem cores à mão e nada
// impedia que envelhecessem — foi exatamente o que aconteceu quando a paleta
// mudou. Estes checks são baratos e fecham a porta.
const base = paletas.find((x) => x.ehBase)!.p;
const cBase = base.palette;

const readme = readFileSync(join(raiz, "README.md"), "utf8");
const bloco = readme.match(/<!-- palette:start[\s\S]*?<!-- palette:end -->/);
if (!bloco) {
  console.error("\n✘ README.md: bloco palette:start/palette:end não encontrado");
  falhas++;
} else {
  const linhasReadme = [...bloco[0].matchAll(/^\|\s*`(\w[\w-]*)`\s*\|\s*`(#[0-9a-fA-F]{6})`/gm)];
  const divergentes = linhasReadme
    .filter(([, token, hex]) => cBase[token] && cBase[token].toLowerCase() !== hex.toLowerCase())
    .map(([, token, hex]) => `${token}: README diz ${hex}, palette diz ${cBase[token]}`);
  const inexistentes = linhasReadme
    .filter(([, token]) => !cBase[token])
    .map(([, token]) => `${token}: está no README mas não existe na palette`);
  for (const msg of [...divergentes, ...inexistentes]) {
    console.error(`✘ README.md — ${msg}`);
    falhas++;
  }
}

const pkg = JSON.parse(readFileSync(join(raiz, "package.json"), "utf8"));
const banner = pkg.galleryBanner?.color?.toLowerCase();
if (banner && banner !== cBase.bg0.toLowerCase()) {
  console.error(`✘ package.json — galleryBanner.color ${banner} ≠ bg0 ${cBase.bg0}`);
  falhas++;
}

// Cada paleta precisa estar registrada como tema no package.json — uma
// variante nova sem entrada em contributes.themes simplesmente não aparece
// no seletor do VSCode.
const caminhosTemas = new Set(
  (pkg.contributes?.themes ?? []).map((t: { path: string }) => t.path)
);
for (const { p } of paletas) {
  const esperado = `./themes/${p.meta.slug}-color-theme.json`;
  if (!caminhosTemas.has(esperado)) {
    console.error(`✘ package.json — contributes.themes não lista ${esperado} (${p.meta.name})`);
    falhas++;
  }
}

if (falhas > 0) {
  console.error(`\n✘ ${falhas} problema(s). Ajuste palette/*.yaml.`);
  process.exit(1);
}
console.log(`\n✔ Contraste e unicidade ANSI dentro dos alvos (${paletas.length} paleta(s)).`);
