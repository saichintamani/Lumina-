"""
mission_planning.py
====================
Landing site selection and rover traverse planning, built on top of the
terrain classification from radar_processing.py.

Landing site criteria (mirrors ISRO's own template image in the problem
statement: low slope <5 deg, hazard-free, illumination >70%, near a
high-dielectric/ice-bearing target, within comm visibility):

    1. Slope            <= 5 deg          (lander stability)
    2. Hazard-free       no boulders/craters in footprint (proxied here by
                          local roughness/slope variance)
    3. Illumination      >= 70% of local day (solar power for lander/rover)
    4. Proximity          close enough to the doubly-shadowed ice target
                          for a traversable rover range (we use <= 1.5 km
                          straight-line as a soft constraint, configurable)
    5. Comm visibility    simplified here as "not inside a deep PSR" (a
                          real implementation would do line-of-sight raycasting
                          against the DEM to an orbital relay or Earth direction;
                          documented as a known simplification below)

Chandrayaan-3 Pragyan Rover traverse planning:
    A* search over an 8-connected grid, with edge cost combining:
        - distance (meters)
        - slope penalty (quadratic above a comfort threshold; near-infinite
          above a rover capability limit, making that path effectively
          forbidden)
        - illumination penalty (favor sunlit cells for solar charging;
          this also naturally steers the path to skirt the PSR rather than
          cut straight through it, which is the physically correct choice
          since the rover cannot operate on its own panels inside the PSR)
    The traverse necessarily DIPS into the shadowed crater interior only
    near the final approach to the ice target, where it should switch to
    battery/RTG-reserve power for a short sortie -- call this out explicitly
    in your slides, it shows operational thinking beyond "shortest path."
"""

import heapq
import numpy as np


def score_landing_candidates(scene, label, target_yx, n_candidates=400,
                              max_slope_deg=5.0, min_illum=0.70,
                              max_range_m=1500.0, seed=7):
    """
    Randomly samples candidate landing pixels outside the doubly-shadowed
    zone, scores them against the 5 criteria above, and returns a ranked
    list of the top candidates plus the single best site.

    Returns: list of dicts, sorted best-first, each with keys:
        yx, lat-like (row,col), slope_deg, illum_frac, dist_to_target_m,
        roughness_proxy, pass_all, score
    """
    rng = np.random.default_rng(seed)
    ny, nx = scene["slope_deg"].shape
    pixel_size_m = scene["meta"]["pixel_size_m"]
    ty, tx = target_yx

    candidates = []
    tries = 0
    while len(candidates) < n_candidates and tries < n_candidates * 50:
        tries += 1
        y = rng.integers(0, ny)
        x = rng.integers(0, nx)
        if scene["doubly_shadowed"][y, x]:
            continue  # never land inside the PSR target itself

        slope = float(scene["slope_deg"][y, x])
        illum = float(scene["illum_frac"][y, x])
        dist_m = float(np.hypot(y - ty, x - tx) * pixel_size_m)

        # local roughness proxy: std of slope in a 5x5 neighborhood
        y0, y1 = max(0, y - 2), min(ny, y + 3)
        x0, x1 = max(0, x - 2), min(nx, x + 3)
        roughness = float(np.std(scene["slope_deg"][y0:y1, x0:x1]))

        pass_slope = slope <= max_slope_deg
        pass_illum = illum >= min_illum
        pass_range = dist_m <= max_range_m
        pass_hazard = roughness <= 6.0
        pass_all = pass_slope and pass_illum and pass_range and pass_hazard

        # composite score (lower is better): weighted penalty
        score = (
            2.0 * max(0, slope - max_slope_deg)
            + 3.0 * max(0, min_illum - illum) * 100
            + 0.01 * dist_m
            + 1.5 * roughness
        )

        candidates.append(dict(
            y=y, x=x, slope_deg=slope, illum_frac=illum,
            dist_to_target_m=dist_m, roughness_proxy=roughness,
            pass_slope=pass_slope, pass_illum=pass_illum,
            pass_range=pass_range, pass_hazard=pass_hazard,
            pass_all=pass_all, score=score,
        ))

    candidates.sort(key=lambda c: (not c["pass_all"], c["score"]))
    return candidates


def _edge_cost(slope_deg, illum_frac, step_m,
               slope_comfort_deg=10.0, slope_limit_deg=25.0):
    """Cost of moving INTO a cell with the given slope/illumination."""
    if slope_deg >= slope_limit_deg:
        return np.inf  # rover cannot climb this -- hard exclusion
    slope_pen = max(0.0, slope_deg - slope_comfort_deg) ** 2 * 0.05
    illum_pen = (1.0 - illum_frac) * 3.0  # favor sunlit cells
    return step_m * (1.0 + slope_pen + illum_pen)


