import { createBasketball, updateBasketballMovement } from "./basketball.js";
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

// stats
let score = 0;
let shotAttempts = 0;
let shotsMade = 0;
let hitSomething = false;
let combo = 0;

// Create all elements
createBasketballCourt(scene);
const { backboards, rims, arms, nets } = createBasketballHoops(scene);
const ball = createBasketball(scene);

const HOOP_POSITIONS = rims.map((rim) => rim.position.clone());

// physics variables
const initialBallPosition = ball.position.clone();
let ballVelocity = new THREE.Vector3();
let isShooting = false;
let scoreMode = false;
let shotPower = 50;

const COURT_LENGTH = 28;
const COURT_WIDTH = 15;
const COURT_HEIGHT = 0.2;
const Y_OFFSET = 0.01;
const BALL_RADIUS = 0.12;
const RIM_RADIUS = 0.6 / 2;
const RIM_TUBE_RADIUS = 0.02 / 2;
const RIM_HOLE_RADIUS = RIM_RADIUS - RIM_TUBE_RADIUS;
const GRAVITY = -9.8;
const RIM_BOUNCINESS = 0.8;
const BALL_BOUNCINESS = 0.7;

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
instructionsElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
instructionsElement.style.borderRadius = "5px";
instructionsElement.style.padding = "15px";
instructionsElement.innerHTML = `
  <h3>Controls:</h3>
  <p>Arrow Keys - Move basketball</p>
  <p>W/S - Adjust shot power</p>
  <p>Spacebar - Shoot basketball</p>
  <p>R - Reset basketball</p>
  <p>O - Toggle orbit camera</p>
`;
document.body.appendChild(instructionsElement);

// Score display
const scoreElement = document.createElement("div");
scoreElement.style.position = "absolute";
scoreElement.style.top = "20px";
scoreElement.style.right = "20px";
scoreElement.style.color = "white";
scoreElement.style.fontSize = "16px";
scoreElement.style.fontFamily = "Arial, sans-serif";
scoreElement.style.textAlign = "right";
scoreElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
scoreElement.style.borderRadius = "5px";
scoreElement.style.padding = "15px";
document.body.appendChild(scoreElement);

// Power display
const powerElement = document.createElement("div");
powerElement.style.position = "absolute";
powerElement.style.top = "20px";
powerElement.style.left = "20px";
powerElement.style.color = "white";
powerElement.style.fontSize = "16px";
powerElement.style.fontFamily = "Arial, sans-serif";
powerElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
powerElement.style.borderRadius = "5px";
powerElement.style.padding = "15px";
document.body.appendChild(powerElement);

// Status message display
const statusElement = document.createElement("div");
statusElement.style.position = "absolute";
statusElement.style.top = "50%";
statusElement.style.left = "50%";
statusElement.style.transform = "translate(-50%, -50%)";
statusElement.style.color = "white";
statusElement.style.fontSize = "24px";
statusElement.style.fontFamily = "Arial, sans-serif";
statusElement.style.fontWeight = "bold";
statusElement.style.textAlign = "center";
statusElement.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
statusElement.style.borderRadius = "10px";
statusElement.style.padding = "20px";
statusElement.style.display = "none";
statusElement.style.zIndex = "1000";
document.body.appendChild(statusElement);

// Update functions
function updateScoreDisplay() {
  const accuracy =
    shotAttempts > 0 ? Math.round((shotsMade / shotAttempts) * 100) : 0;
  scoreElement.innerHTML = `
    <h3>Statistics:</h3>
    <p>Score: ${score}</p>
    <p>Attempts: ${shotAttempts}</p>
    <p>Shots Made: ${shotsMade}</p>
    <p>Accuracy: ${accuracy}%</p>
    <p>Combo: ${combo}</p>
  `;
}

function updatePowerDisplay() {
  const powerColor =
    shotPower < 30 ? "#ff6b6b" : shotPower < 70 ? "#ffd93d" : "#6bcf7f";

  powerElement.innerHTML = `
    <h3>Shot Power:</h3>
    <p>${shotPower}%</p>
    <div style="
      width: 200px; 
      height: 20px; 
      background-color: #333; 
      border-radius: 10px; 
      overflow: hidden;
      border: 2px solid #555;
    ">
      <div style="
        width: ${shotPower}%; 
        height: 100%; 
        background-color: ${powerColor}; 
        transition: all 0.1s ease;
        border-radius: 8px;
      "></div>
    </div>
  `;
}

function showStatusMessage(message, duration = 1000) {
  statusElement.textContent = message;
  statusElement.style.display = "block";
  setTimeout(() => {
    statusElement.style.display = "none";
  }, duration);
}

// Initialize UI
updateScoreDisplay();
updatePowerDisplay();

let inputState = {
  left: false,
  right: false,
  up: false,
  down: false,
};

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o" || e.key === "O") {
    isOrbitEnabled = !isOrbitEnabled;
  }

  // Only allow basketball controls when physics is not active
  if (!isShooting) {
    switch (e.key) {
      case "ArrowLeft":
        inputState.down = true;
        break;
      case "ArrowRight":
        inputState.up = true;
        break;
      case "ArrowUp":
        inputState.left = true;
        break;
      case "ArrowDown":
        inputState.right = true;
        break;
      case "w":
      case "W":
        shotPower = Math.min(100, shotPower + 2);
        updatePowerDisplay();
        break;
      case "s":
      case "S":
        shotPower = Math.max(0, shotPower - 2);
        updatePowerDisplay();

        break;
      case " ": // Spacebar
        scoreMode = true;
        e.preventDefault();
        isShooting = true;
        shotAttempts++;
        const targetHoop =
          ball.position.distanceTo(HOOP_POSITIONS[0]) <
          ball.position.distanceTo(HOOP_POSITIONS[1])
            ? HOOP_POSITIONS[0]
            : HOOP_POSITIONS[1];

        const direction = new THREE.Vector3()
          .subVectors(targetHoop, ball.position)
          .normalize();
        const initialSpeed = shotPower / 8;
        const upwardForce = 7;

        ballVelocity.copy(direction).multiplyScalar(initialSpeed);
        ballVelocity.y += upwardForce;
        break;
    }
  }

  // Reset is always available
  if (e.key === "r" || e.key === "R") {
    hitSomething = false;
    ball.position.copy(initialBallPosition);
    ball.rotation.set(0, 0, 0);
    isShooting = false;
    ballVelocity.set(0, 0, 0);
    if (scoreMode) {
      combo = 0;
    }
    shotPower = 50;
    updatePowerDisplay();
    updateScoreDisplay();
    scoreMode = false;
  }
}

