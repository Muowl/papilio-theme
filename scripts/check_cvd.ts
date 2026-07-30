// ============================================================
// Valida a SEPARAÇÃO PERCEPTUAL das cores sob daltonismo. Falha
// (exit 1) se um par cair abaixo do piso — integrado ao `npm run check`.
//
// Roda para a BASE e para cada variante (overlays em palette/).
//
// A escada de luminosidade da palette foi projetada para visão
// vermelho-verde deficiente, mas nada a vigiava: o check de contraste
// mede razões WCAG (legibilidade contra o fundo), não a distância
// ENTRE cores de sintaxe — que é o que separa keyword de tipo para
// quem tem protanopia. Este check fecha esse buraco.
//
// Método (o mesmo dos estudos que calibraram a palette — os ΔE citados
// em CHANGELOG e nos comentários do YAML reproduzem-se aqui):
//   1. simula protanopia e deuteranopia com as matrizes de
//      Machado et al. 2009, severidade 1.0, em RGB linear;
//   2. mede ΔE como distância euclidiana em OKLAB × 100.
// Referência de escala: ΔE 2 é quase indistinguível; 6 é o mínimo que
// a palette aceita (gold × ember, com ressalva); 10+ é confortável.
//
// `npx tsx scripts/check_cvd.ts --matriz` imprime todos os pares de
// sintaxe nas três visões, para inspeção ao ajustar a palette.
// ============================================================

import { join } from "node:path";
import { PaletteFile, loadAllPalettes, BRACKETS } from "../src/lib/palette";

type V3 = [number, number, number];
type Visao = "normal" | "protanopia" | "deuteranopia";

// Piso global: nenhum par de cores de sintaxe pode ficar abaixo disto em
// nenhuma visão. 6.0 é o mínimo que a palette já aceita conscientemente
// (gold × ember a 6.5 sob deuteranopia). O desastre que este piso impede
// já aconteceu: tipo × atributo chegaram a ΔE 0.6 sob protanopia.
const PISO_SINTAXE = 6.0;

// Roles de estado/markup de diff. O YAML já declara a exceção: "Colidem com
// alguns tokens de sintaxe sob daltonismo, e isso é aceito de propósito:
// sempre aparecem com fundo tingido, sublinhado ou marcador de gutter
// reforçando". Um par cai neste piso rebaixado quando um dos lados só é
// usado por estes roles — o piso residual existe para impedir cores
// IDÊNTICAS, que nenhum segundo canal salva.
const ROLES_DE_ESTADO = new Set(["inserted", "deleted", "changed"]);
const PISO_ESTADOS = 2.5;

// Pares que o design cita nominalmente, com o piso da decisão documentada.
// Se um ajuste futuro da palette derrubar um destes, o build para.
// Valem para a base E para as variantes: variante que fura um destes pisos
// não é "drama", é outra paleta.
const PARES_NOMEADOS: { a: string; b: string; visao: Visao; piso: number; motivo: string }[] = [
  { a: "crimson", b: "fg1", visao: "protanopia", piso: 10.0,
    motivo: "tag encosta na pontuação em todo <div>; o teto do clareamento do crimson é este joelho" },
  { a: "crimson", b: "ember", visao: "deuteranopia", piso: 10.0,
    motivo: "tag × componente JSX (<section> vs <Botao>) — o par quente mais exposto do markup" },
  { a: "crimson", b: "fg1", visao: "deuteranopia", piso: 6.0,
    motivo: "o mesmo par tag × pontuação é mais apertado sob deuteranopia: 6.7 após o clareamento do crimson (era 7.7)" },
  { a: "gold", b: "ember", visao: "deuteranopia", piso: 6.0,
    motivo: "o par proibido sem segundo canal; 6.5 é o mínimo aceito e attribute (itálico) é o canal" },
  { a: "dusk", b: "ember", visao: "protanopia", piso: 10.0,
    motivo: "atributo × tipo lado a lado em <Componente atributo=…>; foi ΔE 0.6 um dia" },
  { a: "muted", b: "crimson", visao: "protanopia", piso: 6.5,
    motivo: "comentário migrou para o mauve para sair do aglomerado do crimson; o clareamento do crimson comeu a folga (8.6 → 7.1)" },
];

// ------------------------------------------------------------
// Simulação e métrica
// ------------------------------------------------------------

// Machado, Oliveira & Fernandes 2009, severidade 1.0, aplicadas em RGB linear.
const MACHADO: Record<Exclude<Visao, "normal">, number[][]> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
};

function hexParaLinear(hex: string): V3 {
  return [1, 3, 5].map((i) => {
    const canal = parseInt(hex.slice(i, i + 2), 16) / 255;
    return canal <= 0.04045 ? canal / 12.92 : Math.pow((canal + 0.055) / 1.055, 2.4);
  }) as V3;
}

function simula(rgb: V3, visao: Visao): V3 {
  if (visao === "normal") return rgb;
  const m = MACHADO[visao];
  return m.map((l) =>
    Math.min(1, Math.max(0, l[0] * rgb[0] + l[1] * rgb[1] + l[2] * rgb[2]))
  ) as V3;
}

