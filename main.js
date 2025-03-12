import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';


// Create a scene
const scene = new THREE.Scene();


// Create a render
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
document.body.appendChild(renderer.domElement);

// Create cameras (mutliple cameras for different views)
const cameras = {
    main: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000), // main camera
    gunner: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000), // gunner camera
    driver: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),  // driver camera
    pilot: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)  // pilot camera
};

// Position cameras
cameras.main.position.set(0, 2, 5);   
cameras.gunner.position.set(3.16, 2.10, 5.69);  
cameras.driver.position.set(14.88, 1.38, -4.10); 
cameras.pilot.position.set(-25.54, 13.55, -15.72); 

const controls = {
    orbit: new OrbitControls(cameras.main, renderer.domElement),
    gunner: new PointerLockControls(cameras.gunner, document.body),
    driver: new PointerLockControls(cameras.driver, document.body),
    pilot: new PointerLockControls(cameras.pilot, document.body)
};

// initial active camera
let activeCamera = cameras.main;



// Sunlight
const sunLight = new THREE.DirectionalLight(0xFF4500, 3);
sunLight.position.set(-50, 20, -50); 
sunLight.castShadow = true;

// adjust shadow of sunlight
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 200;

// addjust shadow map size
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.radius = 8; 

scene.add(sunLight);

// add ambient light
const ambientLight = new THREE.AmbientLight(0xFF8C00, 0.5); // ambient light with a warm color (dawn)
scene.add(ambientLight);

// add horizon light
const horizonLight = new THREE.PointLight(0xFF6347, 1.5, 50); 
horizonLight.position.set(0, 2, -20); // simulate horizon light
scene.add(horizonLight);
scene.fog = new THREE.Fog(0xFFA07A, 20, 50); // red

// add hemisphere light
const hemisphereLight = new THREE.HemisphereLight(0xFF6347, 0x8B4513, 0.6);
scene.add(hemisphereLight);

// add reflection
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMap = cubeTextureLoader.load([
]);

// Load textures
const textureLoader = new THREE.TextureLoader();
const mtlLoader = new MTLLoader();

// skybox (sphere)
textureLoader.load('./Desert.jpg', (texture) => {
    const skyGeometry = new THREE.SphereGeometry(100, 30, 40); // create a large sphere
    skyGeometry.scale(-1, 1, 1); // invert the sphere to make it inside-out

    const skyMaterial = new THREE.MeshBasicMaterial({
        map: texture
    });

    const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skySphere);
});

// texture for the ground
const dirtTexture = textureLoader.load('./dirt.jpg');
dirtTexture.wrapS = THREE.RepeatWrapping;
dirtTexture.wrapT = THREE.RepeatWrapping;

// floor material
const planeMaterial = new THREE.MeshPhysicalMaterial({
  map: dirtTexture,     
  metalness: 0.01,       
  roughness: 0.8,        
  envMap: envMap,        
  envMapIntensity: 0.1,  
  clearcoat: 0.3,        
  clearcoatRoughness: 0.1 
});

// ground plane
const planeSize = 100;
dirtTexture.repeat.set(planeSize / 4, planeSize / 4); 
const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;

plane.rotation.x = -Math.PI / 2; 
plane.position.y = 0;
scene.add(plane);

// Create road texture
const roadTexture = textureLoader.load('./dirt_road.jpg'); 
roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.repeat.set(8, 1);

// Create road material
const roadMaterial = new THREE.MeshPhysicalMaterial({
    map: roadTexture, 
    metalness: 0.5,    
    roughness: 0.3,     
    envMap: envMap,     
    envMapIntensity: 1.0,  
    clearcoatRoughness: 0.1,  
    side: THREE.DoubleSide 
});

// Create road geometry and mesh
const roadWidth = 8;  
const roadLength = 80; 
const roadGeometry = new THREE.PlaneGeometry(roadLength, roadWidth);
const road = new THREE.Mesh(roadGeometry, roadMaterial);

road.rotation.x = -Math.PI / 2;
road.rotation.z = -Math.PI / 3;
road.position.set(0, 0.01, 0); 
road.receiveShadow = true;
scene.add(road);


