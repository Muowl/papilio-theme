// ============================================================
// Valida a TOKENIZAÇÃO real do tema. Falha (exit 1) se um token
// de um fixture resolver para cor ou fontStyle errados.
//
// É o "Developer: Inspect Editor Tokens and Scopes" automatizado:
// usa o MESMO motor do VS Code (vscode-textmate + vscode-oniguruma)
// e as gramáticas publicadas (tests/grammars/, vendidas do repositório
// microsoft/vscode), então o que passa aqui é o que o editor pinta.
//
// O que este check protege:
//   - o itálico restrito a comentário / parâmetro / atributo HTML —
//     inclusive a regra de exceção para seletores CSS/LESS/SCSS, cujo
//     vazamento (todo seletor .less em itálico) já aconteceu uma vez;
//   - o trio tag / attribute / componente em HTML e JSX, que é onde
//     as decisões de cor mais disputadas do tema se encontram.
//
// O tema é gerado EM MEMÓRIA a partir do YAML (não lê themes/*.json),
// então o check não depende da ordem build/check.
// ============================================================

import { join } from "node:path";
import { readFileSync } from "node:fs";
import * as vsctm from "vscode-textmate";
import * as oniguruma from "vscode-oniguruma";
import { loadPalette } from "../src/lib/palette";
import { generateVscodeTheme } from "../src/generators/vscode";

const raiz = join(import.meta.dirname, "..");
const p = loadPalette(join(raiz, "palette", "papilio.yaml"));
const c = p.palette;

// ------------------------------------------------------------
// Casos: cada linha diz "este trecho deste fixture sai nesta cor,
// com ou sem itálico". A cor é um role de roles.syntax (ou um token
// da palette, para punctuation de tag etc.) — nunca hex solto.
// A âncora é o PRIMEIRO caractere da primeira ocorrência do trecho
// na linha indicada.
// ------------------------------------------------------------
interface Caso {
  arquivo: string;
  linha: number;      // 1-based
  trecho: string;
  role: string;       // chave de roles.syntax
  italico: boolean;
}

const casos: Caso[] = [
  // CSS — seletores NÃO herdam o itálico de atributo HTML
  { arquivo: "sample.css", linha: 1, trecho: "comentário", role: "comment", italico: true },
  { arquivo: "sample.css", linha: 2, trecho: "cartao", role: "type", italico: false },
  { arquivo: "sample.css", linha: 2, trecho: "hover", role: "type", italico: false },
  { arquivo: "sample.css", linha: 2, trecho: "after", role: "type", italico: false },
  { arquivo: "sample.css", linha: 2, trecho: "color", role: "variable", italico: false },
  { arquivo: "sample.css", linha: 3, trecho: "principal", role: "type", italico: false },

  // LESS — o vazamento corrigido: escopos .less não eram cobertos
  { arquivo: "sample.less", linha: 1, trecho: "comentário", role: "comment", italico: true },
  { arquivo: "sample.less", linha: 2, trecho: "botao", role: "type", italico: false },
  { arquivo: "sample.less", linha: 3, trecho: "topo", role: "type", italico: false },
  { arquivo: "sample.less", linha: 3, trecho: "hover", role: "type", italico: false },
  { arquivo: "sample.less", linha: 5, trecho: "__titulo", role: "type", italico: false },
  { arquivo: "sample.less", linha: 6, trecho: "extend", role: "type", italico: false },

  // SCSS — %placeholder e o sufixo &__elem do BEM
  { arquivo: "sample.scss", linha: 1, trecho: "comentário", role: "comment", italico: true },
  { arquivo: "sample.scss", linha: 2, trecho: "base", role: "type", italico: false },
  { arquivo: "sample.scss", linha: 3, trecho: "cartao", role: "type", italico: false },
  // A gramática SCSS marca o identificador do sufixo `&__elem` inteiro como
  // punctuation.definition.entity.css (dentro do escopo de parent-selector-
  // suffix), então a cor final é a de pontuação — diferente do LESS, que dá
  // ember. O que este caso trava é o ITÁLICO: antes do fix o sufixo herdava
  // o itálico de atributo HTML mesmo saindo em fg1.
  { arquivo: "sample.scss", linha: 4, trecho: "__titulo", role: "punctuation", italico: false },
  { arquivo: "sample.scss", linha: 5, trecho: "hover", role: "type", italico: false },

  // HTML — aqui o itálico de atributo É desejado
  { arquivo: "sample.html", linha: 1, trecho: "comentário", role: "comment", italico: true },
  { arquivo: "sample.html", linha: 2, trecho: "div", role: "tag", italico: false },
  { arquivo: "sample.html", linha: 2, trecho: "<", role: "punctuation", italico: false },
  { arquivo: "sample.html", linha: 2, trecho: "class", role: "attribute", italico: true },
  { arquivo: "sample.html", linha: 2, trecho: "cartao", role: "string", italico: false },
  { arquivo: "sample.html", linha: 3, trecho: "a href", role: "tag", italico: false },
  { arquivo: "sample.html", linha: 3, trecho: "href", role: "attribute", italico: true },

  // TSX — o trio tag × atributo × componente do JSX
  { arquivo: "sample.tsx", linha: 1, trecho: "comentário", role: "comment", italico: true },
  { arquivo: "sample.tsx", linha: 2, trecho: "import", role: "keyword", italico: false },
  { arquivo: "sample.tsx", linha: 4, trecho: "Cartao", role: "function", italico: false },
  { arquivo: "sample.tsx", linha: 4, trecho: "props", role: "parameter", italico: true },
  { arquivo: "sample.tsx", linha: 4, trecho: "CartaoProps", role: "type", italico: false },
  { arquivo: "sample.tsx", linha: 5, trecho: "Item:", role: "string", italico: false },
  { arquivo: "sample.tsx", linha: 5, trecho: "${", role: "interpolation", italico: false },
  { arquivo: "sample.tsx", linha: 6, trecho: "return", role: "keyword", italico: false },
  { arquivo: "sample.tsx", linha: 7, trecho: "<", role: "punctuation", italico: false },
  { arquivo: "sample.tsx", linha: 7, trecho: "section", role: "tag", italico: false },
  { arquivo: "sample.tsx", linha: 7, trecho: "className", role: "attribute", italico: true },
  { arquivo: "sample.tsx", linha: 8, trecho: "Botao", role: "type", italico: false },
  { arquivo: "sample.tsx", linha: 8, trecho: "onClick", role: "attribute", italico: true },
];

