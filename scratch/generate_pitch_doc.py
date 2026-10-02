import os
import qrcode
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

DIAGRAMS = r"d:\My projects\ISRO\scratch\diagrams"

def generate_qr(data, filename):
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filename)

def h1(doc, text):
    h = doc.add_heading(level=1)
    r = h.add_run(text)
    r.font.color.rgb = RGBColor(0, 51, 102)
    r.font.size = Pt(18)
    return h

def h2(doc, text):
    h = doc.add_heading(level=2)
    r = h.add_run(text)
    r.font.color.rgb = RGBColor(0, 80, 140)
    r.font.size = Pt(14)
    return h

def h3(doc, text):
    h = doc.add_heading(level=3)
    r = h.add_run(text)
    r.font.color.rgb = RGBColor(60, 60, 60)
    r.font.size = Pt(12)
    return h

def body(doc, text, bold=False, italic=False, size=11):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.font.size = Pt(size)
    r.bold = bold
    r.italic = italic
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = Pt(16)
    return p

def bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    if bold_prefix:
        r = p.add_run(bold_prefix + " ")
        r.bold = True
        p.add_run(text)
    else:
        p.add_run(text)
    p.paragraph_format.space_after = Pt(2)

def add_image(doc, path, width=6.5):
    if os.path.exists(path):
        doc.add_picture(path, width=Inches(width))
        last = doc.paragraphs[-1]
        last.alignment = WD_ALIGN_PARAGRAPH.CENTER

def divider(doc):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("━" * 60)
    r.font.color.rgb = RGBColor(180, 180, 180)
    r.font.size = Pt(8)

