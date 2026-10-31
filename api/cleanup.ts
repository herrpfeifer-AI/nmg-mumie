// Täglicher Aufräum-Job (Vercel Cron): löscht Resultate nach 30 Tagen ohne Aktivität.
import { cleanupOld } from '../lib/results.js';

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Nicht erlaubt', { status: 401 });
  }
  const deleted = await cleanupOld();
  return Response.json({ deleted });
}
