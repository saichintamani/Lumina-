import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
import os

OUT = r"d:\My projects\ISRO\scratch\diagrams"
os.makedirs(OUT, exist_ok=True)

# ============================================================
# DIAGRAM 1: End-to-End System Architecture
# ============================================================
def draw_architecture():
    fig, ax = plt.subplots(1, 1, figsize=(16, 10))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')
    fig.patch.set_facecolor('#0a0e1a')
    ax.set_facecolor('#0a0e1a')
    
    title = ax.text(8, 9.6, 'LUMINA v3 — End-to-End System Architecture', 
                    fontsize=18, fontweight='bold', color='white', ha='center',
                    fontfamily='monospace')
    
    # Layer colors
    colors = {
        'data': '#1e3a5f',
        'ai': '#1a4731',
        'backend': '#4a1942',
        'frontend': '#3d1f00',
        'deploy': '#1f1f1f'
    }
    border = {
        'data': '#3b82f6',
        'ai': '#10b981',
        'backend': '#a855f7',
        'frontend': '#f59e0b',
        'deploy': '#6b7280'
    }
    
    # Data Layer
    boxes = [
        # (x, y, w, h, text, layer)
        (0.5, 7.5, 2.8, 1.2, 'ISRO PRADAN\n(TMC / OHRC / DFSAR)', 'data'),
        (3.8, 7.5, 2.8, 1.2, 'NASA PDS\n(LOLA DEM)', 'data'),
        (7.1, 7.5, 2.8, 1.2, 'JPL Horizons\n(Ephemeris)', 'data'),
        (10.4, 7.5, 2.8, 1.2, 'Kaggle Dataset\n(Synthetic Pairs)', 'data'),
        
        # AI Layer
        (0.5, 5.5, 3.5, 1.4, 'LoFTR Feature Matcher\n(PyTorch + Kornia)\nScale-Invariant Tie-Points', 'ai'),
        (4.5, 5.5, 3.5, 1.4, 'DEM Ray-Tracer\n(NumPy + SciPy)\nSun-Angle Normalization', 'ai'),
        (8.5, 5.5, 3.5, 1.4, 'RF Ice Classifier\n(scikit-learn)\nDFSAR Polarimetry → Ice %', 'ai'),
        (12.5, 5.5, 3, 1.4, 'Boids Swarm\nEngine\n(Reynolds 1987)', 'ai'),
        
        # Backend
        (0.5, 3.3, 4.5, 1.4, 'Next.js 16 App Router\nAPI Routes + Static Generation\nServer-Side Rendering', 'backend'),
        (5.5, 3.3, 5, 1.4, 'Zustand State Management\nTelemetry Store / Cinematic Engine\nVisual Layer Manager', 'backend'),
        (11, 3.3, 4.5, 1.4, 'Three.js Scene Graph\nreact-three-fiber (R3F)\nWebGL 2.0 Renderer', 'backend'),
        
        # Frontend
        (0.5, 1.2, 3.5, 1.4, 'Landing Page\nCinematic Scroll\nMoon 3D Background', 'frontend'),
        (4.5, 1.2, 3.5, 1.4, 'Mission Control\nDigital Twin + HUDs\nRover WASD Controls', 'frontend'),
        (8.5, 1.2, 3.5, 1.4, 'Science Workspace\nSpectroscopy Panel\nIce Heatmaps', 'frontend'),
        (12.5, 1.2, 3, 1.4, 'Operations\nTelemetry Dash\nWorkflow Engine', 'frontend'),
    ]
    
    for (x, y, w, h, text, layer) in boxes:
        rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1",
                               facecolor=colors[layer], edgecolor=border[layer], linewidth=2)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h/2, text, fontsize=7.5, color='white', ha='center', va='center',
                fontfamily='monospace', fontweight='bold')
    
    # Layer Labels
    labels = [
        (15.8, 8.1, 'DATA\nLAYER', border['data']),
        (15.8, 6.2, 'AI/ML\nLAYER', border['ai']),
        (15.8, 4.0, 'BACKEND\nLAYER', border['backend']),
        (15.8, 1.9, 'FRONTEND\nLAYER', border['frontend']),
    ]
    for (x, y, t, c) in labels:
        ax.text(x, y, t, fontsize=8, color=c, ha='right', va='center',
                fontfamily='monospace', fontweight='bold', rotation=0)
    
    # Arrows (Data → AI)
    for x in [1.9, 5.2, 8.5, 11.8]:
        ax.annotate('', xy=(x, 7.0), xytext=(x, 7.5),
                    arrowprops=dict(arrowstyle='->', color='#64748b', lw=1.5))
    
    # Arrows (AI → Backend)
    for x in [2.7, 6.25, 10.25, 14.0]:
        ax.annotate('', xy=(x, 4.7), xytext=(x, 5.5),
                    arrowprops=dict(arrowstyle='->', color='#64748b', lw=1.5))
    
    # Arrows (Backend → Frontend)
    for x in [2.7, 8.0, 13.25]:
        ax.annotate('', xy=(x, 2.6), xytext=(x, 3.3),
                    arrowprops=dict(arrowstyle='->', color='#64748b', lw=1.5))
    
    # Deployment bar
    deploy_rect = FancyBboxPatch((0.5, 0.15), 15, 0.7, boxstyle="round,pad=0.05",
                                  facecolor='#111827', edgecolor='#374151', linewidth=2)
    ax.add_patch(deploy_rect)
    ax.text(8, 0.5, '☁  DEPLOYMENT: Vercel Edge CDN  |  Kaggle Notebooks  |  GitHub CI/CD  |  lumina-zeta-sand.vercel.app', 
            fontsize=9, color='#9ca3af', ha='center', va='center', fontfamily='monospace')
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, 'architecture.png'), dpi=200, bbox_inches='tight', facecolor='#0a0e1a')
    plt.close()
    print("Architecture diagram saved.")

