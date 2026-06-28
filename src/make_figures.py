"""
make_figures.py
================
Generates every figure needed for the BAH 2026 submission deck and report,
from the synthetic scene (swap to real DFSAR via radar_processing.load_dfsar_product
on hackathon day -- nothing else in this file needs to change).

Run:  python3 make_figures.py
Output: ../figures/*.png  (300 dpi, ready to drop into PowerPoint/Canva)
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from matplotlib.patches import Circle
import os

from synth_dfsar import load_synthetic_scene
from radar_processing import classify_terrain, evaluate_against_ground_truth, summarize_region_stats
from mission_planning import score_landing_candidates, plan_rover_traverse, find_safe_approach_point
from ice_volume import estimate_ice_volume

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")
os.makedirs(OUT_DIR, exist_ok=True)

# Color scheme: dark, scientific, high-contrast -- consistent across all figures
plt.rcParams.update({
    "figure.facecolor": "#0b1622",
    "axes.facecolor": "#0b1622",
    "savefig.facecolor": "#0b1622",
    "text.color": "#eaf2f8",
    "axes.edgecolor": "#3a4a5a",
    "axes.labelcolor": "#eaf2f8",
    "xtick.color": "#b8c6d3",
    "ytick.color": "#b8c6d3",
    "font.size": 11,
    "font.family": "DejaVu Sans",
})

ACCENT_ORANGE = "#ff7a33"
ACCENT_BLUE = "#4aa3ff"
ACCENT_GREEN = "#3ddc84"
ACCENT_RED = "#ff4d4d"


def fig01_illumination_psr(scene, path):
    fig, ax = plt.subplots(figsize=(7, 6))
    im = ax.imshow(scene["illum_frac"], cmap="inferno", origin="upper")
    ax.contour(scene["doubly_shadowed"], levels=[0.5], colors=[ACCENT_BLUE], linewidths=2)
    cb = fig.colorbar(im, ax=ax, fraction=0.04, pad=0.03)
    cb.set_label("Illumination fraction (fraction of local day sunlit)")
    ax.set_title("Illumination Model & Doubly-Shadowed Crater Mask", fontsize=13, weight="bold")
    ax.set_xlabel("Pixel (E-W)")
    ax.set_ylabel("Pixel (N-S)")
    ax.text(0.02, 0.02, "Blue outline: doubly-shadowed zone (illum. < 2%)",
             transform=ax.transAxes, fontsize=9, color=ACCENT_BLUE,
             va="bottom", ha="left")
    fig.tight_layout()
    fig.savefig(path, dpi=300)
    plt.close(fig)


def fig02_cpr_dop_maps(scene, path):
    fig, axes = plt.subplots(1, 2, figsize=(12, 5.5))

    im0 = axes[0].imshow(scene["cpr"], cmap="turbo", vmin=0, vmax=1.6, origin="upper")
    axes[0].contour(scene["doubly_shadowed"], levels=[0.5], colors=["white"], linewidths=1.2, alpha=0.6)
    cb0 = fig.colorbar(im0, ax=axes[0], fraction=0.045, pad=0.03)
    cb0.set_label("Circular Polarization Ratio (CPR)")
    axes[0].set_title("CPR Map (DFSAR L-band, synthetic)", fontsize=12, weight="bold")

    im1 = axes[1].imshow(scene["dop"], cmap="cividis_r", vmin=0, vmax=0.5, origin="upper")
    axes[1].contour(scene["doubly_shadowed"], levels=[0.5], colors=["white"], linewidths=1.2, alpha=0.6)
    cb1 = fig.colorbar(im1, ax=axes[1], fraction=0.045, pad=0.03)
    cb1.set_label("Degree of Polarization (DOP)")
    axes[1].set_title("DOP Map (DFSAR L-band, synthetic)", fontsize=12, weight="bold")

    for ax in axes:
        ax.set_xlabel("Pixel (E-W)")
        ax.set_ylabel("Pixel (N-S)")

    fig.suptitle("Polarimetric Radar Parameters Used for Ice Detection", fontsize=14, weight="bold", y=1.04)
    fig.tight_layout(rect=[0, 0, 1, 0.96])
    fig.savefig(path, dpi=300, bbox_inches="tight")
    plt.close(fig)


def fig03_terrain_classification(scene, label, legend, path):
    cmap = mcolors.ListedColormap(["#16222e", "#c0392b", "#f4d35e", "#3ddc84"])
    bounds = [-0.5, 0.5, 1.5, 2.5, 3.5]
    norm = mcolors.BoundaryNorm(bounds, cmap.N)

    fig, ax = plt.subplots(figsize=(8.5, 7.2))
    im = ax.imshow(label, cmap=cmap, norm=norm, origin="upper")
    ax.contour(scene["doubly_shadowed"], levels=[0.5], colors=["white"], linewidths=1.2, alpha=0.7)

    cb = fig.colorbar(im, ax=ax, ticks=[0, 1, 2, 3], fraction=0.045, pad=0.03)
    cb.ax.set_yticklabels([legend[i].split(" (")[0] for i in range(4)], fontsize=8)

    ax.set_title("Terrain Classification: CPR > 1 AND DOP < 0.13 Criterion\n"
                  "(with roughness-confound discrimination)", fontsize=12.5, weight="bold", pad=12)
    ax.set_xlabel("Pixel (E-W)")
    ax.set_ylabel("Pixel (N-S)")
    fig.tight_layout(pad=1.4)
    fig.savefig(path, dpi=300, bbox_inches="tight")
    plt.close(fig)


def fig04_scatter_cpr_dop(scene, label, path):
    fig, ax = plt.subplots(figsize=(7, 6))
    sample = np.random.default_rng(0).choice(scene["cpr"].size, size=20000, replace=False)
    cpr_s = scene["cpr"].ravel()[sample]
    dop_s = scene["dop"].ravel()[sample]
    label_s = label.ravel()[sample]

    colors = {0: "#3a4a5a", 1: "#c0392b", 2: "#f4d35e", 3: "#3ddc84"}
    names = {0: "Background", 1: "Roughness artifact", 2: "Ambiguous", 3: "Ice candidate"}
    for cls in [0, 1, 2, 3]:
        m = label_s == cls
        ax.scatter(cpr_s[m], dop_s[m], s=4, alpha=0.5, color=colors[cls], label=names[cls])

    ax.axvline(1.0, color=ACCENT_ORANGE, linestyle="--", linewidth=1.3)
    ax.axhline(0.13, color=ACCENT_ORANGE, linestyle="--", linewidth=1.3)
    ax.text(1.02, 0.48, "CPR = 1", color=ACCENT_ORANGE, fontsize=9, rotation=90, va="top")
    ax.text(0.05, 0.135, "DOP = 0.13", color=ACCENT_ORANGE, fontsize=9)

    ax.set_xlabel("Circular Polarization Ratio (CPR)")
    ax.set_ylabel("Degree of Polarization (DOP)")
    ax.set_title("CPR-DOP Parameter Space: Refined Ice Detection Criterion\n"
                 "(Sinha et al. 2026 threshold: CPR>1 & DOP<0.13)", fontsize=12, weight="bold")
    ax.legend(loc="upper right", fontsize=8, framealpha=0.85)
    fig.tight_layout()
    fig.savefig(path, dpi=300)
    plt.close(fig)


def fig05_landing_site_traverse(scene, label, candidates, start_yx, approach_yx,
                                 target_yx, traverse_result, path):
    fig, ax = plt.subplots(figsize=(8, 7))
    im = ax.imshow(scene["elevation_m"], cmap="gist_earth", origin="upper", alpha=0.95)
    cb = fig.colorbar(im, ax=ax, fraction=0.045, pad=0.03)
    cb.set_label("Relative elevation (m)")

    ax.contour(scene["doubly_shadowed"], levels=[0.5], colors=[ACCENT_BLUE], linewidths=2)

    ice_mask = label == 3
    ax.contourf(ice_mask, levels=[0.5, 1.5], colors=[ACCENT_GREEN], alpha=0.55)

    for c in candidates[:60]:
        marker_color = ACCENT_GREEN if c["pass_all"] else "#5a6a7a"
        ax.plot(c["x"], c["y"], "o", color=marker_color, markersize=2.5, alpha=0.5)

    ax.plot(start_yx[1], start_yx[0], marker="*", markersize=20, color=ACCENT_ORANGE,
            markeredgecolor="white", markeredgewidth=1, zorder=5, label="Selected landing site")

    if traverse_result["reachable"]:
        path_arr = np.array(traverse_result["path_yx"])
        ax.plot(path_arr[:, 1], path_arr[:, 0], "-", color="white", linewidth=2.2, zorder=4)
        ax.plot(path_arr[:, 1], path_arr[:, 0], "--", color=ACCENT_ORANGE, linewidth=1.4, zorder=4,
                label="Rover traverse (A*, slope+illum aware)")

    ax.plot(approach_yx[1], approach_yx[0], "s", markersize=10, color=ACCENT_RED,
            markeredgecolor="white", zorder=5, label="Rim approach point (rover halts here)")
    ax.plot(target_yx[1], target_yx[0], "D", markersize=9, color=ACCENT_GREEN,
            markeredgecolor="white", zorder=5, label="Ice-candidate target (final sortie)")

    ax.plot([approach_yx[1], target_yx[1]], [approach_yx[0], target_yx[0]],
            ":", color=ACCENT_GREEN, linewidth=1.6, zorder=4)

    ax.set_title("Landing Site Selection & Rover Traverse Plan", fontsize=13, weight="bold")
    ax.set_xlabel("Pixel (E-W)")
    ax.set_ylabel("Pixel (N-S)")
    ax.legend(loc="upper left", fontsize=8, framealpha=0.85)
    fig.tight_layout()
    fig.savefig(path, dpi=300)
    plt.close(fig)


def fig06_slope_profile_along_path(scene, traverse_result, approach_yx, target_yx, path):
    if not traverse_result["reachable"]:
        return
    path_arr = np.array(traverse_result["path_yx"])
    pixel_size_m = scene["meta"]["pixel_size_m"]
    dists = np.concatenate([[0], np.cumsum(
        np.hypot(np.diff(path_arr[:, 0]), np.diff(path_arr[:, 1])) * pixel_size_m
    )])
    slopes = scene["slope_deg"][path_arr[:, 0], path_arr[:, 1]]
    illum = scene["illum_frac"][path_arr[:, 0], path_arr[:, 1]]

    fig, ax1 = plt.subplots(figsize=(9.5, 5.2))
    ax1.fill_between(dists, slopes, color=ACCENT_ORANGE, alpha=0.35)
    l1, = ax1.plot(dists, slopes, color=ACCENT_ORANGE, linewidth=1.8, label="Local slope (deg)")
    l2 = ax1.axhline(25, color=ACCENT_RED, linestyle="--", linewidth=1.2, label="Rover hard slope limit (25 deg)")
    ax1.set_xlabel("Distance along traverse (m)")
    ax1.set_ylabel("Slope (deg)", color=ACCENT_ORANGE)
    ax1.set_ylim(0, 30)

    ax2 = ax1.twinx()
    l3, = ax2.plot(dists, illum, color=ACCENT_BLUE, linewidth=1.5, linestyle=":", label="Illumination fraction")
    ax2.set_ylabel("Illumination fraction", color=ACCENT_BLUE)
    ax2.set_ylim(0, 1)

    final_sortie_m = float(np.hypot(approach_yx[0] - target_yx[0], approach_yx[1] - target_yx[1])
                            * pixel_size_m)
    ax1.axvspan(dists[-1], dists[-1] + final_sortie_m, color=ACCENT_GREEN, alpha=0.15)
    ax1.text(dists[-1] + final_sortie_m / 2, 27.5,
             "Battery-sortie\nfinal approach", ha="center", fontsize=8, color=ACCENT_GREEN)

    ax1.set_title("Traverse Engineering Profile: Slope & Illumination vs. Distance",
                   fontsize=12.5, weight="bold", pad=12)
    ax1.legend(handles=[l1, l2, l3], loc="upper left", bbox_to_anchor=(0.0, -0.16),
               ncol=3, fontsize=8, framealpha=0.9, columnspacing=1.0)
    fig.tight_layout(rect=[0, 0.04, 1, 1])
    fig.savefig(path, dpi=300, bbox_inches="tight")
    plt.close(fig)


def fig07_ice_volume_bars(vol_result, path):
    fig, ax = plt.subplots(figsize=(6.5, 5))
    labels = ["P10", "Point estimate\n(median assumptions)", "P90"]
    values = [vol_result["bootstrap_p10_volume_m3"],
              vol_result["point_estimate_volume_m3"],
              vol_result["bootstrap_p90_volume_m3"]]
    colors = ["#3a4a5a", ACCENT_GREEN, "#3a4a5a"]
    bars = ax.bar(labels, values, color=colors, edgecolor="white", linewidth=0.6)
    for b, v in zip(bars, values):
        ax.text(b.get_x() + b.get_width() / 2, v + max(values) * 0.02, f"{v:,.0f} m³",
                ha="center", fontsize=9, color="#eaf2f8")
    ax.set_ylabel("Estimated subsurface ice volume (m³, top 5 m)")
    ax.set_title("Subsurface Ice Volume Estimate with Uncertainty Range",
                  fontsize=12, weight="bold")
    fig.tight_layout()
    fig.savefig(path, dpi=300)
    plt.close(fig)


def fig08_detector_validation(metrics, path):
    fig, ax = plt.subplots(figsize=(5.5, 5))
    cm = np.array([[metrics["tn"], metrics["fp"]], [metrics["fn"], metrics["tp"]]])
    im = ax.imshow(cm, cmap="YlGnBu")
    for i in range(2):
        for j in range(2):
            ax.text(j, i, f"{cm[i,j]:,}", ha="center", va="center",
                    fontsize=13, color="black" if cm[i, j] > cm.max() / 2 else "white")
    ax.set_xticks([0, 1]); ax.set_xticklabels(["Pred: not ice", "Pred: ice"])
    ax.set_yticks([0, 1]); ax.set_yticklabels(["True: not ice", "True: ice"])
    ax.set_title(f"Detector Validation (synthetic ground truth)\n"
                 f"Precision={metrics['precision']:.2f}  Recall={metrics['recall']:.2f}  "
                 f"F1={metrics['f1']:.2f}", fontsize=11, weight="bold")
    fig.tight_layout()
    fig.savefig(path, dpi=300)
    plt.close(fig)


def main():
    print("Generating synthetic scene...")
    scene = load_synthetic_scene()

    print("Classifying terrain...")
    label, legend = classify_terrain(scene["cpr"], scene["dop"], scene["slope_deg"])
    metrics = evaluate_against_ground_truth(label, scene["ground_truth_ice"])

    ice_ys, ice_xs = np.where(label == 3)
    target_yx = (int(np.mean(ice_ys)), int(np.mean(ice_xs)))
    approach_yx, approach_info = find_safe_approach_point(scene, target_yx)

    candidates = score_landing_candidates(scene, label, approach_yx)
    best = candidates[0]
    start_yx = (best["y"], best["x"])

    traverse_result = plan_rover_traverse(scene, start_yx, approach_yx)
    vol_result = estimate_ice_volume(scene, label)

    print("Rendering figures...")
    fig01_illumination_psr(scene, os.path.join(OUT_DIR, "fig01_illumination_psr.png"))
    fig02_cpr_dop_maps(scene, os.path.join(OUT_DIR, "fig02_cpr_dop_maps.png"))
    fig03_terrain_classification(scene, label, legend, os.path.join(OUT_DIR, "fig03_terrain_classification.png"))
    fig04_scatter_cpr_dop(scene, label, os.path.join(OUT_DIR, "fig04_cpr_dop_scatter.png"))
    fig05_landing_site_traverse(scene, label, candidates, start_yx, approach_yx, target_yx,
                                 traverse_result, os.path.join(OUT_DIR, "fig05_landing_traverse.png"))
    fig06_slope_profile_along_path(scene, traverse_result, approach_yx, target_yx,
                                    os.path.join(OUT_DIR, "fig06_slope_profile.png"))
    fig07_ice_volume_bars(vol_result, os.path.join(OUT_DIR, "fig07_ice_volume.png"))
    fig08_detector_validation(metrics, os.path.join(OUT_DIR, "fig08_detector_validation.png"))

    print(f"\nAll figures written to {os.path.abspath(OUT_DIR)}")
    print("\n--- Key numbers for the deck ---")
    print(f"Landing site: row={best['y']}, col={best['x']}, "
          f"slope={best['slope_deg']:.2f} deg, illum={best['illum_frac']:.0%}, "
          f"passes all criteria={best['pass_all']}")
    print(f"Traverse: {traverse_result['path_len_m']:.0f} m drive + "
          f"final sortie to target, max slope {traverse_result['max_slope_on_path_deg']:.1f} deg")
    print(f"Ice volume point estimate: {vol_result['point_estimate_volume_m3']:,.0f} m³ "
          f"({vol_result['point_estimate_mass_tonnes']:,.0f} tonnes)")
    print(f"Detector: precision={metrics['precision']:.2f}, recall={metrics['recall']:.2f}, "
          f"f1={metrics['f1']:.2f}")


if __name__ == "__main__":
    main()
