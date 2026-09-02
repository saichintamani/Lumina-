import argparse
from pathlib import Path
import yaml
import json

from .data_pipeline import get_image_pairs
from .dl_matching import run_batch

def main(dry_run: bool):
    cfg_path = Path(__file__).parent / "config.yaml"
    cfg = yaml.safe_load(open(cfg_path))
    pairs = get_image_pairs()
    if dry_run:
        print(f"[DRY RUN] {len(pairs)} pairs would be processed.")
        return
    results = run_batch(pairs)
    out_path = Path(cfg["processed_dir"]) / cfg["matches_file"]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    # Copy the result to the public directory for the React app to fetch
    import shutil, os
    public_path = Path(__file__).parent.parent / "public" / "data" / "processed"
    public_path.mkdir(parents=True, exist_ok=True)
    shutil.copy2(out_path, public_path / out_path.name)
    print(f"Finished – matches written to {out_path} and copied to {public_path / out_path.name}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Only show how many pairs exist")
    args = parser.parse_args()
    main(args.dry_run)
