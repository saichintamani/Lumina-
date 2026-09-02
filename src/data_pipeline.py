import urllib.request
import ssl
import os
import cv2
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)

def download_and_prepare_lunar_data():
    """
    Downloads a sample high-res lunar surface image to act as our OHRC source.
    We will artificially downsample and crop it to simulate a TMC and OHRC pair
    for the deep learning pipeline to match.
    """
    # Sample high-res lunar image (Apollo 11 or similar as proxy for OHRC)
    url = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Apollo_11_lunar_surface.jpg/1024px-Apollo_11_lunar_surface.jpg"
    img_path = os.path.join(DATA_DIR, "lunar_surface_raw.jpg")
    
    if not os.path.exists(img_path):
        print("Generating synthetic lunar image...")
        # Create a base terrain with some noise and craters
        y, x = np.ogrid[-512:512, -512:512]
        img = np.zeros((1024, 1024), dtype=np.float32)
        
        # Add random noise (regolith)
        noise = np.random.normal(128, 40, (1024, 1024))
        
        # Add a crater
        crater_mask = (x**2 + y**2) < 200**2
        
        img = np.clip(noise - crater_mask * 50, 0, 255).astype(np.uint8)
        cv2.imwrite(img_path, img)
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Failed to load image.")

    # 1. Simulate TMC (Medium Resolution, wide FOV)
    # Resize to 256x256
    tmc_img = cv2.resize(img, (256, 256), interpolation=cv2.INTER_AREA)
    tmc_path = os.path.join(DATA_DIR, "tmc_sample.png")
    cv2.imwrite(tmc_path, tmc_img)

    # 2. Simulate OHRC (High Resolution, narrow FOV cropped from center)
    # Crop a 100x100 region from the center of the original high-res image
    h, w = img.shape
    center_y, center_x = h // 2, w // 2
    crop_size = 100
    
    ohrc_img = img[center_y - crop_size : center_y + crop_size, 
                   center_x - crop_size : center_x + crop_size]
    
    # OHRC is usually larger in pixels even if it covers a smaller area
    ohrc_img = cv2.resize(ohrc_img, (256, 256), interpolation=cv2.INTER_CUBIC)
    ohrc_path = os.path.join(DATA_DIR, "ohrc_sample.png")
    cv2.imwrite(ohrc_path, ohrc_img)

    print(f"Generated pseudo-TMC (low-res wide FOV) at {tmc_path}")
    print(f"Generated pseudo-OHRC (high-res narrow FOV) at {ohrc_path}")

    return tmc_path, ohrc_path

if __name__ == "__main__":
    download_and_prepare_lunar_data()
