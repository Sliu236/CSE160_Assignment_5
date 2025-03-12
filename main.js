import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';


// 创建场景
const scene = new THREE.Scene();


// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 柔和阴影
document.body.appendChild(renderer.domElement);

// 创建相机
// 定义多个摄像机
const cameras = {
    main: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    gunner: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    driver: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    pilot: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
};

// 设置各个摄像机的位置
cameras.main.position.set(0, 2, 5);   // 自由摄像机
cameras.gunner.position.set(3.16, 2.10, 5.69);  // 机枪手视角
cameras.driver.position.set(14.88, 1.38, -4.10); // 驾驶员视角
cameras.pilot.position.set(-25.54, 13.55, -15.72); // 飞行员视角

const controls = {
    orbit: new OrbitControls(cameras.main, renderer.domElement),
    gunner: new PointerLockControls(cameras.gunner, document.body),
    driver: new PointerLockControls(cameras.driver, document.body),
    pilot: new PointerLockControls(cameras.pilot, document.body)
};

// 设定默认活动摄像机
let activeCamera = cameras.main;




const sunLight = new THREE.DirectionalLight(0xFF4500, 3);
sunLight.position.set(-50, 20, -50); // 更远更高
sunLight.castShadow = true;

// 调整阴影范围，让光线更柔和
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 200;

// 增加阴影的模糊度
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.radius = 8; // 让阴影柔和一些

scene.add(sunLight);



// 添加环境光
const ambientLight = new THREE.AmbientLight(0xFF8C00, 0.5); // 灰白色环境光
scene.add(ambientLight);

// 添加地平线光源
const horizonLight = new THREE.PointLight(0xFF6347, 1.5, 50); 
horizonLight.position.set(0, 2, -20); // 低角度光源，模拟地平线光晕
scene.add(horizonLight);
scene.fog = new THREE.Fog(0xFFA07A, 20, 50); // 远处带点红色调


// 添加半球光源
const hemisphereLight = new THREE.HemisphereLight(0xFF6347, 0x8B4513, 0.6);
scene.add(hemisphereLight);



// 加载环境贴图（反射效果）
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMap = cubeTextureLoader.load([
]);

// 定义textrueLoader
const textureLoader = new THREE.TextureLoader();
const mtlLoader = new MTLLoader();

// 天空
textureLoader.load('./Desert.jpg', (texture) => {
    const skyGeometry = new THREE.SphereGeometry(100, 30, 40); // 大球体
    skyGeometry.scale(-1, 1, 1); // 翻转法线，使纹理贴在球体内部

    const skyMaterial = new THREE.MeshBasicMaterial({
        map: texture
    });

    const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skySphere);
});

// 加载地板纹理
const dirtTexture = textureLoader.load('./dirt.jpg');
dirtTexture.wrapS = THREE.RepeatWrapping;
dirtTexture.wrapT = THREE.RepeatWrapping;



// 创建带有地板贴图的材质
const planeMaterial = new THREE.MeshPhysicalMaterial({
  map: dirtTexture,      // 应用地板纹理
  metalness: 0.01,        // 低金属度
  roughness: 0.8,        // 适当的粗糙度，使地面更真实
  envMap: envMap,        // 反射环境贴图
  envMapIntensity: 0.1,  // 反射强度
  clearcoat: 0.3,        // 轻微的透明反射层
  clearcoatRoughness: 0.1 // 透明层的粗糙度
});

// 创建地板
const planeSize = 100;
dirtTexture.repeat.set(planeSize / 4, planeSize / 4); // 让纹理按比例覆盖
const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;


plane.rotation.x = -Math.PI / 2; // 旋转平面使其水平
plane.position.y = 0; // 将平面稍微下移
scene.add(plane);

// 道路
// 加载道路纹理
const roadTexture = textureLoader.load('./dirt_road.jpg'); 
roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.repeat.set(8, 1); // 让纹理重复 3 次，模拟拉长的道路效果


// 创建道路材质
const roadMaterial = new THREE.MeshPhysicalMaterial({
    map: roadTexture,   // 贴图
    metalness: 0.5,     // 让道路有部分金属反射性
    roughness: 0.3,     // 让表面稍微光滑以增强反射
    envMap: envMap,     // 添加环境贴图，使道路可以反射天空
    envMapIntensity: 1.0,  // 反射强度
    clearcoat: 0.5,     // 额外的透明光泽层
    clearcoatRoughness: 0.1,  // 透明层的粗糙度，值越小越光滑
    side: THREE.DoubleSide // 双面渲染
});

