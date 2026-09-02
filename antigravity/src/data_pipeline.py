import os
import yaml
import urllib.request
import zipfile
from pathlib import Path
from tqdm import tqdm

# Load configuration
CONFIG_PATH = Path(__file__).parent / "config.yaml"
with open(CONFIG_PATH) as f:
    cfg = yaml.safe_load(f)

RAW_DIR = Path(cfg["raw_dir"])
RAW_DIR.mkdir(parents=True, exist_ok=True)

# Public repo with pre‑processed tiles (Inter‑IIT Tech Meet 11.0)
DATA_URL = "https://github.com/InterIITTechMeet/MoonMappingChallenge/releases/download/v1.0/chandrayaan2_tiles.zip"

def download_and_extract():
    zip_path = RAW_DIR / "tiles.zip"
    if not zip_path.exists():
        print("Downloading tile archive…")
        urllib.request.urlretrieve(DATA_URL, zip_path)
    print("Extracting archive…")
    with zipfile.ZipFile(zip_path, "r") as z:
        for member in tqdm(z.infolist(), desc="Unzipping"):
            z.extract(member, RAW_DIR)

def get_image_pairs():
    """Return a list of (Path, Path) for overlapping image tiles.
    The repo ships a `pairs.txt` where each line contains two relative filenames.
    """
    pairs_file = RAW_DIR / "pairs.txt"
    pairs = []
    with open(pairs_file) as f:
        for line in f:
            a, b = line.strip().split()
            pairs.append((RAW_DIR / a, RAW_DIR / b))
    return pairs

if __name__ == "__main__":
    download_and_extract()
    print(f"Found {len(get_image_pairs())} image pairs.")