def plan_rover_traverse(scene, start_yx, goal_yx,
                         slope_comfort_deg=10.0, slope_limit_deg=25.0,
                         auto_relax=True):
    """
    A* path planning from a landing site (start_yx) to the ice target
    (goal_yx) on the (ny, nx) grid, 8-connected, using slope and
    illumination-aware edge costs.

    If `auto_relax` is True and no path exists at `slope_limit_deg` (this
    happens when the only way to a crater-floor target crosses a steep rim
    segment), the planner retries with progressively larger slope limits,
    up to a hard ceiling of 35 deg, and reports which limit was actually
    required. This mirrors a real mission-planning conversation: "can the
    Pragyan rover's wheel/suspension design handle the steepest rim crossing on
    this specific route, or do we need a different approach azimuth?" --
    report the REQUIRED limit in your deck rather than silently picking a
    number that happens to work.

    Returns: dict with keys
        path_yx, path_len_m, max_slope_on_path_deg, mean_illum_on_path,
        reachable, slope_limit_used_deg
    """
    slope = scene["slope_deg"]
    illum = scene["illum_frac"]
    ny, nx = slope.shape
    pixel_size_m = scene["meta"]["pixel_size_m"]

    neighbors = [(-1, 0, 1.0), (1, 0, 1.0), (0, -1, 1.0), (0, 1, 1.0),
                 (-1, -1, 1.41421356), (-1, 1, 1.41421356),
                 (1, -1, 1.41421356), (1, 1, 1.41421356)]

    candidate_limits = [slope_limit_deg]
    if auto_relax:
        candidate_limits += [28.0, 32.0]

    for trial_limit in candidate_limits:
        def heuristic(y, x):
            return np.hypot(y - goal_yx[0], x - goal_yx[1]) * pixel_size_m

        start = tuple(start_yx)
        goal = tuple(goal_yx)

        open_heap = [(heuristic(*start), 0.0, start)]
        came_from = {}
        g_score = {start: 0.0}
        visited = set()

        while open_heap:
            _, g, current = heapq.heappop(open_heap)
            if current in visited:
                continue
            visited.add(current)
            if current == goal:
                break
            cy, cx = current
            for dy, dx, mult in neighbors:
                ny_, nx_ = cy + dy, cx + dx
                if not (0 <= ny_ < ny and 0 <= nx_ < nx):
                    continue
                step_m = pixel_size_m * mult
                cost = _edge_cost(
                    float(slope[ny_, nx_]), float(illum[ny_, nx_]), step_m,
                    slope_comfort_deg=slope_comfort_deg,
                    slope_limit_deg=trial_limit,
                )
                if not np.isfinite(cost):
                    continue
                tentative_g = g + cost
                neighbor = (ny_, nx_)
                if tentative_g < g_score.get(neighbor, np.inf):
                    g_score[neighbor] = tentative_g
                    came_from[neighbor] = current
                    f = tentative_g + heuristic(ny_, nx_)
                    heapq.heappush(open_heap, (f, tentative_g, neighbor))

        if goal in came_from or goal == start:
            path = [goal]
            cur = goal
            while cur != start:
                cur = came_from[cur]
                path.append(cur)
            path.reverse()

            path_arr = np.array(path)
            seg_dists = np.hypot(np.diff(path_arr[:, 0]), np.diff(path_arr[:, 1])) * pixel_size_m
            slopes_on_path = slope[path_arr[:, 0], path_arr[:, 1]]
            illum_on_path = illum[path_arr[:, 0], path_arr[:, 1]]

            return dict(
                path_yx=path,
                path_len_m=float(seg_dists.sum()),
                max_slope_on_path_deg=float(slopes_on_path.max()),
                mean_illum_on_path=float(illum_on_path.mean()),
                reachable=True,
                slope_limit_used_deg=trial_limit,
            )

    return dict(path_yx=[], path_len_m=np.inf, max_slope_on_path_deg=np.nan,
                mean_illum_on_path=np.nan, reachable=False,
                slope_limit_used_deg=None)


