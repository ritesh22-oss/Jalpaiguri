from PIL import Image
import numpy as np

# Load original image
img_path = './src/assets/images/durga_ma_icon_1788702412453.jpg'
img = Image.open(img_path).convert('RGBA')
data = np.array(img)

# Convert white / off-white background pixels outside to transparent
# In the generated image, the background around Durga Ma is pure/near white (R>240, G>240, B>240)
r, g, b, a = data.T
white_areas = (r > 220) & (g > 220) & (b > 220)

# But wait! Eyes might be white! We don't want to make eyes transparent!
# Let's flood-fill from corners (0,0), (width,0), (0,height), (width,height) to only remove EXTERNAL background!
from collections import deque

h, w, _ = data.shape
visited = np.zeros((h, w), dtype=bool)
alpha = data[:, :, 3].copy()

# Threshold for background pixel
def is_bg(y, x):
    pr, pg, pb, _ = data[y, x]
    # Check if light gray/white or checkerboard
    return (int(pr) > 200 and int(pg) > 200 and int(pb) > 200)

queue = deque()
# Add border pixels to queue if they look like background
for x in range(w):
    if is_bg(0, x): queue.append((0, x)); visited[0, x] = True
    if is_bg(h-1, x): queue.append((h-1, x)); visited[h-1, x] = True
for y in range(h):
    if is_bg(y, 0): queue.append((y, 0)); visited[y, 0] = True
    if is_bg(y, w-1): queue.append((y, w-1)); visited[y, w-1] = True

while queue:
    cy, cx = queue.popleft()
    data[cy, cx, 3] = 0 # Make transparent
    
    for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
        ny, nx = cy + dy, cx + dx
        if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
            if is_bg(ny, nx):
                visited[ny, nx] = True
                queue.append((ny, nx))

out_img = Image.fromarray(data)
out_img.save('./public/durga-ma-icon.png', 'PNG')
out_img.save('./public/durga-ma-transparent.png', 'PNG')
print("Successfully saved transparent PNG to ./public/durga-ma-icon.png")