function createBrickWall(position = { x: 0, y: 0, z: 0 }, size = { width: 1, height: 1, depth: 1 }) {
    const brickTexture = textureLoader.load('./brickwall.png'); 
    brickTexture.wrapS = THREE.RepeatWrapping;
    brickTexture.wrapT = THREE.RepeatWrapping;
    brickTexture.repeat.set(size.width, size.height); 

    const brickMaterial = new THREE.MeshStandardMaterial({
        map: brickTexture,
        roughness: 0.5,    
        metalness: 0.1     
    });

    // create brick wall
    const brickGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const brickWall = new THREE.Mesh(brickGeometry, brickMaterial);
    brickWall.position.set(position.x, position.y, position.z);
    brickWall.castShadow = true;
    brickWall.receiveShadow = true;

    scene.add(brickWall);
    return brickWall;
}


// Helipad 
function createHelipad(position) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

    ctx.strokeStyle = "rgba(255, 255, 255, 1)"; // White circle
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(256, 256, 200, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = "bold 220px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 1)"; // White H
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("H", 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const helipadMaterial = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true, 
        side: THREE.DoubleSide 
    });

    const helipadGeometry = new THREE.CircleGeometry(4, 64); 
    const helipad = new THREE.Mesh(helipadGeometry, helipadMaterial);

    helipad.rotation.x = -Math.PI / 2;
    helipad.position.set(position.x, position.y, position.z);
    scene.add(helipad);
}


function loadTent(position, rotationY = Math.PI / 3, scale = 0.0001) {
    mtlLoader.load('/models/tent/028_AR.mtl', (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);

        objLoader.load('/models/tent/028_AR.obj', (object) => {
            console.log('Tent Model Loaded!:', object);

            object.position.set(position.x, position.y, position.z);
            object.scale.set(scale, scale, scale);
            object.rotation.y = rotationY;

            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            console.log('Size of the tent:', size); 
            object.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        map: textureLoader.load('/models/tent/AM84_028_Tent_Diff.jpg'),
                        bumpMap: textureLoader.load('/models/tent/AM84_028_Tent_Bump.jpg'),
                        transparent: true,
                        opacity: 1.0
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(object);
        }, undefined, (error) => {
            console.error('Failed to load OBJ:', error);
        });
    });
}


// Load helicopter
function loadHelicopter(position, rotationY, scale) {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('./models/heli1/'); // MTL path
    mtlLoader.load('Helicoperwa.mtl', (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('./models/heli1/');

        objLoader.load('Helicoperwa.obj', (object) => {
            console.log('Heli Model Loaded', object);

            object.position.set(position.x, position.y, position.z);
            object.scale.set(scale, scale, scale);
            object.rotation.y = rotationY;

            // shadow
            object.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            addHelicopterSpotlight(object, position);

            scene.add(object);
        }, undefined, (error) => {
            console.error('Failed to load heli OBJ', error);
        });
    });
}



function loadAPCModel(position, rotationY, scale) {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('./models/APC1/');
    mtlLoader.load('001_AR.mtl', (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('./models/APC1/');

        objLoader.load('001_AR.obj', (object) => {
            console.log('APC Model Loaded', object);

            object.position.set(position.x, position.y, position.z);
            object.scale.set(scale, scale, scale);
            object.rotation.y = rotationY;

            // shadow and texture
            const textureLoader = new THREE.TextureLoader();
            object.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = textureLoader.load('./models/APC1/AM84_001_Humvee_Diff.jpg');
                    child.material.specularMap = textureLoader.load('./models/APC1/AM84_001_Humvee_Spec.jpg');
                    child.material.needsUpdate = true;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
          
            scene.add(object);
        }, undefined, (error) => {
            console.error('Failed to load APC OBJ', error);
        });
    });
}