def find_safe_approach_point(scene, target_yx, search_radius_px=120,
                              slope_weight_m_per_deg=60.0,
                              max_acceptable_slope_deg=20.0):
    """
    The rover should not attempt to drive its full chassis into the deepest,
    steepest part of a doubly-shadowed crater interior -- besides the path
    risk, it would lose solar power entirely. The realistic operational
    target for the LAST safe traverse waypoint is a point on the boundary
    of the doubly-shadowed mask that is BOTH reasonably close to the ice
    target AND sits on a comparatively gentle stretch of the rim/wall,
    rather than the single geometrically-nearest boundary pixel (which may
    sit in a locally rugged, fractured part of the rim that is not
    actually crossable by a wheeled rover).

    We score each boundary candidate by:
        cost = distance_m + slope_weight_m_per_deg * local_mean_slope_deg
    i.e. we are willing to walk significantly farther around the rim to
    find a gentler crossing -- exactly the trade-off a real traverse
    planner makes (and exactly the kind of azimuth-selection reasoning a
    judge wants to see argued explicitly, not just asserted).

    If the best candidate found still exceeds `max_acceptable_slope_deg`,
    that is reported honestly rather than silently accepted -- in that
    case the deck should say so and propose alternative approach azimuths
    or a wider search, rather than presenting an unrealistic crossing as
    safe.

    From the selected point, a short battery-powered sortie or instrument
    arm/boom covers the final stretch to the ice-bearing patch itself
    (reported separately, not driven by the rover chassis).
    """
    ny, nx = scene["slope_deg"].shape
    ty, tx = target_yx
    slope = scene["slope_deg"]
    ds = scene["doubly_shadowed"]

    y0, y1 = max(0, ty - search_radius_px), min(ny, ty + search_radius_px)
    x0, x1 = max(0, tx - search_radius_px), min(nx, tx + search_radius_px)

    boundary = []
    for y in range(y0, y1):
        for x in range(x0, x1):
            if not ds[y, x]:
                continue
            neigh = ds[max(0, y - 1):y + 2, max(0, x - 1):x + 2]
            if neigh.size and not neigh.all():
                boundary.append((y, x))

    if not boundary:
        return target_yx, None

    scored = []
    for (y, x) in boundary:
        dist_m = float(np.hypot(y - ty, x - tx)) * scene["meta"]["pixel_size_m"]
        yy0, yy1 = max(0, y - 3), min(ny, y + 4)
        xx0, xx1 = max(0, x - 3), min(nx, x + 4)
        local_slope = float(np.mean(slope[yy0:yy1, xx0:xx1]))
        cost = dist_m + slope_weight_m_per_deg * local_slope
        scored.append((cost, local_slope, y, x))

    scored.sort(key=lambda t: t[0])
    best_cost, best_slope, by, bx = scored[0]

    achieved_acceptable = best_slope <= max_acceptable_slope_deg
    return (int(by), int(bx)), dict(
        local_slope_deg=best_slope,
        meets_target=achieved_acceptable,
    )


if __name__ == "__main__":
    from synth_dfsar import load_synthetic_scene
    from radar_processing import classify_terrain

    scene = load_synthetic_scene()
    label, legend = classify_terrain(scene["cpr"], scene["dop"], scene["slope_deg"])

    ice_ys, ice_xs = np.where(label == 3)
    if len(ice_ys) == 0:
        target_yx = (scene["meta"]["ny"] // 2, scene["meta"]["nx"] // 2)
    else:
        target_yx = (int(np.mean(ice_ys)), int(np.mean(ice_xs)))
    print(f"Ice target centroid (row,col): {target_yx}")

    approach_yx, approach_info = find_safe_approach_point(scene, target_yx)
    final_sortie_m = float(np.hypot(approach_yx[0] - target_yx[0],
                                     approach_yx[1] - target_yx[1])
                            * scene["meta"]["pixel_size_m"])
    print(f"Safe rim-edge approach point (row,col): {approach_yx}")
    print(f"Approach point local mean slope: {approach_info['local_slope_deg']:.2f} deg "
          f"(meets <=20deg target: {approach_info['meets_target']})")
    print(f"Final battery-powered sortie distance: {final_sortie_m:.1f} m")

    candidates = score_landing_candidates(scene, label, approach_yx)
    best = candidates[0]
    print("\nBest landing site candidate:")
    for k, v in best.items():
        print(f"  {k}: {v}")

    start_yx = (best["y"], best["x"])
    result = plan_rover_traverse(scene, start_yx, approach_yx)
    print(f"\nTraverse (landing site -> rim approach point) reachable: {result['reachable']}")
    print(f"Path length: {result['path_len_m']:.1f} m")
    print(f"Max slope on path: {result['max_slope_on_path_deg']:.2f} deg")
    print(f"Mean illumination on path: {result['mean_illum_on_path']:.2f}")
    print(f"Path has {len(result['path_yx'])} waypoints")
    print(f"\nTotal mission range (drive + final sortie): "
          f"{result['path_len_m'] + final_sortie_m:.1f} m")
