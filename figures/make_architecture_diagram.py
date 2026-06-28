"""
make_architecture_diagram.py
=============================
Generates the system architecture diagram for the deck (slide 7),
in the same dark/scientific visual style as the other figures.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")

plt.rcParams.update({
    "figure.facecolor": "#0b1622",
    "axes.facecolor": "#0b1622",
    "savefig.facecolor": "#0b1622",
    "text.color": "#eaf2f8",
    "font.size": 10.5,
    "font.family": "DejaVu Sans",
})

BLUE = "#4aa3ff"
ORANGE = "#ff7a33"
GREEN = "#3ddc84"
GREY = "#3a4a5a"
BOXFACE = "#16222e"


def box(ax, x, y, w, h, text, color=BLUE, fontsize=9.5, fontweight="bold"):
    b = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.08",
                        linewidth=1.6, edgecolor=color, facecolor=BOXFACE, zorder=2)
    ax.add_patch(b)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center",
            fontsize=fontsize, fontweight=fontweight, color="#eaf2f8", zorder=3,
            wrap=True)
    return b


def arrow(ax, p0, p1, color="#7a8a99"):
    a = FancyArrowPatch(p0, p1, arrowstyle="-|>", mutation_scale=14,
                         linewidth=1.6, color=color, zorder=1)
    ax.add_patch(a)


def main():
    fig, ax = plt.subplots(figsize=(11, 6.2))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 6.2)
    ax.axis("off")

    # Row 1: Inputs
    box(ax, 0.3, 5.0, 2.2, 0.9, "Chandrayaan-2\nDFSAR (SC/OC)", color=BLUE)
    box(ax, 2.8, 5.0, 2.2, 0.9, "Chandrayaan-2\nOHRC imagery", color=BLUE)
    box(ax, 5.3, 5.0, 2.2, 0.9, "LOLA / DEM\nelevation model", color=BLUE)
    box(ax, 7.8, 5.0, 2.9, 0.9, "Illumination model\n(sun-angle geometry)", color=BLUE)

    # Row 2: Processing
    box(ax, 0.3, 3.55, 3.3, 0.9, "Radiometric calib. + multilook\n+ orthorectification", color=GREY, fontweight="normal")
    box(ax, 3.9, 3.55, 3.1, 0.9, "CPR / DOP computation\n(radar_processing.py)", color=ORANGE)
    box(ax, 7.3, 3.55, 3.4, 0.9, "Slope / roughness /\nPSR mask (synth_dfsar.py)", color=ORANGE)

    # Row 3: Classification
    box(ax, 2.0, 2.1, 4.0, 0.9,
        "Terrain classifier:\nCPR>1 AND DOP<0.13 + roughness check\n(classify_terrain)", color=GREEN)
    box(ax, 6.3, 2.1, 3.4, 0.9, "Detector validation\n(synthetic ground truth, P/R/F1)", color=GREEN)

    # Row 4: Mission planning
    box(ax, 0.3, 0.6, 3.0, 0.9, "Landing site scorer\n(score_landing_candidates)", color=ORANGE)
    box(ax, 3.5, 0.6, 3.0, 0.9, "A* rover traverse planner\n(plan_rover_traverse)", color=ORANGE)
    box(ax, 6.7, 0.6, 2.0, 0.9, "Ice volume\nestimator", color=ORANGE)
    box(ax, 8.9, 0.6, 1.8, 0.9, "Figures +\nreport", color=BLUE)

    # Arrows: inputs -> processing
    arrow(ax, (1.4, 5.0), (1.95, 4.45))
    arrow(ax, (3.9, 5.0), (4.7, 4.45))
    arrow(ax, (6.4, 5.0), (5.4, 4.45))
    arrow(ax, (6.4, 5.0), (8.5, 4.45))
    arrow(ax, (9.25, 5.0), (9.0, 4.45))

    # processing -> classification
    arrow(ax, (5.4, 3.55), (4.5, 3.0))
    arrow(ax, (9.0, 3.55), (7.5, 3.0))

    # classification cross-link
    arrow(ax, (5.5, 2.1), (1.8, 1.5))
    arrow(ax, (5.5, 2.1), (5.0, 1.5))
    arrow(ax, (8.0, 2.55), (8.0, 2.55))  # placeholder no-op avoided below
    arrow(ax, (8.0, 2.1), (7.7, 1.5))

    # mission planning chain
    arrow(ax, (3.3, 1.05), (3.5, 1.05))
    arrow(ax, (6.5, 1.05), (6.7, 1.05))
    arrow(ax, (8.7, 1.05), (8.9, 1.05))

    ax.set_title("End-to-End Pipeline Architecture", fontsize=15, weight="bold", pad=14)

    legend_items = [
        mpatches.Patch(facecolor=BOXFACE, edgecolor=BLUE, label="Data input"),
        mpatches.Patch(facecolor=BOXFACE, edgecolor=ORANGE, label="Processing / analysis"),
        mpatches.Patch(facecolor=BOXFACE, edgecolor=GREEN, label="Decision / validation"),
    ]
    ax.legend(handles=legend_items, loc="upper center", bbox_to_anchor=(0.5, -0.02),
              ncol=3, fontsize=9, framealpha=0.9)

    fig.tight_layout()
    out_path = os.path.join(OUT_DIR, "fig09_architecture.png")
    fig.savefig(out_path, dpi=300, bbox_inches="tight")
    plt.close(fig)
    print(f"Saved {out_path}")


if __name__ == "__main__":
    main()
