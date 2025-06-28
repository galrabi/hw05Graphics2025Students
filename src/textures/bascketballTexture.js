export const createBasketballTexture = () => {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");

  // Draw the basketball texture
  context.fillStyle = "#7d2e0c";
  context.fillRect(0, 0, size, size);
  context.save();

  // Draw the basketball lines
  context.strokeStyle = "black";
  context.lineWidth = size / 100;

  const cx = size / 2; // Center x-coordinate
  const cy = size / 2; // Center y-coordinate

  // Draw the left vertical line
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, size);
  context.stroke();
  // Draw the right vertical line
  context.beginPath();
  context.moveTo(0, cy);
  context.lineTo(size, cy);
  context.stroke();
  // Draw the horizontal line
  context.beginPath();
  context.moveTo(cx, 0);
  context.lineTo(cx, size);
  context.stroke();

  // Draw the weird ellipse shape
  const angleOffset = 10 * (Math.PI / 180);
  context.beginPath();
  for (let i = 0; i <= size; i++) {
    const t = angleOffset + (i / size) * (2 * Math.PI - 2 * angleOffset);
    const x = cx + size * 0.45 * Math.cos(t);
    const pinch = 1 - Math.pow(Math.cos(2 * t), 2) / 2;
    const y = cy + size * 0.3 * Math.sin(t) * pinch;
    if (i === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};
