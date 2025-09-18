import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: '0.0.0.0',
      port: 8000,
      strictPort: true,
      hmr: {
        port: 8000,
        host: 'localhost',
        clientPort: 8000
      },
      watch: {
        usePolling: true,
        interval: 100
      },
      cors: true
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger({
        exclude: ['ThemeProvider', 'ThemeProvider2', 'ThemeProviderNoVars', 'MuiThemeProvider']
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: './',
    build: {
      outDir: 'dist',
    },
    define: {
      // Make env variables available in the client code
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      // Expose Vite env variables directly
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    }
  };
});
