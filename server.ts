import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleChat, checkExamCode, getStatus } from './lib/pharao.js';
import { saveProgress, teacherAction } from './lib/results.js';

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

app.post('/api/unlock', (req, res) => {
  const result = checkExamCode(req.body, process.env.EXAM_CODE);
  res.status(result.status).json(result.body);
});

app.post('/api/progress', async (req, res) => {
  try {
    const result = await saveProgress(req.body, process.env.EXAM_CODE);
    res.status(result.status).json(result.body);
  } catch (error: any) {
    res.status(500).json({ error: 'Speichern fehlgeschlagen.', details: error?.message });
  }
});

app.post('/api/results', async (req, res) => {
  try {
    const result = await teacherAction(req.body, process.env.TEACHER_CODE);
    res.status(result.status).json(result.body);
  } catch (error: any) {
    res.status(500).json({ error: 'Resultate konnten nicht geladen werden.' });
  }
});

app.get('/api/status', async (_req, res) => {
  res.json(await getStatus(process.env.GEMINI_API_KEY));
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