function handleKeyUp(e) {
  switch (e.key) {
    case "ArrowLeft":
      inputState.down = false;
      break;
    case "ArrowRight":
      inputState.up = false;
      break;
    case "ArrowUp":
      inputState.left = false;
      break;
    case "ArrowDown":
      inputState.right = false;
      break;
  }
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

function checkCollisions() {
  const ballSphere = new THREE.Sphere(ball.position, BALL_RADIUS);

  backboards.forEach((backboard) => {
    const backboardBox = new THREE.Box3().setFromObject(backboard);
    if (backboardBox.intersectsSphere(ballSphere)) {
      ballVelocity.x *= -1;
      hitSomething = true;
    }
  });

  arms.forEach((arm) => {
    const armBox = new THREE.Box3().setFromObject(arm);
    if (armBox.intersectsSphere(ballSphere)) {
      ballVelocity.x *= -1;
      hitSomething = true;
    }
  });

  rims.forEach((rim, index) => {
    const rimCenter = rim.position.clone();
    const rimY = rimCenter.y;

    const ballPos = ball.position;
    const horizontalVec = new THREE.Vector3(
      ballPos.x - rimCenter.x,
      0,
      ballPos.z - rimCenter.z
    );
    const horizontalDist = horizontalVec.length();
    const verticalDist = ballPos.y - rimY;

    if (
      scoreMode &&
      ballVelocity.y < 0 &&
      verticalDist > -BALL_RADIUS &&
      verticalDist < BALL_RADIUS &&
      horizontalDist < RIM_HOLE_RADIUS - BALL_RADIUS
    ) {
      scoreMode = false;
      score += combo + (hitSomething ? 2 : 3);
      shotsMade++;
      const comboString = combo > 0 ? ` (Combo: ${combo + 1})` : "";
      if (hitSomething) {
        showStatusMessage("SHOT MADE!" + comboString);
      } else {
        showStatusMessage("SWISH SHOT MADE!" + comboString);
      }
      hitSomething = false;
      combo++;
      updateScoreDisplay();

      ballVelocity.y = -3;
      ballVelocity.x *= 0.3;
      ballVelocity.z *= 0.3;
      return;
    }

    const isAboveRim = ballPos.y > rimY;
    const rimContact =
      Math.abs(verticalDist) < BALL_RADIUS + RIM_TUBE_RADIUS &&
      horizontalDist > RIM_HOLE_RADIUS - BALL_RADIUS &&
      horizontalDist < RIM_RADIUS + BALL_RADIUS;

    if (rimContact) {
      hitSomething = true;
      if (isAboveRim) {
        ballVelocity.y *= -RIM_BOUNCINESS;
      } else {
        ballVelocity.y *= -RIM_BOUNCINESS * 0.6;
      }

      const approachAngle = Math.atan2(ballVelocity.z, ballVelocity.x);
      const rimAngle = Math.atan2(horizontalVec.z, horizontalVec.x);
      const angleDiff = approachAngle - rimAngle;

      const spinPower = 0.5 * Math.sin(angleDiff);
      ballVelocity.x += spinPower * horizontalVec.z;
      ballVelocity.z -= spinPower * horizontalVec.x;

      ballVelocity.x *= 0.7;
      ballVelocity.z *= 0.7;
    }
  });
}

const missedShot = () => {
  if (scoreMode) {
    scoreMode = false;
    handleKeyDown({ key: "r" });
    showStatusMessage("MISSED SHOT");
    combo = 0;
  }
  updateScoreDisplay();
  updatePowerDisplay();
  isShooting = false;
  hitSomething = false;
  ballVelocity.set(0, 0, 0);
};

// Animation function
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (isShooting) {
    ballVelocity.y += GRAVITY * delta;
    ball.position.add(ballVelocity.clone().multiplyScalar(delta));

    const rotationAxis = new THREE.Vector3(
      ballVelocity.z,
      0,
      -ballVelocity.x
    ).normalize();
    const rotationSpeed = ballVelocity.length() * 0.1;
    ball.rotateOnAxis(rotationAxis, rotationSpeed * delta);

    if (ball.position.y < COURT_HEIGHT + Y_OFFSET + BALL_RADIUS) {
      ball.position.y = COURT_HEIGHT + Y_OFFSET + BALL_RADIUS;
      ballVelocity.y *= -BALL_BOUNCINESS;

      if (
        Math.abs(ball.position.x) > COURT_LENGTH / 2 ||
        Math.abs(ball.position.z) > COURT_WIDTH / 2
      ) {
        missedShot();
      }

      if (Math.abs(ballVelocity.y) < 1) {
        missedShot();
      }
    }
    checkCollisions();
  } else {
    updateBasketballMovement(inputState, ball);
  }

  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();

  renderer.render(scene, camera);
}

animate();
