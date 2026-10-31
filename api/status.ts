// Kurzer Gesundheitscheck: Ist der Gemini-Schlüssel gesetzt und sind die Modelle erreichbar?
// Aufruf im Browser: /api/status
import { getStatus } from '../lib/pharao.js';

export async function GET(): Promise<Response> {
  const status = await getStatus(process.env.GEMINI_API_KEY);
  return Response.json(status, { headers: { 'Cache-Control': 'no-store' } });
}
