import { readFileSync } from "node:fs";
import { load } from "js-yaml";

export interface PaletteFile {
  meta: {
    name: string;
    slug: string;
    variant: "dark" | "light";
    author: string;
    description: string;
  };
  anchors: Record<string, string>;
  palette: Record<string, string>;
  roles: {
    syntax: Record<string, string>;
    ui: Record<string, string>;
    terminal: Record<string, string>;
    /**
     * Exceções à regra "bright = base clareada". Só existe porque um slot
     * precisou fugir dela; ver o comentário no YAML.
     */
    "terminal-bright"?: Record<string, string>;
  };
}

export type RoleGroup = "syntax" | "ui" | "terminal";

const GRUPOS: readonly RoleGroup[] = ["syntax", "ui", "terminal"];

/**
 * O quanto um slot ANSI "bright" clareia em relação à sua base.
 * Vive aqui para que gerador e validador de contraste nunca divirjam.
 */
export const ANSI_BRIGHT = 0.22;

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * Chapas semitransparentes que o VSCode desenha ATRÁS do texto: realce de
 * busca, blocos de merge, linha do stack frame, match do peek view.
 *
 * O olho lê a cor COMPOSTA, não o token — medir contraste contra `bg0` nesses
 * casos produz um número que ninguém enxerga. O find match estava em alpha
 * 0.35, o que derrubava comentário para 2.34:1 sobre a chapa enquanto o gate
 * reportava ✔, porque o gate só olhava para cores opacas.
 *
 * Mora aqui, e não no gerador, porque o validador precisa exatamente dos
 * mesmos alphas (regra 4: constante compartilhada não se duplica).
 */
export interface Chapa {
  /** Token da palette que tinge a chapa. */
  token: string;
  /** Opacidade da chapa sobre o fundo. */
  alpha: number;
  /** Token de fundo sobre o qual ela é composta. */
  fundo: string;
}

// Os alphas param um degrau ABAIXO do teto que ainda daria 3:1. Encostar no
// piso é o que deixou o crimson sem margem por uma versão inteira: qualquer
// ajuste futuro na palette quebrava o gate.
export const CHAPAS: Record<string, Chapa> = {
  "find match": { token: "gold", alpha: 0.21, fundo: "bg0" },
  "find match (outros)": { token: "gold", alpha: 0.16, fundo: "bg0" },
  "stack frame": { token: "gold", alpha: 0.18, fundo: "bg0" },
  "stack frame focado": { token: "success", alpha: 0.2, fundo: "bg0" },
  "merge: current header": { token: "crimson", alpha: 0.26, fundo: "bg0" },
  "merge: current content": { token: "crimson", alpha: 0.14, fundo: "bg0" },
  "merge: incoming header": { token: "dusk", alpha: 0.26, fundo: "bg0" },
  "merge: incoming content": { token: "dusk", alpha: 0.14, fundo: "bg0" },
  "mergeEditor: palavra": { token: "gold", alpha: 0.21, fundo: "bg0" },
  "peek: match": { token: "gold", alpha: 0.17, fundo: "bg1" },
  "diff: linha inserida": { token: "success", alpha: 0.08, fundo: "bg0" },
  "diff: linha removida": { token: "error", alpha: 0.08, fundo: "bg0" },
};

/** Separa um #rrggbb em canais 0-255. */
function canais(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/** A chapa como o VSCode a consome: #rrggbbaa. */
export function chapa(p: PaletteFile, nome: string): string {
  const ch = CHAPAS[nome];
  if (!ch) throw new Error(`chapa desconhecida: ${nome}`);
  return alpha(p.palette[ch.token], ch.alpha);
}

/**
 * A cor OPACA que a chapa produz sobre seu fundo — o que o olho vê e o que
 * o contraste do texto por cima precisa ser medido contra.
 */
export function chapaComposta(p: PaletteFile, nome: string): string {
  const ch = CHAPAS[nome];
  if (!ch) throw new Error(`chapa desconhecida: ${nome}`);
  const frente = canais(p.palette[ch.token]);
  const fundo = canais(p.palette[ch.fundo]);
  const mix = frente.map((f, i) => Math.round(f * ch.alpha + fundo[i] * (1 - ch.alpha)));
  return "#" + mix.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Carrega e valida a fonte da verdade. */
export function loadPalette(path: string): PaletteFile {
  const data = load(readFileSync(path, "utf8")) as PaletteFile;

  for (const [name, hex] of Object.entries(data.palette)) {
    if (!HEX_RE.test(hex)) {
      throw new Error(`palette.${name}: "${hex}" não é hex válido (#rrggbb)`);
    }
  }

  for (const group of GRUPOS) {
    if (!data.roles[group]) {
      throw new Error(`roles.${group} está ausente na palette`);
    }
    for (const [role, token] of Object.entries(data.roles[group])) {
      if (!(token in data.palette)) {
        throw new Error(
          `roles.${group}.${role} referencia "${token}", que não existe na palette`
        );
      }
    }
  }

  for (const [slot, token] of Object.entries(data.roles["terminal-bright"] ?? {})) {
    if (!(slot in data.roles.terminal)) {
      throw new Error(`roles.terminal-bright.${slot} não é um slot ANSI`);
    }
    if (!(token in data.palette)) {
      throw new Error(
        `roles.terminal-bright.${slot} referencia "${token}", que não existe na palette`
      );
    }
  }

  return data;
}

/**
 * A cor final de um slot ANSI "bright": normalmente a base clareada, mas o
 * YAML pode apontar um token direto para os casos em que a regra não serve.
 * Gerador e validador chamam esta função — é o que impede os dois de divergirem.
 */
export function ansiBright(p: PaletteFile, slot: string): string {
  const override = p.roles["terminal-bright"]?.[slot];
  if (override) return p.palette[override];
  return lighten(resolve(p, "terminal", slot), ANSI_BRIGHT);
}

/** Resolve um role (ex: "syntax.keyword") para o hex final. */
export function resolve(p: PaletteFile, group: RoleGroup, role: string): string {
  const token = p.roles[group][role];
  if (!token) throw new Error(`role desconhecido: ${group}.${role}`);
  return p.palette[token];
}

/** Hex + alpha (0-1) -> #rrggbbaa. Útil para overlays do workbench. */
export function alpha(hex: string, a: number): string {
  if (!HEX_RE.test(hex)) throw new Error(`alpha(): "${hex}" não é #rrggbb`);
  const byte = Math.round(clamp01(a) * 255).toString(16).padStart(2, "0");
  return hex + byte;
}

/** Prende um número em [0,1]. Sem isto, alpha e lighten emitem hex inválido. */
function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Clareia um hex puxando cada canal em direção ao branco.
 * Derivar assim NÃO fura a regra do hex hardcoded: a cor de origem
 * continua vindo da palette — isto é só uma transformação dela.
 * Usado para os "bright" do terminal e para microajustes de UI.
 */
export function lighten(hex: string, amount: number): string {
  if (!HEX_RE.test(hex)) throw new Error(`lighten(): "${hex}" não é #rrggbb`);
  const a = clamp01(amount);
  const canais = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(c + (255 - c) * a);
  });
  return "#" + canais.map((c) => c.toString(16).padStart(2, "0")).join("");
}
