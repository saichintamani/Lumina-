"""
make_3d_animation.py
====================
Generates a 3D orbital visualization of Chandrayaan-3 scanning the lunar
south pole crater (Shiv Shakti Point context).

This script uses Plotly to create an interactive 3D surface map and saves it 
as an HTML component that can be embedded into our UI/UX dashboard.
"""

import sys
import os
import numpy as np
import plotly.graph_objects as go

# Add src to path to import synthetic data generator
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))
from synth_dfsar import load_synthetic_scene

def create_3d_crater_visualization(output_path="../frontend/3d_crater.html"):
    print("Loading Chandrayaan-3 synthetic DFSAR data...")
    scene = load_synthetic_scene()
    
    # Downsample for faster 3D rendering in browser
    step = 4
    elevation = scene["elevation_m"][::step, ::step]
    cpr = scene["cpr"][::step, ::step]
    ice_mask = scene["ground_truth_ice"][::step, ::step]
    
    ny, nx = elevation.shape
    y = np.linspace(0, ny * scene["meta"]["pixel_size_m"] * step, ny)
    x = np.linspace(0, nx * scene["meta"]["pixel_size_m"] * step, nx)
    
    # Create the base surface (colored by elevation or CPR)
    print("Generating 3D surface...")
    fig = go.Figure(data=[go.Surface(
        z=elevation, 
        x=x, 
        y=y,
        colorscale='Greys',
        showscale=False,
        name="Lunar Surface"
    )])
    
    # Highlight ice regions by adding them as a separate surface slightly above
    ice_elev = np.where(ice_mask, elevation + 2.0, np.nan)
    fig.add_trace(go.Surface(
        z=ice_elev,
        x=x,
        y=y,
        colorscale='Blues',
        showscale=False,
        name="Ice Deposits"
    ))
    
    fig.update_layout(
        title="Chandrayaan-3: Shiv Shakti Point DFSAR 3D Scan",
        scene=dict(
            xaxis_title='Azimuth (m)',
            yaxis_title='Range (m)',
            zaxis_title='Elevation (m)',
            camera=dict(
                eye=dict(x=1.5, y=1.5, z=1.2)
            ),
            aspectratio=dict(x=1, y=1, z=0.3)
        ),
        template="plotly_dark",
        margin=dict(l=0, r=0, b=0, t=40)
    )
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fig.write_html(output_path)
    print(f"3D Animation saved to {output_path}!")

if __name__ == "__main__":
    create_3d_crater_visualization()
