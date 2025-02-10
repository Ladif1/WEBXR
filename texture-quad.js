import * as THREE from "./node_modules/three/build/three.module.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.OrthographicCamera(-16, 16, 9, -9, 1, 1000);
camera.position.set(0, 0, 50);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

const geometry = new THREE.BufferGeometry();

// create a simple square shape. We duplicate the top left and bottom right
// vertices because each vertex needs to appear once per triangle.
const vertices = new Float32Array([
    -1.0, -1.0, 1.0, // v0
    1.0, -1.0, 1.0, // v1
    1.0, 1.0, 1.0, // v2

    1.0, 1.0, 1.0, // v3
    -1.0, 1.0, 1.0, // v4
    -1.0, -1.0, 1.0  // v5
]);

const texture = new THREE.TextureLoader().load("crate.jpg");

geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0.0, 0.0, // v0
    1.0, 0.0, // v1
    1.0, 1.0, // v2

    1.0, 1.0, // v3
    0.0, 1.0, // v4
    0.0, 0.0  // v5
]), 2));

const material = new THREE.MeshBasicMaterial({
    map: texture
});

const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

function animate() {
    requestAnimationFrame(animate);

    mesh.rotation.y += 0.01;

    renderer.render(scene, camera);
}


animate();
renderer.render(scene, camera);