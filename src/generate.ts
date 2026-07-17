import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { loadPalette } from "./lib/palette";
import { generateVscodeTheme } from "./generators/vscode";
import { generateLogoSvg } from "./generators/logo";

const ROOT = join(import.meta.dirname, "..");
const PALETTE = join(ROOT, "palette", "papilio.yaml");
const OUT_DIR = join(ROOT, "themes");
const ASSETS_DIR = join(ROOT, "assets");

const palette = loadPalette(PALETTE);

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(ASSETS_DIR, { recursive: true });

// --- VSCode ---
const vscodeTheme = generateVscodeTheme(palette);
const vscodeOut = join(OUT_DIR, `${palette.meta.slug}-color-theme.json`);
writeFileSync(vscodeOut, JSON.stringify(vscodeTheme, null, 2) + "\n");
console.log(`✔ VSCode: ${vscodeOut}`);

// --- Logo (ícone da extensão) ---
const logoSvg = generateLogoSvg(palette);
writeFileSync(join(ASSETS_DIR, "logo.svg"), logoSvg);
const logoPng = new Resvg(logoSvg, { fitTo: { mode: "width", value: 512 } })
  .render()
  .asPng();
writeFileSync(join(ASSETS_DIR, "logo.png"), logoPng);
console.log(`✔ Logo: ${join(ASSETS_DIR, "logo.png")}`);

// --- Futuro: outros alvos entram aqui ---
// import { generateBase24Scheme } from "./generators/base24";
// import { generateWindowsTerminal } from "./generators/windows-terminal";
