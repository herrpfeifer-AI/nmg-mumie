import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Lock,
  RefreshCw,
  Users,
  Award,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Trash2,
  LogOut,
  Printer,
  Gamepad2,
} from 'lucide-react';
import { QUIZ_QUESTIONS, CLOZE_ITEMS } from './PharaoPruefung';

// =====================================================================
// Lehrerübersicht: /lehrer
// Zeigt den Prüfungsstand aller Kinder. Geschützt mit dem Lehrer-Passwort
// (Vercel-Umgebungsvariable TEACHER_CODE). Aktualisiert sich automatisch.
// =====================================================================

interface QuizEntry {
  nr: number;
  solved: boolean;
  tries: number;
  wrong: string[];
}
interface ClozeEntry {
  nr: number;
  wrongCount: number;
  wrongWords: string[];
}
interface StudentRecord {
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

const PW_KEY = 'lehrer-passwort';
const REFRESH_MS = 15_000;

function readStored(): string {
  try {
    return window.sessionStorage.getItem(PW_KEY) || '';
  } catch {
    return '';
  }
}
function store(pw: string | null) {
  try {
    if (pw) window.sessionStorage.setItem(PW_KEY, pw);
    else window.sessionStorage.removeItem(PW_KEY);
  } catch {
    /* egal */
  }
}

function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'gerade eben';
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.floor(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  return new Date(iso).toLocaleDateString('de-CH');
}

function clockTime(iso: string | null): string {
  if (!iso) return '–';
  const d = new Date(iso);
  return `${d.toLocaleDateString('de-CH')} ${d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`;
}

function minutesBetween(a: string, b: string | null): string {
  if (!b) return '';
  const m = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
  return `${m} Min.`;
}

type Stage = 'urkunde' | 'lueckentext' | 'quiz';
function stageOf(r: StudentRecord): Stage {
  if (r.certificateAt) return 'urkunde';
  if (r.quiz.length && r.quiz.every((q) => q.solved)) return 'lueckentext';
  return 'quiz';
}

const STAGE_LABEL: Record<Stage, string> = {
  urkunde: 'Urkunde erhalten',
  lueckentext: 'beim Lückentext',
  quiz: 'beim Quiz',
};
const STAGE_STYLE: Record<Stage, string> = {
  urkunde: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
  lueckentext: 'bg-sky-500/20 text-sky-200 border-sky-500/50',
  quiz: 'bg-amber-500/20 text-amber-200 border-amber-500/50',
};

/** Ein Kästchen pro Aufgabe: ✓ beim 1. Versuch, Zahl = Anläufe, – = noch offen */
function TryBadge({ solved, tries, started }: { solved: boolean; tries: number; started: boolean }) {
  let style = 'bg-slate-800 text-slate-500 border-slate-700';
  let label = '–';
  if (solved && tries <= 1) {
    style = 'bg-emerald-600/80 text-white border-emerald-400';
    label = '✓';
  } else if (solved) {
    style = tries === 2 ? 'bg-amber-500/80 text-amber-950 border-amber-300' : 'bg-orange-600/90 text-white border-orange-400';
    label = String(tries);
  } else if (started) {
    style = 'bg-rose-700/80 text-white border-rose-400';
    label = '✗';
  }
  return (
    <span
      className={`inline-flex w-7 h-7 items-center justify-center rounded-md border text-xs font-bold ${style}`}
      title={solved ? (tries <= 1 ? 'beim 1. Versuch' : `${tries} Anläufe`) : started ? 'noch nicht gelöst' : 'noch nicht bearbeitet'}
    >
      {label}
    </span>
  );
}

function mostCommon(items: string[]): { text: string; count: number } | null {
  if (!items.length) return null;
  const counts = new Map<string, number>();
  items.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
  const [text, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return { text, count };
}

export const LehrerUebersicht: React.FC = () => {
  const [password, setPassword] = useState<string>(() => readStored());
  const [pwInput, setPwInput] = useState('');
  const [records, setRecords] = useState<StudentRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastLoad, setLastLoad] = useState<Date | null>(null);
  const [klasse, setKlasse] = useState<string>('alle');
  const [open, setOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null); // 'all' oder id

  const call = useCallback(
    async (pw: string, extra: Record<string, unknown> = {}) => {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(data.error || 'Fehler beim Laden.'), { status: res.status });
      return data;
    },
    [],
  );

