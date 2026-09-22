<div align="center">

<img src="antigravity/public/lumina_logo.png" width="160" alt="Lumina Logo"/>

<br/>

<pre>
██╗     ██╗   ██╗███╗   ███╗██╗███╗   ██╗ █████╗
██║     ██║   ██║████╗ ████║██║████╗  ██║██╔══██╗
██║     ██║   ██║██╔████╔██║██║██╔██╗ ██║███████║
██║     ██║   ██║██║╚██╔╝██║██║██║╚██╗██║██╔══██║
███████╗╚██████╔╝██║ ╚═╝ ██║██║██║ ╚████║██║  ██║
╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
</pre>

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=1000&color=00C7FF&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=80&lines=Multi-Modal+Lunar+Image+Correspondence;Chandrayaan-2+%C2%B7+OHRC+%C2%B7+TMC+%C2%B7+IIRS+%C2%B7+DFSAR" alt="Typing SVG" /></a>

<br/>

### **LUMINA — Lunar Digital Twin · Mission Intelligence Platform**

*Next-generation multi-modal image correspondence, autonomous swarm navigation, explainable AI reasoning, and real-time spectroscopy — designed for the Moon.*

<br/>

[![SIH Qualified](https://img.shields.io/badge/🏆_SIH_2026-QUALIFIED-FFD700?style=for-the-badge&labelColor=1a1a2e)](https://www.sih.gov.in/)
[![3rd Rank](https://img.shields.io/badge/🥉_College_Rank-3rd_Place-CD7F32?style=for-the-badge&labelColor=1a1a2e)]()
[![BAH 2026](https://img.shields.io/badge/🚀_BAH_2026-ISRO_×_Hack2skill-FF6B35?style=for-the-badge&labelColor=1a1a2e)](https://hack2skill.com/)

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_LIVE_DEMO-Visit_Platform-00C7FF?style=for-the-badge&logoColor=white)](https://lumina-zeta-sand.vercel.app)
[![Mission Control](https://img.shields.io/badge/🛸_MISSION_CONTROL-Enter_Dashboard-6366F1?style=for-the-badge)](https://lumina-zeta-sand.vercel.app/mission-control)
[![ISRO](https://img.shields.io/badge/🇮🇳_ISRO-Chandrayaan_2_Research-FF6B35?style=for-the-badge)](https://www.isro.gov.in/)

<br/>

![GitHub last commit](https://img.shields.io/github/last-commit/saichintamani/Lumina-?color=00C7FF&style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/saichintamani/Lumina-?color=6366F1&style=flat-square)
![GitHub stars](https://img.shields.io/github/stars/saichintamani/Lumina-?color=FFD700&style=flat-square)
![GitHub forks](https://img.shields.io/github/forks/saichintamani/Lumina-?color=00C7FF&style=flat-square)
![GitHub license](https://img.shields.io/github/license/saichintamani/Lumina-?color=00FF88&style=flat-square)

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## 🏆 SIH Achievement — Bharatiya Antariksh Hackathon 2026

<div align="center">

<table>
<tr>
<td align="center" width="25%">

### 🎯 Problem Statement
**SIH26166**
<br/>
Multi-modal, Sun angle & scale invariant image correspondence

</td>
<td align="center" width="25%">

### 🏅 Status
**QUALIFIED**
<br/>
Smart India Hackathon — Intern Hackathon Round

</td>
<td align="center" width="25%">

### 🥉 Ranking
**3rd Place**
<br/>
Across all participating teams in the college

</td>
<td align="center" width="25%">

### 👥 Team
**LumaInit**
<br/>
Powered by ISRO & Hack2skill

</td>
</tr>
</table>

</div>

> **📋 Official Problem Statement:** *"Multi-modal, Sun angle and scale invariant image correspondence using Chandrayaan-2 optical images (OHRC, TMC and IIRS)."*
>
> Our solution **Lumina** addresses this challenge by building a complete end-to-end pipeline — from deep-learned feature matching (LoFTR) and DEM-based sun-angle normalization, to a production-grade **3D Lunar Mission Digital Twin** that visualizes co-registered multi-modal imagery in real-time.

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## 🌌 The Challenge

Chandrayaan-2 carries three optical instruments that image the lunar surface at **vastly different scales, spectral bands, and lighting conditions**:

<div align="center">

| Instrument | Resolution | Spectral Range | Challenge |
|:---:|:---:|:---:|:---:|
| **OHRC** (Orbiter High Resolution Camera) | **0.25 m/pixel** | Panchromatic | Ultra-high detail, narrow swath |
| **TMC** (Terrain Mapping Camera) | **5 m/pixel** | Panchromatic (stereo) | 20× scale gap from OHRC |
| **IIRS** (Imaging IR Spectrometer) | **80 m/pixel** | 0.8–5.0 μm (256 bands) | 320× scale gap, hyperspectral |

</div>

**The core problem:** How do you find corresponding points across a **320× scale difference**, across **different spectral bands** (panchromatic vs. hyperspectral), and across **different Sun illumination angles** that cast entirely different shadow patterns on the lunar surface?

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## 🧠 Our Solution — The Lumina Pipeline

```mermaid
flowchart LR
    subgraph INPUT["📡 Chandrayaan-2 Data Ingestion"]
        OHRC["🔬 OHRC\n0.25m/px"]
        TMC["🗺️ TMC\n5m/px"]
        IIRS["🌈 IIRS\n80m/px"]
        DEM["⛰️ TMC DEM\nElevation Model"]
    end

    subgraph PREPROCESS["⚙️ Pre-Processing"]
        NORM["☀️ Sun-Angle\nNormalization\n(DEM Ray-Tracing)"]
        SCALE["📐 Multi-Scale\nPyramid\nGeneration"]
        SPEC["🌈 Spectral\nBand\nExtraction"]
    end

    subgraph AI["🧠 AI Feature Matching"]
        LOFTR["🔗 LoFTR\nDetector-Free\nMatching"]
        SIFT["🔑 SIFT/SuperPoint\nKeypoint\nDetection"]
        RF["🌲 Random Forest\nIce Classification\n(CPR/DOP)"]
    end

    subgraph OUTPUT["📊 Outputs"]
        REG["✅ Co-Registered\nImage Stack"]
        TWIN["🌕 3D Digital\nTwin Dashboard"]
        ICE["🧊 Ice Probability\nMap"]
    end

    OHRC --> NORM
    TMC --> NORM
    IIRS --> SPEC
    DEM --> NORM
    NORM --> SCALE
    SPEC --> SCALE
    SCALE --> LOFTR
    SCALE --> SIFT
    LOFTR --> REG
    SIFT --> REG
    REG --> TWIN
    RF --> ICE
    ICE --> TWIN

    style INPUT fill:#0d1117,stroke:#00C7FF,color:#fff
    style PREPROCESS fill:#0d1117,stroke:#FFD700,color:#fff
    style AI fill:#0d1117,stroke:#6366F1,color:#fff
    style OUTPUT fill:#0d1117,stroke:#00FF88,color:#fff
```

### Key Technical Approaches

<table>
<tr>
<td width="50%">

#### 🔗 Scale-Invariant Feature Matching
We employ **LoFTR** (Local Feature Matching with Transformers) — a detector-free deep learning approach that uses self- and cross-attention to produce dense correspondences that survive the **20×–320× scale differences** between OHRC, TMC, and IIRS images.

</td>
<td width="50%">

#### ☀️ Sun-Angle Normalization via DEM
Lunar shadows shift drastically with the Sun angle. We use the **TMC Digital Elevation Model** to perform physics-based ray-tracing, simulating and normalizing illumination conditions *before* feature extraction — making the pipeline **Sun-angle invariant**.

</td>
</tr>
<tr>
<td width="50%">

#### 🧊 AI-Powered Ice Classification
Integrates synthetic **DFSAR polarimetry** (Circular Polarization Ratio & Degree of Polarization) with thermal constraints via **Random Forest** to predict sub-surface water-ice probability at permanently shadowed regions.

</td>
<td width="50%">

#### 🌕 3D Digital Twin Dashboard
A browser-native **WebGL Mission Control** built with Three.js + React Three Fiber — draping co-registered multi-modal data over a 3D DEM mesh, with real-time sun/shadow physics, autonomous rover swarms, and AI-powered telemetry.

</td>
</tr>
</table>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## 🚀 Tech Stack

<div align="center">

### Core Platform
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

### 3D & Visualization
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![React Three Fiber](https://img.shields.io/badge/R3F-FF6B6B?style=for-the-badge&logo=react&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![WebGL](https://img.shields.io/badge/WebGL-990000?style=for-the-badge&logo=webgl&logoColor=white)

### AI / ML Pipeline
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)

### Deployment & Data
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Kaggle](https://img.shields.io/badge/Kaggle-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## ✨ Platform Highlights

<table>
<tr>
<td width="50%">

### 🤖 Autonomous Boids Swarm
64 micro-rovers running **Craig Reynolds' Boids Algorithm** in real-time inside the browser — separation, alignment, cohesion — all rendered as `InstancedMesh` at 60 FPS via WebGL.

</td>
<td width="50%">

### 🧠 Explainable AI Orchestrator
The AI doesn't just act — it **explains itself**. When a Coronal Mass Ejection spikes thermal readings, the platform generates a structured reasoning card with Assumptions, Evidence, and Confidence Scores.

</td>
</tr>
<tr>
<td width="50%">

### ⏱️ Earth-Moon Latency Simulator
Physics-accurate **2.6-second round-trip delay** between Earth and the Moon. Commands are buffered with visual uplink/downlink progress bars before the rover executes them on the 3D surface.

</td>
<td width="50%">

### 🔬 Volumetric Spectroscopy
Simulated **X-Ray fluorescence spectrometer** — rendering sub-surface mineral composition (Mg, Fe, Ca, Al) from Chandrayaan-2 observations in real time.

</td>
</tr>
<tr>
<td width="50%">

### 🎬 Cinematic Engine
Fully scripted **camera choreography system** — transitions from orbital overview to crater surface to rover first-person with smooth, cinematic keyframe interpolation.

</td>
<td width="50%">

### 🎭 9-Stage Demo Mode
Built-in **Presentation Mode** guiding audiences through the full mission — from Introduction to AI Reasoning to Scenario Comparison — controllable with Prev/Next/Skip.

</td>
</tr>
</table>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## 📊 AI Pipeline & Datasets

The deep learning pipeline for scale-invariant multi-modal alignment is hosted entirely on **Kaggle** with GPU acceleration:

<div align="center">

[![Kaggle Notebook](https://img.shields.io/badge/📓_Kaggle_Notebook-ISRO_Lunar_LoFTR_Matching-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white)](https://www.kaggle.com/code/saichintamaniai/isro-lunar-surface-loftr-feature-matching)

[![Kaggle Dataset](https://img.shields.io/badge/📦_Kaggle_Dataset-ISRO_Lunar_Surface_Matching-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white)](https://www.kaggle.com/datasets/saichintamaniai/isro-lunar-surface-matching)

</div>

| Resource | Description | Link |
|:---|:---|:---:|
| 📓 **AI Pipeline Notebook** | PyTorch-based LoFTR for detector-free scale-invariant matching + RF Ice Classification | [Open on Kaggle →](https://www.kaggle.com/code/saichintamaniai/isro-lunar-surface-loftr-feature-matching) |
| 📦 **Lunar Dataset** | Multi-modal Chandrayaan-2 imagery (OHRC, TMC, IIRS) for training and evaluation | [Open on Kaggle →](https://www.kaggle.com/datasets/saichintamaniai/isro-lunar-surface-matching) |
| 🌐 **Live Platform** | Production deployment of the 3D Digital Twin Mission Control | [Open on Vercel →](https://lumina-zeta-sand.vercel.app) |
| 🐙 **Source Code** | Full repository with pipeline code, dashboard, and research documentation | [Open on GitHub →](https://github.com/saichintamani/Lumina-) |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## 🌐 Live Deployment

<div align="center">

### 🌟 Experience the Lumina Digital Twin Live

| Page | URL | Description |
|:---:|:---:|:---|
| 🚀 **Landing** | [lumina-zeta-sand.vercel.app](https://lumina-zeta-sand.vercel.app) | Scroll-driven narrative introduction |
| 🛸 **Mission Control** | [/mission-control](https://lumina-zeta-sand.vercel.app/mission-control) | Real-time 3D dashboard with rover swarms |
| 🔬 **Science Lab** | [/science](https://lumina-zeta-sand.vercel.app/science) | Spectroscopy & mineral analysis workspace |
| ⚙️ **Operations** | [/operations](https://lumina-zeta-sand.vercel.app/operations) | Command palette & workflow engine |

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph CLIENT["🌐 Browser Client — Next.js 16 App Router"]
        LP["🚀 Landing Page<br/>Scroll-Driven Narrative"]
        MC["🛸 Mission Control<br/>Real-Time Dashboard"]
        SCI["🔬 Science Workspace<br/>Spectroscopy Panel"]
        OPS["⚙️ Operations Hub<br/>Command Engine"]
    end

    subgraph RENDER["🎮 WebGL Rendering Layer — React Three Fiber"]
        DT["🌕 Digital Twin<br/>InstancedMesh + ShaderMaterial"]
        SWARM["🤖 Boids Swarm Engine<br/>64 Autonomous Micro-Rovers"]
        DUST["🌫️ Lunar Dust Engine<br/>GPU Particle System"]
        NAVCAM["📸 NavCam First-Person<br/>CV HUD Overlay"]
    end

    subgraph AI["🧠 AI Intelligence Layer"]
        ORCH["🎯 AI Orchestrator<br/>Threshold Monitor"]
        EXPL["💡 Explanation Cards<br/>Assumptions + Confidence"]
        LATENCY["⏱️ Latency Simulator<br/>2.6s Earth-Moon Delay"]
        CINE["🎬 Cinematic Engine<br/>Camera Choreography"]
    end

    subgraph STATE["⚡ State Architecture — Zustand"]
        TELEM["📡 Telemetry Store<br/>Battery / Thermal / Solar"]
        MEM["🧩 Mission Memory<br/>Persistent Event Log"]
        PRES["🎭 Presentation Store<br/>9-Stage Demo Mode"]
        SCENARIO["🌪️ Scenario Manager<br/>Solar Flare / CME Events"]
    end

    LP --> MC
    MC --> DT
    MC --> SWARM
    MC --> NAVCAM
    DT --> DUST
    SWARM --> |Boids Algorithm| DT
    ORCH --> EXPL
    ORCH --> TELEM
    TELEM --> DT
    CINE --> MC
    PRES --> MC
    SCENARIO --> TELEM
    LATENCY --> NAVCAM
    MEM --> |Time-Travel Replay| MC

    style CLIENT fill:#0d1117,stroke:#00C7FF,color:#fff
    style RENDER fill:#0d1117,stroke:#6366F1,color:#fff
    style AI fill:#0d1117,stroke:#FF6B35,color:#fff
    style STATE fill:#0d1117,stroke:#FFD700,color:#fff
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## 🗂️ Repository Structure

```
Lumina-/
├── 📁 antigravity/                    # 🌕 Next.js 16 Dashboard (Production)
│   ├── src/
│   │   ├── app/                       # App Router pages
│   │   │   ├── page.tsx               # 🚀 Scroll-driven landing
│   │   │   ├── mission-control/       # 🛸 3D Mission Control
│   │   │   ├── science/               # 🔬 Spectroscopy workspace
│   │   │   └── operations/            # ⚙️ Operations hub
│   │   ├── components/
│   │   │   ├── visualization/         # 🌕 DigitalTwin, RoverSwarm, MoonScene
│   │   │   ├── intelligence/          # 🧠 AIOrchestrator, ExplanationCard
│   │   │   ├── effects/               # 📸 NavCam HUD, Latency, Glitch FX
│   │   │   └── presentation/          # 🎭 DemonstrationMode
│   │   └── lib/
│   │       ├── physics/               # ⚛️ Boids algorithm engine
│   │       ├── memory/                # 🧩 Telemetry, Mission Memory, Scenarios
│   │       └── audio/                 # 🔊 Web Audio synthesis
│   └── public/                        # Static assets (textures, logo)
│
├── 📁 src/                            # 🐍 Python CV Pipeline
│   ├── image_registration.py          # SIFT/LoFTR feature extraction
│   ├── ml_ice_classification.py       # Random Forest ice classifier
│   ├── data_pipeline.py               # Data ingestion & preprocessing
│   └── make_figures.py                # Generate analysis figures
│
├── 📁 kaggle_notebook/                # 📓 Kaggle AI Notebook
│   └── isro-lunar-loftr-matching.ipynb
│
├── 📁 kaggle_dataset/                 # 📦 Kaggle Dataset Config
│   ├── dataset-metadata.json
│   └── processed/                     # Processed imagery
│
├── 📁 figures/                        # 📊 Generated Analysis Figures
│   ├── fig01_sun_angle_normalization.png
│   ├── fig02_scale_invariant_matching.png
│   ├── fig09_architecture.png
│   └── ... (10 scientific figures)
│
├── 📁 docs/                           # 📄 Strategy & Submission Decks
│   ├── BAH2026_Strategy_Guide.pdf
│   └── BAH2026_Submission_Deck.pptx
│
├── 📁 MoonRef/                        # 🌕 3D Moon Visualizer (Three.js)
│   └── index.html                     # Standalone lunar globe
│
└── README.md                          # 📖 This file
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## ⚡ Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/saichintamani/Lumina-.git
cd Lumina-

# 2. Launch the 3D Dashboard
cd antigravity
npm install
npm run dev
# → Open http://localhost:3000

# 3. Run the Python CV Pipeline (optional)
pip install numpy scipy matplotlib rasterio
cd src
python make_figures.py
python make_architecture_diagram.py
```

> 💡 **Pro Tip**: Press `Ctrl+K` inside Mission Control to open the **Command Palette** — trigger Solar Flares, deploy the Rover Swarm, toggle NavCam, or activate Demo Mode.

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## 🌍 Scientific Foundation

| Data Source | Instrument | Parameter | Usage |
|:---|:---|:---|:---|
| Chandrayaan-2 | DFSAR (Dual-frequency SAR) | Sub-surface ice detection | Ice probability mapping |
| Chandrayaan-2 | OHRC (0.25m/px) | High-res panchromatic | Feature matching anchor |
| Chandrayaan-2 | TMC (5m/px, stereo) | DEM + surface mapping | Sun-angle normalization |
| Chandrayaan-2 | IIRS (80m/px, 256 bands) | Hyperspectral imaging | Mineral spectroscopy |
| Chandrayaan-2 | CLASS (X-ray spectrometer) | Elemental composition | Terrain classification |
| LRO | LOLA (Laser Altimeter) | Crater elevation model | 3D mesh generation |
| ISRO PRADAN | Polar Region Analysis | Thermal excursion data | PSR identification |

**Primary Mission Target:** Faustini Crater (−85.46°S, 30.12°E) — Lunar South Pole

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## 📚 References & Resources

<div align="center">

| Resource | Type | Link |
|:---|:---:|:---:|
| 🏆 Smart India Hackathon | Competition | [sih.gov.in](https://www.sih.gov.in/) |
| 🚀 ISRO Official | Organization | [isro.gov.in](https://www.isro.gov.in/) |
| 🤝 Hack2skill | Platform | [hack2skill.com](https://hack2skill.com/) |
| 📓 Kaggle AI Notebook | Notebook | [Lunar LoFTR Matching](https://www.kaggle.com/code/saichintamaniai/isro-lunar-surface-loftr-feature-matching) |
| 📦 Kaggle Dataset | Dataset | [Lunar Surface Matching](https://www.kaggle.com/datasets/saichintamaniai/isro-lunar-surface-matching) |
| 🌐 Live Platform | Deployment | [lumina-zeta-sand.vercel.app](https://lumina-zeta-sand.vercel.app) |
| 🐙 Source Code | Repository | [saichintamani/Lumina-](https://github.com/saichintamani/Lumina-) |

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

## 🏆 Recognition

<div align="center">

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🏆  SMART INDIA HACKATHON (BAH 2026)  —  QUALIFIED        ║
║   🥉  SECURED 3RD RANK ACROSS THE COLLEGE                   ║
║                                                              ║
║   Problem Statement : SIH26166                               ║
║   Organization      : ISRO × Hack2skill                     ║
║   Team              : LumaInit                               ║
║   Challenge         : Multi-Modal Lunar Image                ║
║                       Correspondence                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

Built for the **Bharatiya Antariksh Hackathon 2026** — advancing autonomous lunar exploration at the South Polar Region, inspired by **Chandrayaan-2** and the scientific groundwork laid for future crewed Moon missions.

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" alt="separator"/>

<div align="center">

### Built with ❤️ for the Moon

**[🌐 Live Platform](https://lumina-zeta-sand.vercel.app) · [🛸 Mission Control](https://lumina-zeta-sand.vercel.app/mission-control) · [📓 Kaggle Notebook](https://www.kaggle.com/code/saichintamaniai/isro-lunar-surface-loftr-feature-matching) · [🐙 GitHub](https://github.com/saichintamani/Lumina-)**

<br/>

*"Ad astra per aspera — through hardships to the stars."*

<br/>

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=saichintamani.Lumina-)

*Developed for the Smart India Hackathon 2026, powered by ISRO & Hack2skill. Represented by Team LumaInit.*

</div>