// ------------------------------------------------------------
// Infra de tokenização
// ------------------------------------------------------------
const GRAMATICAS: Record<string, string> = {
  "source.css": "css.tmLanguage.json",
  "source.css.less": "less.tmLanguage.json",
  "source.css.scss": "scss.tmLanguage.json",
  "text.html.basic": "html.tmLanguage.json",
  "text.html.derivative": "html-derivative.tmLanguage.json",
  "source.tsx": "TypeScriptReact.tmLanguage.json",
};

const ESCOPO_POR_EXTENSAO: Record<string, string> = {
  css: "source.css",
  less: "source.css.less",
  scss: "source.css.scss",
  html: "text.html.derivative",
  tsx: "source.tsx",
};

// Máscaras de metadata do vscode-textmate (MetadataConsts). O itálico é o
// bit 1 do fontStyle.
const FONT_STYLE_MASK = 0b00000000_00000000_01111000_00000000;
const FONT_STYLE_OFFSET = 11;
const FOREGROUND_MASK = 0b00000000_11111111_10000000_00000000;
const FOREGROUND_OFFSET = 15;
const ITALICO = 1;

async function criaRegistry(): Promise<vsctm.Registry> {
  const wasm = readFileSync(join(raiz, "node_modules", "vscode-oniguruma", "release", "onig.wasm"));
  await oniguruma.loadWASM(wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength));
  return new vsctm.Registry({
    onigLib: Promise.resolve({
      createOnigScanner: (padroes) => new oniguruma.OnigScanner(padroes),
      createOnigString: (s) => new oniguruma.OnigString(s),
    }),
    loadGrammar: async (scopeName) => {
      const arquivo = GRAMATICAS[scopeName];
      if (!arquivo) return null; // linguagens embutidas que não testamos (js em <script> etc.)
      const caminho = join(raiz, "tests", "grammars", arquivo);
      return vsctm.parseRawGrammar(readFileSync(caminho, "utf8"), caminho);
    },
  });
}

interface TokenPintado {
  inicio: number;
  fim: number;
  cor: string;      // hex minúsculo resolvido pelo tema
  italico: boolean;
  escopos: string[]; // para diagnóstico quando o caso falha
}

