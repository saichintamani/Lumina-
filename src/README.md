# BAH 2026 — Multi-Modal Image Correspondence Pipeline

Project code for the Bharatiya Antariksh Hackathon 2026 problem statement:
"Multi-modal, Sun angle and scale invariant image correspondence using Chandrayaan-2 optical images (OHRC, TMC and IIRS)."
PS Number: SIH26166

## Quick start

```bash
pip install numpy scipy matplotlib rasterio --break-system-packages
cd src/
python3 make_figures.py          # runs the full pipeline, writes 2 figures to ../figures/
python3 make_architecture_diagram.py  # writes the architecture diagram
```

## Module overview

| File | Purpose |
|---|---|
| `image_registration.py` | Feature extraction (SIFT/LoFTR), DEM sun-angle normalization |
| `make_figures.py` | Generates analysis figures showcasing match quality |
| `make_architecture_diagram.py` | Generates the architecture diagram figure |

## Swapping in real data on hackathon day

1. Open `image_registration.py`, find `load_optical_product()` — it's a documented stub.
2. Implement it for whatever format ISRO/Hack2skill issues (likely GeoTIFF or PDS .img+.lbl).
3. Ensure the function returns the images scaled and formatted as expected by the pipeline.
4. Re-run `make_figures.py`.

See the accompanying presentation decks in the root for full methodology.
