import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Lock,
  Unlock,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  Printer,
  ArrowRight,
  Scroll,
  HelpCircle,
  Flame,
  Check,
  Lightbulb,
  Gamepad2,
} from 'lucide-react';
import { playSuccessChime, playMysticChime, playTombGong } from '../utils/soundEffects';
import { MumienSpiel } from './MumienSpiel';

interface PharaoPruefungProps {
  onBackToChat: () => void;
  soundEnabled: boolean;
}

// 4 targeted questions based on the Mummy's facts
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'In wie vielen ineinandergeschachtelten Särgen (Sarkophagen) lag Tutanchamuns Mumie?',
    options: [
      'In nur 1 einzelnen Steinsarg',
      'In 4 Särgen (Stein, 2x bemaltes Holz, 1x pures Gold)',
      'In 7 Kupfersarkophagen',
      'Er lag frei auf einem goldenen Bett',
    ],
    correctIdx: 1,
    hint: 'Denk an eine russische Puppe: Mehrere Särge steckten ineinander – und der innerste war besonders kostbar.',
    explanation: 'Genau! Der äusserste Sarg war aus Stein, zwei aus bemaltem Holz und der innerste aus purem Gold – umgeben von vier vergoldeten Holzschreinen.',
  },
  {
    id: 2,
    question: 'Welche 3 heiligen Gegenstände hielt der Pharao in seinen Händen?',
    options: [
      'Bogen, Pfeile und einen Schild',
      'Krummstab (Herrschaftsstab), königlicher Dreschflegel und das Lebenszeichen (Anch)',
      'Eine goldene Schale, Brot und Nilschlamm',
      'Drei goldene Schlangenstäbe',
    ],
    correctIdx: 1,
    hint: 'Ein Pharao war wie ein Hirte für sein Volk. Und eines der Zeichen steht für das ewige Leben.',
    explanation: 'Richtig! Der Krummstab (Symbol des Hirten), der Dreschflegel und das Anch (Symbol für ewiges Leben) waren seine Insignien.',
  },
  {
    id: 3,
    question: 'Wer entdeckte am 26. November 1922 nach 5 Jahren vergeblicher Suche das Grab im Tal der Könige?',
    options: [
      'Napoleon Bonaparte',
      'Howard Carter und Lord Carnarvon',
      'Einheimische Grabräuber',
      'Alexander der Grosse',
    ],
    correctIdx: 1,
    hint: 'Es waren zwei Männer aus England: ein Archäologe und sein reicher Geldgeber.',
    explanation: 'Ausgezeichnet! Carter und sein Geldgeber Lord Carnarvon gaben nicht auf und fanden das einzige unversehrte Königsgrab.',
  },
  {
    id: 4,
    question: 'Was war der angebliche «Fluch des Pharao» in Wirklichkeit?',
    options: [
      'Ein echter Zauberspruch, der alle Ausgräber traf',
      'Eine reine Zeitungsente nach Lord Carnarvons Tod – die meisten Forscher lebten noch viele Jahre!',
      'Ein giftiges Wüstengas aus der Mumie',
      'Eine Warnung vor Schlangen im Sand',
    ],
    correctIdx: 1,
    hint: 'Überlege: Sind die Forscher wirklich alle früh gestorben? Und wer schreibt gerne aufregende Geschichten?',
    explanation: 'Ganz genau! Tutanchamun ist keineswegs wütend, sondern freut sich über den ewigen Ruhm. Die Zeitungen erfanden den Fluch als Sensation.',
  },
];

// Lückentext Definition: 7 blanks
interface ClozeItem {
  id: number;
  word: string;
  hint: string;
}

const CLOZE_ITEMS: ClozeItem[] = [
  { id: 1, word: 'Wüstensand', hint: 'Wo wurden arme Menschen begraben? Es ist dort sehr heiss und trocken.' },
  { id: 2, word: 'Nase', hint: 'Durch welche Öffnung im Kopf kommt man ans Gehirn, ohne den Kopf aufzuschneiden?' },
  { id: 3, word: 'Kanopen', hint: 'So heissen die besonderen Krüge für die Organe.' },
  { id: 4, word: 'Myrrhe', hint: 'Etwas, das gut duftet und in den Bauch kam.' },
  { id: 5, word: 'Natronlauge', hint: 'Die salzige Flüssigkeit, die das Wasser aus dem Körper zieht.' },
  { id: 6, word: 'Leinenstreifen', hint: 'Damit wurde die Mumie eingewickelt.' },
  { id: 7, word: 'Mundöffnung', hint: 'Das Ritual, damit der Pharao im Jenseits sprechen und essen kann.' },
];

