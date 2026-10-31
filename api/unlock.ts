// Prüft das Codewort für die Prüfung auf dem Server.
// Das Codewort steht so nicht im Browser-Code. Ändern: Vercel-Umgebungsvariable EXAM_CODE.
import { checkExamCode } from '../lib/pharao.js';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }
  const result = checkExamCode(body, process.env.EXAM_CODE);
  return Response.json(result.body, { status: result.status });
}
