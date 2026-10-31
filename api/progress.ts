// Speichert den Prüfungsfortschritt eines Kindes (nur mit gültigem Prüfungs-Codewort).
import { saveProgress } from '../lib/results.js';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }
  try {
    const result = await saveProgress(body, process.env.EXAM_CODE);
    return Response.json(result.body, { status: result.status });
  } catch (error: any) {
    console.error('Fortschritt konnte nicht gespeichert werden:', error?.message);
    return Response.json({ error: 'Speichern fehlgeschlagen.' }, { status: 500 });
  }
}