function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Punkte je nach Anzahl Versuche: 1. Versuch 10, 2. Versuch 5, danach 2. */
function pointsForTries(tries: number): number {
  if (tries <= 1) return 10;
  if (tries === 2) return 5;
  return 2;
}

// Generate a personalized royal Egyptian Pharaoh Name based on student's name
function generatePharaohName(rawName: string): { pharaohName: string; title: string } {
  const clean = rawName.trim();
  if (!clean) return { pharaohName: 'Pharao Tut-Erlenmatt', title: 'Der Erleuchtete am Nil' };

  // First name only
  const firstName = clean.split(' ')[0];
  const lower = firstName.toLowerCase();

  const isGirlLikely =
    lower.endsWith('a') ||
    lower.endsWith('e') ||
    lower.endsWith('i') ||
    lower.endsWith('y') ||
    ['sarah', 'mia', 'emma', 'lina', 'elena', 'leila', 'sophie', 'zoe', 'maya', 'laura', 'anna', 'lea'].includes(lower);

  // Royal epithets and suffix additions
  if (isGirlLikely) {
    const titles = [
      'Herrscherin des ewigen Lichts',
      'Geliebte der Sonne (Merit-Aton)',
      'Hüterin der goldenen Schreine',
      'Prinzessin des Nils von Erlenmatt',
      'Die Strahlende am Himmelszelt',
    ];
    const title = titles[clean.length % titles.length];

    // Egyptian name variation
    let base = firstName;
    if (base.endsWith('a')) {
      base = base.slice(0, -1);
    }
    const suffix = ['ra-Anch', 'hotep-Isis', 'nefer', 'merit', 't-Amun'][clean.length % 5];
    return {
      pharaohName: `Königin ${base}${suffix}`,
      title,
    };
  } else {
    const titles = [
      'Der Weise aus dem Tal der Könige',
      'Bezwinger der Jahrtausende',
      'Grosser Hüter des goldenen Anch',
      'Erleuchteter Herrscher von Erlenmatt',
      'Beschützer der heiligen Kanopen',
    ];
    const title = titles[clean.length % titles.length];

    const suffix = ['tep der Gütige', 'enchamun', 'anch-Ra', 'hotep der Starke', 'amon-Tut'][clean.length % 5];
    return {
      pharaohName: `Pharao ${firstName}${suffix}`,
      title,
    };
  }
}

