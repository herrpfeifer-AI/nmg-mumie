import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleChat } from './lib/pharao.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lokal / in AI Studio. Auf Vercel übernimmt api/chat.ts diese Route.
app.post('/api/chat', async (req, res) => {
  try {
    const result = await handleChat(req.body, process.env.GEMINI_API_KEY);
    res.status(result.status).json(result.body);
  } catch (error: any) {
    console.error('Fehler bei Gemini API Aufruf:', error);
    res.status(500).json({
      error: 'Pharao Tutanchamuns Grabkammer ist im Moment in tiefen Schlaf versunken. Bitte versuche es gleich noch einmal.',
    });
  }
});

// Vite middleware in dev or static server in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
  });
}

startServer();
