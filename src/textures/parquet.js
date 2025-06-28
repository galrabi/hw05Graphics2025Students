import { randomColor, arrayToRgb } from "../utils.js";

export const createParquetTexture = (
  height = 2048,
  width = 2048,
  boardHeight = height / 64,
  boardWidth = width / 4
) => {
  const baseWoodColor = [198, 134, 66];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  context.fillStyle = arrayToRgb(baseWoodColor);
  context.fillStyle = context.fillRect(0, 0, width, height);

  for (let y = 0; y < height; y += boardHeight) {
    const xOffset =
      Math.floor(y / boardHeight) % 2 === 0 ? boardWidth * 0.5 : 0;
    for (let x = -xOffset; x < width; x += boardWidth) {
      const gradient = context.createLinearGradient(x, y, x + boardWidth, y);
      gradient.addColorStop(0, arrayToRgb([0, 0, 0, Math.random() * 0.1]));
      gradient.addColorStop(1, arrayToRgb([0, 0, 0, Math.random() * 0.1]));

      context.fillStyle = randomColor(baseWoodColor, 10);
      context.fillRect(x, y, boardWidth, boardHeight);

      context.fillStyle = gradient;
      context.fillRect(x, y, boardWidth, boardHeight);

      context.strokeStyle = 0x00000033;
      context.lineWidth = 0.1;
      context.strokeRect(x, y, boardWidth, boardHeight);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
};
