"""
ice_volume.py
=============
Estimate subsurface ice volume within the top ~5 m of regolith beneath
the detected ice-candidate patches, using the Birchak/CRIM dielectric
mixing model -- a real, published effective-medium formulation, not an
ad-hoc proxy.

Physical basis:
  - Birchak power-law mixing (Birchak et al. 1974; CRIM is the alpha=0.5
    special case, equivalent to linear averaging of refractive indices):

        eps_eff^alpha = sum_i f_i * eps_i^alpha,   sum_i f_i = 1

    For isotropic, randomly oriented inclusions (appropriate for ice
    grains mixed through porous regolith) alpha = 0.5.

  - Three-component lunar subsurface: vacuum/pore space (f_vac), dry
    silicate regolith grains (f_grain), water ice (f_ice), with
    f_vac + f_grain + f_ice = 1.
        eps_ice    ~ 3.1   (stable at cryogenic PSR temperatures, ~25-110 K;
                             Heggy et al. 2017)
        eps_vac    = 1.0
        eps_grain  ~ 6.0-7.0 for lunar highland silicates (Carrier et al.
                             1991); we use 6.5 as a representative midpoint.
        porosity f_vac ~ 0.40-0.50 in the upper few meters of polar
                             regolith due to impact gardening (used as a
                             fixed assumption, swept in the bootstrap).

  - Given an effective dielectric constant eps_eff for a pixel/region
    (which in a full pipeline would come from an inversion against the
    measured radar backscatter -- a neural-network or empirical
    regression retrieval; see retrieve_eps_eff_from_radar() below for the
    DOCUMENTED, TRANSPARENT proxy used here in the absence of a trained
    inversion network), the Birchak equation is solved algebraically for
    f_ice with f_vac held fixed:

        eps_eff^a = f_vac*eps_vac^a + (1-f_vac-f_ice)*eps_grain^a + f_ice*eps_ice^a
        =>  f_ice = [eps_eff^a - f_vac*eps_vac^a - (1-f_vac)*eps_grain^a]
                     / (eps_ice^a - eps_grain^a)

IMPORTANT HONESTY NOTE FOR THE DECK:
  A from-scratch trained MLP dielectric-inversion network (as more
  ambitious literature on this topic describes) is not something we
  built or are claiming to have built in this timeframe. What IS real
  and defensible here: (1) the Birchak/CRIM mixing physics is a genuine
  published effective-medium model, correctly applied; (2) the mapping
  from CPR enhancement to an assumed eps_eff is an explicitly documented,
  simple monotonic proxy standing in for a proper inversion, exactly
  flagged as such; (3) the bootstrap propagates uncertainty in BOTH the
  eps_eff proxy and the assumed porosity/depth, so the final range is
  honest about compounding uncertainty rather than hiding it.
"""

import numpy as np

EPS_ICE = 3.1
EPS_VAC = 1.0
EPS_GRAIN = 6.5
RHO_ICE_KGM3 = 917.0
ALPHA_DEFAULT = 0.5  # Birchak exponent; 0.5 = CRIM


def retrieve_eps_eff_from_radar(cpr, baseline_cpr,
                                 eps_floor=2.85, eps_ceiling=3.45,
                                 cpr_enh_saturation=1.0):
    """
    DOCUMENTED PROXY for what a trained inversion network would do:
    maps local CPR enhancement above background to an assumed effective
    dielectric constant, monotonically DECREASING from eps_ceiling
    (no enhancement -> looks like ordinary dry, porous regolith with no
    ice: at f_vac=0.45, eps_grain=6.5, the Birchak no-ice value is
    ~3.43) down toward eps_floor (maximum enhancement -> pulled toward
    a literature-consistent ~20% patchy ice fraction, ~2.87) as CPR
    enhancement increases. These floor/ceiling values are NOT arbitrary
    -- they are the actual Birchak forward-model outputs at f_ice=0 and
    f_ice=0.20 respectively (see calibration check in module tests),
    keeping the inverted ice fractions inside the literature-supported
    5-20% patchy-mixture range (Neish et al. 2011; Calla et al. 2016)
    rather than an arbitrary choice.

    This direction matters physically: ice has a LOWER dielectric
    constant than silicate grains, so a higher ice fraction pulls the
    bulk eps_eff DOWN, not up. Returns an array of eps_eff, same shape
    as cpr.
    """
    enh = np.clip(cpr - baseline_cpr, 0, None)
    t = np.clip(enh / cpr_enh_saturation, 0, 1)
    return eps_ceiling - (eps_ceiling - eps_floor) * t


def birchak_solve_f_ice(eps_eff, f_vac=0.45, eps_ice=EPS_ICE,
                         eps_grain=EPS_GRAIN, eps_vac=EPS_VAC,
                         alpha=ALPHA_DEFAULT):
    """
    Solves the Birchak/CRIM three-component mixing equation for ice
    volume fraction f_ice, given eps_eff and an assumed fixed porosity
    f_vac. Clips to [0, 1 - f_vac] (cannot exceed the available
    non-vacuum volume fraction).
    """
    lhs = eps_eff ** alpha
    rhs_const = f_vac * (eps_vac ** alpha) + (1 - f_vac) * (eps_grain ** alpha)
    coef = (eps_ice ** alpha) - (eps_grain ** alpha)  # negative, since eps_ice < eps_grain
    f_ice = (lhs - rhs_const) / coef
    return np.clip(f_ice, 0.0, 1.0 - f_vac)


