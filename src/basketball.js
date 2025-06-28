import { createBasketballTexture } from "./textures/bascketballTexture.js";

const COURT_HEIGHT = 0.2;
const BALL_RADIUS = 0.12;
const BALL_Y_POSITION = COURT_HEIGHT / 2 + BALL_RADIUS + 0.02;

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
