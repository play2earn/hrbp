import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Load environment variables for local dev server
if (fs.existsSync('.env')) dotenv.config({ path: '.env' });
if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local', override: true });

function apiDevMiddleware(): Plugin {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next: () => void) => {
        const urlStr = req.url || '';
        if (!urlStr.startsWith('/api')) {
          return next();
        }

        const host = req.headers.host || 'localhost:3000';
        const parsedUrl = new URL(urlStr, `http://${host}`);
        const pathname = parsedUrl.pathname;

        // Extract route name from /api/<route> or /api?route=<route>
        let route = parsedUrl.searchParams.get('route');
        if (!route) {
          const match = pathname.match(/^\/api\/?([a-z0-9-]+)?/i);
          if (match && match[1]) {
            route = match[1];
          }
        }

        // Buffer the request body
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const rawBody = Buffer.concat(chunks).toString('utf8');

        let body: any = {};
        if (rawBody) {
          try {
            body = JSON.parse(rawBody);
          } catch {
            body = rawBody;
          }
        }

        // Query params object
        const query: Record<string, string | string[]> = {};
        for (const [key, val] of parsedUrl.searchParams.entries()) {
          query[key] = val;
        }
        if (route) {
          query.route = route;
        }

        // Parse cookies
        const cookieHeader = req.headers.cookie || '';
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach((part: string) => {
          const idx = part.indexOf('=');
          if (idx > 0) {
            const k = part.slice(0, idx).trim();
            const v = part.slice(idx + 1).trim();
            if (k) cookies[k] = decodeURIComponent(v);
          }
        });

        // Enrich req for VercelRequest compatibility
        req.query = query;
        req.body = body;
        req.cookies = cookies;

        // Enrich res for VercelResponse compatibility
        res.status = function (code: number) {
          res.statusCode = code;
          return res;
        };
        res.json = function (data: any) {
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          res.end(JSON.stringify(data));
          return res;
        };
        res.send = function (data: any) {
          res.end(data);
          return res;
        };

        try {
          const apiModule = await server.ssrLoadModule('/api/index.ts');
          await apiModule.default(req, res);
        } catch (err: any) {
          console.error('[api-dev-middleware] Error executing handler:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
          }
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), apiDevMiddleware()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts')) return 'vendor-charts';
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('lucide-react')) return 'vendor-icons';
              return 'vendor';
            }
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});