/** Tokeniza um fixture inteiro e devolve, por linha, os tokens já pintados. */
function tokenizaArquivo(
  registry: vsctm.Registry,
  grammar: vsctm.IGrammar,
  linhas: string[]
): TokenPintado[][] {
  const mapaCores = registry.getColorMap();
  const resultado: TokenPintado[][] = [];
  let pilha = vsctm.INITIAL;      // para tokenizeLine2 (metadata: cor/estilo)
  let pilhaEscopos = vsctm.INITIAL; // para tokenizeLine (escopos legíveis)
  for (const linha of linhas) {
    const bin = grammar.tokenizeLine2(linha, pilha);
    const leg = grammar.tokenizeLine(linha, pilhaEscopos);
    pilha = bin.ruleStack;
    pilhaEscopos = leg.ruleStack;

    const tokens: TokenPintado[] = [];
    // tokens binários vêm em pares (startIndex, metadata)
    for (let i = 0; i < bin.tokens.length; i += 2) {
      const inicio = bin.tokens[i];
      const metadata = bin.tokens[i + 1];
      const fim = i + 2 < bin.tokens.length ? bin.tokens[i + 2] : linha.length;
      const idCor = (metadata & FOREGROUND_MASK) >>> FOREGROUND_OFFSET;
      const fontStyle = (metadata & FONT_STYLE_MASK) >>> FONT_STYLE_OFFSET;
      const legivel = leg.tokens.find((t) => t.startIndex <= inicio && inicio < t.endIndex);
      tokens.push({
        inicio,
        fim,
        cor: (mapaCores[idCor] ?? "").toLowerCase(),
        italico: (fontStyle & ITALICO) !== 0,
        escopos: legivel?.scopes ?? [],
      });
    }
    resultado.push(tokens);
  }
  return resultado;
}

// ------------------------------------------------------------
// Execução
// ------------------------------------------------------------
async function main(): Promise<void> {
  const registry = await criaRegistry();

  // O tema entra no registry como o VS Code o entrega: tokenColors precedidos
  // do default (editor.foreground/background).
  const tema = generateVscodeTheme(p) as {
    colors: Record<string, string>;
    tokenColors: vsctm.IRawThemeSetting[];
  };
  registry.setTheme({
    name: "papilio",
    settings: [
      {
        settings: {
          foreground: tema.colors["editor.foreground"],
          background: tema.colors["editor.background"],
        },
      },
      ...tema.tokenColors,
    ],
  });

  // Tokeniza cada fixture uma vez
  const porArquivo = new Map<string, TokenPintado[][]>();
  for (const arquivo of new Set(casos.map((k) => k.arquivo))) {
    const extensao = arquivo.split(".").pop()!;
    const grammar = await registry.loadGrammar(ESCOPO_POR_EXTENSAO[extensao]);
    if (!grammar) throw new Error(`gramática não carregou para ${arquivo}`);
    const linhas = readFileSync(join(raiz, "tests", "fixtures", arquivo), "utf8").split(/\r?\n/);
    porArquivo.set(arquivo, tokenizaArquivo(registry, grammar, linhas));
  }

  let falhas = 0;
  const diagnosticos: string[] = [];
  const linhasTabela: string[][] = [];

  for (const caso of casos) {
    const token = c[p.roles.syntax[caso.role]];
    const esperadoCor = token.toLowerCase();
    const rotulo = `${p.roles.syntax[caso.role]}/${caso.role}`;

    const linhas = readFileSync(join(raiz, "tests", "fixtures", caso.arquivo), "utf8").split(/\r?\n/);
    const idx = linhas[caso.linha - 1]?.indexOf(caso.trecho) ?? -1;
    let obtido = "— trecho não encontrado —";
    let ok = false;
    let escopos: string[] = [];

    if (idx >= 0) {
      const pintado = porArquivo
        .get(caso.arquivo)!
        [caso.linha - 1].find((t) => t.inicio <= idx && idx < t.fim);
      if (pintado) {
        obtido = `${pintado.cor}${pintado.italico ? " itálico" : ""}`;
        ok = pintado.cor === esperadoCor && pintado.italico === caso.italico;
        escopos = pintado.escopos;
      }
    }
    if (!ok) {
      falhas++;
      diagnosticos.push(
        `✘ ${caso.arquivo}:${caso.linha} "${caso.trecho}" — escopos: ${escopos.join(", ") || "?"}`
      );
    }
    linhasTabela.push([
      `${caso.arquivo}:${caso.linha}`,
      caso.trecho,
      `${esperadoCor}${caso.italico ? " itálico" : ""} (${rotulo})`,
      obtido,
      ok ? "✔" : "✘ DIVERGE",
    ]);
  }

  // Tabela alinhada, no formato do check_contrast
  const cab = ["onde", "trecho", "esperado", "obtido", "status"];
  const larguras = cab.map((h, i) => Math.max(h.length, ...linhasTabela.map((l) => l[i].length)));
  const fmt = (l: string[]) => l.map((cel, i) => cel.padEnd(larguras[i])).join("  ");
  console.log(`\ntokenização real contra as gramáticas do VS Code:\n`);
  console.log(fmt(cab));
  console.log(larguras.map((w) => "-".repeat(w)).join("  "));
  for (const l of linhasTabela) console.log(fmt(l));

  if (falhas > 0) {
    console.error(`\nescopos dos casos que falharam:`);
    for (const d of diagnosticos) console.error(d);
    console.error(`\n✘ ${falhas} caso(s) de tokenização divergem do esperado.`);
    process.exit(1);
  }
  console.log(`\n✔ ${casos.length} casos de tokenização conferem com o tema.`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
