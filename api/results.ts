// Lehrerübersicht: Resultate lesen oder löschen (nur mit Lehrer-Passwort TEACHER_CODE).
import { teacherAction } from '../lib/results.js';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }
  try {
    const result = await teacherAction(body, process.env.TEACHER_CODE);
    return Response.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('Resultate konnten nicht gelesen werden:', error?.message);
    return Response.json({ error: 'Resultate konnten nicht geladen werden.' }, { status: 500 });
  }
}
