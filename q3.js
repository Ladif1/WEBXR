import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

//GLTFLoader
const loader = new GLTFLoader();
loader.load('./maison_scene.glb', function (gltf) {
    scene.add(gltf.scene);
    animate();
});

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;
camera.position.y = 50;
camera.rotation.x = -0.5;

const scene = new THREE.Scene();

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);


function animate() {
    requestAnimationFrame(animate);
    // rotate the house
    scene.rotation.y += 0.01;
    renderer.render(scene, camera);
}