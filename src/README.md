# BAH 2026 — Subsurface Lunar Ice Detection Pipeline

Project code for the Bharatiya Antariksh Hackathon 2026 problem statement:
"Detection and Characterization of Subsurface Ice in Lunar South Polar
Regions Using Chandrayaan-2 Radar and Imagery Data for Landing Site and
Rover Traverse Planning."

## Quick start

```bash
pip install numpy scipy matplotlib rasterio --break-system-packages
cd src/
python3 make_figures.py          # runs the full pipeline, writes 8 figures to ../figures/
python3 make_architecture_diagram.py  # writes the 9th figure (architecture diagram)
```

## Module overview

| File | Purpose |
|---|---|
| `synth_dfsar.py` | Synthetic stand-in DFSAR scene (use until real data arrives) |
| `radar_processing.py` | CPR/DOP computation + terrain classification (the science core) |
| `mission_planning.py` | Landing site scoring + A* rover traverse planning |
| `ice_volume.py` | Dielectric-mixing ice volume estimate with bootstrap uncertainty |
| `make_figures.py` | Generates all 8 analysis figures |
| `make_architecture_diagram.py` | Generates the architecture diagram figure |

## Swapping in real DFSAR data on hackathon day

1. Open `radar_processing.py`, find `load_dfsar_product()` — it's a documented stub.
2. Use Claude Code (or this file's docstring) to implement it for whatever
   format ISRO/Hack2skill issues (likely GeoTIFF or PDS .img+.lbl).
3. Keep the returned dict's keys identical to `synth_dfsar.load_synthetic_scene()`'s
   output — every other module consumes that same contract, so nothing else
   needs to change.
4. Re-run `make_figures.py`.

See the accompanying BAH2026_Strategy_Guide.pdf / .docx for full methodology,
the bugs we found and fixed, the hackathon-day execution plan, exact Claude
Code prompts, and the pitch script.
