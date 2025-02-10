import * as THREE from "./node_modules/three/build/three.module.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.OrthographicCamera(-16, 16, 9, -9, 1, 1000);
camera.position.set(0, 0, 50);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

const geometry = new THREE.BufferGeometry();

// Les 8 sommets uniques du cube (24 coordonnées)
const vertices = new Float32Array([
    // Face avant
    -0.5, -0.5, 0.5,  // 0
    0.5, -0.5, 0.5,  // 1
    -0.5, 0.5, 0.5,  // 2
    0.5, 0.5, 0.5,  // 3
    // Face arrière
    -0.5, -0.5, -0.5,  // 4
    0.5, -0.5, -0.5,  // 5
    -0.5, 0.5, -0.5,  // 6
    0.5, 0.5, -0.5   // 7
]);

// Les indices pour former les triangles (36 indices pour 12 triangles)
const indices = new Uint16Array([
    // Face avant
    0, 1, 2, 2, 1, 3,
    // Face arrière
    5, 4, 7, 7, 4, 6,
    // Face gauche
    4, 0, 6, 6, 0, 2,
    // Face droite
    1, 5, 3, 3, 5, 7,
    // Face supérieure
    2, 3, 6, 6, 3, 7,
    // Face inférieure
    4, 5, 0, 0, 5, 1
]);

geometry.setIndex(new THREE.BufferAttribute(indices, 1));
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

const material = new THREE.MeshBasicMaterial({ color: 0x990000 });
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    mesh.rotation.z += 0.005;
    renderer.render(scene, camera);
}

animate();
renderer.render(scene, camera);