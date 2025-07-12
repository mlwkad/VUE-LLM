/// <reference types="node" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

// 在 ESM 环境中定义 __dirname
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  // 基本配置
  base: './', // 部署在任何路径下都能正常工作

  // 插件配置
  plugins: [
    vue(), // Vue 3 支持
    compression({
      // Gzip 压缩配置
      verbose: true, // 是否在控制台输出压缩结果
      disable: false, // 是否禁用
      threshold: 10240, // 体积大于阈值会被压缩，单位 b，这里是 10kb
      algorithm: 'gzip', // 压缩算法
      ext: '.gz', // 生成的压缩包后缀
    }),
    // 打包分析插件，生成 stats.html 以可视化展示打包结果
    visualizer({
      open: false, // 是否自动打开分析报告
      gzipSize: true, // 显示 gzip 后的大小
      brotliSize: true, // 显示 brotli 压缩后的大小
    }),
  ],

  // 解析配置
  resolve: {
    alias: {
      // 路径别名配置，方便导入模块
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@views': path.resolve(__dirname, 'src/views'),
      '@store': path.resolve(__dirname, 'src/store'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'], // 导入时可以省略的扩展名
  },

  // 服务器配置
  server: {
    port: 5173, // 指定端口
    open: true, // 启动时自动打开浏览器
    cors: true, // 允许跨域
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // API 服务器地址
        changeOrigin: true, // 改变请求源
      }
    }
  },

  // CSS 相关配置
  css: {
    preprocessorOptions: {},
    // 配置 CSS modules
    modules: {
      localsConvention: 'camelCaseOnly', // 类名转换为驼峰命名
    },
  },

  // 构建配置
  build: {
    target: 'es2015', // 目标浏览器兼容性
    outDir: 'dist', // 输出目录
    assetsDir: 'assets', // 静态资源目录
    assetsInlineLimit: 4096, // 小于此阈值的资源将内联为 base64 编码
    cssCodeSplit: true, // 启用 CSS 代码拆分
    sourcemap: false, // 生产环境不生成 sourcemap
    minify: 'terser', // 使用 terser 进行压缩
    terserOptions: {
      compress: {  // terser 压缩配置
        drop_console: true, // 删除 console
        drop_debugger: true, // 删除 debugger
      },
    },
    // 分块策略
    rollupOptions: {
      output: {
        // 静态资源分类打包
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/entry/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // 拆分依赖包
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          vendor: ['axios', 'highlight.js'],
        },
      },
    },
  },

  // 性能优化
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'], // 预构建依赖
  },
})