function oklab(rgb: V3): V3 {
  const [r, g, b] = rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** ΔE entre dois hex sob uma visão: distância OKLAB × 100. */
function deltaE(hexA: string, hexB: string, visao: Visao): number {
  const a = oklab(simula(hexParaLinear(hexA), visao));
  const b = oklab(simula(hexParaLinear(hexB), visao));
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * 100;
}

// ------------------------------------------------------------
// Execução
// ------------------------------------------------------------
const VISOES: Visao[] = ["normal", "protanopia", "deuteranopia"];
let falhas = 0;

function tabela(titulo: string, cab: string[], linhas: string[][]): void {
  const larguras = cab.map((h, i) => Math.max(h.length, ...linhas.map((l) => l[i].length)));
  const fmt = (l: string[]) => l.map((cel, i) => cel.padEnd(larguras[i])).join("  ");
  console.log(`\n${titulo}\n`);
  console.log(fmt(cab));
  console.log(larguras.map((w) => "-".repeat(w)).join("  "));
  for (const l of linhas) console.log(fmt(l));
}

function rodaPaleta(p: PaletteFile): void {
  const c = p.palette;
  const nome = p.meta.name;

  // Tokens distintos usados em roles.syntax, com os roles que os usam.
  // Dedupe por token: quote=muted e keyword=tag=crimson são compartilhamentos
  // deliberados — o que se mede é a distância entre CORES diferentes.
  const usoPorToken = new Map<string, string[]>();
  for (const [role, token] of Object.entries(p.roles.syntax)) {
    usoPorToken.set(token, [...(usoPorToken.get(token) ?? []), role]);
  }
  const tokens = [...usoPorToken.keys()].sort();
  const soEstado = (token: string) =>
    usoPorToken.get(token)!.every((role) => ROLES_DE_ESTADO.has(role));

  // 1. Piso global sobre todos os pares de sintaxe, nas três visões.
  // A tabela imprime só o que está abaixo do nível de atenção (12) — o
  // resto é folga; a matriz completa sai com --matriz.
  const ATENCAO = 12;
  const linhasSintaxe: string[][] = [];
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 1; j < tokens.length; j++) {
      const [a, b] = [tokens[i], tokens[j]];
      const estado = soEstado(a) || soEstado(b);
      const piso = estado ? PISO_ESTADOS : PISO_SINTAXE;
      for (const visao of VISOES) {
        const dE = deltaE(c[a], c[b], visao);
        const ok = dE >= piso;
        if (!ok) falhas++;
        if (dE < ATENCAO || !ok) {
          linhasSintaxe.push([
            `${a}×${b}`,
            visao,
            dE.toFixed(1),
            piso.toFixed(1) + (estado ? " (estado)" : ""),
            ok ? "✔" : "✘ ABAIXO",
          ]);
        }
      }
    }
  }
  linhasSintaxe.sort((x, y) => parseFloat(x[2]) - parseFloat(y[2]));
  tabela(
    `[${nome}] pares de sintaxe abaixo do nível de atenção (ΔE < ${ATENCAO}; piso ${PISO_SINTAXE}):`,
    ["par", "visão", "ΔE", "piso", "status"],
    linhasSintaxe
  );

  // 2. Pares nomeados: as decisões de design viram asserções.
  tabela(
    `[${nome}] pares nomeados do design:`,
    ["par", "visão", "ΔE", "piso", "status"],
    PARES_NOMEADOS.map(({ a, b, visao, piso }) => {
      const dE = deltaE(c[a], c[b], visao);
      const ok = dE >= piso;
      if (!ok) falhas++;
      return [`${a}×${b}`, visao, dE.toFixed(1), piso.toFixed(1), ok ? "✔" : "✘ ABAIXO"];
    })
  );

  // 3. Brackets: o conjunto sem segundo canal. Mede os 6 níveis entre si e
  // cada um contra o bracket-erro — foi a colisão crimson×error que motivou
  // a reorganização.
  const PISO_BRACKETS = 6.0;
  const conjuntoBrackets = [...BRACKETS, "error"];
  const linhasBrackets: string[][] = [];
  for (let i = 0; i < conjuntoBrackets.length; i++) {
    for (let j = i + 1; j < conjuntoBrackets.length; j++) {
      const [a, b] = [conjuntoBrackets[i], conjuntoBrackets[j]];
      for (const visao of VISOES) {
        const dE = deltaE(c[a], c[b], visao);
        const ok = dE >= PISO_BRACKETS;
        if (!ok) falhas++;
        if (dE < ATENCAO || !ok) {
          linhasBrackets.push([`${a}×${b}`, visao, dE.toFixed(1), PISO_BRACKETS.toFixed(1), ok ? "✔" : "✘ ABAIXO"]);
        }
      }
    }
  }
  linhasBrackets.sort((x, y) => parseFloat(x[2]) - parseFloat(y[2]));
  tabela(
    `[${nome}] brackets (níveis 1-6 + bracket não fechado) abaixo do nível de atenção:`,
    ["par", "visão", "ΔE", "piso", "status"],
    linhasBrackets
  );

  // Modo de inspeção: a matriz completa, para quando se ajusta a palette.
  if (process.argv.includes("--matriz")) {
    const linhas: string[][] = [];
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        const [a, b] = [tokens[i], tokens[j]];
        linhas.push([
          `${a}×${b}`,
          `(${usoPorToken.get(a)!.join(",")} × ${usoPorToken.get(b)!.join(",")})`,
          ...VISOES.map((v) => deltaE(c[a], c[b], v).toFixed(1)),
        ]);
      }
    }
    linhas.sort((x, y) => parseFloat(x[2]) - parseFloat(y[2]));
    tabela(`[${nome}] matriz completa (ordenada pelo ΔE normal):`, ["par", "roles", "normal", "protan", "deutan"], linhas);
  }
}

const paletas = loadAllPalettes(join(import.meta.dirname, "..", "palette"));
for (const { p } of paletas) rodaPaleta(p);

if (falhas > 0) {
  console.error(`\n✘ ${falhas} par(es) abaixo do piso de separação. Ajuste palette/*.yaml.`);
  process.exit(1);
}
console.log(`\n✔ Separação perceptual dentro dos pisos (${paletas.length} paleta(s), 3 visões).`);
