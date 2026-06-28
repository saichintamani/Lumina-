"""
synth_dfsar.py
==============
Generates a PHYSICALLY-MOTIVATED SYNTHETIC stand-in for a Chandrayaan-3 DFSAR
scene of a doubly-shadowed crater, so the rest of the pipeline (CPR/DOP,
landing site selection, traverse planning, ice-volume estimation) can be
built, tested and rehearsed BEFORE the real DFSAR cube is issued at the
hackathon.

IMPORTANT — READ BEFORE THE HACKATHON:
This is NOT real ISRO data. It exists only so your code path is already
debugged when the real .img/.tif DFSAR product is handed out. On hackathon
day you replace `load_synthetic_scene()` with `load_dfsar_product(path)`
(stub provided in radar_processing.py) and nothing downstream changes,
because every other function consumes the same array shapes
(SC, OC, S1..S4 Stokes-like channels -> CPR, DOP, sigma0).

Design basis (so the synthetic scene is not arbitrary):
- Shiv Shakti Point doubly-shadowed crater: ~1.1 km diameter, lobate rim,
  centered near 69.373 S, 32.319 E (Chandrayaan-3 landing site context).
- DFSAR L-band native resolution ~11.5 m (range) x 20.0 m (azimuth)
  (Bhiravarasu et al. 2021, Planet. Sci. J.; Verma et al. 2025, Icarus).
- Background lunar regolith CPR is typically 0.3-0.6 on smooth mare/highland
  terrain; fresh-crater ejecta and rough slopes commonly show CPR 0.8-1.3
  from double-bounce / diffuse scattering (NOT necessarily ice); the
  literature explicitly warns that CPR>1 alone is frequently a roughness
  artifact (Eke et al. 2014; Fa & Eke 2018; Putrevu et al. 2023).
- The refined ice criterion used here (Sinha et al. 2026): CPR > 1 AND
  DOP < 0.13, i.e. high CPR co-located with LOW depolarization, consistent
  with coherent volumetric scattering from a buried low-loss dielectric
  (ice) rather than diffuse rough-surface scattering (which raises CPR but
  does NOT suppress DOP).
"""

import numpy as np

RNG_SEED = 42


def _gaussian_bump(yy, xx, cy, cx, sigma, amp):
    return amp * np.exp(-(((yy - cy) ** 2 + (xx - cx) ** 2) / (2 * sigma ** 2)))


def _crater_bowl(yy, xx, cy, cx, radius_px, depth, rim_height, rim_width_px,
                  saddle_azimuth_rad=2.3, saddle_width_rad=0.55, saddle_drop=0.55):
    """
    Simple parabolic bowl + raised lobate rim, in meters of relief.

    Real fresh lunar craters with lobate rims are NOT uniformly steep all
    the way around -- lobate (flow-like) rims by definition have azimuthal
    sectors of differing rim height/slope, and degraded sectors or breaches
    are common (e.g. where an earlier, larger crater's wall was overprinted).
    We model one such gentler "saddle" sector explicitly: rim height is
    multiplied down to `saddle_drop` fraction over a `saddle_width_rad`
    angular window centered on `saddle_azimuth_rad`. This is what makes a
    safe rover approach azimuth physically findable, rather than wishing
    one into existence in the path planner.
    """
    r = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)
    bowl = np.where(r < radius_px, -depth * (1 - (r / radius_px) ** 2), 0.0)
    rim = rim_height * np.exp(-((r - radius_px) ** 2) / (2 * rim_width_px ** 2))
    theta = np.arctan2(yy - cy, xx - cx)
    lobate = 1.0 + 0.18 * np.sin(4 * theta + 0.7) + 0.10 * np.sin(7 * theta)

    # angular distance from the saddle center, wrapped to [-pi, pi]
    dtheta = np.angle(np.exp(1j * (theta - saddle_azimuth_rad)))
    saddle_factor = 1.0 - (1.0 - saddle_drop) * np.exp(-(dtheta ** 2) / (2 * saddle_width_rad ** 2))

    return bowl + rim * lobate * saddle_factor


