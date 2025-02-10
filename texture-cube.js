import * as THREE from "./node_modules/three/build/three.module.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const vertices = new Float32Array([
    // Face avant
    -0.5, -0.5, 0.5,  // 0
    0.5, -0.5, 0.5,  // 1
    0.5, 0.5, 0.5,  // 2
    -0.5, 0.5, 0.5,  // 3

    // Face arrière
    0.5, -0.5, -0.5,  // 4
    -0.5, -0.5, -0.5,  // 5
    -0.5, 0.5, -0.5,  // 6
    0.5, 0.5, -0.5,  // 7

    // Face gauche
    -0.5, -0.5, -0.5,  // 8
    -0.5, -0.5, 0.5,  // 9
    -0.5, 0.5, 0.5,  // 10
    -0.5, 0.5, -0.5,  // 11

    // Face droite
    0.5, -0.5, 0.5,  // 12
    0.5, -0.5, -0.5,  // 13
    0.5, 0.5, -0.5,  // 14
    0.5, 0.5, 0.5,  // 15

    // Face supérieure
    -0.5, 0.5, 0.5,  // 16
    0.5, 0.5, 0.5,  // 17
    0.5, 0.5, -0.5,  // 18
    -0.5, 0.5, -0.5,  // 19

    // Face inférieure
    -0.5, -0.5, -0.5,  // 20
    0.5, -0.5, -0.5,  // 21
    0.5, -0.5, 0.5,  // 22
    -0.5, -0.5, 0.5   // 23
]);

// Définition des coordonnées UV pour chaque face
const uvs = new Float32Array([
    // Face avant
    0, 0,
    1, 0,
    1, 1,
    0, 1,

    // Face arrière
    0, 0,
    1, 0,
    1, 1,
    0, 1,

    // Face gauche
    0, 0,
    1, 0,
    1, 1,
    0, 1,

    // Face droite
    0, 0,
    1, 0,
    1, 1,
    0, 1,

    // Face supérieure
    0, 0,
    1, 0,
    1, 1,
    0, 1,

    // Face inférieure
    0, 0,
    1, 0,
    1, 1,
    0, 1
]);

// Définition des indices pour former les 12 triangles (2 par face)
const indices = new Uint16Array([
    // Face avant
    0, 1, 2,
    2, 3, 0,

    // Face arrière
    4, 5, 6,
    6, 7, 4,

    // Face gauche
    8, 9, 10,
    10, 11, 8,

    // Face droite
    12, 13, 14,
    14, 15, 12,

    // Face supérieure
    16, 17, 18,
    18, 19, 16,

    // Face inférieure
    20, 21, 22,
    22, 23, 20
]);

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
geometry.setIndex(new THREE.BufferAttribute(indices, 1));

const texture = new THREE.TextureLoader().load("crate.jpg");

const material = new THREE.MeshBasicMaterial({ map: texture });

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
