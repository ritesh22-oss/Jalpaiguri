from PIL import Image, ImageDraw
from collections import deque

img_path = './src/assets/images/durga_ma_icon_1788702412453.jpg'
img = Image.open(img_path).convert('RGBA')
w, h = img.size

# We will floodfill from edge pixels that are bright (white/gray background)
# Create a mask for transparency
canvas = img.copy()

def is_light(color):
    r, g, b, a = color
    return r > 200 and g > 200 and b > 200

# Flood fill background from 4 corners
visited = set()
queue = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])

for pt in list(queue):
    visited.add(pt)

pixels = canvas.load()

while queue:
    x, y = queue.popleft()
    curr_color = pixels[x, y]
    
    if is_light(curr_color):
        pixels[x, y] = (0, 0, 0, 0) # Set transparent
        
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                visited.add((nx, ny))
                if is_light(pixels[nx, ny]):
                    queue.append((nx, ny))

canvas.save('./public/durga-ma-icon.png', 'PNG')
canvas.save('./public/durga-ma-transparent.png', 'PNG')
canvas.save('./src/assets/logo-durga.png', 'PNG')
print("Pure PIL script created transparent PNG successfully at ./public/durga-ma-icon.png!")
