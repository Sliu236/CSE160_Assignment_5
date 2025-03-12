import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

// 创建几何体（立方体）
const geometry = new THREE.BoxGeometry();

function createCube(geometry, color, x) {
  const material = new THREE.MeshStandardMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cube.position.x = x;
    return cube;
}

// 创建多个立方体
const cubes = [
    createCube(geometry, 0xff0000, -2),
    createCube(geometry, 0x00ff00, 0),
    createCube(geometry, 0x0000ff, 2),
]

// 创建地板
const planeSize = 40;
const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x808080,       // 灰色地板
  metalness: 0.4,        // 近乎金属（越接近1，反射越明显）
  roughness: 0.05,       // 越小越光滑（0是完全光滑）
  envMap: envMap,        // 环境贴图（反射环境）
  envMapIntensity: 0.8,  // 反射强度
  clearcoat: 1.0,        // 额外的透明反射层
  clearcoatRoughness: 0  // 透明层的粗糙度（越小越清晰）
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

plane.rotation.x = -Math.PI / 2; // 旋转平面使其水平
plane.position.y = -1; // 将平面稍微下移
scene.add(plane);

scene.environment = envMap;
scene.background = envMap;

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 动画循环
function animate(time) {
    time *= 0.001; // 将时间单位转换为秒
  
    cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * 0.1; // 速度略有不同
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });
  
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

animate();
