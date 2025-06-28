import { addTwoDuplicates } from "./utils.js";

const COURT_HEIGHT = 0.2;
const COURT_LENGTH = 28;
const BACKBOARD_THICKNESS = 0.05;
const BACKBOARD_WIDTH = 1.8;
const BACKBOARD_HEIGHT = 1.05;
const RIM_Y_OFFSET = 0.15;
const BASKET_POSITION = 1.575;
const RIM_HEIGHT_ABOVE_GROUND = COURT_HEIGHT / 2 + 3.05;
const BACKBOARD_FRAME_THICKNESS = 0.07;
const BACKBOARD_HEIGHT_ABOVE_GROUND = RIM_HEIGHT_ABOVE_GROUND - RIM_Y_OFFSET;
const SHOOTING_SQUARE_WIDTH = 0.59;
const SHOOTING_SQUARE_HEIGHT = 0.45;
const SHOOTING_SQUARE_LINE_WIDTH = 0.05;
const RIM_RADIUS = 0.45 / 2;
const RIM_TUBE_RADIUS = 0.02 / 2;
const ARM_WIDTH = 0.3;
const ARM_HEIGHT =
  BACKBOARD_HEIGHT_ABOVE_GROUND +
  ARM_WIDTH / 2 +
  BACKBOARD_HEIGHT / 2 -
  RIM_Y_OFFSET;
const NET_HEIGHT = 0.4;
const NET_MIDDLE_RADIUS = RIM_RADIUS * 0.9;
const NET_BOTTOM_RADIUS = RIM_RADIUS * 0.6;

