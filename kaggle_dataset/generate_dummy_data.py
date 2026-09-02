import os
import numpy as np
import cv2
from pathlib import Path

raw_dir = Path('d:/My projects/ISRO/antigravity/data/raw')
raw_dir.mkdir(parents=True, exist_ok=True)

# Create two simple synthetic images (white square on black background)
img1 = np.zeros((256, 256, 3), dtype=np.uint8)
cv2.rectangle(img1, (50, 50), (200, 200), (255, 255, 255), -1)
img2 = np.zeros((256, 256, 3), dtype=np.uint8)
cv2.circle(img2, (128, 128), 80, (255, 255, 255), -1)

cv2.imwrite(str(raw_dir / 'img1.png'), img1)
cv2.imwrite(str(raw_dir / 'img2.png'), img2)

# Write pairs.txt
pairs_path = raw_dir / 'pairs.txt'
with open(pairs_path, 'w') as f:
    f.write('img1.png img2.png\n')
print('Dummy data created')