def estimate_ice_volume(scene, label, depth_m=5.0, ice_class=3,
                        f_vac=0.45, baseline_cpr=None,
                        n_bootstrap=300, seed=11):
    """
    Estimate total subsurface ice volume (m^3) within `depth_m` of
    regolith beneath all pixels classified as high-confidence ice
    candidates (label == ice_class), using the Birchak/CRIM inversion.

    Bootstrap varies: the CPR-to-eps_eff proxy's saturation point
    (+/-40%), assumed porosity f_vac (0.40-0.50, per Carrier et al.
    1991), assumed eps_grain (6.0-7.0), and assumed depth (+/-30%) --
    propagating uncertainty from every assumption stated in the module
    docstring, not just one.
    """
    rng = np.random.default_rng(seed)
    pixel_area_m2 = scene["meta"]["pixel_size_m"] ** 2
    ice_mask = label == ice_class
    n_ice_px = int(np.sum(ice_mask))

    if baseline_cpr is None:
        baseline_cpr = float(np.median(scene["cpr"][~ice_mask]))

    eps_eff_map = retrieve_eps_eff_from_radar(scene["cpr"], baseline_cpr)
    f_ice_map = birchak_solve_f_ice(eps_eff_map, f_vac=f_vac)
    f_ice_on_ice_px = f_ice_map[ice_mask]

    point_volume_m3 = float(np.sum(f_ice_on_ice_px) * pixel_area_m2 * depth_m)
    point_mass_kg = point_volume_m3 * RHO_ICE_KGM3
    point_mean_f_ice = float(np.mean(f_ice_on_ice_px)) if n_ice_px else 0.0

    samples = []
    for _ in range(n_bootstrap):
        sat_s = 1.0 * rng.uniform(0.6, 1.4)
        f_vac_s = rng.uniform(0.40, 0.50)
        eps_grain_s = rng.uniform(6.0, 7.0)
        depth_s = depth_m * rng.uniform(0.7, 1.3)

        # recompute floor/ceiling consistently for this sample's f_vac/eps_grain
        # so the proxy stays anchored to the Birchak forward model rather than
        # silently drifting from the stale module-level defaults
        eps_ceiling_s = (f_vac_s * (EPS_VAC ** ALPHA_DEFAULT)
                         + (1 - f_vac_s) * (eps_grain_s ** ALPHA_DEFAULT)) ** (1 / ALPHA_DEFAULT)
        f_ice_cap = 0.20
        f_grain_cap = 1 - f_vac_s - f_ice_cap
        eps_floor_s = (f_vac_s * (EPS_VAC ** ALPHA_DEFAULT)
                       + f_grain_cap * (eps_grain_s ** ALPHA_DEFAULT)
                       + f_ice_cap * (EPS_ICE ** ALPHA_DEFAULT)) ** (1 / ALPHA_DEFAULT)

        eps_eff_s = retrieve_eps_eff_from_radar(scene["cpr"], baseline_cpr,
                                                 eps_floor=eps_floor_s,
                                                 eps_ceiling=eps_ceiling_s,
                                                 cpr_enh_saturation=sat_s)
        f_ice_s_map = birchak_solve_f_ice(eps_eff_s, f_vac=f_vac_s,
                                           eps_grain=eps_grain_s)
        vol_s = float(np.sum(f_ice_s_map[ice_mask]) * pixel_area_m2 * depth_s)
        samples.append(vol_s)
    samples = np.array(samples)

    return dict(
        n_ice_pixels=n_ice_px,
        ice_bearing_area_m2=float(n_ice_px * pixel_area_m2),
        mean_ice_volume_fraction=point_mean_f_ice,
        point_estimate_volume_m3=point_volume_m3,
        point_estimate_mass_kg=point_mass_kg,
        point_estimate_mass_tonnes=point_mass_kg / 1000.0,
        bootstrap_p10_volume_m3=float(np.percentile(samples, 10)),
        bootstrap_p50_volume_m3=float(np.percentile(samples, 50)),
        bootstrap_p90_volume_m3=float(np.percentile(samples, 90)),
        assumptions=dict(
            eps_ice=EPS_ICE,
            eps_grain_nominal=EPS_GRAIN,
            eps_vac=EPS_VAC,
            assumed_porosity_f_vac=f_vac,
            assumed_depth_m=depth_m,
            mixing_model="Birchak/CRIM power-law (alpha=0.5), 3-component "
                         "(vacuum/grain/ice), solved algebraically for f_ice "
                         "given an assumed porosity.",
            eps_eff_retrieval="DOCUMENTED PROXY (CPR-enhancement -> eps_eff, "
                              "monotonic decreasing) standing in for a trained "
                              "ML inversion network -- NOT a unique retrieval. "
                              "Flag this explicitly when presenting the number.",
            baseline_cpr_used=baseline_cpr,
        ),
    )


if __name__ == "__main__":
    from synth_dfsar import load_synthetic_scene
    from radar_processing import classify_terrain

    scene = load_synthetic_scene()
    label, legend = classify_terrain(scene["cpr"], scene["dop"], scene["slope_deg"])

    result = estimate_ice_volume(scene, label)
    print("Subsurface ice volume estimate (Birchak/CRIM mixing model, top 5 m):")
    for k, v in result.items():
        if k == "assumptions":
            print("  assumptions:")
            for ak, av in v.items():
                print(f"    {ak}: {av}")
        else:
            print(f"  {k}: {v}")
