import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadPalette } from "./lib/palette";
import { generateVscodeTheme } from "./generators/vscode";

const ROOT = join(import.meta.dirname, "..");
const PALETTE = join(ROOT, "palette", "papilio.yaml");
const OUT_DIR = join(ROOT, "themes");

const palette = loadPalette(PALETTE);

mkdirSync(OUT_DIR, { recursive: true });

// --- VSCode ---
const vscodeTheme = generateVscodeTheme(palette);
const vscodeOut = join(OUT_DIR, `${palette.meta.slug}-color-theme.json`);
writeFileSync(vscodeOut, JSON.stringify(vscodeTheme, null, 2) + "\n");
console.log(`✔ VSCode: ${vscodeOut}`);

// --- Futuro: outros alvos entram aqui ---
// import { generateBase24Scheme } from "./generators/base24";
// import { generateWindowsTerminal } from "./generators/windows-terminal";
