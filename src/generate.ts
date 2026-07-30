import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { loadAllPalettes } from "./lib/palette";
import { generateVscodeTheme } from "./generators/vscode";
import { generateLogoSvg } from "./generators/logo";
import { generateBase24Scheme } from "./generators/base24";

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "themes");
const ASSETS_DIR = join(ROOT, "assets");

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(ASSETS_DIR, { recursive: true });

// Base + variantes: cada paleta gera o próprio tema VSCode e o próprio
// esquema Base24. Uma variante nova é um overlay em palette/ e nada mais.
for (const { p, ehBase } of loadAllPalettes(join(ROOT, "palette"))) {
  const vscodeOut = join(OUT_DIR, `${p.meta.slug}-color-theme.json`);
  writeFileSync(vscodeOut, JSON.stringify(generateVscodeTheme(p), null, 2) + "\n");
  console.log(`✔ VSCode: ${vscodeOut}`);

  const base24Out = join(OUT_DIR, `${p.meta.slug}-base24.yaml`);
  writeFileSync(base24Out, generateBase24Scheme(p));
  console.log(`✔ Base24: ${base24Out}`);

  // --- Logo (ícone da extensão) — só a base define a identidade visual ---
  if (ehBase) {
    const logoSvg = generateLogoSvg(p);
    writeFileSync(join(ASSETS_DIR, "logo.svg"), logoSvg);
    const logoPng = new Resvg(logoSvg, { fitTo: { mode: "width", value: 512 } })
      .render()
      .asPng();
    writeFileSync(join(ASSETS_DIR, "logo.png"), logoPng);
    console.log(`✔ Logo: ${join(ASSETS_DIR, "logo.png")}`);
  }
}

// --- Futuro: outros alvos entram aqui ---
// import { generateWindowsTerminal } from "./generators/windows-terminal";
