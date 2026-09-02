# Smart India Hackathon: Multi-Modal Image Correspondence

*Lumina represented by LumaInit*
**Official Problem Statement Alignment:** Multi-modal, Sun angle and scale invariant image correspondence using Chandrayaan-2 optical images (OHRC, TMC and IIRS).
**PS Number:** SIH26166

## Overview
The goal of this project is to create an advanced computer vision pipeline and an interactive 3D Mission Control Dashboard capable of co-registering vastly different optical products from Chandrayaan-2.

The challenge lies in matching images across extreme scale differences (OHRC at 0.25m/pixel vs TMC at 5m/pixel vs IIRS at 80m/pixel), across different spectral bands (Multi-modal), and across different lighting conditions (Sun angle invariance).

## Key Objectives Achieved

### 1. Scale-Invariant Feature Matching
We utilize advanced computer vision algorithms (such as SIFT or deep-learned LoFTR) to extract robust tie-points that survive the 20x scale difference between OHRC and TMC images.

### 2. Sun Angle Normalization via DEM Ray-Tracing
Shadows on the lunar surface change drastically depending on the sun angle. We use the TMC Digital Elevation Model (DEM) to simulate and normalize lighting conditions, reducing sun-angle variance before attempting feature matching.

## Architecture & Mission Control Dashboard (Lumina v3)
We built a highly advanced, browser-based **3D Multi-Modal Fusion Viewer** to visualize the co-registered data.

### 🌟 Vercel Live Deployment
**Access the fully functional Digital Twin live here:**
👉 [https://lumina-zeta-sand.vercel.app](https://lumina-zeta-sand.vercel.app)

### ✨ Features:
- **WebGL 3D Interactive Simulation:** A fully coded Three.js simulation draping TMC, OHRC, and IIRS data over a 3D DEM mesh of the lunar surface at Faustini Crater.
- **Interactive Sun & Shadow Physics Simulator:** Real-time raycasting dynamically casts accurate shadows over the 3D terrain, calculating rover temperature and battery drain to simulate survival constraints based on the sun-angle.
- **AI-Powered Ice Classification & Spectroscopy:** Integrates synthetic DFSAR polarimetry (CPR/DOP) with thermal constraints via Random Forest to predict sub-surface ice probability.
- **Real-Time Telemetry Interface:** Displays live image registration metrics like Inlier Ratio, Reprojection Error, and robotic swarm operations.

## 🧠 AI Pipeline & Data Sets
To solve the scale-invariance and multi-modal alignment challenges, we developed a powerful Deep Learning pipeline hosted entirely on Kaggle. 

*   **Kaggle AI Pipeline (Notebook):** [ISRO Lunar Surface LoFTR Feature Matching](https://www.kaggle.com/code/saichintamaniai/isro-lunar-surface-loftr-feature-matching) (Implements PyTorch-based LoFTR for detector-free scale-invariant matching and RF Ice Classification).
*   **Kaggle Lunar Dataset:** [ISRO Lunar Surface Matching Dataset](https://www.kaggle.com/datasets/saichintamaniai/isro-lunar-surface-matching)
*   **GitHub Reference:** [saichintamani/Lumina-](https://github.com/saichintamani/Lumina-)

## How to Run the Dashboard Locally
1. Ensure you have Node.js installed.
2. Clone this repository.
3. Navigate to the `antigravity` folder:
   ```bash
   cd antigravity
   npm install
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

To run the offline python pipeline and generate architectural figures:
```bash
pip install numpy matplotlib
cd src
python make_figures.py
python make_architecture_diagram.py
```

---
*Developed for the Smart India Hackathon, powered by ISRO & Hack2skill. Represented by LumaInit.*
