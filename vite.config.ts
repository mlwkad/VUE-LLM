/// <reference types="node" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

// 在 ESM 环境中定义 __dirname
import { fileURLToPath } from 'url'  // fileURLToPath:将文件路径(file://./...)转系统路径(D:\xxx.vue)
const __filename = fileURLToPath(import.meta.url)  // import.meta.url:当前文件的文件路径
const __dirname = path.dirname(__filename)  // path.dirname:获取文件所在目录

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
    // Vite 配置实现了 Gzip 压缩优化：
    // 在项目构建阶段，使用 vite-plugin-compression 插件对 JS、CSS 等静态资源进行预处理，生成对应的 .gz 压缩文件（设置 10KB 阈值过滤小文件，避免过度压缩消耗资源）
    // (同时利用 Vite 内置的预览服务器（npm run preview）模拟生产环境) 浏览器请求时,服务器检查请求头是否有accept-encoding:gzip和对应.gz文件
    // 有就返回 .gz 文件且响应头有content-encoding:gzip表示成功
    // 浏览器直接解压使用

    // 打包分析插件，生成 stats.html 以可视化展示打包结果
    visualizer({
      open: false, // 是否自动打开分析报告
      gzipSize: true, // 显示 gzip 后的大小
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

  // CSS
  // css: {
  //   preprocessorOptions: {
  //     less: {
  //       additionalData: `  // 自动在less文件引入以下文件
  //         @import '@/assets/property.less'
  //         @import '@/assets/style.less'
  //       `
  //     }
  //   }
  // },

  // 构建配置
  build: {
    target: 'es2015', // 目标浏览器兼容性
    outDir: 'dist', // 输出目录
    assetsDir: 'assets', // 静态资源目录
    assetsInlineLimit: 4096, // 小于此阈值的资源将内联为 base64 编码
    cssCodeSplit: true, // 启用 CSS 代码拆分(Webpack 中：需通过 mini-css-extract-plugin 实现 CSS 拆分, 防止内嵌在 JS 中)
    sourcemap: false, // 生产环境不生成 sourcemap
    minify: 'terser', // 使用 terser 进行压缩(Webpack 中：需安装 terser-webpack-plugin 并在 optimization.minimizer 中配置)
    terserOptions: {
      compress: {  // terser 压缩配置
        drop_console: true, // 删除 console
        drop_debugger: true, // 删除 debugger
      },
    },
    // 分块策略
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash:6].js',  // 公共chunk
        entryFileNames: 'assets/entry/[name]-[hash:6].js',  // 入口chunk
        assetFileNames: 'assets/[ext]/[name]-[hash:6].[ext]',  // 静态资源根据类型分包
        manualChunks: {  // 手动分包
          vue: ['vue', 'vue-router', 'pinia'],
          vendor: ['axios', '@highlightjs/vue-plugin', 'markdown-it', 'markdown-it-br', 'markdown-it-highlightjs', 'markdown-it-katex', 'markdown-it-mathjax3'],
        }
        //关于代码分割
        // rollupOptions.output配置: 公共/入口/静态资源分开打包, 手动给第三方依赖分包
        // cssCodeSplit防止css内嵌到js
        // minify: 'terser'和terserOptions压缩js, 去除打印、断点
        // assetsInlineLimit限制静态资源, 小于就内联, 大了就单独打包
      },
    },
  },

  // 依赖预构建(将零散的依赖合并为一个ESM文件(使用import/export语法的文件), 减少请求)
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'],  // eg: 只写vue就是只对vue里零散的模块合并为一个esmodule文件(响应式处理, 运行时...)
  },
})
