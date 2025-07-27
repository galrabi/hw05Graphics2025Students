export const randomNumber = (base, range) =>
  base + Math.round((Math.random() - 0.5) * range);

export const arrayToRgb = (arr) => `rgb(${arr.join(", ")})`;

export const randomColor = (color, range = 10) =>
  arrayToRgb(color.map((c) => randomNumber(c, range)));

export const rotateBy = (object, deg) => {
  object.quaternion.setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    THREE.MathUtils.degToRad(deg)
  );
};

export const translateBy = (object, x, z) => {
  object.position.x += x;
  object.position.z += z;
};

export const addTwoDuplicates = (scene, object, x, z = 0, rotate = true) => {
  const object1 = object.clone();
  translateBy(object1, x, z);
  const object2 = object1.clone();
  object2.position.x = -object1.position.x;
  if (rotate) {
    rotateBy(object2, 180);
  }
  scene.add(object1, object2);
  return [object1, object2];
};

export const addFourDuplicates = (scene, object, x, z) => {
  addTwoDuplicates(scene, object, x, z);
  addTwoDuplicates(scene, object, x, -z);
};
