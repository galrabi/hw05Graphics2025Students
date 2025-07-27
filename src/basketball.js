import { createBasketballTexture } from "./textures/bascketballTexture.js";

const COURT_LENGTH = 28;
const COURT_WIDTH = 15;
const COURT_HEIGHT = 0.2;
const BALL_RADIUS = 0.12;
const BALL_Y_POSITION = COURT_HEIGHT / 2 + BALL_RADIUS + 0.02;
const BALL_HORIZONTAL_SPEED = 0.05;

export const createBasketball = (scene) => {
  const geometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    map: createBasketballTexture(),
    shininess: 30,
    specular: 0x333333,
  });

  const ball = new THREE.Mesh(geometry, material);
  ball.position.set(0, BALL_Y_POSITION, 0);
  ball.castShadow = true;
  ball.receiveShadow = true;
  scene.add(ball);
  return ball;
};

const moveBasketball = (deltaX, deltaZ, basketballPosition, basketball) => {
  const newX = basketballPosition.x + deltaX;
  const newZ = basketballPosition.z + deltaZ;

  // Keep ball within court boundaries (with small margin for ball radius)
  const margin = BALL_RADIUS + 0.0125;
  if (
    Math.abs(newX) <= COURT_LENGTH / 2 - margin &&
    Math.abs(newZ) <= COURT_WIDTH / 2 - margin
  ) {
    // Update target position
    basketballPosition.x = newX;
    basketballPosition.z = newZ;

    // Smooth interpolation to target position
    const lerpFactor = 0.8;
    basketball.position.x = THREE.MathUtils.lerp(
      basketball.position.x,
      newX,
      lerpFactor
    );
    basketball.position.z = THREE.MathUtils.lerp(
      basketball.position.z,
      newZ,
      lerpFactor
    );

    // Compute rolling angles: θ = distance / radius
    const rollX = deltaZ / BALL_RADIUS;
    const rollZ = deltaX / BALL_RADIUS;

    // Apply roll (signs chosen to match forward/backward & left/right)
    basketball.rotation.x += rollX;
    basketball.rotation.z -= rollZ;
  }
};

export const updateBasketballMovement = (
  inputState,
  basketball
) => {
  let deltaX = 0;
  let deltaZ = 0;

  if (inputState.left) deltaX -= BALL_HORIZONTAL_SPEED;
  if (inputState.right) deltaX += BALL_HORIZONTAL_SPEED;
  if (inputState.up) deltaZ -= BALL_HORIZONTAL_SPEED;
  if (inputState.down) deltaZ += BALL_HORIZONTAL_SPEED;

  if (deltaX !== 0 || deltaZ !== 0) {
    const basketballPosition = basketball.position.clone();
    moveBasketball(deltaX, deltaZ, basketballPosition, basketball);
  }
};
