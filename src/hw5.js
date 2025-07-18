import { createBasketball } from "./basketball.js";
import { createBasketballCourt } from "./basketballCourt.js";
import { createBasketballHoops } from "./basketballHoops.js";
import { OrbitControls } from "./OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

// Create all elements
createBasketballCourt(scene);
createBasketballHoops(scene);
createBasketball(scene);

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Instructions display
const instructionsElement = document.createElement("div");
instructionsElement.style.position = "absolute";
instructionsElement.style.bottom = "20px";
instructionsElement.style.left = "20px";
instructionsElement.style.color = "white";
instructionsElement.style.fontSize = "16px";
instructionsElement.style.fontFamily = "Arial, sans-serif";
instructionsElement.style.textAlign = "left";
instructionsElement.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
instructionsElement.style.borderRadius = "5px";
instructionsElement.style.padding = "15px";
instructionsElement.innerHTML = `
  <h3>Controls:</h3>
  <p>O - Toggle orbit camera</p>
`;
document.body.appendChild(instructionsElement);

// Score display
const scoreElement = document.createElement("div");
scoreElement.style.position = "absolute";
scoreElement.style.bottom = "20px";
scoreElement.style.right = "20px";
scoreElement.style.color = "white";
scoreElement.style.fontSize = "16px";
scoreElement.style.fontFamily = "Arial, sans-serif";
scoreElement.style.textAlign = "left";
scoreElement.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
scoreElement.style.borderRadius = "5px";
scoreElement.style.padding = "15px";
scoreElement.innerHTML = `
  <h3>Score: 0</h3>
`;
document.body.appendChild(scoreElement);

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener("keydown", handleKeyDown);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();

  renderer.render(scene, camera);
}

animate();
