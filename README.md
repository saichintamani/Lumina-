# Chandrayaan-3 DFSAR & Lunar Ice Mapping

This is the hackathon-winning repository for Lunar Ice Volume mapping and Pragyan Rover mission planning, using simulated Dual Frequency Synthetic Aperture Radar (DFSAR) data over the **Chandrayaan-3 Shiv Shakti Point** landing site.

## Architecture & Features
- **Data Integration (`src/space_data_integration.py`)**: Real-time mock ingestion of lunar conditions inspired by *CosmosChronicle*.
- **Radar Processing (`src/radar_processing.py`)**: Advanced polarimetric radar analysis adhering to NASA PDS and ISRO ISSDC standards. Identifies high-confidence ice regions.
- **Ice Volume Estimation (`src/ice_volume.py`)**: Employs the Birchak/CRIM dielectric mixing model to estimate subsurface ice volume.
- **Mission Planning (`src/mission_planning.py`)**: A* pathfinding and rim-crossing algorithms for the Pragyan rover to safely approach doubly-shadowed craters.
- **3D Visualization (`figures/make_3d_animation.py`)**: Plotly-based interactive 3D rendering of the crater and ice deposits.
- **UI/UX Dashboard (`frontend/`)**: A *Pro-Max* styled dark-mode operations dashboard to present findings.

## Quickstart
1. Generate the 3D visualization:
   ```bash
   python figures/make_3d_animation.py
   ```
2. Open the Mission Control Dashboard:
   - Double-click `frontend/index.html` in your web browser.

## Strategic Impact
Our approach explicitly rejects simple CPR>1 proxy metrics, relying instead on a rigorous two-parameter (CPR + DOP) constraint verified against terrain steepness. The modularity of the pipeline ensures rapid ingestion of real ISRO .img/.tif DFSAR products.
