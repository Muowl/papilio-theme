#!/usr/bin/env python3
"""
Extrai as cores dominantes de imagens de referência (references/).

Uso:
  python scripts/extract_colors.py references/hutao-art.jpg
  python scripts/extract_colors.py references/*.png --colors 12 --json

Requer: pip install Pillow
"""
import argparse
import json
import sys
from collections import Counter
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow não instalado. Rode: pip install Pillow")


def luminance(r: int, g: int, b: int) -> float:
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def extract(path: Path, n_colors: int, skip_extremes: bool) -> list[dict]:
    img = Image.open(path).convert("RGB")
    img.thumbnail((300, 300))  # acelera sem distorcer a distribuição

    quantized = img.quantize(colors=n_colors * 2, method=Image.Quantize.MEDIANCUT)
    palette = quantized.getpalette()
    # get_flattened_data substitui getdata em versões novas do Pillow
    get_pixels = getattr(quantized, "get_flattened_data", quantized.getdata)
    counts = Counter(get_pixels())
    total = sum(counts.values())

    results = []
    for idx, count in counts.most_common():
        r, g, b = palette[idx * 3 : idx * 3 + 3]
        lum = luminance(r, g, b)
        # Pula quase-preto e quase-branco: raramente viram token útil
        if skip_extremes and (lum < 18 or lum > 240):
            continue
        results.append({
            "hex": f"#{r:02x}{g:02x}{b:02x}",
            "pct": round(count / total * 100, 1),
        })
        if len(results) >= n_colors:
            break
    return results


def main() -> None:
    ap = argparse.ArgumentParser(description="Extrai cores dominantes de imagens")
    ap.add_argument("images", nargs="+", type=Path)
    ap.add_argument("--colors", type=int, default=8, help="cores por imagem (padrão: 8)")
    ap.add_argument("--json", action="store_true", help="saída em JSON")
    ap.add_argument("--keep-extremes", action="store_true",
                    help="não filtrar quase-preto/quase-branco")
    args = ap.parse_args()

    output = {}
    for img_path in args.images:
        if not img_path.exists():
            print(f"⚠ não encontrado: {img_path}", file=sys.stderr)
            continue
        output[str(img_path)] = extract(img_path, args.colors, not args.keep_extremes)

    if args.json:
        print(json.dumps(output, indent=2))
    else:
        for name, colors in output.items():
            print(f"\n{name}")
            for c in colors:
                print(f"  {c['hex']}  {c['pct']:>5}%")


if __name__ == "__main__":
    main()