# ============================================================
# DIAGRAM 2: Data Flow Pipeline
# ============================================================
def draw_pipeline():
    fig, ax = plt.subplots(1, 1, figsize=(16, 6))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 6)
    ax.axis('off')
    fig.patch.set_facecolor('#0a0e1a')
    ax.set_facecolor('#0a0e1a')
    
    ax.text(8, 5.7, 'LUMINA v3 — AI Pipeline Data Flow', fontsize=16, fontweight='bold',
            color='white', ha='center', fontfamily='monospace')
    
    steps = [
        (0.3, 3.0, 2.2, 1.8, 'RAW DATA\nINGEST\n\nTMC 5m/px\nOHRC 0.25m/px\nIIRS 80m/px', '#1e3a5f', '#3b82f6'),
        (3.0, 3.0, 2.2, 1.8, 'PRE-\nPROCESSING\n\nResize 640×480\nGrayscale\nNormalize [0,1]', '#1a3a2f', '#22c55e'),
        (5.7, 3.0, 2.2, 1.8, 'DEM\nRAY-TRACE\n\nSun Position\nShadow Mask\nIllum. Norm.', '#2d1a3f', '#a855f7'),
        (8.4, 3.0, 2.2, 1.8, 'LoFTR\nMATCHING\n\nCoarse→Fine\nConf. τ=0.7\nRANSAC F-mat', '#1a4731', '#10b981'),
        (11.1, 3.0, 2.2, 1.8, 'ICE\nCLASSIFY\n\nRF 200 Trees\nCPR + DOP\n94% Accuracy', '#3d1f00', '#f59e0b'),
        (13.8, 3.0, 2.0, 1.8, 'DIGITAL\nTWIN\n\nWebGL 3D\nTie-Lines\nLive Telemetry', '#1f1f3f', '#6366f1'),
    ]
    
    for (x, y, w, h, text, fc, ec) in steps:
        rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1",
                               facecolor=fc, edgecolor=ec, linewidth=2.5)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h/2, text, fontsize=7, color='white', ha='center', va='center',
                fontfamily='monospace', fontweight='bold')
    
    # Arrows between steps
    arrow_xs = [(2.5, 3.0), (5.2, 5.7), (7.9, 8.4), (10.6, 11.1), (13.3, 13.8)]
    for (x1, x2) in arrow_xs:
        ax.annotate('', xy=(x2, 3.9), xytext=(x1, 3.9),
                    arrowprops=dict(arrowstyle='->', color='#64748b', lw=2))
    
    # Output artifacts
    outputs = [
        (1.4, 1.5, 'matches.json\n(tie-points)', '#3b82f6'),
        (4.1, 1.5, 'shadow_mask.npy\n(binary)', '#22c55e'),
        (6.8, 1.5, 'norm_images/\n(corrected)', '#a855f7'),
        (9.5, 1.5, 'inliers.json\n(verified)', '#10b981'),
        (12.2, 1.5, 'ice_prob.csv\n(predictions)', '#f59e0b'),
        (14.8, 1.5, 'Live URL\n(Vercel)', '#6366f1'),
    ]
    
    for (x, y, text, color) in outputs:
        ax.text(x, y, text, fontsize=7, color=color, ha='center', va='center',
                fontfamily='monospace', fontstyle='italic',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='#111827', edgecolor=color, alpha=0.8))
    
    # Down arrows to outputs
    for i, (x, y, w, h, *_) in enumerate(steps):
        ax.annotate('', xy=(outputs[i][0], 1.9), xytext=(x + w/2, 3.0),
                    arrowprops=dict(arrowstyle='->', color='#374151', lw=1, ls='--'))
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, 'pipeline.png'), dpi=200, bbox_inches='tight', facecolor='#0a0e1a')
    plt.close()
    print("Pipeline diagram saved.")

