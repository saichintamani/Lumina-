import torch
import cv2
import yaml
import json
from pathlib import Path
from kornia.feature import LoFTR
from tqdm import tqdm

# Load configuration
CONFIG_PATH = Path(__file__).parent / "config.yaml"
with open(CONFIG_PATH) as f:
    cfg = yaml.safe_load(f)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
LOFTR_MODEL = LoFTR(pretrained=cfg["loftr"]["pretrained"]).eval().to(DEVICE)

def read_image(path: Path) -> torch.Tensor:
    img = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, (640, 480))
    tensor = torch.from_numpy(img / 255.0).float()
    tensor = tensor[None, None, :, :]
    return tensor.to(DEVICE)

def match_pair(img_a: Path, img_b: Path):
    a = read_image(img_a)
    b = read_image(img_b)
    with torch.no_grad():
        matches = LOFTR_MODEL({"image0": a, "image1": b})
    mkpts0 = matches["keypoints0"].cpu().numpy()
    mkpts1 = matches["keypoints1"].cpu().numpy()
    confidence = matches["confidence"].cpu().numpy()
    thr = cfg["loftr"]["confidence_thr"]
    mask = confidence > thr
    return {
        "img_a": str(img_a),
        "img_b": str(img_b),
        "pts_a": mkpts0[mask].tolist(),
        "pts_b": mkpts1[mask].tolist(),
        "confidence": confidence[mask].tolist(),
    }

def run_batch(pairs):
    results = []
    for a, b in tqdm(pairs, desc="LoFTR matching"):
        results.append(match_pair(a, b))
    return results

if __name__ == "__main__":
    from .data_pipeline import get_image_pairs
    pairs = get_image_pairs()
    out = run_batch(pairs)
    out_path = Path(cfg["processed_dir"]) / cfg["matches_file"]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"Saved {len(out)} matches to {out_path}")
