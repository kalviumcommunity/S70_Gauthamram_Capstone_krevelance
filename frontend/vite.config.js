
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; 

export default defineConfig({
  server: {
    host: "::",
    port: 1613,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
});