# ============================================================
# DIAGRAM 3: SIH Evaluation Criteria Radar Chart
# ============================================================
def draw_radar():
    categories = ['Novelty &\nCreativity', 'Complexity &\nTechnical Merit', 'Feasibility &\nViability', 
                   'Impact &\nSocial Benefit', 'Presentation\n& Demo', 'User\nExperience']
    values = [9.2, 9.5, 8.8, 9.0, 9.7, 9.4]
    
    N = len(categories)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    values_plot = values + values[:1]
    angles += angles[:1]
    
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))
    fig.patch.set_facecolor('#0a0e1a')
    ax.set_facecolor('#0a0e1a')
    
    ax.plot(angles, values_plot, 'o-', linewidth=2, color='#3b82f6')
    ax.fill(angles, values_plot, alpha=0.25, color='#3b82f6')
    
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=10, fontweight='bold', color='white', fontfamily='monospace')
    ax.set_ylim(0, 10)
    ax.set_yticks([2, 4, 6, 8, 10])
    ax.set_yticklabels(['2', '4', '6', '8', '10'], fontsize=8, color='#64748b')
    ax.spines['polar'].set_color('#1e293b')
    ax.grid(color='#1e293b')
    ax.tick_params(axis='x', pad=15)
    
    ax.set_title('SIH Evaluation Criteria — Lumina v3 Self-Assessment', 
                  fontsize=14, fontweight='bold', color='white', fontfamily='monospace', pad=20)
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, 'radar.png'), dpi=200, bbox_inches='tight', facecolor='#0a0e1a')
    plt.close()
    print("Radar chart saved.")

