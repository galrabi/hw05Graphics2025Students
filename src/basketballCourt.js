import { createParquetTexture } from "./textures/parquet.js";
import {
  addFourDuplicates,
  addTwoDuplicates,
  translateBy,
  rotateBy,
} from "./utils.js";

const COURT_LENGTH = 28;
const COURT_WIDTH = 15;
const COURT_HEIGHT = 0.2;
const Y_OFFSET = 0.01;
const FILLS_Y_POSITION = COURT_HEIGHT / 2 + Y_OFFSET;
const LINES_Y_POSITION = FILLS_Y_POSITION + Y_OFFSET;
const COURT_MARGIN = 2;
const LINE_WIDTH = 0.1;
const CENTRE_CIRCLE_RADIUS = 1.8;
const THROW_IN_LINE_POSITION = 8.33;
const THREE_POINT_LINE_RADIUS = 6.75;
const THREE_POINT_LINE_SIDE_POSITION = 0.9;
const THREE_POINT_LINE_LENGTH = 3.04;
const THREE_POINT_START_ANGLE = THREE.MathUtils.radToDeg(
  Math.acos(
    (COURT_WIDTH / 2 - THREE_POINT_LINE_SIDE_POSITION) / THREE_POINT_LINE_RADIUS
  )
);
const RESTRICTED_AREA_RADIUS = 1.25;
const KEY_WIDTH = 4.9;
const KEY_LENGTH = 5.8;
const FREE_THROW_CIRCLE_RADIUS = 1.8;
const BASKET_POSITION = 1.575;

export const createBasketballCourt = (scene) => {
  createCourtFloor(scene);
  createCourtLines(scene);
};

const createCourtFloor = (scene) => {
  const parquetTexture = createParquetTexture();

  const courtGeometry = new THREE.BoxGeometry(
    COURT_LENGTH + COURT_MARGIN * 2,
    COURT_HEIGHT,
    COURT_WIDTH + COURT_MARGIN * 2
  );
  const courtMaterial = new THREE.MeshPhongMaterial({
    map: parquetTexture,
    shininess: 50,
  });

  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
};

