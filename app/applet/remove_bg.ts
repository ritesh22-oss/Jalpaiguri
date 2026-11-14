import { Jimp } from 'jimp';

async function removeBackground() {
  try {
    const imagePath = './public/assets/aistudio/image_3ca593a8.png';
    const outputPath = './public/logo.png';
    const srcPath = './src/assets/logo.png';

    console.log('Loading image from', imagePath);
    const image = await Jimp.read(imagePath);

    image.scan((x, y, idx) => {
      const red = image.bitmap.data[idx + 0];
      const green = image.bitmap.data[idx + 1];
      const blue = image.bitmap.data[idx + 2];
      const alpha = image.bitmap.data[idx + 3];

      // If pixel is white or near-white background
      if (red > 230 && green > 230 && blue > 230) {
        // Set alpha to 0 (transparent)
        image.bitmap.data[idx + 3] = 0;
      }
    });

    await image.write(outputPath as any);
    await image.write(srcPath as any);
    console.log('Successfully generated true transparent PNG logo at', outputPath);
  } catch (err) {
    console.error('Error removing background:', err);
    process.exit(1);
  }
}

void removeBackground();
