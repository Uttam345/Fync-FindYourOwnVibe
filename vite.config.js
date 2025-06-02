import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Check if HTTPS certificates exist
const httpsConfig = (() => {
  const certPaths = [
    // mkcert default naming
    { key: 'localhost+2-key.pem', cert: 'localhost+2.pem' },
    // Alternative naming
    { key: 'localhost-key.pem', cert: 'localhost.pem' }
  ];
  
  for (const certPath of certPaths) {
    const keyPath = path.resolve(certPath.key);
    const certFilePath = path.resolve(certPath.cert);
    
    if (fs.existsSync(keyPath) && fs.existsSync(certFilePath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certFilePath),
      };
    }
  }
  
  return false;
})();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5174, // Use consistent port
    host: 'localhost',
    // Use HTTPS if certificates are available
    ...(httpsConfig && { https: httpsConfig })
  },
})
