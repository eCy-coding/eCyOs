import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';


export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/stage/main',
      lib: {
        entry: {
          index: 'src/stage/main/index.ts',
          'brain.process': 'src/stage/main/brain.process.ts',
          'eye.process': 'src/stage/main/eye.process.ts',
          'agent.worker': 'src/stage/main/agent.worker.ts'
        }
      },
      rollupOptions: {
        external: ['playwright', 'electron-log', 'msgpackr']
      }
    },
    resolve: {
        alias: {
            '@': resolve('src')
        }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/stage/preload',
      lib: {
        entry: 'src/stage/preload/index.ts'
      }
    }
  },
  renderer: {
    root: 'src/stage/renderer',
    build: {
      outDir: 'dist/stage/renderer',
      rollupOptions: {
        input: {
          index: resolve('src/stage/renderer/index.html')
        },
        output: {
            manualChunks: (id) => {
                if (id.includes('node_modules')) {
                    if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                        return 'vendor-react';
                    }
                    if (id.includes('micromark') || id.includes('shiki') || id.includes('hast') || id.includes('unist')) {
                        return 'vendor-markdown';
                    }
                    if (id.includes('playwright') || id.includes('axe-core')) {
                        return 'vendor-testing';
                    }
                    if (id.includes('lancedb') || id.includes('apache-arrow')) {
                        return 'vendor-db';
                    }
                    return 'vendor'; // Fallback for other node_modules
                }
            }
        }
      }
    },

    plugins: [react(), visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true
    })],

    resolve: {
      alias: {
        '@renderer': resolve('src/stage/renderer/src'),
        '@': resolve('src')
      }
    }
  }
});
