import type { PaletteFile } from "../lib/palette";

/**
 * Logo do tema: o fantasminha Papilio (desenho original, flat).
 * Corpo em fg0 sobre bg0, olhos fechados em bg0 — nada além da palette.
 * O grupo é ampliado ao redor do centro para preencher bem o ícone.
 */
export function generateLogoSvg(p: PaletteFile): string {
  const bg = p.palette.bg0;
  const body = p.palette.fg0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="${bg}"/>
  <g transform="translate(256 260) scale(1.26) translate(-256 -260)">
    <ellipse cx="146" cy="286" rx="22" ry="32" transform="rotate(20 146 286)" fill="${body}"/>
    <ellipse cx="366" cy="286" rx="22" ry="32" transform="rotate(-20 366 286)" fill="${body}"/>
    <path d="M 160 366 L 160 258 C 160 172 202 126 256 126 C 310 126 352 172 352 258 L 352 366
             Q 328 336 304 366 Q 280 396 256 366 Q 232 336 208 366 Q 184 396 160 366 Z"
          fill="${body}"/>
    <path d="M 206 252 Q 220 266 234 252" stroke="${bg}" stroke-width="9" stroke-linecap="round" fill="none"/>
    <path d="M 278 252 Q 292 266 306 252" stroke="${bg}" stroke-width="9" stroke-linecap="round" fill="none"/>
  </g>
</svg>
`;
}
