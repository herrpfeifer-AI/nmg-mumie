// Prüfungsfortschritt der Schülerinnen und Schüler für die Lehrerübersicht.
// Gespeichert im privaten Vercel-Blob-Speicher (Region Frankfurt).
// Gespeichert werden nur: Vorname, Klasse, Prüfungsverlauf, Punkte, Spielstand.
// Einträge werden 30 Tage nach der letzten Aktivität automatisch gelöscht.
import { put, list, get, del } from '@vercel/blob';
import { isValidExamCode } from './pharao.js';

export const RETENTION_DAYS = 30;
const PREFIX = 'resultate/';
const MAX_BODY = 12_000;

export type ApiResult = { status: number; body: unknown };

// ------------------------------------------------------------------
// Datensatz eines Kindes
// ------------------------------------------------------------------
export interface QuizEntry {
  nr: number;
  solved: boolean;
  tries: number;
  wrong: string[]; // gewählte falsche Antworten (Text)
}
export interface ClozeEntry {
  nr: number;
  wrongCount: number;
  wrongWords: string[]; // falsch eingesetzte Wörter
}
export interface StudentRecord {
  id: string;
  name: string;
  klasse: string;
  startedAt: string;
  updatedAt: string;
  quiz: QuizEntry[];
  cloze: { rounds: number; solved: boolean; blanks: ClozeEntry[] };
  score: number;
  maxScore: number;
  certificateAt: string | null;
  game: { started: boolean; level: number; gold: number; won: boolean };
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: unknown, min = 0, max = 10_000) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : 0;
const bool = (v: unknown) => v === true;
const strList = (v: unknown, maxItems: number, maxLen: number) =>
  Array.isArray(v) ? v.slice(0, maxItems).map((x) => str(x, maxLen)).filter(Boolean) : [];
const isoOrNull = (v: unknown) => {
  const s = str(v, 40);
  return s && !Number.isNaN(Date.parse(s)) ? new Date(s).toISOString() : null;
};

/** Nimmt nur bekannte Felder mit sinnvollen Längen an. */
export function sanitizeRecord(raw: any): StudentRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = str(raw.id, 60);
  if (!/^[a-zA-Z0-9-]{8,60}$/.test(id)) return null;
  const name = str(raw.name, 40);
  if (!name) return null;
  return {
    id,
    name,
    klasse: str(raw.klasse, 8) || '?',
    startedAt: isoOrNull(raw.startedAt) || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quiz: (Array.isArray(raw.quiz) ? raw.quiz.slice(0, 20) : []).map((q: any) => ({
      nr: num(q?.nr, 0, 50),
      solved: bool(q?.solved),
      tries: num(q?.tries, 0, 20),
      wrong: strList(q?.wrong, 10, 200),
    })),
    cloze: {
      rounds: num(raw.cloze?.rounds, 0, 100),
      solved: bool(raw.cloze?.solved),
      blanks: (Array.isArray(raw.cloze?.blanks) ? raw.cloze.blanks.slice(0, 20) : []).map((b: any) => ({
        nr: num(b?.nr, 0, 50),
        wrongCount: num(b?.wrongCount, 0, 100),
        wrongWords: strList(b?.wrongWords, 20, 40),
      })),
    },
    score: num(raw.score, 0, 1000),
    maxScore: num(raw.maxScore, 0, 1000),
    certificateAt: isoOrNull(raw.certificateAt),
    game: {
      started: bool(raw.game?.started),
      level: num(raw.game?.level, 0, 20),
      gold: num(raw.game?.gold, 0, 1_000_000),
      won: bool(raw.game?.won),
    },
  };
}

// ------------------------------------------------------------------
// Schreiben (von der Prüfung aus) – nur mit gültigem Prüfungs-Codewort
// ------------------------------------------------------------------
export async function saveProgress(input: unknown, examCode: string | undefined): Promise<ApiResult> {
  const body = input as { code?: unknown; record?: unknown } | null;
  if (JSON.stringify(body ?? {}).length > MAX_BODY) return { status: 413, body: { error: 'Zu gross.' } };
  if (typeof body?.code !== 'string' || !isValidExamCode(body.code, examCode)) {
    return { status: 403, body: { error: 'Codewort ungültig.' } };
  }
  const record = sanitizeRecord(body.record);
  if (!record) return { status: 400, body: { error: 'Ungültige Daten.' } };

  await put(`${PREFIX}${record.id}.json`, JSON.stringify(record), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return { status: 200, body: { ok: true } };
}

// ------------------------------------------------------------------
// Lesen & Löschen (Lehrerseite) – nur mit Lehrer-Passwort
// ------------------------------------------------------------------
function checkTeacher(password: unknown, teacherCode: string | undefined): ApiResult | null {
  if (!teacherCode) {
    return {
      status: 503,
      body: { error: 'Das Lehrer-Passwort ist noch nicht eingerichtet (Vercel-Variable TEACHER_CODE).' },
    };
  }
  // Tolerant vergleichen: Leerzeichen am Rand, Gross-/Kleinschreibung und
  // unterschiedliche Umlaut-Kodierungen (z. B. vom iPad) sollen nicht stören.
  const clean = (v: string) => v.normalize('NFC').trim().toLowerCase();
  if (typeof password !== 'string' || clean(password) !== clean(teacherCode)) {
    console.warn(
      `Lehrer-Login abgelehnt (eingegeben: ${typeof password === 'string' ? clean(password).length : '-'} Zeichen, ` +
        `erwartet: ${clean(teacherCode).length} Zeichen)`,
    );
    return { status: 403, body: { error: 'Passwort falsch.' } };
  }
  return null;
}

async function listAllBlobs() {
  const blobs: { pathname: string; uploadedAt: Date }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

/** Löscht Einträge, die seit mehr als 30 Tagen nicht mehr verändert wurden. */
export async function cleanupOld(): Promise<number> {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const old = (await listAllBlobs()).filter((b) => new Date(b.uploadedAt).getTime() < cutoff);
  if (old.length) await del(old.map((b) => b.pathname));
  return old.length;
}

async function readRecord(pathname: string): Promise<StudentRecord | null> {
  try {
    const res = await get(pathname, { access: 'private', useCache: false });
    if (!res || res.statusCode !== 200) return null;
    const text = await new Response(res.stream).text();
    return JSON.parse(text) as StudentRecord;
  } catch {
    return null;
  }
}

export async function teacherAction(input: unknown, teacherCode: string | undefined): Promise<ApiResult> {
  const body = (input ?? {}) as { password?: unknown; action?: unknown; id?: unknown };
  const denied = checkTeacher(body.password, teacherCode);
  if (denied) return denied;

  if (body.action === 'deleteAll') {
    const all = await listAllBlobs();
    if (all.length) await del(all.map((b) => b.pathname));
    return { status: 200, body: { deleted: all.length } };
  }

  if (body.action === 'deleteOne' && typeof body.id === 'string' && /^[a-zA-Z0-9-]{8,60}$/.test(body.id)) {
    await del(`${PREFIX}${body.id}.json`);
    return { status: 200, body: { deleted: 1 } };
  }

  await cleanupOld();
  const blobs = await listAllBlobs();
  const records = (await Promise.all(blobs.map((b) => readRecord(b.pathname)))).filter(
    (r): r is StudentRecord => !!r,
  );
  records.sort((a, b) => a.klasse.localeCompare(b.klasse) || a.name.localeCompare(b.name, 'de'));
  return { status: 200, body: { records, retentionDays: RETENTION_DAYS } };
}