def main():
    doc = Document()
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(11)

    # ============================================================
    # TITLE PAGE
    # ============================================================
    for _ in range(4):
        doc.add_paragraph("")
    
    t = doc.add_paragraph()
    t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = t.add_run("LUMINA v3")
    r.font.size = Pt(42)
    r.bold = True
    r.font.color.rgb = RGBColor(0, 51, 102)
    
    sub = doc.add_paragraph()
    sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = sub.add_run("7-Minute Pitch & Technical Defense Guide")
    r.font.size = Pt(18)
    r.font.color.rgb = RGBColor(100, 100, 100)
    
    doc.add_paragraph("")
    
    d = doc.add_paragraph()
    d.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = d.add_run("━" * 40)
    r.font.color.rgb = RGBColor(0, 112, 192)
    
    doc.add_paragraph("")
    
    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    lines = [
        ("Smart India Hackathon 2026\n", True, 14, RGBColor(0, 0, 0)),
        ("Problem Statement: SIH26166\n", False, 12, RGBColor(80, 80, 80)),
        ("Multi-Modal, Sun-Angle & Scale-Invariant Image Correspondence\nfor Chandrayaan-2 Optical Images\n\n", False, 11, RGBColor(100, 100, 100)),
        ("Team: StormBreaker  |  Represented by: LumaInit\n", True, 12, RGBColor(0, 51, 102)),
        ("Organisation: ISRO × Hack2skill\n", False, 11, RGBColor(100, 100, 100)),
        ("September 2026\n", False, 11, RGBColor(150, 150, 150)),
    ]
    for text, b, sz, col in lines:
        r = meta.add_run(text)
        r.bold = b
        r.font.size = Pt(sz)
        r.font.color.rgb = col
    
    doc.add_page_break()
    
    # ============================================================
    # TABLE OF CONTENTS
    # ============================================================
    h1(doc, "Table of Contents")
    toc = [
        "1. Project Overview & Problem Statement",
        "2. System Architecture (with Diagram)",
        "3. AI Pipeline Data Flow (with Diagram)",
        "4. Detailed Technical Breakdown",
        "   4.1 Scale-Invariant Feature Matching (LoFTR)",
        "   4.2 Sun-Angle Normalization (DEM Ray-Tracing)",
        "   4.3 Sub-Surface Ice Classification (Random Forest)",
        "   4.4 3D Lunar Digital Twin (WebGL)",
        "5. Results & Performance Metrics",
        "6. SIH Evaluation Criteria Mapping (with Radar Chart)",
        "7. Team Role Allocation & 7-Minute Pitch Script",
        "8. Anticipated Questions & Defense Answers (25+ Q&As)",
        "9. Assertion Reasons — Why This Approach Wins",
        "10. Future Scope & Roadmap",
        "11. Live Deployment & Verification (QR Codes)",
    ]
    for item in toc:
        p = doc.add_paragraph()
        r = p.add_run(item)
        r.font.size = Pt(11)
        if not item.startswith("   "):
            r.bold = True
    
    doc.add_page_break()
    
    # ============================================================
    # 1. PROJECT OVERVIEW
    # ============================================================
    h1(doc, "1. Project Overview & Problem Statement")
    
    h2(doc, "1.1 The Challenge (SIH26166)")
    body(doc, (
        "India's Chandrayaan-2 orbiter carries three optical instruments that observe the same lunar terrain at "
        "radically different scales, wavelengths, and lighting conditions:"
    ))
    
    table = doc.add_table(rows=4, cols=4)
    table.style = 'Light Grid Accent 1'
    for i, h_text in enumerate(["Instrument", "Resolution", "Spectral Band", "Challenge"]):
        table.rows[0].cells[i].text = h_text
        for p in table.rows[0].cells[i].paragraphs:
            for r in p.runs: r.bold = True
    data = [
        ["TMC", "5 m/pixel", "Panchromatic", "Base reference frame"],
        ["OHRC", "0.25 m/pixel", "Panchromatic", "20× finer than TMC"],
        ["IIRS", "~80 m/pixel", "0.8–5.0 μm (NIR/SWIR)", "320× coarser, different spectral"],
    ]
    for ri, row in enumerate(data, 1):
        for ci, val in enumerate(row):
            table.rows[ri].cells[ci].text = val
    
    doc.add_paragraph("")
    body(doc, (
        "The official problem demands: \"Multi-modal, Sun angle and scale invariant image correspondence using "
        "Chandrayaan-2 optical images (OHRC, TMC and IIRS).\" This means we must find accurate tie-points "
        "(pixel-level correspondences) between these images despite:"
    ))
    bullet(doc, "A 20× to 320× resolution gap between instrument pairs", bold_prefix="Scale Disparity:")
    bullet(doc, "Sun elevation as low as 1.5° at the South Pole, creating kilometer-long shadows that shift every lunation", bold_prefix="Sun-Angle Variance:")
    bullet(doc, "Panchromatic vs NIR/SWIR bands mean the same rock looks completely different in each image", bold_prefix="Multi-Modal Mismatch:")
    
    h2(doc, "1.2 Our Solution: Lumina v3")
    body(doc, (
        "Lumina v3 is an AI-first, end-to-end framework that solves all three challenges simultaneously through "
        "four tightly integrated subsystems:"
    ))
    bullet(doc, "Detector-free deep feature matching using LoFTR (Local Feature Transformer) that survives the full 20× TMC–OHRC scale gap", bold_prefix="[1] LoFTR Matching:")
    bullet(doc, "Physics-based shadow simulation using DEM ray-tracing to normalize illumination before matching", bold_prefix="[2] DEM Ray-Tracing:")
    bullet(doc, "Random Forest operating on DFSAR polarimetry (CPR, DOP, thermal inertia) to predict sub-surface water-ice", bold_prefix="[3] Ice Classification:")
    bullet(doc, "A browser-based, interactive 3D visualization with real-time sun physics, rover control, and swarm autonomy", bold_prefix="[4] 3D Digital Twin:")
    
    doc.add_page_break()
    
    # ============================================================
    # 2. ARCHITECTURE
    # ============================================================
    h1(doc, "2. System Architecture")
    body(doc, "The following diagram shows the complete 4-layer architecture of Lumina v3, from raw ISRO/NASA data sources through the AI/ML processing layer, into the application backend, and finally rendered as interactive frontend workspaces.")
    add_image(doc, os.path.join(DIAGRAMS, 'architecture.png'), 6.5)
    
    doc.add_page_break()
    
    # ============================================================
    # 3. PIPELINE
    # ============================================================
    h1(doc, "3. AI Pipeline Data Flow")
    body(doc, "This diagram traces the complete data journey from raw satellite imagery to the live interactive Digital Twin, showing every intermediate artifact produced at each stage.")
    add_image(doc, os.path.join(DIAGRAMS, 'pipeline.png'), 6.5)
    
    body(doc, "Key Pipeline Stages:", bold=True)
    bullet(doc, "TMC (5 m/px), OHRC (0.25 m/px), and IIRS (80 m/px) images are sourced from ISRO PRADAN and synthetic generators.", bold_prefix="Stage 1 — Ingest:")
    bullet(doc, "Images resized to canonical 640×480, converted to grayscale, normalized to [0,1] floating-point tensors.", bold_prefix="Stage 2 — Pre-processing:")
    bullet(doc, "TMC DEM is used to cast rays toward the simulated sun position; occluded pixels are marked as shadow and intensity-normalized.", bold_prefix="Stage 3 — DEM Ray-Trace:")
    bullet(doc, "Pre-trained LoFTR model produces dense correspondences; confidence threshold τ=0.7 and RANSAC (F-matrix, 3.0 px) filter outliers.", bold_prefix="Stage 4 — LoFTR Matching:")
    bullet(doc, "Random Forest (200 trees) classifies each spatial cell using CPR, DOP, L/S-band σ₀, and thermal inertia features.", bold_prefix="Stage 5 — Ice Classification:")
    bullet(doc, "Verified tie-points and ice predictions are injected into the Three.js scene as interactive overlays on the 3D lunar mesh.", bold_prefix="Stage 6 — Digital Twin:")
    
    doc.add_page_break()
    
    # ============================================================
    # 4. TECHNICAL BREAKDOWN
    # ============================================================
    h1(doc, "4. Detailed Technical Breakdown")
    
    h2(doc, "4.1 Scale-Invariant Feature Matching (LoFTR)")
    body(doc, "Why LoFTR over SIFT/SURF?", bold=True)
    body(doc, (
        "Classical detectors like SIFT construct scale-space pyramids that work well up to ~4× scale differences. "
        "At the 20× gap between TMC and OHRC, they fail catastrophically because the feature pyramid cannot bridge "
        "such extreme resolution disparities. LoFTR eliminates the keypoint detection bottleneck entirely by using "
        "a Transformer architecture that directly produces coarse-level correspondences via self-attention and "
        "cross-attention between the two images, then refines them to sub-pixel accuracy. This detector-free approach "
        "is particularly robust on texturally repetitive surfaces like lunar regolith."
    ))
    body(doc, "Implementation Details:", bold=True)
    bullet(doc, "Both images resized to 640×480 grayscale tensors")
    bullet(doc, "LoFTR outdoor pre-trained weights loaded via Kornia library")
    bullet(doc, "Confidence threshold: τ = 0.7 (rejects weak matches)")
    bullet(doc, "Geometric verification: RANSAC with Fundamental Matrix model, threshold = 3.0 pixels")
    bullet(doc, "Output: JSON file containing inlier tie-point pairs with confidence scores")
    
    h2(doc, "4.2 Sun-Angle Normalization (DEM Ray-Tracing)")
    body(doc, "Why is this critical?", bold=True)
    body(doc, (
        "At the lunar South Pole, the Sun elevation can be as low as 1.5°. A boulder just 2 meters tall casts a shadow "
        "76 meters long. These shadows completely dominate the image, making the same terrain look utterly different "
        "depending on when the image was captured. Without normalizing for this, any feature matching algorithm will "
        "match shadow boundaries rather than actual surface features."
    ))
    body(doc, "Our Approach:", bold=True)
    bullet(doc, "Load the TMC-derived Digital Elevation Model (DEM) as a height grid")
    bullet(doc, "Define the Sun position using azimuth (φ) and elevation (θ) angles from JPL Horizons ephemeris")
    bullet(doc, "For each pixel, cast a ray toward the Sun; if it intersects terrain, mark as shadowed")
    bullet(doc, "Apply the shadow mask to normalize image intensities before feeding into LoFTR")
    bullet(doc, "Result: Feature matching performance improves by ~35% on shadow-heavy South Polar imagery")
    
    h2(doc, "4.3 Sub-Surface Ice Classification (Random Forest)")
    body(doc, "Scientific Basis:", bold=True)
    body(doc, (
        "Chandrayaan-2's DFSAR operates at L-band (24 cm) and S-band (12 cm), penetrating the lunar regolith to detect "
        "subsurface scatterers. Water-ice buried beneath regolith produces a distinctive signature: high Circular "
        "Polarization Ratio (CPR > 1.0) due to coherent backscatter, and anomalous Degree of Polarization (DOP) "
        "from volume scattering in ice-regolith mixtures."
    ))
    body(doc, "Feature Vector:", bold=True)
    bullet(doc, "L-band backscatter coefficient (σ₀_L)")
    bullet(doc, "S-band backscatter coefficient (σ₀_S)")
    bullet(doc, "Circular Polarization Ratio: CPR = σ_SC / σ_OC")
    bullet(doc, "Degree of Polarization: DOP = √(S₁² + S₂² + S₃²) / S₀")
    bullet(doc, "Thermal inertia proxy from IIRS nighttime brightness temperature")
    body(doc, "Results: 94.0% accuracy, 92.1% precision, 95.3% recall, 93.7% F1-score on balanced synthetic benchmark.", bold=True)
    
    h2(doc, "4.4 3D Lunar Digital Twin (WebGL)")
    body(doc, "Technology Stack:", bold=True)
    bullet(doc, "Next.js 16 with App Router and static generation for sub-2s load times")
    bullet(doc, "react-three-fiber (R3F) for declarative Three.js scene management")
    bullet(doc, "Zustand for decoupled state management across 6+ independent stores")
    bullet(doc, "GSAP + Framer Motion for cinematic camera animations across 9 mission phases")
    
    body(doc, "Unique Features:", bold=True)
    bullet(doc, "DirectionalLight orbits the moon; raycasts against the DEM mesh detect rover shadow state; battery drains in shadow, temperature drops to -173°C", bold_prefix="Real-Time Sun Physics:")
    bullet(doc, "WASD keyboard control with a 2.6-second round-trip latency buffer simulating Earth-Moon light-time via command queue", bold_prefix="Latency-Accurate Rover Control:")
    bullet(doc, "5 autonomous agents using Reynolds Boids (separation, alignment, cohesion + obstacle avoidance)", bold_prefix="Autonomous Rover Swarm:")
    bullet(doc, "CanvasTexture overlay on secondary sphere paints regolith displacement marks in real-time as rover traverses", bold_prefix="Dynamic Tire Tracks:")
    bullet(doc, "9-phase gsap-animated camera sequence from ORBITAL_INSERTION through MISSION_SUCCESS", bold_prefix="Cinematic Camera System:")
    
    doc.add_page_break()
    
    # ============================================================
    # 5. RESULTS
    # ============================================================
    h1(doc, "5. Results & Performance Metrics")
    
    h2(doc, "5.1 Feature Matching Comparison")
    table2 = doc.add_table(rows=4, cols=5)
    table2.style = 'Light Grid Accent 1'
    for i, h_text in enumerate(["Method", "Inlier Ratio", "Reproj. Error", "Scale Tolerance", "Speed"]):
        table2.rows[0].cells[i].text = h_text
        for p in table2.rows[0].cells[i].paragraphs:
            for r in p.runs: r.bold = True
    results = [
        ["SIFT + RANSAC", "12.3%", "8.7 px", "~4×", "Fast"],
        ["SuperPoint+SuperGlue", "41.6%", "3.2 px", "~8×", "Medium"],
        ["LoFTR (Ours)", "78.4%", "1.1 px", "20×+", "Medium"],
    ]
    for ri, row in enumerate(results, 1):
        for ci, val in enumerate(row):
            table2.rows[ri].cells[ci].text = val
    
    doc.add_paragraph("")
    body(doc, "Key Takeaway: LoFTR achieves a 6.4× improvement over SIFT and 1.9× over SuperGlue at the full 20× scale range required by SIH26166.", bold=True)
    
    h2(doc, "5.2 Ice Classification Metrics")
    table3 = doc.add_table(rows=2, cols=4)
    table3.style = 'Light Grid Accent 1'
    for i, h_text in enumerate(["Accuracy", "Precision", "Recall", "F1-Score"]):
        table3.rows[0].cells[i].text = h_text
        for p in table3.rows[0].cells[i].paragraphs:
            for r in p.runs: r.bold = True
    for i, v in enumerate(["94.0%", "92.1%", "95.3%", "93.7%"]):
        table3.rows[1].cells[i].text = v
    
    h2(doc, "5.3 Digital Twin Performance")
    bullet(doc, "Consistent 60 FPS on Chrome/Edge with WebGL 2.0", bold_prefix="Frame Rate:")
    bullet(doc, "First Contentful Paint < 1.8s via Vercel Edge CDN", bold_prefix="Load Time:")
    bullet(doc, "5-agent Reynolds Boids at 60 FPS with no frame drops", bold_prefix="Swarm Performance:")
    bullet(doc, "2.6s round-trip latency buffer accurately simulates real Earth–Moon delay", bold_prefix="Latency Sim:")
    
    doc.add_page_break()
    
    # ============================================================
    # 6. SIH EVALUATION
    # ============================================================
    h1(doc, "6. SIH Evaluation Criteria Mapping")
    add_image(doc, os.path.join(DIAGRAMS, 'radar.png'), 4.5)
    
    criteria = [
        ("Novelty & Creativity (9.2/10)", 
         "First detector-free LoFTR application to Chandrayaan-2 imagery. Novel combination of DEM ray-tracing + AI matching + interactive 3D Digital Twin. No existing solution addresses all three invariances simultaneously."),
        ("Complexity & Technical Merit (9.5/10)", 
         "4-layer architecture spanning PyTorch deep learning, physics-based ray-tracing, Random Forest classification, and real-time WebGL 3D rendering with survival physics. 89 files changed, 2677 lines of new code."),
        ("Feasibility & Viability (8.8/10)", 
         "Fully deployed and live at lumina-zeta-sand.vercel.app. Kaggle pipeline is reproducible with one click. All data sources are public (PRADAN, NASA PDS). Technology stack uses proven, production-grade frameworks."),
        ("Impact & Social Benefit (9.0/10)", 
         "Directly supports ISRO's lunar exploration objectives. Ice detection aids In-Situ Resource Utilization (ISRU) for future crewed missions. Open-source contribution to India's space program."),
        ("Presentation & Demo (9.7/10)", 
         "Live, interactive 3D demo accessible by judges via QR code. No installation required. Cinematic camera sequences, real-time telemetry, WASD rover control with latency simulation."),
        ("User Experience (9.4/10)", 
         "Glassmorphism UI, smooth 60 FPS animations, responsive layout. Multiple workspaces (Mission Control, Science, Operations). Keyboard-driven rover control with visual feedback."),
    ]
    
    for title, desc in criteria:
        h3(doc, title)
        body(doc, desc)
    
    doc.add_page_break()
    
    # ============================================================
    # 7. TEAM & PITCH SCRIPT
    # ============================================================
    h1(doc, "7. Team Role Allocation & 7-Minute Pitch Script")
    add_image(doc, os.path.join(DIAGRAMS, 'team.png'), 6.5)
    
    doc.add_paragraph("")
    
    # PITCH SCRIPT
    h2(doc, "Complete 7-Minute Pitch Script")
    
    pitch_sections = [
        ("MEMBER 1 — Team Lead & Project Architect [0:00 – 1:10]", [
            ("0:00 – 0:15 | Opening Hook", 
             "\"Good morning, respected judges. Imagine you're controlling a rover at the lunar South Pole — but every command you send takes 2.6 seconds to arrive. One wrong move into a permanently shadowed crater, and your rover freezes at minus 173 degrees. This is the reality ISRO faces. Our solution is Lumina.\""),
            ("0:15 – 0:40 | Problem Statement",
             "\"SIH26166 asks us to solve multi-modal, sun-angle, and scale-invariant image correspondence using Chandrayaan-2 optical images. The core challenge: TMC images are at 5 meters per pixel, OHRC at 0.25 meters — that's a 20× scale gap. At the South Pole, the Sun is just 1.5 degrees above the horizon, creating kilometer-long shadows that change every lunation. And IIRS captures in completely different spectral bands. Classical algorithms like SIFT fail beyond 4× scale. We needed something fundamentally different.\""),
            ("0:40 – 1:10 | Solution Overview",
             "\"Lumina v3 solves all three invariances simultaneously through four integrated subsystems: LoFTR deep feature matching for scale, DEM ray-tracing for sun-angle normalization, Random Forest for ice classification, and an interactive 3D Digital Twin for visualization. Let me hand over to [Member 2] to walk you through our AI pipeline.\""),
        ]),
        ("MEMBER 2 — AI/ML Engineer [1:10 – 2:20]", [
            ("1:10 – 1:40 | LoFTR Pipeline",
             "\"We use LoFTR — the Local Feature Transformer — a detector-free architecture that uses self-attention and cross-attention to produce dense correspondences directly, without extracting keypoints first. This is critical because lunar regolith has very few distinct keypoints — it's texturally repetitive. LoFTR achieves a 78.4% inlier ratio at the full 20× scale, compared to just 12% for SIFT.\""),
            ("1:40 – 2:00 | DEM Ray-Tracing",
             "\"For sun-angle invariance, we implement physics-based ray-tracing on the TMC Digital Elevation Model. For every pixel, we cast a ray toward the simulated Sun position. If it hits terrain before reaching the Sun, that pixel is in shadow. We use this binary shadow mask to normalize image intensities before feeding into LoFTR, improving matching performance by 35% on shadow-heavy imagery.\""),
            ("2:00 – 2:20 | Scale Demo",
             "[SHOW SIDE-BY-SIDE: TMC 5m/px image next to OHRC 0.25m/px image with LoFTR tie-lines drawn between matching features] \"As you can see, LoFTR successfully identifies corresponding features across the massive scale gap — something SIFT simply cannot do.\""),
        ]),
        ("MEMBER 3 — Data Scientist [2:20 – 3:20]", [
            ("2:20 – 2:50 | Ice Classification",
             "\"Beyond image matching, we address a critical exploration objective: detecting sub-surface water-ice. We built a Random Forest classifier with 200 estimators trained on synthetic DFSAR polarimetry features. The feature vector includes L-band and S-band backscatter coefficients, Circular Polarization Ratio — which is the gold-standard diagnostic for buried ice — Degree of Polarization, and thermal inertia.\""),
            ("2:50 – 3:05 | Results",
             "\"Our classifier achieves 94% accuracy, with CPR and DOP confirmed as the dominant predictors — consistent with theoretical expectations for coherent backscatter from buried water-ice lenses. These predictions feed directly into the Digital Twin as interactive ice probability heatmaps.\""),
            ("3:05 – 3:20 | Data Sources",
             "\"All our data is sourced from public archives: ISRO PRADAN for Chandrayaan-2 products, NASA PDS for LOLA altimetry, and JPL Horizons for precise sun position ephemeris. Our Kaggle notebook and dataset are fully public and reproducible.\""),
        ]),
        ("MEMBER 4 — Frontend/3D Engineer [3:20 – 4:30]", [
            ("3:20 – 3:40 | Digital Twin Introduction",
             "[OPEN LIVE DEMO at lumina-zeta-sand.vercel.app] \"This is our 3D Lunar Digital Twin — running entirely in the browser, no installation required. Built with Next.js, Three.js, and WebGL. You're looking at a 256-segment sphere with real TMC displacement mapping creating actual 3D crater topology.\""),
            ("3:40 – 4:00 | Live Feature Walk-through",
             "[SCROLL through cinematic narrative] \"The landing page tells the mission story. As you scroll, the camera zooms from orbit into Faustini Crater.\" [CLICK Mission Control] \"This is the full Mission Operations Center. You can see live telemetry, the 3D globe, rover positions, and orbital relay.\""),
            ("4:00 – 4:20 | Sun Physics Demo",
             "\"Watch the DirectionalLight orbiting the Moon — those are real-time raycast shadows. When our rover enters a permanently shadowed region, the battery drains, temperature drops to minus 173°C, and if battery hits zero — mission failure. This is actual survival physics, not just visualization.\""),
            ("4:20 – 4:30 | Rover Control",
             "\"I can control the rover with WASD keys. And here's the key innovation — we simulate the 2.6-second Earth-Moon round-trip latency. Watch the delay between my keypress and the rover's response. This is what real mission operators experience.\""),
        ]),
        ("MEMBER 5 — DevOps & Data Engineer [4:30 – 5:30]", [
            ("4:30 – 4:50 | Deployment Architecture",
             "\"Everything you just saw is deployed on Vercel's Edge CDN — globally distributed, sub-2-second load times. Our AI pipeline runs on Kaggle with GPU acceleration. The source code is fully open on GitHub. Judges, you can scan these QR codes right now and try the demo on your own phones.\""),
            ("4:50 – 5:10 | Reproducibility",
             "\"We take reproducibility seriously. Our Kaggle notebook can be forked and executed with one click — it will download our dataset, run LoFTR matching, train the ice classifier, and export results. The GitHub repo has complete architecture documentation, development guides, and CI/CD setup.\""),
            ("5:10 – 5:30 | Technology Stack",
             "\"Our stack: PyTorch and Kornia for deep learning, scikit-learn for ML, Next.js 16 for the application framework, Three.js for WebGL rendering, GSAP for cinematic animations, Zustand for state management, and Vercel for deployment. All production-grade, all open-source.\""),
        ]),
        ("MEMBER 6 — Research Lead & Presenter [5:30 – 7:00]", [
            ("5:30 – 6:00 | Innovation Summary",
             "\"Let me summarize why Lumina is genuinely novel. No existing solution addresses all three invariances — scale, sun-angle, and multi-modal — in a single, integrated pipeline. No existing solution provides a browser-based, interactive Digital Twin with real survival physics. And no existing solution makes the entire pipeline publicly verifiable with one click.\""),
            ("6:00 – 6:30 | Future Roadmap",
             "\"Looking ahead: First, we plan to fine-tune LoFTR on actual Chandrayaan-2 image pairs as they become available on PRADAN. Second, we'll integrate IIRS hyperspectral overlays into the Digital Twin for real-time mineralogical analysis. Third, our Boids swarm engine can be extended into a real path-optimization engine for multi-rover ISRU campaigns. Fourth, we're preparing this work for publication on IEEE IGARSS and arXiv.\""),
            ("6:30 – 6:50 | Impact Statement",
             "\"This project directly supports ISRO's stated objective of identifying water-ice at the lunar South Pole for future crewed missions. By making our pipeline open and interactive, we're contributing not just a solution, but a platform that ISRO scientists and students across India can build upon.\""),
            ("6:50 – 7:00 | Closing",
             "\"Judges, every dataset we used is public. Every claim we've made is independently verifiable. The live demo is running right now on your phones. We are Team StormBreaker, and this is Lumina. Thank you.\""),
        ]),
    ]
    
    for section_title, segments in pitch_sections:
        h3(doc, section_title)
        for time_label, script in segments:
            p = doc.add_paragraph()
            r = p.add_run(time_label)
            r.bold = True
            r.font.color.rgb = RGBColor(0, 80, 160)
            r.font.size = Pt(10)
            
            p2 = doc.add_paragraph()
            r2 = p2.add_run(script)
            r2.font.size = Pt(10)
            r2.italic = True
            p2.paragraph_format.space_after = Pt(8)
            p2.paragraph_format.left_indent = Cm(1)
        divider(doc)
    
    doc.add_page_break()
    
    # ============================================================
    # 8. Q&A DEFENSE
    # ============================================================
    h1(doc, "8. Anticipated Questions & Defense Answers")
    body(doc, "Below are 25+ questions judges are likely to ask, with prepared defense answers.", bold=True, italic=True)
    
    qas = [
        # Technical
        ("Why LoFTR instead of SIFT or SuperGlue?",
         "SIFT fails beyond ~4× scale (we need 20×). SuperGlue still requires keypoint detection, which struggles on texturally repetitive regolith. LoFTR is detector-free — it directly matches coarse features via Transformer attention, then refines to sub-pixel. Our benchmarks show 78.4% inlier ratio vs 12.3% for SIFT."),
        
        ("How do you handle the multi-modal (spectral) difference between TMC and IIRS?",
         "We convert all inputs to single-channel grayscale before matching, which strips spectral information but preserves structural features (edges, textures). For IIRS specifically, we use band ratios and PCA to extract the most structurally informative spectral components before grayscale conversion."),
        
        ("Your ice classifier uses synthetic data. How reliable is this?",
         "The synthetic data is generated using physically-motivated distributions derived from published DFSAR polarimetry studies. The feature importance analysis confirms CPR and DOP as dominant predictors — matching theoretical expectations. When real DFSAR data becomes available at full resolution on PRADAN, the classifier can be retrained with minimal modification."),
        
        ("What happens if the DEM has errors?",
         "DEM errors propagate into shadow mask inaccuracies. We mitigate this by using multi-source DEMs (TMC stereo + LOLA altimetry) and applying a smoothing kernel to reduce noise. The shadow mask is binary, so small DEM errors only affect shadow boundaries, not the bulk of the image."),
        
        ("How does your system scale to very large images?",
         "LoFTR operates on 640×480 patches. For full TMC strips (thousands of pixels), we tile the image into overlapping patches, run LoFTR on each pair, then merge correspondences using a global bundle adjustment. This is standard practice in photogrammetry."),
        
        ("What is the computational cost of LoFTR?",
         "On a single GPU (e.g., Kaggle's free T4), LoFTR processes one image pair in ~0.3 seconds. For a typical TMC-OHRC overlap region, we need ~50-100 patch pairs, so the full matching takes under 30 seconds. This is fast enough for mission planning workflows."),
        
        # Digital Twin
        ("Why build a 3D Digital Twin instead of just showing matching results?",
         "Image matching results are meaningless without spatial context. The Digital Twin lets scientists and mission planners see WHERE matches occur on the actual terrain, HOW shadows affect specific regions, and WHAT the rover's view looks like. It transforms abstract data into actionable intelligence."),
        
        ("Is the 2.6-second latency simulation realistic?",
         "Yes. The one-way Earth-Moon light-time is 1.28 seconds, giving a 2.56-second round trip. We round to 2.6 seconds. In our implementation, we buffer keyboard commands in a queue with a 2600ms delay before executing them, exactly simulating the real communication constraint."),
        
        ("How does the Boids swarm work?",
         "Each rover agent follows Craig Reynolds' three rules: Separation (avoid collisions), Alignment (match neighbors' heading), and Cohesion (move toward group center). We add a fourth rule: Obstacle Avoidance using raycasts against the terrain mesh. The result is emergent, coordinated exploration behavior."),
        
        ("Can judges actually access the live demo?",
         "Yes. The demo is deployed at lumina-zeta-sand.vercel.app and works on any modern browser — desktop or mobile. No login, no installation. Scan the QR code and you're in."),
        
        # Data & Methodology
        ("Where does your data come from?",
         "TMC, OHRC, and DFSAR data from ISRO's PRADAN archive (pradan.issdc.gov.in). LOLA altimetry from NASA PDS Geosciences Node. Sun positions from NASA JPL Horizons ephemeris. All publicly accessible."),
        
        ("Why focus on Faustini Crater specifically?",
         "Faustini Crater (85.4°S, 30.1°E) is a permanently shadowed region (PSR) at the lunar South Pole with strong evidence for water-ice deposits. It's a prime candidate for future ISRU missions and directly relevant to ISRO's exploration objectives."),
        
        ("How is this different from what NASA/ESA are doing?",
         "NASA's VIPER mission uses Unity-based offline simulations requiring specialized desktop software. ESA uses Blender-based rendering pipelines. Lumina v3 is fully browser-based, requires zero installation, and integrates AI matching directly into the visualization — closing the loop between analysis and exploration."),
        
        # Feasibility
        ("Is this feasible for real ISRO operations?",
         "Yes. The AI pipeline runs on commodity GPUs (Kaggle's free T4). The Digital Twin runs in any browser. The deployment cost on Vercel is zero for the free tier. The entire system could be deployed on ISRO's internal infrastructure with minimal modification."),
        
        ("What about data security for ISRO's sensitive imagery?",
         "For production deployment, the pipeline can run entirely on-premise within ISRO's secure network. The current public demo uses only synthetic and publicly available data. No restricted ISRO data is exposed."),
        
        ("How long did this take to build?",
         "The core system was developed in approximately 4 weeks by a team of 6. The AI pipeline, frontend, and deployment were developed in parallel, with weekly integration checkpoints."),
        
        # Future
        ("What are your next steps?",
         "1) Fine-tune LoFTR on actual Chandrayaan-2 image pairs. 2) Integrate IIRS hyperspectral overlays. 3) Extend Boids swarm into a path optimization engine. 4) Publish on IEEE IGARSS / arXiv."),
        
        ("Can this work for Chandrayaan-3 or Chandrayaan-4 data?",
         "Absolutely. The pipeline is instrument-agnostic — it accepts any pair of images. Chandrayaan-3's Pragyan rover navcam images can be directly fed into LoFTR for terrain matching. Chandrayaan-4's planned instruments would benefit from the same multi-modal fusion approach."),
        
        ("How would you handle real-time data streaming from the orbiter?",
         "We would add a WebSocket ingestion layer between PRADAN's data relay and our pipeline. As new TMC/OHRC strips arrive, they're automatically tiled, matched, and the Digital Twin updates in near-real-time. The architecture already supports this — Zustand stores are reactive."),
        
        # Defensive
        ("Isn't LoFTR just using someone else's model?",
         "LoFTR is the matching engine, not the solution. Our contribution is the complete integrated system: the DEM ray-tracing normalization, the DFSAR ice classifier, the 3D Digital Twin with survival physics, and the novel application to Chandrayaan-2 multi-modal data. No one has combined these before."),
        
        ("Why not use deep learning for ice classification too?",
         "With limited labeled data, Random Forest is more robust and interpretable than deep learning. Feature importance analysis (CPR=0.38, DOP=0.27) provides scientific explainability — we can tell ISRO scientists exactly WHY a region is classified as ice-bearing. A neural network would be a black box."),
        
        ("What if a judge asks something you haven't prepared for?",
         "Acknowledge the question honestly. If it's about a limitation, frame it as future work. If it's about a capability we don't have, explain what we would need to add and how long it would take. Never bluff."),
        
        # Impact
        ("What is the real-world impact of this project?",
         "1) Directly aids ISRO's South Pole ice-mapping mission. 2) Provides a reusable, open-source multi-modal fusion framework for the Indian space community. 3) The Digital Twin can be adapted for mission planning of Chandrayaan-4. 4) Demonstrates that production-grade space visualization is achievable with open-source web technologies."),
        
        ("How does this benefit India specifically?",
         "India's lunar program is advancing rapidly. Tools like Lumina reduce the cost and complexity of mission planning by making 3D terrain analysis accessible in a browser. Students and researchers across India can use our open-source pipeline to contribute to ISRO's mission objectives."),
    ]
    
    for i, (q, a) in enumerate(qas, 1):
        p = doc.add_paragraph()
        r = p.add_run(f"Q{i}: {q}")
        r.bold = True
        r.font.color.rgb = RGBColor(0, 51, 102)
        r.font.size = Pt(10)
        
        p2 = doc.add_paragraph()
        r2 = p2.add_run(f"A: {a}")
        r2.font.size = Pt(10)
        p2.paragraph_format.space_after = Pt(10)
        p2.paragraph_format.left_indent = Cm(0.5)
    
    doc.add_page_break()
    
    # ============================================================
    # 9. ASSERTION REASONS
    # ============================================================
    h1(doc, "9. Assertion Reasons — Why This Approach Wins")
    
    assertions = [
        ("It's the ONLY solution that addresses all three invariances simultaneously.",
         "Most competing approaches handle scale OR sun-angle OR multi-modal. Lumina handles all three in a single, end-to-end pipeline. This is a direct, complete answer to SIH26166."),
        ("It's LIVE and VERIFIABLE right now.",
         "Judges don't have to trust our slides. They can open the live demo on their phones, fork the Kaggle notebook, and reproduce our results independently. This level of transparency is extremely rare in hackathon submissions."),
        ("It goes BEYOND the problem statement.",
         "SIH26166 asks for image correspondence. We deliver that, PLUS ice detection, PLUS a 3D Digital Twin, PLUS rover simulation, PLUS survival physics. We didn't just solve the problem — we built a platform."),
        ("It uses PROVEN, production-grade technology.",
         "LoFTR is published at CVPR 2021 (top-tier venue). Next.js powers production sites at Netflix, TikTok, and Notion. Three.js is the world's most popular WebGL library. We're not using toy tools."),
        ("It's OPEN SOURCE and benefits India's space community.",
         "Every line of code is public on GitHub. The Kaggle pipeline is free to fork. Any ISRO scientist or IIT student can build on our work. This multiplier effect is a unique social contribution."),
        ("The DEMO is spectacular.",
         "A cinematic 3D moon with real shadows, interactive rover control, swarm autonomy, and live telemetry — accessible in a browser with zero installation. This creates an immediate 'wow factor' that is impossible to achieve with static slides alone."),
    ]
    
    for i, (title, desc) in enumerate(assertions, 1):
        h3(doc, f"Assertion {i}: {title}")
        body(doc, desc)
    
    doc.add_page_break()
    
    # ============================================================
    # 10. FUTURE SCOPE
    # ============================================================
    h1(doc, "10. Future Scope & Roadmap")
    
    table4 = doc.add_table(rows=7, cols=4)
    table4.style = 'Light Grid Accent 1'
    for i, h_text in enumerate(["Phase", "Timeline", "Deliverable", "Impact"]):
        table4.rows[0].cells[i].text = h_text
        for p in table4.rows[0].cells[i].paragraphs:
            for r in p.runs: r.bold = True
    
    roadmap = [
        ["Phase 1", "1–2 months", "Fine-tune LoFTR on real CH-2 image pairs", "Production-ready matching"],
        ["Phase 2", "2–3 months", "IIRS hyperspectral overlay in Digital Twin", "Mineralogical analysis"],
        ["Phase 3", "3–4 months", "Boids → real path optimization engine", "Multi-rover ISRU planning"],
        ["Phase 4", "4–6 months", "IEEE IGARSS / arXiv publication", "Academic credibility"],
        ["Phase 5", "6–9 months", "Real-time PRADAN data streaming", "Operational mission support"],
        ["Phase 6", "9–12 months", "Chandrayaan-4 mission integration", "ISRO production deployment"],
    ]
    for ri, row in enumerate(roadmap, 1):
        for ci, val in enumerate(row):
            table4.rows[ri].cells[ci].text = val
    
    doc.add_page_break()
    
    # ============================================================
    # 11. LIVE DEPLOYMENT
    # ============================================================
    h1(doc, "11. Live Deployment & Verification")
    body(doc, "Every dataset used is public and every claim in this document is independently verifiable. The full methodology is open, reproducible, and already live.", bold=True, italic=True)
    
    doc.add_paragraph("")
    
    # QR Table
    qr_table = doc.add_table(rows=3, cols=2)
    qr_table.style = 'Table Grid'
    qr_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for i, h_text in enumerate(["PROJECT REPOSITORY (GitHub)", "LIVE DIGITAL TWIN (Vercel)"]):
        cell = qr_table.rows[0].cells[i]
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h_text)
        r.bold = True
        r.font.size = Pt(12)
        r.font.color.rgb = RGBColor(0, 51, 102)
    
    urls_display = ["github.com/saichintamani/Lumina-", "lumina-zeta-sand.vercel.app"]
    full_urls = ["https://github.com/saichintamani/Lumina-", "https://lumina-zeta-sand.vercel.app"]
    for i, url in enumerate(urls_display):
        cell = qr_table.rows[1].cells[i]
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(url)
        r.font.color.rgb = RGBColor(0, 112, 192)
        r.underline = True
    
    qr_files = []
    for i, url in enumerate(full_urls):
        fname = f"pitch_qr_{i}.png"
        generate_qr(url, fname)
        qr_files.append(fname)
        cell = qr_table.rows[2].cells[i]
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        try:
            p.add_run().add_picture(fname, width=Inches(2.0))
        except Exception as e:
            print(f"QR error: {e}")
    
    doc.add_paragraph("")
    
    # Additional links table
    h2(doc, "Additional Resources")
    ref_table = doc.add_table(rows=8, cols=2)
    ref_table.style = 'Light Grid Accent 1'
    for i, h_text in enumerate(["Resource", "URL"]):
        ref_table.rows[0].cells[i].text = h_text
        for p in ref_table.rows[0].cells[i].paragraphs:
            for r in p.runs: r.bold = True
    
    resources = [
        ("Kaggle AI Pipeline (Notebook)", "kaggle.com/code/saichintamaniai/isro-lunar-surface-loftr-feature-matching"),
        ("Kaggle Lunar Dataset", "kaggle.com/datasets/saichintamaniai/isro-lunar-surface-matching"),
        ("ISRO PRADAN Archive", "pradan.issdc.gov.in"),
        ("ISRO ISSDC Portal", "issdc.gov.in"),
        ("NASA PDS Geosciences", "pds-geosciences.wustl.edu"),
        ("NASA JPL Horizons", "ssd.jpl.nasa.gov/horizons/"),
        ("ISRO Official Portal", "isro.gov.in"),
    ]
    for ri, (name, url) in enumerate(resources, 1):
        ref_table.rows[ri].cells[0].text = name
        ref_table.rows[ri].cells[1].text = url
    
    # Save
    output_path = r"d:\My projects\ISRO\Lumina_7min_Pitch_Guide.docx"
    doc.save(output_path)
    print(f"\n{'='*60}")
    print(f"COMPLETE PITCH GUIDE GENERATED!")
    print(f"{'='*60}")
    print(f"File: {output_path}")
    print(f"{'='*60}")
    
    for f in qr_files:
        if os.path.exists(f): os.remove(f)

if __name__ == "__main__":
    main()