export const PharaoPruefung: React.FC<PharaoPruefungProps> = ({
  onBackToChat,
  soundEnabled,
}) => {
  // State 1: Password Lock (Codewort wird auf dem Server geprüft)
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // State 2: Student identity
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('5a');
  const [hasStarted, setHasStarted] = useState(false);

  // State 3: Quiz – Antworten werden sofort geprüft.
  // Reihenfolge der Antworten pro Frage durchmischt (sonst wäre immer die 2. richtig)
  const [optionOrder] = useState<Record<number, number[]>>(() =>
    Object.fromEntries(QUIZ_QUESTIONS.map((q) => [q.id, shuffled(q.options.map((_, i) => i))])),
  );
  const [quizSolved, setQuizSolved] = useState<Record<number, boolean>>({});
  const [quizWrongPicks, setQuizWrongPicks] = useState<Record<number, number[]>>({});

  // State 4: Lückentext
  const [clozeAnswers, setClozeAnswers] = useState<Record<number, string>>({});
  const [shuffledWordBank, setShuffledWordBank] = useState<string[]>([]);
  const [selectedWordToPlace, setSelectedWordToPlace] = useState<string | null>(null);
  const [clozeRounds, setClozeRounds] = useState(0); // wie oft «Prüfen» gedrückt wurde
  const [clozeWrongCount, setClozeWrongCount] = useState<Record<number, number>>({});
  const [clozeLastWrong, setClozeLastWrong] = useState<number[]>([]); // Lücken, die gerade falsch waren
  const [clozeSolved, setClozeSolved] = useState(false);

  // State 5: Spiel nach der Urkunde
  const [showGame, setShowGame] = useState(false);
  const [certificateDate] = useState(() =>
    new Date().toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric' }),
  );

  // Initialize shuffled word bank on mount
  useEffect(() => {
    setShuffledWordBank(shuffled(CLOZE_ITEMS.map((item) => item.word)));
  }, []);

  // Unlock check (auf dem Server, damit das Codewort nicht im Browser-Code steht)
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim() || isChecking) return;
    setIsChecking(true);
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.ok === true) {
        setIsUnlocked(true);
        setPasswordError(null);
        playSuccessChime(soundEnabled);
      } else {
        setPasswordError('Dieses Wort öffnet das Tor nicht. Frage deine Lehrperson!');
        playTombGong(soundEnabled);
      }
    } catch {
      setPasswordError('Das Tor klemmt gerade. Prüfe die Internetverbindung und versuche es nochmals.');
    } finally {
      setIsChecking(false);
    }
  };

  // Quiz: Antwort antippen -> sofort prüfen
  const handleSelectQuiz = (qId: number, optIdx: number) => {
    const q = QUIZ_QUESTIONS.find((x) => x.id === qId);
    if (!q || quizSolved[qId] || (quizWrongPicks[qId] || []).includes(optIdx)) return;
    if (optIdx === q.correctIdx) {
      setQuizSolved((prev) => ({ ...prev, [qId]: true }));
      playSuccessChime(soundEnabled);
    } else {
      setQuizWrongPicks((prev) => ({ ...prev, [qId]: [...(prev[qId] || []), optIdx] }));
      playTombGong(soundEnabled);
    }
  };

  const quizTries = (qId: number) => (quizWrongPicks[qId]?.length || 0) + 1;

  // Place or remove word in cloze
  const handleBlankClick = (blankId: number) => {
    if (clozeSolved) return;

    // If there is already a word in this blank, remove it back to word bank
    if (clozeAnswers[blankId]) {
      const removed = clozeAnswers[blankId];
      setClozeAnswers((prev) => {
        const next = { ...prev };
        delete next[blankId];
        return next;
      });
      setShuffledWordBank((prev) => [...prev, removed]);
      playMysticChime(soundEnabled);
      return;
    }

    // If a word is currently selected in word bank, place it here
    if (selectedWordToPlace) {
      setClozeAnswers((prev) => ({ ...prev, [blankId]: selectedWordToPlace }));
      setShuffledWordBank((prev) => prev.filter((w) => w !== selectedWordToPlace));
      setSelectedWordToPlace(null);
      setClozeLastWrong((prev) => prev.filter((id) => id !== blankId));
      playMysticChime(soundEnabled);
    }
  };

  const handleWordBankClick = (word: string) => {
    if (clozeSolved) return;

    if (selectedWordToPlace === word) {
      setSelectedWordToPlace(null);
      return;
    }

    // Nach einer Prüfrunde zuerst die falschen Lücken füllen, sonst die erste leere
    const firstEmpty =
      CLOZE_ITEMS.find((item) => !clozeAnswers[item.id] && clozeLastWrong.includes(item.id)) ||
      CLOZE_ITEMS.find((item) => !clozeAnswers[item.id]);
    if (firstEmpty) {
      setClozeAnswers((prev) => ({ ...prev, [firstEmpty.id]: word }));
      setShuffledWordBank((prev) => prev.filter((w) => w !== word));
      setSelectedWordToPlace(null);
      setClozeLastWrong((prev) => prev.filter((id) => id !== firstEmpty.id));
      playMysticChime(soundEnabled);
    } else {
      setSelectedWordToPlace(word);
    }
  };

  // Lückentext prüfen: falsche Wörter gehen zurück in die Wortbank
  const handleCheckCloze = () => {
    const wrong = CLOZE_ITEMS.filter((item) => clozeAnswers[item.id] !== item.word).map((i) => i.id);
    setClozeRounds((r) => r + 1);
    if (wrong.length === 0) {
      setClozeSolved(true);
      setClozeLastWrong([]);
      playSuccessChime(soundEnabled);
      return;
    }
    setClozeWrongCount((prev) => {
      const next = { ...prev };
      wrong.forEach((id) => (next[id] = (next[id] || 0) + 1));
      return next;
    });
    const returned = wrong.map((id) => clozeAnswers[id]).filter(Boolean);
    setClozeAnswers((prev) => {
      const next = { ...prev };
      wrong.forEach((id) => delete next[id]);
      return next;
    });
    setShuffledWordBank((prev) => shuffled([...prev, ...returned]));
    setClozeLastWrong(wrong);
    playTombGong(soundEnabled);
  };

  // Punkte: weniger Punkte, wenn mehr Anläufe nötig waren
  const getQuizScore = () =>
    QUIZ_QUESTIONS.reduce((sum, q) => sum + (quizSolved[q.id] ? pointsForTries(quizTries(q.id)) : 0), 0);

  const getClozeScore = () =>
    clozeSolved
      ? CLOZE_ITEMS.reduce((sum, item) => sum + pointsForTries((clozeWrongCount[item.id] || 0) + 1), 0)
      : 0;

  const quizDone = QUIZ_QUESTIONS.every((q) => quizSolved[q.id]);
  const allDone = quizDone && clozeSolved;
  const totalScore = getQuizScore() + getClozeScore();
  const maxScore = QUIZ_QUESTIONS.length * 10 + CLOZE_ITEMS.length * 10; // 40 + 70 = 110
  const allBlanksFilled = CLOZE_ITEMS.every((item) => clozeAnswers[item.id]);

  // Zusammenfassung der Anläufe für die Urkunde
  const quizRetries = QUIZ_QUESTIONS.map((q, i) => ({ nr: i + 1, tries: quizTries(q.id) })).filter((x) => x.tries > 1);
  const clozeRetries = CLOZE_ITEMS.filter((item) => (clozeWrongCount[item.id] || 0) > 0).map((item) => ({
    nr: item.id,
    tries: (clozeWrongCount[item.id] || 0) + 1,
  }));
  const allFirstTry = quizRetries.length === 0 && clozeRetries.length === 0;

  const royalPersona = generatePharaohName(studentName);

  // ----------------------------------------------------
  // SCREEN 1: LOCKED GATE (Codewort wird auf dem Server geprüft)
  // ----------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6 animate-fade-in">
        <div className="rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-[#181f33] via-[#101726] to-[#0a0f1a] p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Torch glow background */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex p-5 rounded-full bg-amber-500/15 border-2 border-amber-400 text-amber-300 shadow-xl">
            <Lock className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              Abschlussprüfung • Primarschule Erlenmatt
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-pharaoh text-amber-200">
              Das versiegelte Tor der Pharaonen
            </h2>
            <p className="text-sm text-amber-100/80 max-w-lg mx-auto leading-relaxed">
              Hast du deinen <strong>Fragebogen im OneNote</strong> fertig ausgefüllt?
              <br />
              Dann hole dir jetzt bei deiner Lehrperson das geheime Passwort, um das Prüfungstor zu öffnen!
            </p>
          </div>

          <form onSubmit={handleUnlock} className="max-w-sm mx-auto space-y-4">
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(null);
                }}
                placeholder="Codewort eingeben..."
                className="w-full bg-[#162138] border-2 border-amber-500/50 focus:border-amber-400 rounded-2xl px-4 py-3.5 text-center text-lg font-bold tracking-widest text-amber-100 placeholder:text-amber-200/30 placeholder:tracking-normal placeholder:font-normal focus:outline-none shadow-inner"
              />
              <KeyRound className="w-5 h-5 text-amber-400/60 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>

            {passwordError && (
              <p className="text-xs text-rose-400 font-semibold animate-pulse flex items-center justify-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>{passwordError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isChecking}
              className="w-full py-3.5 disabled:opacity-60 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{isChecking ? 'Das Tor wird geprüft...' : 'Prüfungstor öffnen'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-amber-500/20 text-xs text-amber-300/60 flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4" />
            <span>Brauchst du noch Hilfe für dein OneNote? Sprich zuerst mit Pharao Tutanchamun!</span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SCREEN 2: STUDENT NAME REGISTRATION
  // ----------------------------------------------------
  if (!hasStarted) {
    return (
      <div className="max-w-xl mx-auto py-8 animate-fade-in">
        <div className="rounded-3xl border-2 border-amber-500/60 bg-[#0e1628] p-8 shadow-2xl text-center space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300">
            <Sparkles className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-pharaoh text-amber-200">
              Tor erfolgreich geöffnet!
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/80">
              Bevor du startest: Wie lautet dein Name für die offizielle königliche Pharaonen-Urkunde?
            </p>
          </div>

          <div className="space-y-4 max-w-sm mx-auto text-left">
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                Dein Vorname: *
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="z. B. Mia oder Noah"
                className="w-full bg-[#162138] border border-amber-500/50 rounded-xl px-4 py-2.5 text-amber-100 focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                Deine Klasse an der Primarschule Erlenmatt:
              </label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full bg-[#162138] border border-amber-500/50 rounded-xl px-4 py-2.5 text-amber-100 text-sm focus:outline-none"
              >
                <option value="5a">Klasse 5a</option>
                <option value="5b">Klasse 5b</option>
                <option value="5c">Klasse 5c</option>
              </select>
            </div>

            <button
              disabled={!studentName.trim()}
              onClick={() => {
                setHasStarted(true);
                playSuccessChime(soundEnabled);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-amber-950 font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 mt-4"
            >
              <span>Zur Pharaonen-Prüfung starten</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SCREEN 3: THE EXAM (QUIZ + LÜCKENTEXT) & CERTIFICATE
  // ----------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Top Status Header */}
      <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-[#11192e] via-[#162035] to-[#14120c] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40">
            <Scroll className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-pharaoh text-amber-200">
              Die grosse Pharaonen-Prüfung
            </h2>
            <p className="text-xs text-amber-300/80">
              Forscher/in: <strong>{studentName}</strong> (Klasse {studentClass})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#0b101d] border border-amber-500/40 text-center">
            <span className="block text-[10px] uppercase font-bold text-amber-400">Punkte</span>
            <span className="text-lg font-black text-amber-200 font-pharaoh">
              {totalScore} / {maxScore}
            </span>
          </div>

          <button
            onClick={onBackToChat}
            className="text-xs px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
          >
            Zurück zur Mumie
          </button>
        </div>
      </div>

      {/* TEIL 1: DAS GEZIELTE QUIZ */}
      <div hidden={showGame} className="rounded-3xl border-2 border-amber-500/30 bg-[#0e1628] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-amber-500/30 pb-3 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
              Teil 1 von 2 (40 Punkte)
            </span>
            <h3 className="text-xl font-bold font-pharaoh text-amber-200 mt-0.5">
              Das Wissen um das Grab & die Schätze
            </h3>
          </div>
          <span className="text-xs text-slate-400">4 Fragen</span>
        </div>

        <p className="text-xs text-amber-200/80 -mt-2">
          Tippe eine Antwort an. Ist sie falsch, bekommst du einen Tipp und darfst es nochmals versuchen.
          Beim ersten Versuch gibt es 10 Punkte, beim zweiten 5, danach 2.
        </p>

        <div className="space-y-6">
          {QUIZ_QUESTIONS.map((q, qIndex) => {
            const solved = !!quizSolved[q.id];
            const wrongPicks = quizWrongPicks[q.id] || [];

            return (
              <div
                key={q.id}
                className={`p-4 sm:p-5 rounded-2xl bg-[#141e33] border space-y-3 ${
                  solved ? 'border-emerald-500/50' : 'border-amber-500/25'
                }`}
              >
                <h4 className="font-bold text-amber-100 text-sm sm:text-base flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center shrink-0 mt-0.5 font-pharaoh">
                    {qIndex + 1}
                  </span>
                  <span>{q.question}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {optionOrder[q.id].map((optIdx) => {
                    const opt = q.options[optIdx];
                    const isWrongPick = wrongPicks.includes(optIdx);
                    const isCorrect = optIdx === q.correctIdx;
                    let btnStyle = 'bg-[#1b2742] hover:bg-[#223254] text-slate-200 border-slate-700';

                    if (solved && isCorrect) {
                      btnStyle = 'bg-emerald-950 border-emerald-400 text-emerald-200 font-bold';
                    } else if (isWrongPick) {
                      btnStyle = 'bg-rose-950/70 border-rose-500/70 text-rose-200/80 line-through';
                    } else if (solved) {
                      btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={solved || isWrongPick}
                        onClick={() => handleSelectQuiz(q.id, optIdx)}
                        className={`text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {solved && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />}
                        {isWrongPick && <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>

                {!solved && wrongPicks.length > 0 && (
                  <div className="text-xs text-amber-100 p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>
                      <strong>Tipp des Pharao: </strong>
                      {q.hint}
                      {wrongPicks.length >= 2 && ' Du kannst auch im Lexikon nachschauen oder die Mumie fragen.'}
                    </span>
                  </div>
                )}

                {solved && (
                  <p className="text-xs text-amber-300/90 pt-1 border-t border-amber-500/20">
                    <strong>{quizTries(q.id) === 1 ? 'Beim ersten Versuch! ' : `Geschafft im ${quizTries(q.id)}. Versuch. `}</strong>
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TEIL 2: LÜCKENTEXT MIT DURCHMISCHTEN TEXTBAUSTEINEN */}
      <div hidden={showGame} className="rounded-3xl border-2 border-amber-500/30 bg-[#0e1628] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-amber-500/30 pb-3 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
              Teil 2 von 2 (70 Punkte)
            </span>
            <h3 className="text-xl font-bold font-pharaoh text-amber-200 mt-0.5">
              Lückentext: Das Geheimnis der Mumifizierung
            </h3>
          </div>
          <span className="text-xs text-slate-400">7 Textbausteine</span>
        </div>

        {/* Word Bank: Durchmischte Bausteine */}
        <div className="p-4 rounded-2xl bg-[#121b2d] border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Verfügbare Textbausteine (durchmischt):</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Klicke ein Wort an, um es in die nächste Lücke zu setzen
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 min-h-[44px]">
            {shuffledWordBank.length > 0 ? (
              shuffledWordBank.map((word, idx) => (
                <button
                  key={idx}
                  disabled={clozeSolved}
                  onClick={() => handleWordBankClick(word)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-all active:scale-95 shadow-sm ${
                    selectedWordToPlace === word
                      ? 'bg-amber-400 text-amber-950 border-amber-300 animate-pulse'
                      : 'bg-[#1a2640] hover:bg-amber-500/25 text-amber-200 border-amber-400/50 hover:border-amber-300'
                  }`}
                >
                  {word}
                </button>
              ))
            ) : (
              <span className="text-xs text-emerald-400 font-semibold py-1">
                ✓ Alle Textbausteine wurden in den Text eingesetzt! (Klicke auf ein Wort im Text, um es wieder herauszunehmen)
              </span>
            )}
          </div>
        </div>

        {/* Cloze Text Body */}
        <div className="p-6 rounded-2xl bg-[#141e33] border border-amber-500/20 text-sm sm:text-base leading-loose text-amber-100/90 space-y-4 font-sans">
          <p>
            Um im Jenseits ewig zu leben, brauchte die Seele einen unbeschädigten Körper. Reiche Pharaonen wurden aufwendig balsamiert, während arme Menschen im heissen{' '}
            {renderClozeBlank(1, 'Wüstensand')} trockneten.
          </p>

          <p>
            Zuerst zogen die Priester das Gehirn mit einem feinen Haken vorsichtig durch die{' '}
            {renderClozeBlank(2, 'Nase')}. Die lebenswichtigen Organe kamen in vier besondere Krüge, die man{' '}
            {renderClozeBlank(3, 'Kanopen')} nennt. Die Bauchhöhle wurde gereinigt und mit duftender{' '}
            {renderClozeBlank(4, 'Myrrhe')} gefüllt.
          </p>

          <p>
            Danach lag die Mumie für 50 bis 70 Tage in{' '}
            {renderClozeBlank(5, 'Natronlauge')}, um jedes kleinste Tröpfchen Feuchtigkeit zu entziehen. Zuletzt wickelte man den Leichnam liebevoll in feine{' '}
            {renderClozeBlank(6, 'Leinenstreifen')} und vollzog das feierliche Ritual der{' '}
            {renderClozeBlank(7, 'Mundöffnung')}, damit der Pharao wieder sprechen und essen konnte.
          </p>
        </div>

        {/* Lückentext prüfen & Hinweise zu falschen Lücken */}
        {!clozeSolved && clozeLastWrong.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-2 text-xs text-rose-100">
            <p className="font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-400" />
              {clozeLastWrong.length === 1
                ? '1 Lücke war noch falsch. Das Wort liegt wieder oben bei den Textbausteinen.'
                : `${clozeLastWrong.length} Lücken waren noch falsch. Die Wörter liegen wieder oben bei den Textbausteinen.`}
            </p>
            <ul className="space-y-1">
              {CLOZE_ITEMS.filter((item) => clozeLastWrong.includes(item.id)).map((item) => (
                <li key={item.id} className="flex items-start gap-1.5 text-amber-100">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                  <span>
                    <strong>Lücke {item.id}:</strong> {item.hint}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {clozeSolved ? (
          <p className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-sm font-bold text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {clozeRounds === 1 ? 'Lückentext beim ersten Versuch komplett richtig!' : `Lückentext komplett richtig (nach ${clozeRounds} Prüfrunden).`}
          </p>
        ) : (
          <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
            {!allBlanksFilled && (
              <span className="text-xs text-amber-300/70">Fülle zuerst alle Lücken aus.</span>
            )}
            <button
              onClick={handleCheckCloze}
              disabled={!allBlanksFilled}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:pointer-events-none text-amber-950 font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>Lückentext prüfen</span>
            </button>
          </div>
        )}

        {/* Was fehlt noch bis zur Urkunde? */}
        {!allDone && (
          <div className="p-4 rounded-2xl bg-[#121b2d] border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2">
            <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Deine Urkunde erscheint, sobald alles richtig gelöst ist.{' '}
              {!quizDone &&
                `Quiz: ${QUIZ_QUESTIONS.filter((q) => quizSolved[q.id]).length} von ${QUIZ_QUESTIONS.length} Fragen gelöst. `}
              {!clozeSolved && 'Lückentext: noch nicht fertig.'}
            </span>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* SCREEN 4: DIE KÖNIGLICHE URKUNDE MIT PHARAONEN-NAMEN */}
      {/* ---------------------------------------------------- */}
      {allDone && !showGame && (
        <div className="space-y-4 animate-fade-in pt-4">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              Offizielle Belohnung
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-pharaoh text-amber-200">
              Deine Pharaonen-Urkunde
            </h3>
            <p className="text-xs text-slate-300">
              Drucke deine persönliche Urkunde aus oder zeige sie deiner Lehrperson!
            </p>
          </div>

          {/* THE PRINTABLE CERTIFICATE */}
          <div
            id="pharaoh-certificate"
            className="relative rounded-3xl border-8 border-amber-500/80 p-8 sm:p-12 shadow-2xl text-center space-y-6 overflow-hidden bg-[#fbf5e6] text-[#2c1d11]"
            style={{
              backgroundImage: 'radial-gradient(#d4a038 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          >
            {/* Ornate Gold & Lapis Inner Border */}
            <div className="absolute inset-2 border-2 border-[#b45309] rounded-2xl pointer-events-none" />
            <div className="absolute inset-3 border border-[#0284c7]/40 rounded-xl pointer-events-none" />

            {/* Hieroglyphic Top Banner */}
            <div className="text-sm font-pharaoh tracking-widest text-[#92400e] opacity-80">
              𓇋 𓈖 𓊪 𓅱 𓏏 𓊹 𓇳 𓁹 𓋹 𓏏
            </div>

            {/* Seal & Logo */}
            <div className="inline-flex p-3 rounded-full bg-[#f59e0b]/20 border-2 border-[#b45309] text-[#92400e]">
              <Award className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#b45309]">
                KÖNIGREICH ÄGYPTEN • TAL DER KÖNIGE
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-pharaoh text-[#78350f] tracking-wide">
                PHARAONEN-URKUNDE
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#854d0e]">
                Primarschule Erlenmatt • Klasse {studentClass} • Basel
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-2 py-2">
              <p className="text-sm sm:text-base leading-relaxed">
                Hiermit wird feierlich beurkundet, dass
              </p>
              
              {/* Real Student Name */}
              <div className="text-xl sm:text-2xl font-black font-pharaoh text-[#1c1917] border-b-2 border-[#b45309] pb-1 max-w-sm mx-auto">
                {studentName}
              </div>

              <p className="text-xs sm:text-sm pt-2">
                die grosse Prüfung über Pharao Tutanchamuns Grabfund von 1922, die vier Särge und die heilige Kunst der Mumifizierung mit Bravour bestanden hat!
              </p>
            </div>

            {/* Personalized Pharaoh Name Cartouche */}
            <div className="my-4 p-5 max-w-md mx-auto rounded-2xl bg-gradient-to-r from-[#fef3c7] via-[#fde68a] to-[#fef3c7] border-2 border-[#b45309] shadow-md space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#92400e]">
                DEIN KÖNIGLICHER PHARAONEN-NAME LAUTET NUN:
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-pharaoh text-[#78350f]">
                {royalPersona.pharaohName}
              </h3>
              <p className="text-xs font-semibold text-[#854d0e] italic">
                «{royalPersona.title}»
              </p>
            </div>

            {/* Score & Evaluation */}
            <div className="inline-block px-5 py-2 rounded-xl bg-[#fef3c7] border border-[#b45309] text-xs font-bold text-[#78350f]">
              Erreichte Punktzahl: {totalScore} von {maxScore} Punkten ({Math.round((totalScore / maxScore) * 100)}%)
              {allFirstTry
                ? ' — Höchste königliche Auszeichnung!'
                : totalScore >= 80
                ? ' — Ausgezeichneter Forschergeist!'
                : ' — Mit Ausdauer zum Ziel!'}
            </div>

            {/* Anläufe: für die Lehrperson sichtbar */}
            <div className="max-w-md mx-auto text-left text-[11px] sm:text-xs text-[#78350f] rounded-xl border border-[#b45309]/40 bg-[#fffbeb] px-4 py-3 space-y-1">
              <span className="block font-bold uppercase tracking-wider text-[10px] text-[#92400e]">
                Prüfungsverlauf
              </span>
              {allFirstTry ? (
                <span className="block">Alle Aufgaben beim ersten Versuch richtig gelöst.</span>
              ) : (
                <>
                  <span className="block">
                    <strong>Quiz:</strong>{' '}
                    {quizRetries.length === 0
                      ? 'alle Fragen beim ersten Versuch richtig.'
                      : quizRetries.map((r) => `Frage ${r.nr}: ${r.tries} Anläufe`).join(' • ')}
                  </span>
                  <span className="block">
                    <strong>Lückentext:</strong>{' '}
                    {clozeRetries.length === 0
                      ? 'alle Lücken beim ersten Versuch richtig.'
                      : `${clozeRounds} Prüfrunden • korrigiert: ` +
                        clozeRetries.map((r) => `Lücke ${r.nr} (${r.tries} Anläufe)`).join(', ')}
                  </span>
                </>
              )}
            </div>

            {/* Signatures */}
            <div className="pt-6 border-t border-[#b45309]/30 flex flex-wrap items-end justify-around gap-6 text-xs text-[#78350f]">
              <div className="space-y-1 text-center">
                <span className="font-pharaoh font-bold text-sm block">𓇋𓈖𓊪𓅱 Pharao Tutanchamun</span>
                <span className="text-[10px] text-[#854d0e] block">Ewiger Herrscher im Jenseits</span>
              </div>

              <div className="space-y-1 text-center">
                <span className="font-bold text-sm block">Lehrperson & Primarschule Erlenmatt</span>
                <span className="text-[10px] text-[#854d0e] block">Ausgestellt am {certificateDate}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-extrabold text-sm flex items-center gap-2 shadow-xl transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Urkunde ausdrucken / PDF speichern</span>
            </button>

            <button
              onClick={() => {
                setShowGame(true);
                playMysticChime(soundEnabled);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl transition-all"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Belohnung: Mumien-Spiel starten</span>
            </button>

            <button
              onClick={onBackToChat}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 font-bold text-sm flex items-center gap-2 transition-all border border-slate-700"
            >
              <span>Zurück zu Tutanchamun</span>
            </button>
          </div>
        </div>
      )}

      {/* BELOHNUNGS-SPIEL */}
      {allDone && showGame && (
        <MumienSpiel
          playerName={studentName}
          soundEnabled={soundEnabled}
          onClose={() => setShowGame(false)}
        />
      )}

    </div>
  );

  // Helper renderer for cloze blanks
  function renderClozeBlank(blankId: number, _expectedWord: string) {
    const placedWord = clozeAnswers[blankId];
    const wasWrong = clozeLastWrong.includes(blankId);

    let blankClass =
      'inline-flex items-center justify-center min-w-[120px] px-3 py-1 mx-1.5 rounded-lg border-2 border-dashed font-bold text-xs sm:text-sm cursor-pointer transition-all select-none ';

    if (clozeSolved) {
      blankClass += 'border-emerald-400 bg-emerald-950 text-emerald-200 cursor-default';
    } else if (!placedWord && wasWrong) {
      blankClass += 'border-rose-500 bg-rose-950/50 text-rose-200 animate-pulse';
    } else if (!placedWord) {
      blankClass += 'border-amber-400/60 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20';
    } else {
      blankClass += 'border-amber-400 bg-amber-500/25 text-amber-200 hover:bg-rose-950/40 hover:border-rose-400';
    }

    return (
      <span
        onClick={() => handleBlankClick(blankId)}
        className={blankClass}
        title={placedWord && !clozeSolved ? 'Klicken, um Wort zurückzulegen' : 'Klicken zum Einsetzen'}
      >
        {placedWord ? (
          <span className="flex items-center gap-1">
            <span>{placedWord}</span>
            {clozeSolved && <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
          </span>
        ) : (
          <span className="opacity-70 text-[11px] font-normal">
            {wasWrong ? `[ Lücke ${blankId}: nochmals ]` : `[ Lücke ${blankId} ]`}
          </span>
        )}
      </span>
    );
  }
};