function addHeadlight(position, rotationY) {  // Headlight of APC
    const headlight = new THREE.SpotLight(0xFFFFFF, 20, 10, Math.PI / 3, 0.3, 1); 
    headlight.castShadow = true;
    headlight.shadow.mapSize.width = 2048;
    headlight.shadow.mapSize.height = 2048;

    // position
    const headlightOffset = 1.5; // position
    const headlightHeight = 1; // height

    // toward direction
    const directionX = Math.sin(rotationY) * headlightOffset;
    const directionZ = Math.cos(rotationY) * headlightOffset;

    // position
    headlight.position.set(position.x + directionX, headlightHeight, position.z + directionZ);

    // light target
    const target = new THREE.Object3D();
    target.position.set(
        position.x + Math.sin(rotationY) * 10, 
        0.5, 
        position.z + Math.cos(rotationY) * 10
    );
    scene.add(target);
    headlight.target = target; 

    // force light to update (debug)
    setInterval(() => {
        headlight.intensity = 20; 
        setTimeout(() => { headlight.intensity = 20; }, 50);
    }, 5000);

    scene.add(headlight);
}


// Helicopter spotlight
function addHelicopterSpotlight(helicopter, position) {
    const spotlight = new THREE.SpotLight(0xFFFFFF, 150, 50, Math.PI / 6, 0.2, 1);
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;

    // Under the helicopter
    spotlight.position.set(0, 0, 0); 

    // **目标点（地面方向）**
    const target = new THREE.Object3D();
    target.position.set(0, -10, 0);  // target position below the helicopter
    helicopter.add(target);

    // bind spotlight to target
    spotlight.target = target;
    helicopter.add(spotlight);
}

function createRuinedWalls() {  // ruined walls
    createBrickWall({ x: -10, y: 1, z: 7 }, { width: 4, height: 2, depth: 0.5 });
    let wall1 = createBrickWall({ x: -10, y: 0.5, z: 6 }, { width: 3, height: 1, depth: 0.5 });
    wall1.rotation.x = Math.PI / 3;
    let wall2 = createBrickWall({ x: -14, y: 0.5, z: 8 }, { width: 1, height: 1, depth: 0.5 });
    wall2.rotation.z = -Math.PI / 4;

    createBrickWall({ x: -9, y: 0.5, z: 8 }, { width: 1, height: 1, depth: 0.5 });
    createBrickWall({ x: -14, y: 0.3, z: 9 }, { width: 1.5, height: 0.6, depth: 0.5 });
    createBrickWall({ x: -11, y: 0.2, z: 11 }, { width: 0.7, height: 0.4, depth: 0.5 });

    let wall3 = createBrickWall({ x: -8, y: 0.5, z: 9 }, { width: 2, height: 1, depth: 0.5 });
    wall3.rotation.z = Math.PI / 5;
    let wall4 = createBrickWall({ x: -9, y: 0.8, z: 10 }, { width: 2, height: 1, depth: 0.5 });
    wall4.rotation.z = Math.PI / 10;

    createBrickWall({ x: -10, y: 0.1, z: 8 }, { width: 0.5, height: 0.2, depth: 0.5 });
    createBrickWall({ x: -12, y: 0.1, z: 12 }, { width: 0.6, height: 0.3, depth: 0.5 });
    createBrickWall({ x: -8.5, y: 0.1, z: 10 }, { width: 0.6, height: 0.3, depth: 0.5 });
}


// Load models and objects
loadTent({ x: 20, y: 0, z: -20 }); 
loadTent({ x: 20, y: 0, z: -10 }); 
loadHelicopter({ x: 4, y: 0.02, z: -14 }, 0, 2);
loadHelicopter({ x: 4, y: 19, z: -14 }, Math.PI / 3, 2);
loadHelicopter({ x: -25, y: 14, z: -14 }, Math.PI / 3, 2);


loadAPCModel({ x: 15, y: 0, z: 0 }, Math.PI / 2 + Math.PI, 0.0001);
addHeadlight({ x: 15, y: 0, z: 0 }, Math.PI / 2 + Math.PI);

loadAPCModel({ x: 15, y: 0, z: -5 }, Math.PI / 2.5 + Math.PI, 0.0001);
addHeadlight({ x: 15, y: 0, z: -5 }, Math.PI / 2.5 + Math.PI);

loadAPCModel({ x: 3, y: 0, z: 5 }, Math.PI / 5.5 + Math.PI, 0.0001);
addHeadlight({ x: 3, y: 0, z: 5 }, Math.PI / 5.5 + Math.PI);