// 创建道路平面
const roadWidth = 8;  // 道路的宽度
const roadLength = 80; // 道路的长度，与地图一致
const roadGeometry = new THREE.PlaneGeometry(roadLength, roadWidth);
const road = new THREE.Mesh(roadGeometry, roadMaterial);

// 旋转并放置道路
road.rotation.x = -Math.PI / 2; // 让道路水平
road.rotation.z = -Math.PI / 3;
road.position.set(0, 0.01, 0); // 稍微浮起，防止与地面重叠
road.receiveShadow = true;
scene.add(road);


function createBrickWall(position = { x: 0, y: 0, z: 0 }, size = { width: 1, height: 1, depth: 1 }) {
    // 加载砖墙纹理
    const brickTexture = textureLoader.load('./brickwall.png'); 
    brickTexture.wrapS = THREE.RepeatWrapping;
    brickTexture.wrapT = THREE.RepeatWrapping;
    brickTexture.repeat.set(size.width, size.height); // 让砖纹理适配墙的大小

    // 创建砖墙材质
    const brickMaterial = new THREE.MeshStandardMaterial({
        map: brickTexture, // 贴图
        roughness: 0.5,    // 适中的粗糙度
        metalness: 0.1     // 低金属度
    });

    // 创建砖墙几何体
    const brickGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const brickWall = new THREE.Mesh(brickGeometry, brickMaterial);
    
    // 设置砖墙位置
    brickWall.position.set(position.x, position.y, position.z);
    
    // 允许阴影
    brickWall.castShadow = true;
    brickWall.receiveShadow = true;

    // 添加到场景
    scene.add(brickWall);

    return brickWall;
}


// 🚁 创建停机坪函数
function createHelipad(position) {
    // 1️⃣ 创建 Canvas 作为纹理
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // 2️⃣ 清空背景，使其透明
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3️⃣ 画白色圆圈（停机坪的标志）
    ctx.strokeStyle = "rgba(255, 255, 255, 1)"; // 纯白色
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(256, 256, 200, 0, Math.PI * 2);
    ctx.stroke();

    // 4️⃣ 画一个 “H” 标志
    ctx.font = "bold 220px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 1)"; // 纯白色
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("H", 256, 256);

    // 5️⃣ 创建纹理
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // 6️⃣ 创建平面并应用纹理
    const helipadMaterial = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true,  // 启用透明模式
        side: THREE.DoubleSide 
    });

    const helipadGeometry = new THREE.CircleGeometry(4, 64); // 直径 4，64 个面
    const helipad = new THREE.Mesh(helipadGeometry, helipadMaterial);

    // 7️⃣ 旋转平面使其水平，并调整高度
    helipad.rotation.x = -Math.PI / 2;
    helipad.position.set(position.x, position.y, position.z); // 设置停机坪的位置
    scene.add(helipad);
}


function loadTent(position, rotationY = Math.PI / 3, scale = 0.0001) {
    mtlLoader.load('/models/tent/028_AR.mtl', (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);

        objLoader.load('/models/tent/028_AR.obj', (object) => {
            console.log('帐篷模型加载成功:', object);

            object.position.set(position.x, position.y, position.z);
            object.scale.set(scale, scale, scale);
            object.rotation.y = rotationY;

            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            console.log('帐篷模型尺寸:', size); // 打印出模型的实际尺寸

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
            console.error('加载 OBJ 失败:', error);
        });
    });
}


// 🚁 定义一个函数来加载直升机
function loadHelicopter(position, rotationY, scale) {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('./models/heli1/'); // 设置材质路径
    mtlLoader.load('Helicoperwa.mtl', (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('./models/heli1/');

        objLoader.load('Helicoperwa.obj', (object) => {
            console.log('🚁 直升机模型加载成功:', object);

            // 设置直升机的位置、缩放、旋转
            object.position.set(position.x, position.y, position.z);
            object.scale.set(scale, scale, scale);
            object.rotation.y = rotationY;

            // 允许阴影
            object.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            addHelicopterSpotlight(object, position);

            // 添加到场景
            scene.add(object);
        }, undefined, (error) => {
            console.error('🚨 加载直升机 OBJ 失败:', error);
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
            console.log('🚙 APC 载具模型加载成功:', object);

            // 设置装甲车位置、缩放、旋转
            object.position.set(position.x, position.y, position.z);
            object.scale.set(scale, scale, scale);
            object.rotation.y = rotationY;

            // 绑定贴图
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
            console.error('🚨 加载 APC OBJ 失败:', error);
        });
    });
}

