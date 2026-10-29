// Vercel-Funktion für /api/chat.
// Der Schlüssel kommt aus der Vercel-Umgebungsvariable GEMINI_API_KEY
// und bleibt auf dem Server – der Browser der Schüler sieht ihn nie.
import { handleChat } from '../lib/pharao.js';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  try {
    const result = await handleChat(body, process.env.GEMINI_API_KEY);
    return Response.json(result.body, { status: result.status });
  } catch (error: any) {
    console.error('Fehler bei Gemini API Aufruf:', error);
    return Response.json(
      {
        error:
          'Pharao Tutanchamuns Grabkammer ist im Moment in tiefen Schlaf versunken. Bitte versuche es gleich noch einmal.',
      },
      { status: 500 },
    );
  }
}
