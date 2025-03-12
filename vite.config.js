import { defineConfig } from 'vite';

export default defineConfig({
  base: '/CSE160_Assignment_5/', // GitHub Pages 需要匹配你的 repo 名
  build: {
    outDir: 'dist',
  },
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.obj', '**/*.mtl', '**/*.jpg', '**/*.png'] // 确保这些资源被正确包含
});


