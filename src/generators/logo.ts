import type { PaletteFile } from "../lib/palette";

/**
 * Logo do tema: o fantasminha Papilio (desenho original, flat).
 * Silhueta contínua com braços integrados e cauda levemente assimétrica.
 * Olhos grossos e boca espaçada preservam a expressão em miniaturas.
 * Corpo em fg0 sobre bg0, língua em crimson — só cores da palette.
 */
export function generateLogoSvg(p: PaletteFile): string {
  const bg = p.palette.bg0;
  const body = p.palette.fg0;
  const accent = p.palette.crimson;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <title>Papilio — fantasminha</title>
  <rect width="512" height="512" rx="96" fill="${bg}"/>
  <path d="M 104 244
           C 104 130 167 64 250 64 C 343 64 401 130 401 242
           C 424 216 463 237 463 270 C 463 302 438 322 406 309
           C 413 354 428 383 447 397 C 464 414 452 438 432 436
           C 407 434 395 413 370 413 C 345 413 329 456 299 454
           C 269 452 252 413 229 413 C 203 413 189 455 159 448
           C 121 439 108 393 104 309
           C 76 322 49 304 49 275 C 49 244 79 226 104 244 Z"
        fill="${body}"/>
  <g stroke="${bg}" stroke-width="20" stroke-linecap="round" fill="none">
    <path d="M 156 221 Q 179 190 202 221"/>
    <path d="M 296 221 Q 319 190 342 221"/>
  </g>
  <path d="M 221 251 Q 251 261 281 251 Q 288 249 287 258
           C 284 295 270 313 253 313 C 235 313 220 297 216 262
           Q 214 250 221 251 Z" fill="${bg}"/>
  <ellipse cx="252" cy="292" rx="19" ry="12" fill="${accent}"/>
</svg>
`;
}
