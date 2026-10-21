import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  base: './',
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist' },
  // Don't watch build output: rebuilding while the dev server runs locks these files on Windows.
  server: { watch: { ignored: ['**/dist/**', '**/dist-single/**'] } },
}));