  const load = useCallback(
    async (pw: string) => {
      if (!pw) return;
      setLoading(true);
      try {
        const data = await call(pw);
        setRecords(data.records || []);
        setError(null);
        setLastLoad(new Date());
        store(pw);
      } catch (e: any) {
        setError(e.message);
        if (e.status === 403 || e.status === 503) {
          setPassword('');
          store(null);
          setRecords(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [call],
  );

  useEffect(() => {
    if (!password) return;
    load(password);
    const t = setInterval(() => load(password), REFRESH_MS);
    return () => clearInterval(t);
  }, [password, load]);

  const deleteRecords = async (target: string) => {
    try {
      await call(password, target === 'all' ? { action: 'deleteAll' } : { action: 'deleteOne', id: target });
      setConfirm(null);
      setOpen(null);
      load(password);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const classes = useMemo(
    () => [...new Set((records || []).map((r) => r.klasse))].sort(),
    [records],
  );
  const shown = useMemo(
    () => (records || []).filter((r) => klasse === 'alle' || r.klasse === klasse),
    [records, klasse],
  );

  // Klassenauswertung: welche Aufgaben machten am meisten Mühe?
  const analysis = useMemo(() => {
    const quiz = QUIZ_QUESTIONS.map((q, i) => {
      const entries = shown.map((r) => r.quiz.find((e) => e.nr === i + 1)).filter(Boolean) as QuizEntry[];
      const attempted = entries.filter((e) => e.solved || e.tries > 0);
      const needed = attempted.filter((e) => !e.solved || e.tries > 1);
      return {
        label: `Frage ${i + 1}`,
        text: q.question,
        attempted: attempted.length,
        problems: needed.length,
        common: mostCommon(entries.flatMap((e) => e.wrong)),
      };
    });
    const cloze = CLOZE_ITEMS.map((item) => {
      const entries = shown
        .filter((r) => r.cloze.rounds > 0)
        .map((r) => r.cloze.blanks.find((b) => b.nr === item.id))
        .filter(Boolean) as ClozeEntry[];
      return {
        label: `Lücke ${item.id}`,
        text: item.word,
        attempted: entries.length,
        problems: entries.filter((e) => e.wrongCount > 0).length,
        common: mostCommon(entries.flatMap((e) => e.wrongWords)),
      };
    });
    return [...quiz, ...cloze]
      .filter((x) => x.problems > 0)
      .sort((a, b) => b.problems / Math.max(1, b.attempted) - a.problems / Math.max(1, a.attempted))
      .slice(0, 6);
  }, [shown]);

  const stats = useMemo(() => {
    const done = shown.filter((r) => r.certificateAt);
    const avg = done.length ? Math.round(done.reduce((s, r) => s + r.score, 0) / done.length) : null;
    const active = shown.filter((r) => Date.now() - new Date(r.updatedAt).getTime() < 3 * 60000).length;
    return { total: shown.length, done: done.length, avg, max: shown[0]?.maxScore || 110, active };
  }, [shown]);

  // ---------------- Login ----------------
  if (!password) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-[#f1ebd9] flex items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!pwInput.trim()) return;
            setError(null);
            setPassword(pwInput.trim());
          }}
          className="w-full max-w-sm rounded-3xl border-2 border-amber-500/50 bg-[#0e1628] p-8 space-y-5 shadow-2xl text-center"
        >
          <div className="inline-flex p-4 rounded-full bg-amber-500/15 border-2 border-amber-400 text-amber-300">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-pharaoh text-amber-200">Lehrerübersicht</h1>
            <p className="text-xs text-amber-100/70 mt-1">Pharaonen-Prüfung • nur für Lehrpersonen</p>
          </div>
          <input
            type="password"
            autoFocus
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            placeholder="Lehrer-Passwort"
            className="w-full bg-[#162138] border-2 border-amber-500/50 focus:border-amber-400 rounded-xl px-4 py-3 text-center text-amber-100 focus:outline-none"
          />
          {error && <p className="text-xs text-rose-300">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-extrabold text-sm"
          >
            Anmelden
          </button>
          <a href="/" className="block text-xs text-amber-300/60 hover:text-amber-200">
            ← zur Schüler-App
          </a>
        </form>
      </div>
    );
  }

  // ---------------- Übersicht ----------------
  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f1ebd9] p-3 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Kopf */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-pharaoh text-amber-200">Lehrerübersicht Pharaonen-Prüfung</h1>
            <p className="text-xs text-amber-100/60">
              Aktualisiert sich alle {REFRESH_MS / 1000} Sekunden
              {lastLoad && ` • zuletzt ${lastLoad.toLocaleTimeString('de-CH')}`} • Daten werden 30 Tage nach der letzten
              Aktivität gelöscht
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => load(password)}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Aktualisieren
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Drucken
            </button>
            <button
              onClick={() => {
                store(null);
                setPassword('');
                setRecords(null);
              }}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-xs flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Abmelden
            </button>
          </div>
        </div>

        {error && (
          <p className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-sm text-rose-200">{error}</p>
        )}

        {/* Klassenfilter */}
        <div className="flex flex-wrap gap-2 print:hidden">
          {['alle', ...classes].map((k) => (
            <button
              key={k}
              onClick={() => setKlasse(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                klasse === k ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-[#121a2d] text-amber-200 border-amber-500/30'
              }`}
            >
              {k === 'alle' ? 'Alle Klassen' : `Klasse ${k}`}
            </button>
          ))}
        </div>

        {/* Kennzahlen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Users className="w-4 h-4" />, label: 'Kinder', value: String(stats.total) },
            { icon: <Award className="w-4 h-4" />, label: 'Urkunde erhalten', value: `${stats.done} / ${stats.total}` },
            { icon: <Clock className="w-4 h-4" />, label: 'gerade aktiv', value: String(stats.active) },
            { icon: <Award className="w-4 h-4" />, label: 'Ø Punkte (fertig)', value: stats.avg === null ? '–' : `${stats.avg} / ${stats.max}` },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl bg-[#0e1628] border border-amber-500/30 p-4">
              <span className="text-[11px] text-amber-300/80 flex items-center gap-1.5">
                {c.icon} {c.label}
              </span>
              <span className="block text-2xl font-black text-amber-100 mt-1">{c.value}</span>
            </div>
          ))}
        </div>

        {/* Schwierigste Aufgaben */}
        {analysis.length > 0 && (
          <div className="rounded-2xl bg-[#0e1628] border border-amber-500/30 p-4 space-y-3">
            <h2 className="text-sm font-bold text-amber-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Wo es am meisten Mühe gab
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysis.map((a) => (
                <div key={a.label} className="rounded-xl bg-[#141e33] border border-slate-700 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-amber-100">
                      {a.label}: <span className="font-normal text-amber-100/80">{a.text}</span>
                    </span>
                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-rose-900/60 text-rose-200 font-bold">
                      {a.problems} von {a.attempted}
                    </span>
                  </div>
                  {a.common && (
                    <p className="text-slate-300">
                      Häufigster Fehler: «{a.common.text}» ({a.common.count}×)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabelle */}
        <div className="rounded-2xl bg-[#0e1628] border border-amber-500/30 overflow-x-auto">
          {records === null ? (
            <p className="p-6 text-sm text-amber-200/70">Lade Resultate…</p>
          ) : shown.length === 0 ? (
            <p className="p-6 text-sm text-amber-200/70">
              Noch keine Resultate. Sobald ein Kind die Prüfung mit dem Codewort öffnet und seinen Namen eingibt, erscheint es hier.
            </p>
          ) : (
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-amber-300/80 border-b border-amber-500/20">
                  <th className="p-3">Name</th>
                  <th className="p-3">Stand</th>
                  <th className="p-3">Quiz (Fragen 1–{QUIZ_QUESTIONS.length})</th>
                  <th className="p-3">Lückentext</th>
                  <th className="p-3">Punkte</th>
                  <th className="p-3">Spiel</th>
                  <th className="p-3">Aktiv</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const stage = stageOf(r);
                  const isOpen = open === r.id;
                  const wrongBlanks = r.cloze.blanks.filter((b) => b.wrongCount > 0);
                  const recentlyActive = Date.now() - new Date(r.updatedAt).getTime() < 3 * 60000;
                  return (
                    <React.Fragment key={r.id}>
                      <tr
                        onClick={() => setOpen(isOpen ? null : r.id)}
                        className="border-b border-slate-800 hover:bg-[#141e33] cursor-pointer align-middle"
                      >
                        <td className="p-3 font-bold text-amber-100">
                          <span className="flex items-center gap-1.5">
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            {r.name}
                            <span className="text-[11px] font-normal text-amber-300/60">{r.klasse}</span>
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-md border text-[11px] font-bold whitespace-nowrap ${STAGE_STYLE[stage]}`}>
                            {STAGE_LABEL[stage]}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="flex gap-1">
                            {QUIZ_QUESTIONS.map((_, i) => {
                              const e = r.quiz.find((q) => q.nr === i + 1);
                              return (
                                <TryBadge key={i} solved={!!e?.solved} tries={e?.tries || 0} started={!!e && (e.tries > 0 || e.wrong.length > 0)} />
                              );
                            })}
                          </span>
                        </td>
                        <td className="p-3 text-xs">
                          {r.cloze.solved ? (
                            wrongBlanks.length === 0 ? (
                              <span className="text-emerald-300 font-bold">✓ beim 1. Versuch</span>
                            ) : (
                              <span className="text-amber-200">
                                ✓ nach {r.cloze.rounds} Runden ({wrongBlanks.length} Lücken korrigiert)
                              </span>
                            )
                          ) : r.cloze.rounds > 0 ? (
                            <span className="text-rose-200">am Korrigieren ({r.cloze.rounds}. Runde)</span>
                          ) : (
                            <span className="text-slate-500">noch nicht geprüft</span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-amber-100 whitespace-nowrap">
                          {r.score} / {r.maxScore}
                        </td>
                        <td className="p-3 text-xs text-sky-200 whitespace-nowrap">
                          {r.game.started ? (
                            <span className="flex items-center gap-1">
                              <Gamepad2 className="w-3.5 h-3.5" />
                              {r.game.won ? 'durchgespielt' : `Level ${r.game.level || 1}`}
                            </span>
                          ) : (
                            <span className="text-slate-500">–</span>
                          )}
                        </td>
                        <td className="p-3 text-xs whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${recentlyActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                            {timeAgo(r.updatedAt)}
                          </span>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="bg-[#0b1222] border-b border-slate-800">
                          <td colSpan={7} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-2">
                                <h3 className="font-bold text-amber-200">Quiz</h3>
                                {QUIZ_QUESTIONS.map((q, i) => {
                                  const e = r.quiz.find((x) => x.nr === i + 1);
                                  return (
                                    <div key={q.id} className="rounded-lg bg-[#141e33] p-2.5 space-y-0.5">
                                      <p className="text-amber-100">
                                        <strong>Frage {i + 1}:</strong> {q.question}
                                      </p>
                                      <p className="text-slate-300">
                                        {!e || (!e.solved && e.wrong.length === 0)
                                          ? 'noch nicht beantwortet'
                                          : e.solved
                                          ? e.tries <= 1
                                            ? '✓ beim ersten Versuch richtig'
                                            : `✓ richtig im ${e.tries}. Versuch`
                                          : '✗ noch nicht richtig'}
                                      </p>
                                      {e && e.wrong.length > 0 && (
                                        <p className="text-rose-200">Falsch gewählt: {e.wrong.map((w) => `«${w}»`).join(', ')}</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="space-y-2">
                                <h3 className="font-bold text-amber-200">Lückentext</h3>
                                <div className="rounded-lg bg-[#141e33] p-2.5 space-y-1">
                                  {r.cloze.rounds === 0 ? (
                                    <p className="text-slate-300">noch nicht geprüft</p>
                                  ) : wrongBlanks.length === 0 ? (
                                    <p className="text-emerald-300">Alle Lücken beim ersten Versuch richtig.</p>
                                  ) : (
                                    wrongBlanks.map((b) => {
                                      const item = CLOZE_ITEMS.find((c) => c.id === b.nr);
                                      return (
                                        <p key={b.nr} className="text-slate-200">
                                          <strong>Lücke {b.nr}</strong> (richtig: {item?.word}): eingesetzt{' '}
                                          {b.wrongWords.map((w) => `«${w}»`).join(', ')}
                                        </p>
                                      );
                                    })
                                  )}
                                </div>
                                <h3 className="font-bold text-amber-200 pt-2">Zeit</h3>
                                <div className="rounded-lg bg-[#141e33] p-2.5 space-y-0.5 text-slate-300">
                                  <p>Begonnen: {clockTime(r.startedAt)}</p>
                                  <p>
                                    Urkunde: {clockTime(r.certificateAt)}
                                    {r.certificateAt && ` (Dauer ${minutesBetween(r.startedAt, r.certificateAt)})`}
                                  </p>
                                  {r.game.started && <p>Spiel: Level {r.game.level || 1}, {r.game.gold} Gold{r.game.won ? ', durchgespielt' : ''}</p>}
                                </div>
                                <div className="pt-2 print:hidden">
                                  {confirm === r.id ? (
                                    <span className="flex items-center gap-2">
                                      <span className="text-rose-200">Eintrag von {r.name} wirklich löschen?</span>
                                      <button
                                        onClick={(ev) => {
                                          ev.stopPropagation();
                                          deleteRecords(r.id);
                                        }}
                                        className="px-2.5 py-1 rounded-md bg-rose-700 text-white font-bold"
                                      >
                                        Ja, löschen
                                      </button>
                                      <button onClick={() => setConfirm(null)} className="px-2.5 py-1 rounded-md bg-slate-700">
                                        Abbrechen
                                      </button>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={(ev) => {
                                        ev.stopPropagation();
                                        setConfirm(r.id);
                                      }}
                                      className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-600 text-slate-300 flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Eintrag löschen (z. B. Testversuch)
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Legende & alles löschen */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-amber-100/60">
          <span className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1"><TryBadge solved tries={1} started /> 1. Versuch</span>
            <span className="flex items-center gap-1"><TryBadge solved tries={2} started /> Anzahl Anläufe</span>
            <span className="flex items-center gap-1"><TryBadge solved={false} tries={1} started /> noch falsch</span>
            <span className="flex items-center gap-1"><TryBadge solved={false} tries={0} started={false} /> offen</span>
            <span>• Zeile anklicken für Details</span>
          </span>
          {records && records.length > 0 && (
            <span className="print:hidden">
              {confirm === 'all' ? (
                <span className="flex items-center gap-2">
                  <span className="text-rose-200">Wirklich alle {records.length} Einträge löschen?</span>
                  <button onClick={() => deleteRecords('all')} className="px-2.5 py-1 rounded-md bg-rose-700 text-white font-bold">
                    Ja, alles löschen
                  </button>
                  <button onClick={() => setConfirm(null)} className="px-2.5 py-1 rounded-md bg-slate-700 text-slate-200">
                    Abbrechen
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirm('all')}
                  className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-600 text-slate-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Alle Resultate löschen
                </button>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
