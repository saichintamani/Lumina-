import torch
import cv2
import numpy as np
import kornia as K
from kornia.feature import LoFTR
import os
import json

def load_image_tensor(img_path):
    # Load grayscale image
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Could not load {img_path}")
    
    # Convert to float32 tensor in range [0, 1] and add batch/channel dims
    tensor = K.image_to_tensor(img, False).float() / 255.
    return tensor

def match_images_loftr(img1_path, img2_path, out_json_path):
    """
    Uses Kornia's LoFTR (Local Feature TRansformer) for scale-invariant matching.
    """
    print("Loading images...")
    img1 = load_image_tensor(img1_path)
    img2 = load_image_tensor(img2_path)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    img1, img2 = img1.to(device), img2.to(device)

    print(f"Initializing LoFTR on {device}...")
    # 'outdoor' weights are best for terrain mapping
    matcher = LoFTR(pretrained='outdoor').to(device)
    matcher.eval()

    print("Running deep learning feature matcher...")
    with torch.no_grad():
        input_dict = {"image0": img1, "image1": img2}
        correspondences = matcher(input_dict)
    
    # Correspondences dict contains keypoints0, keypoints1, and confidence
    mkpts0 = correspondences['keypoints0'].cpu().numpy()
    mkpts1 = correspondences['keypoints1'].cpu().numpy()
    confidence = correspondences['confidence'].cpu().numpy()

    # Filter for high confidence (lowered to 0.5 to capture more matches)
    mask = confidence > 0.5
    mkpts0_filtered = mkpts0[mask]
    mkpts1_filtered = mkpts1[mask]
    
    print(f"Found {len(mkpts0_filtered)} high-confidence matches.")

    # Save to JSON for the Next.js dashboard
    matches_data = []
    for i in range(len(mkpts0_filtered)):
        matches_data.append({
            "img1_x": float(mkpts0_filtered[i][0]),
            "img1_y": float(mkpts0_filtered[i][1]),
            "img2_x": float(mkpts1_filtered[i][0]),
            "img2_y": float(mkpts1_filtered[i][1]),
            "confidence": float(confidence[mask][i])
        })
    
    with open(out_json_path, 'w') as f:
        json.dump(matches_data, f)
        
    print(f"Matches saved to {out_json_path}")
    return mkpts0_filtered, mkpts1_filtered

if __name__ == "__main__":
    DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
    tmc_path = os.path.join(DATA_DIR, "tmc_sample.png")
    ohrc_path = os.path.join(DATA_DIR, "ohrc_sample.png")
    out_path = os.path.join(DATA_DIR, "..", "antigravity", "public", "matches.json")
    
    if os.path.exists(tmc_path) and os.path.exists(ohrc_path):
        match_images_loftr(tmc_path, ohrc_path, out_path)
    else:
        print("Run data_pipeline.py first to generate samples.")
