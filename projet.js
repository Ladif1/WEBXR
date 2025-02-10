import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0ff);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 5);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 50, 50);
scene.add(directionalLight);

let dayMode = true;
let targetDirectionalIntensity = 1;
let targetAmbientIntensity = 1;
let targetBackgroundColor = new THREE.Color(0xa0a0ff);
let transitionSpeed = 0.5;

function updateTargetLighting() {
    if (dayMode) {
        targetDirectionalIntensity = 1;
        targetAmbientIntensity = 1;
        targetBackgroundColor.set(0xa0a0ff);
    } else {
        targetDirectionalIntensity = 0.2;
        targetAmbientIntensity = 0.2;
        targetBackgroundColor.set(0x000033);
    }
}
updateTargetLighting();

const listener = new THREE.AudioListener();
camera.add(listener);

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.object);
document.addEventListener("click", () => {
    controls.lock();
}, false);

let moveForward = false,
    moveBackward = false,
    moveLeft = false,
    moveRight = false,
    canJump = false,
    runMultiplier = 1;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();

document.addEventListener("keydown", (event) => {
    switch (event.code) {
        case "ArrowUp":
        case "KeyW":
            moveForward = true;
            break;
        case "ArrowLeft":
        case "KeyA":
            moveLeft = true;
            break;
        case "ArrowDown":
        case "KeyS":
            moveBackward = true;
            break;
        case "ArrowRight":
        case "KeyD":
            moveRight = true;
            break;
        case "Space":
            if (canJump) {
                velocity.y += 100;
            }
            canJump = false;
            break;
        case "ShiftLeft":
        case "ShiftRight":
            runMultiplier = 2;
            break;
        case "KeyL":
            dayMode = !dayMode;
            updateTargetLighting();
            break;
    }
});

document.addEventListener("keyup", (event) => {
    switch (event.code) {
        case "ArrowUp":
        case "KeyW":
            moveForward = false;
            break;
        case "ArrowLeft":
        case "KeyA":
            moveLeft = false;
            break;
        case "ArrowDown":
        case "KeyS":
            moveBackward = false;
            break;
        case "ArrowRight":
        case "KeyD":
            moveRight = false;
            break;
        case "ShiftLeft":
        case "ShiftRight":
            runMultiplier = 1;
            break;
    }
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let skipNextClick = false;

// Fonction d'animation pour la soucoupe
function animateSaucer(saucer) {
    if (saucer.userData.isAnimating) return; // évite de relancer si l'animation est déjà en cours
    saucer.userData.isAnimating = true;
    const originalZ = saucer.position.y;
    const targetZ = originalZ + 5; // la soucoupe se soulève de 5 mètres
    const duration = 2500; // durée (ms) pour la montée et la descente

    let startTime = null;

    function animateUp(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        saucer.position.z = THREE.MathUtils.lerp(originalZ, targetZ, progress);
        if (progress < 1) {
            requestAnimationFrame(animateUp);
        } else {
            startTime = null;
            setTimeout(() => requestAnimationFrame(animateDown), 1000); // on attend 1 seconde avant de redescendre
        }
    }

    function animateDown(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        saucer.position.z = THREE.MathUtils.lerp(targetZ, originalZ, progress);
        if (progress < 1) {
            requestAnimationFrame(animateDown);
        } else {
            saucer.userData.isAnimating = false;
        }
    }

    requestAnimationFrame(animateUp);
}

function onInteract(event) {
    if (skipNextClick) {
        skipNextClick = false;
        return;
    }
    if (!controls.isLocked) return;
    mouse.x = 0;
    mouse.y = 0;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.interactive) {
            // Si c'est la soucoupe, on déclenche l'animation
            if (object.name.startsWith("Cylinder007")) {
                animateSaucer(object);
            }
            const info = document.getElementById("info");
            if (info && object.userData.description) {
                info.innerText = object.userData.description;
            }
            if (object.userData.sound) {
                if (object.userData.sound.isPlaying) {
                    object.userData.sound.stop();
                }
                object.userData.sound.play();
            }
        }
    }
}
window.addEventListener("click", onInteract, false);

const loader = new GLTFLoader();
const soundCache = {};
function getSound(key, file, volume = 0.5, loop = false) {
    if (!soundCache[key]) {
        const sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(file, (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(loop);
            sound.setVolume(volume);
        });
        soundCache[key] = sound;
    }
    return soundCache[key];
}

loader.load(
    "./low_poly_ufo_scene.glb",
    function (gltf) {
        gltf.scene.scale.set(0.06, 0.06, 0.06);
        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                if (child.name.startsWith("Cube006") || child.name.startsWith("Cube004")) {
                    child.userData.interactive = true;
                    child.userData.sound = getSound("carSound", "son.mp3");
                }
                if (child.name.startsWith("Cylinder007")) {
                    child.userData.interactive = true;
                    child.userData.sound = getSound("soucoupeSound", "soucoupe.mp3");
                }
                if (child.name.startsWith("Cube_")) {
                    child.userData.interactive = true;
                    child.userData.sound = getSound("radioSound", "radio.mp3");
                }
                if (child.name.startsWith("Plane002")) {
                    child.userData.interactive = true;
                    child.userData.sound = getSound("helicopterSound", "helicopter.mp3");
                }
            }
        });
        scene.add(gltf.scene);
        animateLoop();
    },
    undefined,
    function (error) {
        console.error(error);
    }
);