function addHeadlight(position, rotationY) {
    // 🚗 **增强车灯光源**
    const headlight = new THREE.SpotLight(0xFFFFFF, 20, 10, Math.PI / 3, 0.3, 1); 
    headlight.castShadow = true;
    headlight.shadow.mapSize.width = 2048;
    headlight.shadow.mapSize.height = 2048;

    // **计算光源位置**
    const headlightOffset = 1.5; // 车灯前伸
    const headlightHeight = 1; // 车灯高度

    // **计算朝向 (通过旋转计算前进方向)**
    const directionX = Math.sin(rotationY) * headlightOffset;
    const directionZ = Math.cos(rotationY) * headlightOffset;

    // **设置光源位置**
    headlight.position.set(position.x + directionX, headlightHeight, position.z + directionZ);

    // **确保光源目标点正确**
    const target = new THREE.Object3D();
    target.position.set(
        position.x + Math.sin(rotationY) * 10, 
        0.5, 
        position.z + Math.cos(rotationY) * 10
    );
    scene.add(target);
    headlight.target = target; 

    // **强制更新光源**
    setInterval(() => {
        headlight.intensity = 20; 
        setTimeout(() => { headlight.intensity = 20; }, 50);
    }, 5000);

    // **添加到场景**
    scene.add(headlight);
}


// ✈️ 添加直升机探照灯
function addHelicopterSpotlight(helicopter, position) {
    const spotlight = new THREE.SpotLight(0xFFFFFF, 150, 50, Math.PI / 6, 0.2, 1);
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;

    // **光源位置（固定在机身下方）**
    spotlight.position.set(0, 0, 0);  // 相对直升机机身

    // **目标点（地面方向）**
    const target = new THREE.Object3D();
    target.position.set(0, -10, 0);  // 目标点设为直升机正下方
    helicopter.add(target);

    // 绑定光源
    spotlight.target = target;
    helicopter.add(spotlight);
}

function createRuinedWalls() {
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
let isFirstPerson = false; // 是否为第一人称模式

document.addEventListener('click', () => fpControls.lock()); // 点击进入第一人称模式
fpControls.addEventListener('lock', () => {isFirstPerson = true; orbitControls.enabled = false; console.log("进入第一人称模式");});
fpControls.addEventListener('unlock', () => {isFirstPerson = false; orbitControls.enabled = true; console.log("退出第一人称模式");});
// 监听键盘事件，按 1-4 切换摄像机
// 监听键盘事件，按 1-4 切换摄像机
document.addEventListener('keydown', (event) => {
    if (event.code === 'Digit1') {
        activeCamera = cameras.main; // 自由摄像机
        controls.orbit.enabled = true; // 启用 OrbitControls
        document.exitPointerLock(); // 退出鼠标锁定
        console.log("📷 切换到自由视角");
    }
    if (event.code === 'Digit2') {
        activeCamera = cameras.gunner; // 机枪手视角
        controls.orbit.enabled = false; // 禁用 OrbitControls
        controls.gunner.lock(); // 鼠标锁定
        console.log("🎯 切换到机枪手视角");
    }
    if (event.code === 'Digit3') {
        activeCamera = cameras.driver; // 驾驶员视角
        controls.orbit.enabled = false;
        controls.driver.lock();
        console.log("🚗 切换到驾驶员视角");
    }
    if (event.code === 'Digit4') {
        activeCamera = cameras.pilot; // 直升机飞行员视角
        controls.orbit.enabled = false;
        controls.pilot.lock();
        console.log("🚁 切换到直升机飞行员视角");
    }
});

// 🚀 监听鼠标退出锁定的事件
controls.gunner.addEventListener('unlock', () => {
    activeCamera = cameras.main;
    controls.orbit.enabled = true;
    console.log("🔓 退出机枪手视角");
});
controls.driver.addEventListener('unlock', () => {
    activeCamera = cameras.main;
    controls.orbit.enabled = true;
    console.log("🔓 退出驾驶员视角");
});
controls.pilot.addEventListener('unlock', () => {
    activeCamera = cameras.main;
    controls.orbit.enabled = true;
    console.log("🔓 退出飞行员视角");
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

// **🚶 第一人称相机移动**
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



// 动画循环
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
