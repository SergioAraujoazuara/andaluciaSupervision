import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    define: {
      // Esto es opcional, pero puedes usarlo para exponer las variables de entorno a tu código frontend
      'process.env': env,
    },
    // Resto de tu configuración
  };
});