def load_synthetic_scene(
    nx=512,
    ny=512,
    pixel_size_m=12.5,
    crater_diam_m=1100.0,
    seed=RNG_SEED,
    ice_patch=True,
):
    """
    Returns a dict of co-registered arrays (all shape (ny, nx)):
        elevation_m   : relative elevation, meters
        slope_deg     : local slope, degrees
        sc            : same-sense circularly polarized backscatter (linear power)
        oc            : opposite-sense circularly polarized backscatter (linear power)
        dop           : degree of polarization (0-1)
        illum_frac    : fraction of time pixel is illuminated by the Sun (0-1)
        is_psr        : boolean permanently-shadowed-region mask
        ground_truth_ice : boolean mask of WHERE we injected a synthetic ice
                           signature (only known here because this is synthetic
                           data — used to validate the detector's recall/precision
                           before trusting it on real data)
        meta          : dict of scene metadata (resolution, center coords, etc.)
    """
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:ny, 0:nx]
    cy, cx = ny / 2, nx / 2
    radius_px = (crater_diam_m / 2) / pixel_size_m

    # --- Topography: crater bowl + rim, sitting inside a larger PSR floor ---
    elevation_m = _crater_bowl(
        yy, xx, cy, cx,
        radius_px=radius_px,
        depth=95.0,           # d/D ~0.17, realistic simple-crater depth;
                               # produces ~20 deg max parabolic wall slope
                               # (2*depth/radius_m), matching real fresh
                               # simple lunar craters (~20-30 deg interior walls)
        rim_height=22.0,
        rim_width_px=radius_px * 0.22,
    )
    # gentle regional slope (PSR floors are rarely perfectly flat)
    elevation_m += 0.0008 * (xx - cx) + 0.0005 * (yy - cy)
    # small-scale roughness (boulders / meter-scale roughness), correlated noise
    rough = rng.normal(0, 1, (ny, nx))
    for _ in range(5):
        rough = 0.25 * (
            np.roll(rough, 1, 0) + np.roll(rough, -1, 0)
            + np.roll(rough, 1, 1) + np.roll(rough, -1, 1)
        )
    elevation_m += 3.0 * rough / (rough.std() + 1e-9)

    # local slope via gradient (deg)
    gy, gx = np.gradient(elevation_m, pixel_size_m)
    slope_deg = np.degrees(np.arctan(np.sqrt(gx ** 2 + gy ** 2)))

    # --- Illumination: crater interior in deep PSR floor is doubly shadowed ---
    r_px = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)
    illum_frac = np.clip(0.78 - 0.95 * np.exp(-((r_px / (radius_px * 0.92)) ** 6)), 0.0, 1.0)
    # add slope-dependent illumination falloff outside crater (pole-facing slopes darker)
    illum_frac *= np.clip(1.0 - 0.6 * (slope_deg > 15) * (rng.random((ny, nx)) < 0.5), 0.3, 1.0)
    is_psr = illum_frac < 0.02
    doubly_shadowed = is_psr & (r_px < radius_px * 0.85)

    # --- Radar backscatter baseline (rough regolith, NOT ice) ---
    # OC (opposite-sense) dominates for typical diffuse lunar regolith.
    base_oc = 0.045 + 0.10 * np.clip(slope_deg, 0, 35) / 35.0
    base_oc *= np.exp(0.4 * rough / (rough.std() + 1e-9))  # roughness modulation
    base_oc = np.clip(base_oc, 0.005, None)

    # Baseline CPR ~0.35-0.55 on typical regolith; rises toward steep
    # crater walls / fresh rim due to double-bounce & block fields (roughness,
    # NOT ice) -- this is the literature's confound we must distinguish from ice.
    baseline_cpr = 0.40 + 0.35 * np.clip((slope_deg - 5) / 25, 0, 1)
    baseline_cpr += 0.06 * rng.normal(0, 1, (ny, nx))
    baseline_cpr = np.clip(baseline_cpr, 0.15, 1.25)

    # Baseline DOP: rough/diffuse scattering keeps DOP moderate-to-high (0.2-0.45)
    baseline_dop = 0.30 - 0.10 * np.clip((slope_deg - 5) / 25, 0, 1)
    baseline_dop += 0.04 * rng.normal(0, 1, (ny, nx))
    baseline_dop = np.clip(baseline_dop, 0.10, 0.55)

    sc = base_oc * baseline_cpr
    oc = base_oc.copy()
    dop = baseline_dop.copy()

    ground_truth_ice = np.zeros((ny, nx), dtype=bool)

    if ice_patch:
        # Inject 2-3 ice-bearing patches on the crater floor, inside the
        # doubly-shadowed zone, consistent with the published criterion:
        # CPR > 1 (here ~1.2-1.6) co-located with DOP < 0.13 (volumetric,
        # not diffuse, scattering) -- this is what the detector must find.
        patch_centers = [
            (cy - 0.10 * radius_px, cx + 0.05 * radius_px, radius_px * 0.22),
            (cy + 0.18 * radius_px, cx - 0.12 * radius_px, radius_px * 0.14),
        ]
        for (py, px, psig) in patch_centers:
            w = _gaussian_bump(yy, xx, py, px, psig, 1.0)
            patch_mask = (w > 0.35) & doubly_shadowed
            ground_truth_ice |= patch_mask

            cpr_boost = 0.9 * w  # pushes CPR from ~0.5 baseline to ~1.3-1.6 at core
            dop_suppress = 0.30 * w  # pushes DOP down toward ~0.05-0.10 at core

            local_cpr = baseline_cpr + cpr_boost
            local_dop = np.clip(baseline_dop - dop_suppress, 0.02, None)

            blend = np.clip(w, 0, 1)
            sc = sc * (1 - blend) + (base_oc * local_cpr) * blend
            dop = dop * (1 - blend) + local_dop * blend

        oc = base_oc.copy()  # OC backscatter changes much less than SC/CPR for ice

    cpr = np.divide(sc, oc, out=np.zeros_like(sc), where=oc > 1e-6)

    meta = dict(
        nx=nx, ny=ny, pixel_size_m=pixel_size_m,
        crater_diam_m=crater_diam_m,
        center_lat_deg=-69.373, center_lon_deg=32.319,  # Shiv Shakti Point (Chandrayaan-3)
        band="L-band (24 cm)",
        note="SYNTHETIC stand-in scene for pipeline development. Not ISRO data.",
    )

    return dict(
        elevation_m=elevation_m,
        slope_deg=slope_deg,
        sc=sc,
        oc=oc,
        cpr=cpr,
        dop=dop,
        illum_frac=illum_frac,
        is_psr=is_psr,
        doubly_shadowed=doubly_shadowed,
        ground_truth_ice=ground_truth_ice,
        meta=meta,
    )


if __name__ == "__main__":
    scene = load_synthetic_scene()
    print("Synthetic scene generated:")
    for k, v in scene.items():
        if isinstance(v, np.ndarray):
            print(f"  {k:18s} shape={v.shape} dtype={v.dtype} "
                  f"min={v.min():.3f} max={v.max():.3f}")
        else:
            print(f"  {k:18s} = {v}")