# ============================================================
# DIAGRAM 4: Team Role Allocation
# ============================================================
def draw_team():
    fig, ax = plt.subplots(1, 1, figsize=(14, 7))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 7)
    ax.axis('off')
    fig.patch.set_facecolor('#0a0e1a')
    ax.set_facecolor('#0a0e1a')
    
    ax.text(7, 6.6, 'TEAM STORMBREAKER — Role Allocation & Pitch Sequence', fontsize=15,
            fontweight='bold', color='white', ha='center', fontfamily='monospace')
    
    members = [
        (0.5, 3.5, 'MEMBER 1\n━━━━━━━━━\nTeam Lead &\nProject Architect\n\n• Opening (0:00–1:10)\n• Problem Statement\n• Solution Overview', '#1e3a5f', '#3b82f6'),
        (2.7, 3.5, 'MEMBER 2\n━━━━━━━━━\nAI/ML Engineer\n\n• LoFTR Pipeline (1:10–2:20)\n• DEM Ray-Tracing\n• Scale Invariance Demo', '#1a4731', '#10b981'),
        (4.9, 3.5, 'MEMBER 3\n━━━━━━━━━\nData Scientist\n\n• Ice Classifier (2:20–3:20)\n• DFSAR Polarimetry\n• 94% Accuracy Results', '#3d1f00', '#f59e0b'),
        (7.1, 3.5, 'MEMBER 4\n━━━━━━━━━\nFrontend/3D\nEngineer\n\n• Digital Twin (3:20–4:30)\n• Live Demo Walk-through\n• Sun Physics', '#4a1942', '#a855f7'),
        (9.3, 3.5, 'MEMBER 5\n━━━━━━━━━\nDevOps & Data\nEngineer\n\n• Deployment (4:30–5:30)\n• Kaggle Pipeline\n• Reproducibility', '#1f2937', '#6b7280'),
        (11.5, 3.5, 'MEMBER 6\n━━━━━━━━━\nResearch &\nPresenter\n\n• Future Work (5:30–7:00)\n• Q&A Defense\n• Closing Statement', '#1f1f3f', '#6366f1'),
    ]
    
    for (x, y, text, fc, ec) in members:
        rect = FancyBboxPatch((x, y), 1.9, 2.8, boxstyle="round,pad=0.1",
                               facecolor=fc, edgecolor=ec, linewidth=2.5)
        ax.add_patch(rect)
        ax.text(x + 0.95, y + 1.4, text, fontsize=6.5, color='white', ha='center', va='center',
                fontfamily='monospace', fontweight='bold')
    
    # Timeline bar
    timeline = FancyBboxPatch((0.5, 0.5), 13, 1.2, boxstyle="round,pad=0.05",
                               facecolor='#111827', edgecolor='#374151', linewidth=2)
    ax.add_patch(timeline)
    
    times = ['0:00', '1:10', '2:20', '3:20', '4:30', '5:30', '7:00']
    segments = ['PROBLEM &\nOVERVIEW', 'AI/CV\nPIPELINE', 'ICE\nCLASSIFICATION', 'LIVE\nDEMO', 'DEPLOY &\nREPRO', 'FUTURE &\nQ&A']
    seg_colors = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#6b7280', '#6366f1']
    
    for i, (t, seg, col) in enumerate(zip(times[:-1], segments, seg_colors)):
        x_pos = 0.7 + i * 2.1
        ax.text(x_pos, 1.5, t, fontsize=7, color=col, fontfamily='monospace', fontweight='bold')
        ax.text(x_pos + 0.6, 0.9, seg, fontsize=6, color='#94a3b8', fontfamily='monospace', ha='center')
    ax.text(13.2, 1.5, '7:00', fontsize=7, color='#ef4444', fontfamily='monospace', fontweight='bold')
    
    # Arrows from members to timeline
    for i, (x, *_) in enumerate(members):
        ax.annotate('', xy=(x + 0.95, 1.7), xytext=(x + 0.95, 3.5),
                    arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5, ls='--'))
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, 'team.png'), dpi=200, bbox_inches='tight', facecolor='#0a0e1a')
    plt.close()
    print("Team diagram saved.")

if __name__ == "__main__":
    draw_architecture()
    draw_pipeline()
    draw_radar()
    draw_team()
    print("\nAll diagrams generated successfully!")
