import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor

def update_sih_presentation():
    prs = Presentation("SIH_Submission_StormBreaker.pptx")
    
    # Define a clean blue accent color
    accent_color = RGBColor(0, 102, 204)
    dark_gray = RGBColor(50, 50, 50)
    
    # ---------------- SLIDE 1: Title Page ----------------
    slide1 = prs.slides[0]
    for shape in slide1.shapes:
        if shape.name == 'TextBox 9' and shape.has_text_frame:
            text_frame = shape.text_frame
            text_frame.clear()
            
            # Intentionally leaving Problem Statement blank as per user request
            p = text_frame.paragraphs[0]
            p.text = "Theme: Space Technology"
            p.font.size = Pt(20)
            p.font.bold = True
            
            p = text_frame.add_paragraph()
            p.text = "PS Category: Software"
            p.font.size = Pt(20)
            p.font.bold = True
            
            p = text_frame.add_paragraph()
            p.text = "\nTeam Name (Registered on portal): storm Breaker"
            p.font.size = Pt(24)
            p.font.bold = True
            p.font.color.rgb = accent_color
            
            # Ensure text is black and readable
            for paragraph in text_frame.paragraphs:
                for run in paragraph.runs:
                    run.font.color.rgb = dark_gray
                    
    # Helper to update team name in ovals
    def update_team_name(slide):
        for shape in slide.shapes:
            if "Oval" in shape.name and shape.has_text_frame:
                shape.text_frame.text = "storm Breaker"
                for p in shape.text_frame.paragraphs:
                    p.alignment = PP_ALIGN.CENTER
                    for r in p.runs:
                        r.font.size = Pt(14)
                        r.font.bold = True

    # Helper to format main text body
    def add_bullet(tf, text, is_bold=False, size=18, color=dark_gray):
        p = tf.add_paragraph()
        p.text = "• " + text
        p.font.size = Pt(size)
        p.font.color.rgb = color
        if is_bold:
            p.font.bold = True

    # ---------------- SLIDE 2: Proposed Solution ----------------
    slide2 = prs.slides[1]
    update_team_name(slide2)
    slide2.shapes[1].text_frame.text = "IDEA TITLE: Lumina - Autonomous Lunar Digital Twin"
    for shape in slide2.shapes:
        if shape.name == 'TextBox 8' and shape.has_text_frame:
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "Proposed Solution:"
            p.font.bold = True
            p.font.size = Pt(22)
            p.font.color.rgb = accent_color
            
            add_bullet(tf, "Real-time, browser-native 3D Digital Twin of the Faustini Crater (WebGL 60FPS).")
            add_bullet(tf, "Simulates 64 autonomous micro-rovers using Craig Reynolds' Boids Algorithm for sub-surface mapping.")
            add_bullet(tf, "Integrates an Explainable AI (XAI) orchestrator providing real-time reasoning for telemetry.")
            add_bullet(tf, "Physics-accurate simulation including a 2.6-second Earth-Moon communication latency.")
            
    img_path = "slide_6_7_extracted/screenshot2_missioncontrol.png"
    if os.path.exists(img_path):
        slide2.shapes.add_picture(img_path, Inches(0.5), Inches(3.7), width=Inches(8))

    # ---------------- SLIDE 3: Technical Approach ----------------
    slide3 = prs.slides[2]
    update_team_name(slide3)
    for shape in slide3.shapes:
        if shape.name == 'TextBox 8' and shape.has_text_frame:
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "Technical Stack & Innovation:"
            p.font.bold = True
            p.font.size = Pt(22)
            p.font.color.rgb = accent_color
            
            add_bullet(tf, "Frontend & 3D: Next.js 16, React Three Fiber, Three.js (InstancedMesh for swarm rendering).")
            add_bullet(tf, "Core Science: We reject the flawed 'CPR > 1' assumption for ice.")
            add_bullet(tf, "Innovation: Our pipeline strictly requires a two-parameter criterion (CPR > 1 AND DOP < 0.13) to eliminate surface roughness artifacts.")
            add_bullet(tf, "Pathfinding: A* algorithm dynamically avoids slopes > 15°.")
            
    img_path2 = "slide_6_7_extracted/lumina_architecture_diagram_1782737865178.png"
    if os.path.exists(img_path2):
        slide3.shapes.add_picture(img_path2, Inches(2.0), Inches(3.8), height=Inches(3.3))

    # ---------------- SLIDE 4: Feasibility and Viability ----------------
    slide4 = prs.slides[3]
    update_team_name(slide4)
    for shape in slide4.shapes:
        if shape.name == 'TextBox 8' and shape.has_text_frame:
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "Feasibility & Risk Mitigation:"
            p.font.bold = True
            p.font.size = Pt(22)
            p.font.color.rgb = accent_color
            
            add_bullet(tf, "Feasibility: 100% serverless, zero-infrastructure architecture deployed via Vercel.")
            add_bullet(tf, "Risk: Rendering 64 3D rovers and real-time shadows typically causes severe browser lag.")
            add_bullet(tf, "Mitigation: Implemented highly optimized GPU shaders and InstancedMesh rendering, achieving a stable 60 FPS even on mid-range devices.")
            
    img_path3 = "slide_6_7_extracted/screenshot3_navcam.png"
    if os.path.exists(img_path3):
        slide4.shapes.add_picture(img_path3, Inches(0.5), Inches(3.5), width=Inches(8))

    # ---------------- SLIDE 5: Impact and Benefits ----------------
    slide5 = prs.slides[4]
    update_team_name(slide5)
    for shape in slide5.shapes:
        if shape.name == 'TextBox 8' and shape.has_text_frame:
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "Strategic Impact for ISRO:"
            p.font.bold = True
            p.font.size = Pt(22)
            p.font.color.rgb = accent_color
            
            add_bullet(tf, "Mission Sandbox: Provides engineers with a risk-free, highly accurate environment to stress-test swarms.")
            add_bullet(tf, "AI Trust & Transparency: Explainable AI bridges the gap between autonomous decisions and human operators.")
            add_bullet(tf, "Scalability: The architecture is fully prepared to ingest data from future missions (e.g., LUPEX).")
            
    img_path4 = "slide_6_7_extracted/screenshot1_landing.png"
    if os.path.exists(img_path4):
        slide5.shapes.add_picture(img_path4, Inches(0.5), Inches(3.5), width=Inches(8))

    # ---------------- SLIDE 6: Research and References ----------------
    slide6 = prs.slides[5]
    update_team_name(slide6)
    for shape in slide6.shapes:
        if shape.name == 'TextBox 8' and shape.has_text_frame:
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "Research & Repository Links:"
            p.font.bold = True
            p.font.size = Pt(22)
            p.font.color.rgb = accent_color
            
            add_bullet(tf, "Repository: https://github.com/saichintamani/Lumina-")
            add_bullet(tf, "Live Demo: https://antigravity-faxkdjo57-sai-chintamanis-projects.vercel.app")
            add_bullet(tf, "Data Sources: Chandrayaan-2 DFSAR and CLASS Spectrometer datasets.")
            add_bullet(tf, "Scientific Basis: Sinha et al. (2026) and Verma et al. (2025) on two-parameter (CPR/DOP) ice inversion.")
            add_bullet(tf, "Algorithms: Craig Reynolds (Boids).")

    # ---------------- Delete Slide 7 ----------------
    xml_slides = prs.slides._sldIdLst  
    slides = list(xml_slides)
    if len(slides) > 6:
        xml_slides.remove(slides[6])

    prs.save("SIH_Submission_StormBreaker_Final_V2.pptx")
    print("Saved SIH_Submission_StormBreaker_Final_V2.pptx")

if __name__ == '__main__':
    update_sih_presentation()
