# Bharatiya Antariksh Hackathon 2026: Subsurface Ice Detection & Traverse Planning

**Official Problem Statement Alignment:** Detection and Characterization of Subsurface Ice in Lunar South Polar Regions Using Chandrayaan-2 Radar and Imagery Data for Landing Site and Rover Traverse Planning.

## Overview
The discovery and characterization of water-ice in the lunar South Polar Region is a high-priority scientific and exploration objective. Observations from Chandrayaan-2 have opened new avenues to probe surface/subsurface using high-resolution optical and radar datasets.

This project specifically targets the **Faustini Permanently Shadowed Region (PSR)**, with a deep focus on a **"Doubly Shadowed Crater with Lobate-Rim"**. These doubly shadowed regions (DSRs) provide access to some of the coldest environments on the Moon that are ideal candidates for long-term volatile preservation.

## Key Objectives Achieved

### 1. Subsurface Ice Detection
We utilize Chandrayaan-2 L-band and S-band Dual-Frequency Synthetic Aperture Radar (DFSAR) parameters to detect subsurface ice unambiguously. 
- **Methodology:** We leverage the Circular Polarization Ratio (CPR) and Degree of Polarization (DOP) criterion. High CPR and low DOP values within the Faustini PSR indicate a high likelihood of water-ice deposits rather than merely surface roughness.
- **Machine Learning Integration:** We deployed a Random Forest Classifier trained on these specific DFSAR polarimetric parameters, alongside thermal thresholds, yielding high confidence predictions for subsurface ice beneath the crater floor.

### 2. Optimal Rover Traverse Planning
Identifying ice is only the first challenge; translating these detections into actionable exploration strategies is the key objective of this hackathon.
- **A* Pathfinding Algorithm:** We simulated an optimal and safe rover traverse path traversing the lunar terrain to access the doubly shadowed crater.
- **Constraints Mapped:** The path heavily considers terrain hazards (avoiding slopes > 5°) and solar power constraints (maintaining > 70% illumination during traverse corridors).

## Architecture & Mission Control Dashboard
We built a highly advanced, browser-based **Mission Control Dashboard** (UI/UX Pro Max) to visualize the data.

### Features:
- **WebGL 3D Interactive Simulation:** A fully coded Three.js simulation of the Faustini region, featuring a live-animated **3D Rover traversing the optimal path** towards the doubly shadowed crater.
- **Real-Time Telemetry Inference:** Live machine learning probability updates using the Random Forest algorithm based on simulated Chandrayaan-2 DFSAR readings.
- **Scientific Analysis Report:** Embedded deep-dive charts showing illumination models, CPR-DOP scatter spaces, terrain classification, and ice volume bootstrap estimates.

## How to Run the Dashboard Locally
1. Ensure you have Python installed.
2. Clone this repository.
3. Start the local server:
   ```bash
   python -m http.server 8000 --directory frontend
   ```
4. Open your browser and navigate to `http://localhost:8000`.

---
*Developed for the Bharatiya Antariksh Hackathon 2026, powered by ISRO & Hack2skill.*
