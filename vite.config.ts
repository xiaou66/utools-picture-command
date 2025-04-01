import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig({
  build: {
    lib: {
      entry: {
        'u-upload': resolve(__dirname, 'src/u-upload.ts')
      },
      formats: ['cjs'],
      fileName: (format, entryName) => `${entryName}.cjs.js`,
    },
    sourcemap: false,
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
      outDir: 'dist',
      rollupTypes: true,
    }),
    {
      name: 'copy-bin-files',
      closeBundle() {
        // 确保bin目录存在
        if (!fs.existsSync('./bin')) {
          fs.mkdirSync('./bin', { recursive: true });
        }

        // 复制CLI文件到bin目录
        const source = path.resolve(__dirname, 'dist/u-upload.cjs.js');
        const destination = path.resolve(__dirname, 'bin/u-upload.cjs');

        if (fs.existsSync(source)) {
          fs.copyFileSync(source, destination);
          console.log(`✅ 已复制 ${source} 到 ${destination}`);

          // 添加shebang到文件开头
          const content = fs.readFileSync(destination, 'utf8');
          const shebang = '#!/usr/bin/env node\n';
          if (!content.startsWith('#!')) {
            fs.writeFileSync(destination, shebang + content);
            console.log('✅ 已添加shebang到bin文件');
          }

          // 给文件添加可执行权限 (Unix系统)
          try {
            fs.chmodSync(destination, '755');
            console.log('✅ 已设置bin文件为可执行');
          } catch (err) {
            console.log('⚠️ 无法设置可执行权限:', err);
          }
        } else {
          console.error(`❌ 源文件 ${source} 不存在`);
        }
      }
    }
  ],
})
