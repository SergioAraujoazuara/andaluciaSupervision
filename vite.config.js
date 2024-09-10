import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Cargar las variables de entorno del archivo .env según el modo
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    define: {
      'process.env': env  // Asegúrate de definir las variables de entorno aquí
    },
  };
});
