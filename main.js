import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;


// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加光源(平行光)
const color = 0xffffff;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4).normalize();
scene.add(light);

// 添加环境光
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // 灰白色环境光
scene.add(ambientLight);


// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 加载环境贴图（反射效果）
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMap = cubeTextureLoader.load([
  'https://threejs.org/examples/textures/cube/SwedishRoyalCastle/posx.jpg',
  'https://threejs.org/examples/textures/cube/SwedishRoyalCastle/negx.jpg',
  'https://threejs.org/examples/textures/cube/SwedishRoyalCastle/posy.jpg',
  'https://threejs.org/examples/textures/cube/SwedishRoyalCastle/negy.jpg',
  'https://threejs.org/examples/textures/cube/SwedishRoyalCastle/posz.jpg',
  'https://threejs.org/examples/textures/cube/SwedishRoyalCastle/negz.jpg'
]);

// 定义textrueLoader
const textureLoader = new THREE.TextureLoader();
const mtlLoader = new MTLLoader();

// 加载地板纹理
const dirtTexture = textureLoader.load('./dirt.jpg');
dirtTexture.wrapS = THREE.RepeatWrapping;
dirtTexture.wrapT = THREE.RepeatWrapping;
dirtTexture.repeat.set(5, 5); // 让纹理重复 5x5 次

// 创建带有地板贴图的材质
const planeMaterial = new THREE.MeshPhysicalMaterial({
  map: dirtTexture,      // 应用地板纹理
  metalness: 0.1,        // 低金属度
  roughness: 0.8,        // 适当的粗糙度，使地面更真实
  envMap: envMap,        // 反射环境贴图
  envMapIntensity: 0.5,  // 反射强度
  clearcoat: 0.3,        // 轻微的透明反射层
  clearcoatRoughness: 0.1 // 透明层的粗糙度
});

// 创建地板
const planeSize = 60;
const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

plane.rotation.x = -Math.PI / 2; // 旋转平面使其水平
plane.position.y = 0; // 将平面稍微下移
scene.add(plane);

// 道路
// 加载道路纹理
const roadTexture = textureLoader.load('./dirt_road.jpg'); 
roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.repeat.set(3, 1); // 让纹理重复 3 次，模拟拉长的道路效果

// 创建道路材质
const roadMaterial = new THREE.MeshStandardMaterial({
    map: roadTexture,
    metalness: 0.2,   // 轻微的金属度
    roughness: 0.7,   // 适当的粗糙度
    side: THREE.DoubleSide
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

scene.add(road);


// 砖墙纹理
const brickTexture = textureLoader.load('./brickwall.png'); 

// 砖墙材质
const brickMaterial = new THREE.MeshStandardMaterial({
    map: brickTexture, // 贴图
    roughness: 0.5,    // 适中的粗糙度
    metalness: 0.1     // 低金属度
  });


// 砖墙
const brickGeometry = new THREE.BoxGeometry(1, 1, 1);
const brickCube = new THREE.Mesh(brickGeometry, brickMaterial);
brickCube.position.set(5, 0, 0); // 让立方体位于 x=3
scene.add(brickCube);


// 创建几何体（立方体）
const geometry = new THREE.BoxGeometry();

function createCube(geometry, color, x) {
  const material = new THREE.MeshStandardMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cube.position.x = x;
    return cube;
}

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

const helipadGeometry = new THREE.CircleGeometry(4, 64); // 直径 5，64 个面
const helipad = new THREE.Mesh(helipadGeometry, helipadMaterial);

// 7️⃣ 旋转平面使其水平，并调整高度
helipad.rotation.x = -Math.PI / 2;
helipad.position.set(5, 0.01, -15); // 设置停机坪的位置，稍微浮起避免Z冲突
scene.add(helipad);



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

// **调用函数，在不同位置创建帐篷**



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

            // 添加到场景
            scene.add(object);
        }, undefined, (error) => {
            console.error('🚨 加载直升机 OBJ 失败:', error);
        });
    });
}



// APC 1
// 🚙 定义一个函数来加载装甲车
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

            // 添加到场景
            scene.add(object);
        }, undefined, (error) => {
            console.error('🚨 加载 APC OBJ 失败:', error);
        });
    });
}
// 加载帐篷
loadTent({ x: 20, y: 0, z: -20 }); // 第一个帐篷
loadTent({ x: 20, y: 0, z: -10 }); // 第二个帐篷
// 直升机 1
loadHelicopter({ x: 4, y: 0.02, z: -14 }, 0, 2);

// 直升机 2
loadHelicopter({ x: 4, y: 19, z: -14 }, Math.PI / 3, 2);

// 直升机 3
loadHelicopter({ x: -20, y: 14, z: -14 }, Math.PI / 3, 2);

// 生成第一辆装甲车
loadAPCModel({ x: 15, y: 0, z: 0 }, Math.PI / 2 + Math.PI, 0.0001);

// 生成第二辆装甲车
loadAPCModel({ x: 7, y: 0, z: 10 }, Math.PI / 5.5 + Math.PI, 0.0001);

// 生成第三辆装甲车
loadAPCModel({ x: 12, y: 0, z: 20 }, Math.PI / 5 + Math.PI, 0.0001);



// 动画循环
function animate(time) {
    time *= 0.001; // 将时间单位转换为秒
  
    // 更新控制器
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

animate();