const createLine = (length, color = 0xffffff, lineWidth = LINE_WIDTH) => {
  const geometry = new THREE.PlaneGeometry(lineWidth, length);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshPhongMaterial({
    color,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.position.set(0, LINES_Y_POSITION, 0);
  return mesh;
};

const createRectangle = (
  height,
  width,
  color = 0xffffff,
  lineWidth = LINE_WIDTH
) => {
  const group = new THREE.Group();

  const bottom = createLine(width + lineWidth / 2, color, lineWidth);
  translateBy(bottom, -height / 2, 0);
  group.add(bottom);
  const top = createLine(width + lineWidth / 2, color, lineWidth);
  translateBy(top, height / 2, 0);
  group.add(top);

  const left = createLine(height + lineWidth / 2, color, lineWidth);
  rotateBy(left, 90);
  translateBy(left, 0, -width / 2);
  group.add(left);

  const right = createLine(height + lineWidth / 2, color, lineWidth);
  rotateBy(right, 90);
  translateBy(right, 0, width / 2);
  group.add(right);
  return group;
};

const createFilledRectangle = (height, width, fillColor = 0xffffff) => {
  const geometry = new THREE.PlaneGeometry(height, width);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshPhongMaterial({
    color: fillColor,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.position.set(0, FILLS_Y_POSITION, 0);
  return mesh;
};

const createCircle = (
  radius,
  startDeg = 0,
  lengthDeg = 360,
  color = 0xffffff,
  lineWidth = LINE_WIDTH,
  segments = 64
) => {
  const inner = radius - lineWidth / 2;
  const outer = radius + lineWidth / 2;
  const startRad = THREE.MathUtils.degToRad(startDeg);
  const lengthRad = THREE.MathUtils.degToRad(lengthDeg);

  const geometry = new THREE.RingGeometry(
    inner,
    outer,
    segments,
    1,
    startRad,
    lengthRad
  );
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.position.set(0, LINES_Y_POSITION, 0);
  return mesh;
};

const createFilledCircle = (
  radius,
  fillColor = 0xffffff,
  startDeg = 0,
  lengthDeg = 360,
  segments = 64
) => {
  const startRad = THREE.MathUtils.degToRad(startDeg);
  const lengthRad = THREE.MathUtils.degToRad(lengthDeg);

  const geometry = new THREE.CircleGeometry(
    radius,
    segments,
    startRad,
    lengthRad
  );
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshBasicMaterial({
    color: fillColor,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.position.set(0, FILLS_Y_POSITION, 0);
  return mesh;
};

const createDashedCircle = (
  radius,
  startDeg = 0,
  lengthDeg = 360,
  dashSize = 5,
  gapSize = 5,
  color = 0xffffff,
  lineWidth = LINE_WIDTH,
  segments = 64
) => {
  const group = new THREE.Group();
  const span = dashSize + gapSize;
  const innerSegments = Math.ceil((segments * span) / lengthDeg);

  for (let s = startDeg; s < startDeg + lengthDeg; s += span) {
    const l = Math.min(dashSize, lengthDeg - s + startDeg);
    const seg = createCircle(radius, s, l, color, lineWidth, innerSegments);
    group.add(seg);
  }
  return group;
};

const addBoundaries = (scene) => {
  const group = new THREE.Group();
  // mid-court line
  const midCourtLine = createLine(COURT_WIDTH);
  // boundary lines
  const boundaryLines = createRectangle(COURT_LENGTH, COURT_WIDTH);
  group.add(midCourtLine, boundaryLines);
  scene.add(group);
};

const addCenterCircle = (scene) => {
  const group = new THREE.Group();
  // centre circle fill
  const centreCircleFill = createFilledCircle(CENTRE_CIRCLE_RADIUS, 0xc62828);
  // centre circle line
  const centreCircleLine = createCircle(CENTRE_CIRCLE_RADIUS);
  group.add(centreCircleFill, centreCircleLine);
  scene.add(group);
};

const addThrowInLines = (scene) => {
  addFourDuplicates(
    scene,
    createLine(0.25),
    COURT_LENGTH / 2 - THROW_IN_LINE_POSITION,
    (COURT_WIDTH - 0.25) / 2
  );
};

const addThreePointLines = (scene) => {
  const group = new THREE.Group();
  const rightLine = createLine(THREE_POINT_LINE_LENGTH);
  rotateBy(rightLine, 90);
  translateBy(rightLine, 0, COURT_WIDTH / 2 - THREE_POINT_LINE_SIDE_POSITION);
  const leftLine = rightLine.clone();
  leftLine.position.z = -leftLine.position.z;
  const ring = createCircle(
    THREE_POINT_LINE_RADIUS,
    90 + THREE_POINT_START_ANGLE,
    180 - 2 * THREE_POINT_START_ANGLE
  );
  group.add(rightLine, leftLine, ring);
  addTwoDuplicates(
    scene,
    group,
    COURT_LENGTH / 2 - THREE_POINT_LINE_LENGTH / 2
  );
};

const addRestrictedAreas = (scene) => {
  const restrictedArea = createCircle(RESTRICTED_AREA_RADIUS, 90, -180);
  addTwoDuplicates(scene, restrictedArea, BASKET_POSITION - COURT_LENGTH / 2);
};

const addKeyAreas = (scene) => {
  const group = new THREE.Group();
  const fill = createFilledRectangle(KEY_LENGTH, KEY_WIDTH, 0x283593);
  const lines = createRectangle(KEY_LENGTH, KEY_WIDTH);
  group.add(lines, fill);
  addTwoDuplicates(scene, group, COURT_LENGTH / 2 - KEY_LENGTH / 2);
};

const addFreeThrowCircles = (scene) => {
  const group = new THREE.Group();
  const fill = createFilledCircle(FREE_THROW_CIRCLE_RADIUS, 0x1a237e, 90, 180);
  const ring = createCircle(FREE_THROW_CIRCLE_RADIUS, 90, 180);
  const dashedRing = createDashedCircle(
    FREE_THROW_CIRCLE_RADIUS,
    275,
    180,
    10,
    10
  );
  group.add(fill, ring, dashedRing);
  addTwoDuplicates(scene, group, COURT_LENGTH / 2 - KEY_LENGTH);
};

const addKeySideLines = (scene) => {
  const group = new THREE.Group();
  const positions = [0, 0.85, 0.85, 0.85];
  const lengths = [0.05, 0.4, 0.05, 0.05];
  const offset = 1.75 + lengths[0] / 2;
  let currentPosition = 0;
  for (let i = 0; i < positions.length; i++) {
    currentPosition -= lengths[i] / 2 + positions[i];
    const line = createLine(lengths[i]);
    rotateBy(line, 90);
    translateBy(line, currentPosition, 0);
    group.add(line);
  }
  addFourDuplicates(
    scene,
    group,
    COURT_LENGTH / 2 - offset,
    KEY_WIDTH / 2 + LINE_WIDTH
  );
};

const createCourtLines = (scene) => {
  addBoundaries(scene);
  addCenterCircle(scene);
  addThrowInLines(scene);
  addThreePointLines(scene);
  addRestrictedAreas(scene);
  addKeyAreas(scene);
  addFreeThrowCircles(scene);
  addKeySideLines(scene);
};
