import json
import os
from pathlib import Path

import fitz


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = Path(os.environ.get("PDF_PATH", ROOT / "TFG 3º Entrega.pdf"))
OUT_JSON = ROOT / "_tfg_pdf_extracted.json"
ASSET_DIR = ROOT / "_tfg_pdf_assets"


def clean_text(text):
    return "\n".join(line.rstrip() for line in text.splitlines()).strip()


def main():
    ASSET_DIR.mkdir(exist_ok=True)
    pdf = fitz.open(PDF_PATH)
    extracted = {
        "source": str(PDF_PATH),
        "page_count": pdf.page_count,
        "pages": [],
    }

    seen_images = {}

    for page_index, page in enumerate(pdf, start=1):
        page_data = {
            "number": page_index,
            "text": clean_text(page.get_text("text")),
            "images": [],
        }

        for image_index, image in enumerate(page.get_images(full=True), start=1):
            xref = image[0]
            base = pdf.extract_image(xref)
            ext = base.get("ext", "png")
            key = f"xref-{xref}"

            if key not in seen_images:
                image_path = ASSET_DIR / f"page-{page_index:02d}-image-{image_index}.{ext}"
                image_path.write_bytes(base["image"])
                seen_images[key] = str(image_path)

            page_data["images"].append(seen_images[key])

        extracted["pages"].append(page_data)

    OUT_JSON.write_text(json.dumps(extracted, ensure_ascii=False, indent=2), encoding="utf-8")
    print(OUT_JSON)


if __name__ == "__main__":
    main()