const createLine = (length, lineWidth, color = 0xffffff) => {
  const geometry = new THREE.PlaneGeometry(lineWidth, length);
  geometry.rotateY(-Math.PI / 2);
  const material = new THREE.MeshPhongMaterial({
    color,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
};

const createPole = (
  length,
  width,
  thickness,
  color = 0xffffff,
  shininess = 80
) => {
  const geometry = new THREE.BoxGeometry(thickness, length, width);
  const material = new THREE.MeshPhongMaterial({
    color,
    shininess: shininess,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
};

const createRectangle = (height, width, lineWidth, color = 0xffffff) => {
  const group = new THREE.Group();
  const horizontal = createLine(lineWidth, width + lineWidth, color);
  const vertical = createLine(height + lineWidth, lineWidth, color);
  const bottom = horizontal.clone();
  bottom.position.set(0, -height / 2, 0);
  const top = horizontal.clone();
  top.position.set(0, height / 2, 0);
  const left = vertical.clone();
  left.position.set(0, 0, -width / 2);
  const right = vertical.clone();
  right.position.set(0, 0, width / 2);
  group.add(bottom, top, left, right);
  return group;
};

const createFrame = (
  height,
  width,
  thickness,
  color = 0xffffff,
  shininess = 80
) => {
  const group = new THREE.Group();
  const horizontal = createPole(
    thickness,
    width + thickness,
    thickness,
    color,
    shininess
  );
  const vertical = createPole(
    height + thickness,
    thickness,
    thickness,
    color,
    shininess
  );
  const bottom = horizontal.clone();
  bottom.position.set(0, -height / 2, 0);
  const top = horizontal.clone();
  top.position.set(0, height / 2, 0);
  const left = vertical.clone();
  left.position.set(0, 0, -width / 2);
  const right = vertical.clone();
  right.position.set(0, 0, width / 2);
  group.add(bottom, top, left, right);
  return group;
};

const createArm = () => {
  const group = new THREE.Group();
  const vertical = createPole(ARM_HEIGHT, ARM_WIDTH, ARM_WIDTH, 0x1a237e, 80);
  const horizontal = createPole(
    ARM_WIDTH,
    ARM_WIDTH,
    BASKET_POSITION + ARM_WIDTH,
    0x1a237e,
    80
  );
  horizontal.position.set(
    -BASKET_POSITION / 2,
    ARM_HEIGHT / 2 - ARM_WIDTH / 2,
    0
  );
  group.add(vertical, horizontal);
  group.castShadow = true;
  return group;
};

const createBackboard = () => {
  const geometry = new THREE.BoxGeometry(
    BACKBOARD_THICKNESS,
    BACKBOARD_HEIGHT,
    BACKBOARD_WIDTH
  );
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
  });
  const mesh = new THREE.Mesh(geometry, material);

  const frame = createFrame(
    BACKBOARD_HEIGHT,
    BACKBOARD_WIDTH,
    BACKBOARD_FRAME_THICKNESS,
    0x1a237e
  );
  const shootingSquare = createRectangle(
    SHOOTING_SQUARE_HEIGHT,
    SHOOTING_SQUARE_WIDTH,
    SHOOTING_SQUARE_LINE_WIDTH
  );
  shootingSquare.position.set(
    BACKBOARD_THICKNESS / 2 - 0.1,
    RIM_Y_OFFSET - BACKBOARD_HEIGHT / 2 + SHOOTING_SQUARE_HEIGHT / 2,
    0
  );

  const group = new THREE.Group();
  group.add(mesh, frame, shootingSquare);
  group.receiveShadow = true;
  group.castShadow = true;
  return group;
};

const createRim = () => {
  const geometry = new THREE.TorusGeometry(
    RIM_RADIUS,
    RIM_TUBE_RADIUS,
    16,
    100
  );
  const material = new THREE.MeshPhongMaterial({
    color: 0xd35400,
    shininess: 80,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(BACKBOARD_THICKNESS / 2 + RIM_RADIUS, 0);
  mesh.castShadow = true;
  return mesh;
};

const createNet = (rim) => {
  const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const netPoints = [];
  const segments = 16;

  // build the three rings of points: top (rim), middle, bottom
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // top ring (at rim level, y = 0)
    netPoints.push(new THREE.Vector3(cos * RIM_RADIUS, 0, sin * RIM_RADIUS));
    // middle ring
    netPoints.push(
      new THREE.Vector3(
        cos * NET_MIDDLE_RADIUS,
        -NET_HEIGHT * 0.5,
        sin * NET_MIDDLE_RADIUS
      )
    );
    // bottom ring
    netPoints.push(
      new THREE.Vector3(
        cos * NET_BOTTOM_RADIUS,
        -NET_HEIGHT,
        sin * NET_BOTTOM_RADIUS
      )
    );
  }

  const group = new THREE.Group();
  group.castShadow = false;
  group.receiveShadow = false;

  // vertical and diagonal strands
  for (let i = 0; i < segments; i++) {
    const base = i * 3;
    const nextBase = ((i + 1) % segments) * 3;

    // vertical drop from rim to middle, and middle to bottom
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          netPoints[base],
          netPoints[base + 1],
        ]),
        netMaterial
      )
    );
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          netPoints[base + 1],
          netPoints[base + 2],
        ]),
        netMaterial
      )
    );

    // diagonal between levels to next segment
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          netPoints[base],
          netPoints[nextBase + 1],
        ]),
        netMaterial
      )
    );
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          netPoints[base + 1],
          netPoints[nextBase + 2],
        ]),
        netMaterial
      )
    );
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          netPoints[base + 1],
          netPoints[nextBase + 1],
        ]),
        netMaterial
      )
    );
  }

  // circular loops at each level
  for (let level = 0; level < 3; level++) {
    const ringPts = [];
    for (let i = 0; i <= segments; i++) {
      ringPts.push(netPoints[i * 3 + level]);
    }
    group.add(
      new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(ringPts),
        netMaterial
      )
    );
  }

  return group;
};

const createBasketballHoop = () => {
  const backboard = createBackboard();
  const rim = createRim();
  backboard.position.set(
    -BASKET_POSITION,
    BACKBOARD_HEIGHT_ABOVE_GROUND +
      BACKBOARD_HEIGHT / 2 +
      BACKBOARD_FRAME_THICKNESS / 2,
    0
  );
  rim.position.set(
    -BACKBOARD_THICKNESS - RIM_TUBE_RADIUS * 2 - RIM_RADIUS - BASKET_POSITION,
    RIM_HEIGHT_ABOVE_GROUND,
    0
  );
  const arm = createArm();
  arm.position.set(BACKBOARD_THICKNESS + ARM_WIDTH / 2, ARM_HEIGHT / 2, 0);
  const net = createNet(rim);
  net.position.copy(rim.position);
  const group = new THREE.Group();
  group.add(backboard, rim, arm, net);
  return group;
};

export const createBasketballHoops = (scene) => {
  addTwoDuplicates(scene, createBasketballHoop(), COURT_LENGTH / 2);
};