loadAPCModel({ x: 12, y: 0, z: 20 }, Math.PI / 5 + Math.PI, 0.0001);
addHeadlight({ x: 12, y: 0, z: 20 }, Math.PI / 5 + Math.PI);

loadAPCModel({ x: -7, y: 0, z: -10 }, Math.PI / 4.5 + Math.PI, 0.0001);
addHeadlight({ x: -7, y: 0, z: -10 }, Math.PI / 4.5 + Math.PI);

createRuinedWalls();
createHelipad({ x: 5, y: 0.01, z: -15 });


const orbitControls = new OrbitControls(cameras.main, renderer.domElement);
const fpControls = new PointerLockControls(cameras.main, document.body);
let isFirstPerson = false; // Flag to check if in first-person mode

document.addEventListener('click', () => fpControls.lock()); // Click to lock mouse for first-person controls
fpControls.addEventListener('lock', () => {isFirstPerson = true; orbitControls.enabled = false; console.log("Enable FPS mode");});
fpControls.addEventListener('unlock', () => {isFirstPerson = false; orbitControls.enabled = true; console.log("Disable FPS mode");});

// Switch cameras with number keys
document.addEventListener('keydown', (event) => {
    if (event.code === 'Digit1') {activeCamera = cameras.main; controls.orbit.enabled = true; document.exitPointerLock(); console.log("Free view mode");}
    if (event.code === 'Digit2') {activeCamera = cameras.gunner; controls.orbit.enabled = false; controls.gunner.lock(); console.log("Gunner view mode");}
    if (event.code === 'Digit3') {activeCamera = cameras.driver; controls.orbit.enabled = false; controls.driver.lock(); console.log("Driver view mode");}
    if (event.code === 'Digit4') {activeCamera = cameras.pilot; controls.orbit.enabled = false; controls.pilot.lock(); console.log("Pilot view mode");}
});

// Exit specific views
controls.gunner.addEventListener('unlock', () => {
    activeCamera = cameras.main;
    controls.orbit.enabled = true;
    console.log("Exit gunner view");
});
controls.driver.addEventListener('unlock', () => {
    activeCamera = cameras.main;
    controls.orbit.enabled = true;
    console.log("Exit driver view");
});
controls.pilot.addEventListener('unlock', () => {
    activeCamera = cameras.main;
    controls.orbit.enabled = true;
    console.log("Exit pilot view");
});


const keys = { forward: false, backward: false, left: false, right: false };
function handleUserInput() {
    document.addEventListener('keydown', (event) => {
        if (event.code === 'KeyW') keys.forward = true;
        if (event.code === 'KeyS') keys.backward = true;
        if (event.code === 'KeyA') keys.left = true;
        if (event.code === 'KeyD') keys.right = true;
    });
    document.addEventListener('keyup', (event) => {
        if (event.code === 'KeyW') keys.forward = false;
        if (event.code === 'KeyS') keys.backward = false;
        if (event.code === 'KeyA') keys.left = false;
        if (event.code === 'KeyD') keys.right = false;
    });
}
handleUserInput();

// Camera movement
const moveSpeed = 0.05;
function updateCameraMovement() {
    const direction = new THREE.Vector3();
    if (keys.forward) direction.z -= 1;
    if (keys.backward) direction.z += 1;
    if (keys.left) direction.x -= 1;
    if (keys.right) direction.x += 1;
    direction.normalize();
    direction.applyQuaternion(activeCamera.quaternion);
    cameras.main.position.addScaledVector(direction, moveSpeed);

    if (cameras.main.position.y < 1) { 
        cameras.main.position.y = 1;
    }

}

// animate function
function animate() {
    updateCameraMovement();

    if (activeCamera === cameras.gunner) {
        cameras.gunner.rotation.copy(controls.gunner.getObject().rotation);
    }
    if (activeCamera === cameras.driver) {
        cameras.driver.rotation.copy(controls.driver.getObject().rotation);
    }
    if (activeCamera === cameras.pilot) {
        cameras.pilot.rotation.copy(controls.pilot.getObject().rotation);
    }
    renderer.render(scene, activeCamera);
    requestAnimationFrame(animate);
}

animate();
