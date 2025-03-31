import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'u-upload': resolve(__dirname, 'src/u-upload.ts')
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'es' : 'cjs'}.js`,
    },
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      // 外部化依赖
      external: [
        'net',
        'commander',
        'node:events',
        'node:child_process',
        'node:path',
        'node:fs',
        'node:process',
        '@xiaou66/interconnect-client',
        /^node:.*/
      ],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          'commander': 'commander',
          '@xiaou66/interconnect-client': 'interconnectClient',
        },
        // 确保导出正确
        exports: 'auto'
      }
    },
    // 添加target支持Node.js环境
    target: 'node16'
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
})
