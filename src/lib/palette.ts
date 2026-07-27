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
  };
}

export type RoleGroup = keyof PaletteFile["roles"];

const GRUPOS: readonly RoleGroup[] = ["syntax", "ui", "terminal"];

/**
 * O quanto um slot ANSI "bright" clareia em relação à sua base.
 * Vive aqui para que gerador e validador de contraste nunca divirjam.
 */
export const ANSI_BRIGHT = 0.22;

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

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

  return data;
}

/** Resolve um role (ex: "syntax.keyword") para o hex final. */
export function resolve(p: PaletteFile, group: RoleGroup, role: string): string {
  const token = p.roles[group][role];
  if (!token) throw new Error(`role desconhecido: ${group}.${role}`);
  return p.palette[token];
}

/** Hex + alpha (0-1) -> #rrggbbaa. Útil para overlays do workbench. */
export function alpha(hex: string, a: number): string {
  const byte = Math.round(a * 255).toString(16).padStart(2, "0");
  return hex + byte;
}

/**
 * Clareia um hex puxando cada canal em direção ao branco.
 * Derivar assim NÃO fura a regra do hex hardcoded: a cor de origem
 * continua vindo da palette — isto é só uma transformação dela.
 * Usado para os "bright" do terminal e para microajustes de UI.
 */
export function lighten(hex: string, amount: number): string {
  const canais = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(c + (255 - c) * amount);
  });
  return "#" + canais.map((c) => c.toString(16).padStart(2, "0")).join("");
}
