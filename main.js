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

// 创建几何体（立方体）
const geometry = new THREE.BoxGeometry();

function createCube(geometry, color, x) {
  const material = new THREE.MeshStandardMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cube.position.x = x;
    return cube;
}

const cubes = [
    createCube(geometry, 0xff0000, -2),
    createCube(geometry, 0x00ff00, 0),
    createCube(geometry, 0x0000ff, 2),
]

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
