"""
make_figures.py
================
Generates every figure needed for the SIH26166 submission deck and report.

Run:  python3 make_figures.py
Output: ../figures/*.png  (300 dpi, ready to drop into PowerPoint/Canva)
"""

import numpy as np
import matplotlib.pyplot as plt
import os
from image_registration import load_optical_product, normalize_sun_angle, extract_and_match_features

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")
os.makedirs(OUT_DIR, exist_ok=True)

plt.rcParams.update({
    "figure.facecolor": "#0b1622",
    "axes.facecolor": "#0b1622",
    "savefig.facecolor": "#0b1622",
    "text.color": "#eaf2f8",
    "axes.edgecolor": "#3a4a5a",
    "axes.labelcolor": "#eaf2f8",
    "xtick.color": "#b8c6d3",
    "ytick.color": "#b8c6d3",
})

def fig01_sun_angle_normalization(data, path):
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))
    
    # Original TMC
    axes[0].imshow(data["tmc"], cmap="gray")
    axes[0].set_title("Original TMC Image (Strong Shadows)")
    
    # Normalized TMC
    normalized = normalize_sun_angle(data["tmc"], data["dem"])
    axes[1].imshow(normalized, cmap="gray")
    axes[1].set_title("Sun-Angle Normalized (Using DEM Ray-tracing)")
    
    fig.suptitle("Addressing Sun Angle Invariance")
    fig.savefig(path, dpi=300)
    plt.close(fig)

def fig02_scale_invariant_matching(data, p1, p2, path):
    fig, axes = plt.subplots(1, 2, figsize=(12, 6))
    
    axes[0].imshow(data["tmc"], cmap="gray")
    axes[0].set_title("TMC (5m/px)")
    
    axes[1].imshow(data["ohrc"], cmap="gray")
    axes[1].set_title("OHRC (0.25m/px) - Matched Region")
    
    # Draw mock tie points
    for i in range(min(15, len(p1))):
        axes[0].plot(p1[i, 1], p1[i, 0], 'ro', markersize=4)
        axes[1].plot(p2[i, 1], p2[i, 0], 'ro', markersize=4)
        
    fig.suptitle("Scale-Invariant Feature Matching (TMC to OHRC)")
    fig.savefig(path, dpi=300)
    plt.close(fig)

def main():
    print("Loading simulated multi-modal data...")
    data = load_optical_product()
    
    print("Extracting scale-invariant features...")
    p1, p2 = extract_and_match_features(data["tmc"], data["ohrc"])
    
    print("Generating figures...")
    fig01_sun_angle_normalization(data, os.path.join(OUT_DIR, "fig01_sun_angle_normalization.png"))
    fig02_scale_invariant_matching(data, p1, p2, os.path.join(OUT_DIR, "fig02_scale_invariant_matching.png"))
    
    print(f"All figures written to {os.path.abspath(OUT_DIR)}")

if __name__ == "__main__":
    main()
