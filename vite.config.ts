import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/imos2d-lab/',
  plugins: [react()],
});
