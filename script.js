import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x223355);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 22, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Light ---
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(50, 50, 50);
scene.add(sun);

// --- Planet ---
const planetRadius = 20;
const planet = new THREE.Mesh(
  new THREE.SphereGeometry(planetRadius, 64, 64),
  new THREE.MeshPhongMaterial({ color: 0x339966 })
);
scene.add(planet);

// --- Player ---
const player = new THREE.Object3D();
player.position.set(0, planetRadius + 2, 0);
scene.add(player);

player.add(camera);
camera.position.set(0, 1.5, 0);

// --- Houses ---
function placeHouse(lat, lon, color, info) {
  const house = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshPhongMaterial({ color })
  );

  const phi = (90 - lat) * (Math.PI/180);
  const theta = (lon + 180) * (Math.PI/180);
  const x = -(planetRadius+1) * Math.sin(phi) * Math.cos(theta);
  const z =  (planetRadius+1) * Math.sin(phi) * Math.sin(theta);
  const y =  (planetRadius+1) * Math.cos(phi);
  house.position.set(x, y, z);
  house.lookAt(0,0,0);
  house.userData.info = info;
  scene.add(house);
  return house;
}

const houses = [
  placeHouse(20,  30, 0xff8844, "About: наша компания!"),
  placeHouse(10, 120, 0x44aaff, "Portfolio: проекты 💎"),
  placeHouse(-15, -60, 0xaa44ff, "Games: новые игры 🎮")
];

const infoBox = document.getElementById('infoBox');

// --- Movement ---
const move = { forward:false, back:false, left:false, right:false };
document.addEventListener('keydown', e => {
  if(e.code==="KeyW") move.forward = true;
  if(e.code==="KeyS") move.back = true;
  if(e.code==="KeyA") move.left = true;
  if(e.code==="KeyD") move.right = true;
});
document.addEventListener('keyup', e => {
  if(e.code==="KeyW") move.forward = false;
  if(e.code==="KeyS") move.back = false;
  if(e.code==="KeyA") move.left = false;
  if(e.code==="KeyD") move.right = false;
});

// --- Animate ---
function animate() {
  requestAnimationFrame(animate);

  const gravity = player.position.clone().normalize();

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.projectOnPlane(gravity).normalize();

  const right = new THREE.Vector3().crossVectors(forward, gravity).normalize();

  const speed = 0.2;
  if(move.forward) player.position.addScaledVector(forward, speed);
  if(move.back)    player.position.addScaledVector(forward, -speed);
  if(move.left)    player.position.addScaledVector(right, -speed);
  if(move.right)   player.position.addScaledVector(right, speed);

  // player position
  player.position.setLength(planetRadius+2);
  player.up.copy(gravity);
  camera.lookAt(player.position.clone().add(forward));

  // houses
  let nearHouse = null;
  houses.forEach(h => {
    if(h.position.distanceTo(player.position) < 3) nearHouse = h;
  });
  if(nearHouse) {
    infoBox.style.display = "block";
    infoBox.textContent = nearHouse.userData.info;
  } else {
    infoBox.style.display = "none";
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});