import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/idms-auth': {
            target: 'https://mobiledev.advanceagro.net',
            changeOrigin: true,
            rewrite: (path: string) => {
              const url = new URL(path, 'http://localhost');
              const account = url.searchParams.get('account') || '';
              const password = url.searchParams.get('password') || '';
              return `/ws/api/idms/authentication/?account=${encodeURIComponent(account)}&password=${encodeURIComponent(password)}&Service=0000&AgentId=SystemMango&AgentCode=Np4kfRh5`;
            },
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