let highlightedObject = null;
function highlightObject(object) {
    if (object.material && object.material.emissive) {
        object.userData.originalEmissive = object.material.emissive.clone();
        object.material.emissive.set(0xffff00);
    }
}
function restoreObject(object) {
    if (object.material && object.material.emissive && object.userData.originalEmissive) {
        object.material.emissive.copy(object.userData.originalEmissive);
    }
}
function showHint(message) {
    let hint = document.getElementById("interactionHint");
    if (!hint) {
        hint = document.createElement("div");
        hint.id = "interactionHint";
        hint.style.position = "absolute";
        hint.style.bottom = "10px";
        hint.style.left = "50%";
        hint.style.transform = "translateX(-50%)";
        hint.style.padding = "10px 20px";
        hint.style.backgroundColor = "rgba(0,0,0,0.5)";
        hint.style.color = "white";
        hint.style.fontFamily = "sans-serif";
        hint.style.fontSize = "16px";
        document.body.appendChild(hint);
    }
    hint.innerText = message;
    hint.style.display = "block";
}
function hideHint() {
    const hint = document.getElementById("interactionHint");
    if (hint) {
        hint.style.display = "none";
    }
}
function checkInteractiveObject() {
    raycaster.setFromCamera({ x: 0, y: 0 }, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData.interactive) {
            if (highlightedObject !== obj) {
                if (highlightedObject) {
                    restoreObject(highlightedObject);
                }
                highlightedObject = obj;
                highlightObject(highlightedObject);
                if (!Object.values(soundCache).some(sound => sound.isPlaying)) {
                    showHint("Cliquez pour jouer le son. Clic droit pour stopper tous les sons.");
                }
            }
        } else {
            if (highlightedObject) {
                restoreObject(highlightedObject);
                highlightedObject = null;
            }
            if (!Object.values(soundCache).some(sound => sound.isPlaying)) {
                hideHint();
            }
        }
    } else {
        if (highlightedObject) {
            restoreObject(highlightedObject);
            highlightedObject = null;
        }
        if (!Object.values(soundCache).some(sound => sound.isPlaying)) {
            hideHint();
        }
    }
}
function checkSoundStatus() {
    const anySoundPlaying = Object.values(soundCache).some(sound => sound.isPlaying);
    if (anySoundPlaying) {
        showHint("Clic droit pour stopper tous les sons");
    }
}
function stopAllSounds() {
    Object.values(soundCache).forEach((sound) => {
        if (sound.isPlaying) {
            sound.stop();
        }
    });
}
document.addEventListener("mousedown", (event) => {
    if (event.button === 2) {
        event.preventDefault();
        skipNextClick = true;
        stopAllSounds();
        showHint("Tous les sons ont été stoppés");
        setTimeout(hideHint, 2000);
    }
}, false);
document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    return false;
}, false);

function animate() {
    const rawDelta = clock.getDelta();
    const delta = Math.min(rawDelta, 0.1);
    directionalLight.intensity = THREE.MathUtils.lerp(directionalLight.intensity, targetDirectionalIntensity, transitionSpeed * delta);
    ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, targetAmbientIntensity, transitionSpeed * delta);
    scene.background.lerp(targetBackgroundColor, transitionSpeed * delta);
    checkInteractiveObject();
    checkSoundStatus();
    if (controls.isLocked === true) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 5.8 * 100.0 * delta;
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();
        if (moveForward || moveBackward) {
            velocity.z -= direction.z * 400.0 * runMultiplier * delta;
        }
        if (moveLeft || moveRight) {
            velocity.x -= direction.x * 400.0 * runMultiplier * delta;
        }
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        controls.object.position.y += velocity.y * delta;
        if (controls.object.position.y < 10) {
            velocity.y = 0;
            controls.object.position.y = 10;
            canJump = true;
        }
    }
    renderer.render(scene, camera);
}
function animateLoop() {
    requestAnimationFrame(animateLoop);
    animate();
}
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const infoMenu = document.createElement("div");
infoMenu.style.position = "absolute";
infoMenu.style.top = "10px";
infoMenu.style.left = "10px";
infoMenu.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
infoMenu.style.color = "white";
infoMenu.style.padding = "10px";
infoMenu.style.fontFamily = "sans-serif";
infoMenu.style.fontSize = "14px";
infoMenu.style.zIndex = "1000";
infoMenu.innerHTML = `
  <strong>Contrôles</strong>
  <ul style="margin: 5px 0 0 15px; padding: 0;">
    <li>W / ↑ : Avancer</li>
    <li>S / ↓ : Reculer</li>
    <li>A / ← : Gauche</li>
    <li>D / → : Droite</li>
    <li>Espace : Sauter</li>
    <li>Shift : Courir</li>
    <li>L : Changer le mode jour/nuit</li>
    <li>Clic gauche : Interagir</li>
    <li>Clic droit : Arrêter tous les sons</li>
  </ul>
`;
document.body.appendChild(infoMenu);
