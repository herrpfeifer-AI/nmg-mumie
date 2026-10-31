import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Heart,
  Coins,
  X,
  Trophy,
  RotateCcw,
  Moon,
  ShoppingBag,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { playMysticChime, playSuccessChime, playTombGong } from '../utils/soundEffects';

// =====================================================================
// «Die Flucht der Mumie» – Belohnungsspiel nach der Urkunde
// Rundenbasiert: Jedes Mal, wenn die Mumie einen Schritt macht, bewegen
// sich auch die Gegner einen Schritt. Kein Zeitdruck, gut fürs Tablet.
// Schätze einsammeln -> Wissensfrage -> Gold. Alle Schätze -> Ausgang offen.
// =====================================================================

interface MumienSpielProps {
  playerName: string;
  soundEnabled: boolean;
  onClose: () => void;
}

type Dir = 'up' | 'down' | 'left' | 'right';
interface Pos {
  r: number;
  c: number;
}
interface Enemy extends Pos {
  axis: 'h' | 'v';
  dir: 1 | -1;
  emoji: string;
}

interface LevelDef {
  name: string;
  intro: string;
  // # Wand, ~ Wasser, S Start, A Schatz, E Ausgang, h/v Gegner (waagrecht/senkrecht)
  map: string[];
  wall: string;
  enemyEmoji: string[];
  floor: string;
  wallBg: string;
}

const LEVELS: LevelDef[] = [
  {
    name: 'Tal der Könige',
    intro: 'Die Mumie ist erwacht! Sammle die 4 Schätze im Tal der Könige ein. Achtung vor den Skorpionen!',
    map: [
      '###########',
      '#S..#....A#',
      '#.#.#.##..#',
      '#.#...#...#',
      '#.###.#.#.#',
      '#A..h...#.E',
      '###.###.#.#',
      '#A....#..A#',
      '###########',
    ],
    wall: '🪨',
    enemyEmoji: ['🦂'],
    floor: 'bg-[#e9c98b]',
    wallBg: 'bg-[#a5743d]',
  },
  {
    name: 'Am Ufer des Nils',
    intro: 'Weiter zum Nil! Im Wasser kann die Mumie nicht schwimmen, und am Ufer lauern Krokodile.',
    map: [
      '~~~~~~~~~~~',
      '#S...##..A#',
      '#.~~.....~#',
      '#.~~.#.~.~#',
      '#A..h..~..#',
      '#~~.~~.#.~#',
      '#A...h...~#',
      '#.##.~.A.E#',
      '###########',
    ],
    wall: '🌴',
    enemyEmoji: ['🐊', '🐊'],
    floor: 'bg-[#d9c48a]',
    wallBg: 'bg-[#4d7c3a]',
  },
  {
    name: 'Bei den Pyramiden',
    intro: 'Das letzte Abenteuer: die Pyramiden! Schlangen und Skorpione bewachen die Schätze.',
    map: [
      '###########',
      '#S.#...#.A#',
      '#..#.#.#..#',
      '#.v..#...##',
      '##.#.###.A#',
      '#A.#..h...#',
      '#.##.#.##.#',
      '#...h..A#E#',
      '###########',
    ],
    wall: '🧱',
    enemyEmoji: ['🐍', '🦂', '🐍'],
    floor: 'bg-[#f0d49a]',
    wallBg: 'bg-[#c58a3e]',
  },
];

const TREASURES = ['🏺', '🪲', '👑', '💎', '📜', '🔱'];

interface GameQuestion {
  q: string;
  options: string[]; // die erste Antwort ist richtig (wird beim Anzeigen gemischt)
  explain: string;
}

const QUESTIONS: GameQuestion[] = [
  { q: 'Wie lange lag der Körper in der Natronlauge?', options: ['50 bis 70 Tage', '3 Tage', 'Ein ganzes Jahr'], explain: 'Die Natronlauge zog in 50 bis 70 Tagen alles Wasser aus dem Körper.' },
  { q: 'Wohin kamen die Organe?', options: ['In Kanopen (Krüge)', 'In den Nil', 'In eine Schatztruhe'], explain: 'Die Organe wurden in besondere Krüge gelegt: die Kanopen.' },
  { q: 'Woraus war der innerste Sarg?', options: ['Aus purem Gold', 'Aus Glas', 'Aus Holz'], explain: 'Der innerste der vier Särge war aus purem Gold.' },
  { q: 'Wer hat 1922 das Grab entdeckt?', options: ['Howard Carter und Lord Carnarvon', 'Kleopatra', 'Napoleon'], explain: 'Howard Carter fand das Grab mit seinem Geldgeber Lord Carnarvon.' },
  { q: 'Wie alt wurde Tutanchamun höchstens?', options: ['22 Jahre', '80 Jahre', '45 Jahre'], explain: 'Er starb sehr jung, mit höchstens 22 Jahren.' },
  { q: 'Wofür steht das Anch?', options: ['Für das ewige Leben', 'Für den Regen', 'Für den Krieg'], explain: 'Das Anch ist das Zeichen für das ewige Leben.' },
  { q: 'Wie wurde das Gehirn entfernt?', options: ['Durch die Nase', 'Durch die Ohren', 'Gar nicht'], explain: 'Mit einem feinen Stäbchen wurde es durch die Nase gezogen.' },
  { q: 'Womit wurde die Mumie eingewickelt?', options: ['Mit Leinenstreifen', 'Mit Palmblättern', 'Mit Papyrus'], explain: 'Viele Meter feine Leinenstreifen umhüllten den Körper.' },
  { q: 'Warum wurden Pharaonen mumifiziert?', options: ['Die Seele braucht den Körper im Jenseits', 'Damit sie schöner aussehen', 'Damit sie leichter sind'], explain: 'Die Ägypter glaubten, die Seele braucht einen unversehrten Körper.' },
  { q: 'Was kam in den leeren Bauch?', options: ['Duftende Myrrhe', 'Wüstensand', 'Goldmünzen'], explain: 'Der Bauch wurde mit Myrrhe gefüllt und zugenäht.' },
  { q: 'Wo lag Tutanchamuns Grab?', options: ['Im Tal der Könige', 'In einer Pyramide in Gizeh', 'Auf einer Insel im Meer'], explain: 'Sein Grab lag im Tal der Könige.' },
  { q: 'Wozu diente das Mundöffnungsritual?', options: ['Zum Essen, Trinken und Sprechen im Jenseits', 'Zum Zähneputzen', 'Um einen Fluch zu starten'], explain: 'So sollte der Pharao im Jenseits wieder essen, trinken und sprechen können.' },
  { q: 'Was geschah mit armen Ägyptern?', options: ['Sie wurden im Wüstensand vergraben', 'Sie bekamen goldene Särge', 'Sie kamen in Pyramiden'], explain: 'Der heisse, trockene Sand trocknete ihre Körper oft sogar besser aus.' },
  { q: 'Woraus ist die Totenmaske?', options: ['Aus Gold und Halbedelsteinen', 'Aus Ton', 'Aus Holz und Wolle'], explain: 'Die Maske ist aus massivem Gold mit Halbedelsteinen wie Lapislazuli.' },
  { q: 'War der «Fluch des Pharao» echt?', options: ['Nein, eine Erfindung der Zeitungen', 'Ja, alle Forscher starben sofort', 'Ja, aber nur am Montag'], explain: 'Der Fluch war eine Zeitungsente. Die meisten Forscher wurden alt.' },
];

const GOLD_CORRECT = 100;
const GOLD_STREAK = 25;
const GOLD_TREASURE = 50;
const GOLD_LEVEL = 200;
const PRICE_HEART = 250;
const PRICE_SCARAB = 150;
const SLEEP_MOVES = 6;
const START_LIVES = 3;
const MAX_LIVES = 5;
const HIGHSCORE_KEY = 'mumienspiel-highscore';

function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function readHighscore(): number {
  try {
    return Number(window.localStorage.getItem(HIGHSCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveHighscore(value: number) {
  try {
    window.localStorage.setItem(HIGHSCORE_KEY, String(value));
  } catch {
    /* Speicher nicht verfügbar – egal */
  }
}

interface ParsedLevel {
  start: Pos;
  exit: Pos;
  treasures: (Pos & { emoji: string })[];
  enemies: Enemy[];
}

function parseLevel(idx: number): ParsedLevel {
  const def = LEVELS[idx];
  let start: Pos = { r: 1, c: 1 };
  let exit: Pos = { r: 1, c: 1 };
  const treasures: (Pos & { emoji: string })[] = [];
  const enemies: Enemy[] = [];
  def.map.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch === 'S') start = { r, c };
      if (ch === 'E') exit = { r, c };
      if (ch === 'A') treasures.push({ r, c, emoji: TREASURES[(treasures.length + idx * 2) % TREASURES.length] });
      if (ch === 'h' || ch === 'v') {
        enemies.push({ r, c, axis: ch, dir: 1, emoji: def.enemyEmoji[enemies.length % def.enemyEmoji.length] });
      }
    }),
  );
  return { start, exit, treasures, enemies };
}

function isBlocked(levelIdx: number, r: number, c: number): boolean {
  const map = LEVELS[levelIdx].map;
  if (r < 0 || r >= map.length || c < 0 || c >= map[0].length) return true;
  const ch = map[r][c];
  return ch === '#' || ch === '~';
}

type Phase = 'intro' | 'play' | 'question' | 'shop' | 'gameOver' | 'won';

interface GameState {
  level: number;
  player: Pos;
  enemies: Enemy[];
  treasures: (Pos & { emoji: string })[];
  lives: number;
  gold: number;
  goldAtLevelStart: number;
  livesAtLevelStart: number;
  scarabs: number;
  sleep: number;
  streak: number;
  phase: Phase;
  deck: GameQuestion[];
  question: { item: GameQuestion; order: number[]; picked: number | null } | null;
  flash: string | null;
}

function startLevel(prev: Partial<GameState>, level: number, lives: number, gold: number): GameState {
  const parsed = parseLevel(level);
  return {
    level,
    player: parsed.start,
    enemies: parsed.enemies,
    treasures: parsed.treasures,
    lives,
    gold,
    goldAtLevelStart: gold,
    livesAtLevelStart: lives,
    scarabs: prev.scarabs ?? 0,
    sleep: 0,
    streak: prev.streak ?? 0,
    phase: 'intro',
    deck: prev.deck && prev.deck.length >= 4 ? prev.deck : shuffled(QUESTIONS),
    question: null,
    flash: null,
  };
}

// Kleine gezeichnete Mumie (keine Emoji dafür vorhanden)
const MummySprite: React.FC<{ sad?: boolean }> = ({ sad }) => (
  <svg viewBox="0 0 40 40" className="w-[85%] h-[85%] drop-shadow" aria-label="Mumie">
    <ellipse cx="20" cy="22" rx="13" ry="15" fill="#f3ead2" stroke="#8a7651" strokeWidth="1.5" />
    <path d="M8 14 Q20 10 32 15" stroke="#b9a678" strokeWidth="2" fill="none" />
    <path d="M7 21 Q20 17 33 22" stroke="#b9a678" strokeWidth="2" fill="none" />
    <path d="M8 29 Q20 25 32 30" stroke="#b9a678" strokeWidth="2" fill="none" />
    <rect x="11" y="16" width="18" height="6" rx="3" fill="#2b1d0e" />
    <circle cx="16" cy="19" r="2" fill="#fde047" />
    <circle cx="24" cy="19" r="2" fill="#fde047" />
    {sad ? (
      <path d="M15 30 Q20 26 25 30" stroke="#5b4630" strokeWidth="1.8" fill="none" />
    ) : (
      <path d="M15 27 Q20 31 25 27" stroke="#5b4630" strokeWidth="1.8" fill="none" />
    )}
    <path d="M31 12 L36 8" stroke="#f3ead2" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const MumienSpiel: React.FC<MumienSpielProps> = ({ playerName, soundEnabled, onClose }) => {
  const [g, setG] = useState<GameState>(() => startLevel({}, 0, START_LIVES, 0));
  const [highscore, setHighscore] = useState<number>(() => readHighscore());
  const [hitCell, setHitCell] = useState<Pos | null>(null);
  const gRef = useRef(g);
  gRef.current = g;

  const sound = (kind: 'mystic' | 'success' | 'gong') => {
    if (kind === 'mystic') playMysticChime(soundEnabled);
    if (kind === 'success') playSuccessChime(soundEnabled);
    if (kind === 'gong') playTombGong(soundEnabled);
  };

  const finishGame = (gold: number) => {
    if (gold > highscore) {
      setHighscore(gold);
      saveHighscore(gold);
    }
  };

  // ---------------- Spielzug ----------------
  const step = (dir: Dir) => {
    const s = gRef.current;
    if (s.phase !== 'play') return;

    const dr = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    const dc = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const target = { r: s.player.r + dr, c: s.player.c + dc };
    const parsed = parseLevel(s.level);
    const exitOpen = s.treasures.length === 0;
    const isExit = target.r === parsed.exit.r && target.c === parsed.exit.c;

    if (isBlocked(s.level, target.r, target.c)) return;
    if (isExit && !exitOpen) {
      setG({ ...s, flash: 'Der Ausgang ist noch verschlossen. Sammle zuerst alle Schätze!' });
      sound('gong');
      return;
    }

    // Gegner bewegen (ausser sie schlafen)
    const oldEnemies = s.enemies;
    const asleep = s.sleep > 0;
    const enemies: Enemy[] = asleep
      ? oldEnemies
      : oldEnemies.map((e) => {
          const tryMove = (d: 1 | -1) => ({
            r: e.r + (e.axis === 'v' ? d : 0),
            c: e.c + (e.axis === 'h' ? d : 0),
          });
          const blockedFor = (p: Pos) =>
            isBlocked(s.level, p.r, p.c) || (p.r === parsed.exit.r && p.c === parsed.exit.c);
          let next = tryMove(e.dir);
          let dirNow = e.dir;
          if (blockedFor(next)) {
            dirNow = (e.dir * -1) as 1 | -1;
            next = tryMove(dirNow);
            if (blockedFor(next)) return e;
          }
          return { ...e, ...next, dir: dirNow };
        });

    // Zusammenstoss? (gleiches Feld oder aneinander vorbei getauscht)
    const hit = enemies.some(
      (e, i) =>
        (e.r === target.r && e.c === target.c) ||
        (oldEnemies[i].r === target.r && oldEnemies[i].c === target.c && e.r === s.player.r && e.c === s.player.c),
    );

    if (hit) {
      const lives = s.lives - 1;
      setHitCell(target);
      setTimeout(() => setHitCell(null), 450);
      sound('gong');
      if (lives <= 0) {
        setG({ ...s, lives: 0, streak: 0, phase: 'gameOver', flash: null });
        finishGame(s.gold);
      } else {
        const fresh = parseLevel(s.level);
        setG({
          ...s,
          lives,
          player: fresh.start,
          enemies: fresh.enemies,
          sleep: 0,
          flash: 'Autsch! Die Mumie wurde erwischt und muss zurück zum Start.',
        });
      }
      return;
    }

    // Ausgang erreicht
    if (isExit && exitOpen) {
      const gold = s.gold + GOLD_LEVEL;
      sound('success');
      if (s.level === LEVELS.length - 1) {
        setG({ ...s, player: target, gold, phase: 'won', flash: null });
        finishGame(gold);
      } else {
        setG({ ...s, player: target, gold, phase: 'shop', flash: null });
      }
      return;
    }

    // Schatz gefunden -> Frage
    const treasure = s.treasures.find((t) => t.r === target.r && t.c === target.c);
    if (treasure) {
      const deck = s.deck.length ? s.deck : shuffled(QUESTIONS);
      const [item, ...rest] = deck;
      sound('mystic');
      setG({
        ...s,
        player: target,
        enemies,
        sleep: Math.max(0, s.sleep - 1),
        treasures: s.treasures.filter((t) => t !== treasure),
        gold: s.gold + GOLD_TREASURE,
        deck: rest,
        phase: 'question',
        question: { item, order: shuffled(item.options.map((_, i) => i)), picked: null },
        flash: null,
      });
      return;
    }

    setG({ ...s, player: target, enemies, sleep: Math.max(0, s.sleep - 1), flash: null });
  };

  const stepRef = useRef(step);
  stepRef.current = step;

  // Tastatur (Pfeiltasten / WASD)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
      };
      const dir = map[e.key];
      if (!dir || gRef.current.phase !== 'play') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      stepRef.current(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Wischen auf dem Spielfeld (Tablet)
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    step(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
  };

  // ---------------- Frage beantworten ----------------
  const answer = (optIdx: number) => {
    const s = gRef.current;
    if (!s.question || s.question.picked !== null) return;
    const correct = optIdx === 0;
    const streak = correct ? s.streak + 1 : 0;
    const bonus = correct ? GOLD_CORRECT + Math.min(s.streak, 4) * GOLD_STREAK : 0;
    sound(correct ? 'success' : 'gong');
    setG({ ...s, gold: s.gold + bonus, streak, question: { ...s.question, picked: optIdx } });
  };

  const continueAfterQuestion = () => {
    const s = gRef.current;
    const done = s.treasures.length === 0;
    setG({
      ...s,
      question: null,
      phase: 'play',
      flash: done ? 'Alle Schätze gefunden! Der Ausgang ist jetzt offen. ✨' : null,
    });
  };

  // ---------------- Basar ----------------
  const buy = (item: 'heart' | 'scarab') => {
    const s = gRef.current;
    if (item === 'heart' && s.gold >= PRICE_HEART && s.lives < MAX_LIVES) {
      setG({ ...s, gold: s.gold - PRICE_HEART, lives: s.lives + 1 });
      sound('success');
    }
    if (item === 'scarab' && s.gold >= PRICE_SCARAB) {
      setG({ ...s, gold: s.gold - PRICE_SCARAB, scarabs: s.scarabs + 1 });
      sound('success');
    }
  };

  const useScarab = () => {
    const s = gRef.current;
    if (s.scarabs <= 0 || s.phase !== 'play') return;
    setG({ ...s, scarabs: s.scarabs - 1, sleep: SLEEP_MOVES, flash: `Zzz… Die Gegner schlafen ${SLEEP_MOVES} Schritte lang!` });
    sound('mystic');
  };

  const nextLevel = () => {
    const s = gRef.current;
    setG(startLevel(s, s.level + 1, s.lives, s.gold));
  };

  const retryLevel = () => {
    const s = gRef.current;
    setG(startLevel(s, s.level, s.livesAtLevelStart, s.goldAtLevelStart));
  };

  const restartAll = () => {
    setG(startLevel({}, 0, START_LIVES, 0));
  };

  // ---------------- Darstellung ----------------
  const def = LEVELS[g.level];
  const parsed = parseLevel(g.level);
  const exitOpen = g.treasures.length === 0;
  const firstName = playerName.trim().split(' ')[0] || 'Forscher';

  const renderCell = (ch: string, r: number, c: number) => {
    const isPlayer = g.player.r === r && g.player.c === c;
    const enemy = g.enemies.find((e) => e.r === r && e.c === c);
    const treasure = g.treasures.find((t) => t.r === r && t.c === c);
    const isExit = parsed.exit.r === r && parsed.exit.c === c;
    const isHit = hitCell && hitCell.r === r && hitCell.c === c;

    let bg = def.floor;
    let content: React.ReactNode = null;
    if (ch === '#') {
      bg = def.wallBg;
      content = <span className="opacity-90">{def.wall}</span>;
    } else if (ch === '~') {
      bg = 'bg-[#3b82c4]';
      content = <span className="opacity-80">🌊</span>;
    } else if (isExit) {
      bg = exitOpen ? 'bg-emerald-300 animate-pulse' : 'bg-[#8c6a3c]';
      content = exitOpen ? '🚪' : '🔒';
    }
    if (treasure) content = <span className="animate-bounce">{treasure.emoji}</span>;
    if (enemy) content = <span className={g.sleep > 0 ? 'opacity-60' : ''}>{g.sleep > 0 ? '💤' : enemy.emoji}</span>;
    if (isPlayer) content = <MummySprite sad={!!isHit} />;

    return (
      <div
        key={`${r}-${c}`}
        style={{ fontSize: 'min(5.2vw, 26px)' }}
        className={`aspect-square flex items-center justify-center leading-none select-none ${bg} ${
          isHit ? 'ring-4 ring-rose-500 z-10' : ''
        }`}
      >
        {content}
      </div>
    );
  };

  const DPadButton: React.FC<{ dir: Dir; children: React.ReactNode; label: string }> = ({ dir, children, label }) => (
    <button
      onClick={() => step(dir)}
      aria-label={label}
      className="w-14 h-14 rounded-2xl bg-amber-500/20 active:bg-amber-400 active:text-amber-950 border-2 border-amber-400/60 text-amber-200 flex items-center justify-center shadow-lg touch-manipulation"
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      {/* Kopfzeile */}
      <div className="rounded-2xl border-2 border-sky-500/40 bg-gradient-to-r from-[#0f1a33] via-[#13213f] to-[#0f1a33] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-sky-300">
            Level {g.level + 1} von {LEVELS.length}
          </span>
          <h2 className="text-lg sm:text-xl font-bold font-pharaoh text-amber-200">Die Flucht der Mumie: {def.name}</h2>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0b101d] border border-rose-400/40 text-rose-300">
            {Array.from({ length: g.lives }).map((_, i) => (
              <Heart key={i} className="w-4 h-4 fill-rose-500 text-rose-500" />
            ))}
            {g.lives === 0 && <span className="text-xs">0</span>}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0b101d] border border-amber-400/40 text-amber-200">
            <Coins className="w-4 h-4 text-amber-400" /> {g.gold}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600"
            title="Spiel schliessen und zur Urkunde zurück"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statuszeile */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200/90 px-1">
        <span>
          Schätze: {parsed.treasures.length - g.treasures.length} / {parsed.treasures.length}
          {g.streak >= 2 && <span className="ml-2 text-amber-300 font-bold">🔥 {g.streak} richtig in Folge!</span>}
        </span>
        <span className="flex items-center gap-2">
          {g.sleep > 0 && <span className="text-sky-300 font-bold">💤 Gegner schlafen noch {g.sleep} Schritte</span>}
          {g.scarabs > 0 && g.phase === 'play' && (
            <button
              onClick={useScarab}
              className="px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-400/60 text-sky-200 font-bold flex items-center gap-1"
            >
              <Moon className="w-3.5 h-3.5" /> Skarabäus einsetzen ({g.scarabs})
            </button>
          )}
          <span className="text-amber-300/60">Rekord auf diesem Gerät: {highscore} Gold</span>
        </span>
      </div>

      {/* Spielfeld */}
      <div className="relative">
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="grid rounded-2xl overflow-hidden border-4 border-amber-700 shadow-2xl touch-none mx-auto"
          style={{ gridTemplateColumns: `repeat(${def.map[0].length}, minmax(0, 1fr))`, maxWidth: 560 }}
        >
          {def.map.map((row, r) => [...row].map((ch, c) => renderCell(ch, r, c)))}
        </div>

        {g.flash && g.phase === 'play' && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-3 max-w-[90%] px-4 py-2 rounded-xl bg-[#0b101d]/90 border border-amber-400/60 text-amber-100 text-xs sm:text-sm font-semibold text-center shadow-xl">
            {g.flash}
          </div>
        )}

        {/* Overlays */}
        {g.phase !== 'play' && (
          <div className="absolute inset-0 rounded-2xl bg-[#060a14]/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border-2 border-amber-500/60 bg-[#0e1628] p-5 sm:p-6 text-center space-y-4 shadow-2xl">
              {g.phase === 'intro' && (
                <>
                  <h3 className="text-xl font-bold font-pharaoh text-amber-200">{def.name}</h3>
                  <p className="text-sm text-amber-100/90">{def.intro}</p>
                  <p className="text-xs text-amber-300/80">
                    Jeder Schatz bringt eine Wissensfrage. Richtige Antworten geben Gold – mehrere hintereinander geben Bonus-Gold!
                    Bewege die Mumie mit den Pfeilen, den Pfeiltasten oder durch Wischen. Die Gegner bewegen sich nur, wenn du gehst.
                  </p>
                  <button
                    onClick={() => setG({ ...g, phase: 'play' })}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-extrabold text-sm"
                  >
                    Los geht’s, {firstName}!
                  </button>
                </>
              )}

              {g.phase === 'question' && g.question && (
                <>
                  <span className="text-3xl">📜</span>
                  <h3 className="text-base sm:text-lg font-bold text-amber-100">{g.question.item.q}</h3>
                  <div className="space-y-2">
                    {g.question.order.map((optIdx) => {
                      const picked = g.question!.picked;
                      let style = 'bg-[#1b2742] hover:bg-[#223254] border-slate-600 text-slate-100';
                      if (picked !== null) {
                        if (optIdx === 0) style = 'bg-emerald-950 border-emerald-400 text-emerald-200 font-bold';
                        else if (optIdx === picked) style = 'bg-rose-950 border-rose-500 text-rose-200';
                        else style = 'bg-slate-900/50 border-slate-800 text-slate-500';
                      }
                      return (
                        <button
                          key={optIdx}
                          disabled={picked !== null}
                          onClick={() => answer(optIdx)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center justify-between ${style}`}
                        >
                          <span>{g.question!.item.options[optIdx]}</span>
                          {picked !== null && optIdx === 0 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {picked !== null && optIdx === picked && optIdx !== 0 && <XCircle className="w-4 h-4 text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>
                  {g.question.picked !== null && (
                    <>
                      <p className="text-xs text-amber-200/90">
                        {g.question.picked === 0 ? (
                          <strong className="text-emerald-300">Richtig! Gold für dich. </strong>
                        ) : (
                          <strong className="text-rose-300">Leider nicht. </strong>
                        )}
                        {g.question.item.explain}
                      </p>
                      <button
                        onClick={continueAfterQuestion}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-extrabold text-sm"
                      >
                        Weiterlaufen
                      </button>
                    </>
                  )}
                </>
              )}

              {g.phase === 'shop' && (
                <>
                  <ShoppingBag className="w-10 h-10 mx-auto text-amber-300" />
                  <h3 className="text-xl font-bold font-pharaoh text-amber-200">Level geschafft!</h3>
                  <p className="text-sm text-amber-100/90">
                    +{GOLD_LEVEL} Gold! Auf dem Basar kannst du dein Gold ausgeben. Du hast <strong>{g.gold} Gold</strong>.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    <button
                      onClick={() => buy('heart')}
                      disabled={g.gold < PRICE_HEART || g.lives >= MAX_LIVES}
                      className="p-3 rounded-xl bg-[#1b2742] border border-rose-400/50 disabled:opacity-40 hover:bg-[#223254]"
                    >
                      <span className="block font-bold text-rose-200">❤️ Extra-Leben</span>
                      <span className="block text-xs text-slate-300">{PRICE_HEART} Gold (max. {MAX_LIVES})</span>
                    </button>
                    <button
                      onClick={() => buy('scarab')}
                      disabled={g.gold < PRICE_SCARAB}
                      className="p-3 rounded-xl bg-[#1b2742] border border-sky-400/50 disabled:opacity-40 hover:bg-[#223254]"
                    >
                      <span className="block font-bold text-sky-200">🪲 Schlaf-Skarabäus</span>
                      <span className="block text-xs text-slate-300">
                        {PRICE_SCARAB} Gold – Gegner schlafen {SLEEP_MOVES} Schritte
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={nextLevel}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-extrabold text-sm"
                  >
                    Weiter zu Level {g.level + 2}: {LEVELS[g.level + 1]?.name}
                  </button>
                </>
              )}

              {g.phase === 'gameOver' && (
                <>
                  <span className="text-4xl">😵</span>
                  <h3 className="text-xl font-bold font-pharaoh text-amber-200">Die Mumie braucht eine Pause</h3>
                  <p className="text-sm text-amber-100/90">Keine Leben mehr. Versuche das Level nochmals!</p>
                  <button
                    onClick={retryLevel}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-extrabold text-sm flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Level nochmals spielen
                  </button>
                </>
              )}

              {g.phase === 'won' && (
                <>
                  <Trophy className="w-12 h-12 mx-auto text-amber-300" />
                  <h3 className="text-xl font-bold font-pharaoh text-amber-200">Die Mumie ist frei!</h3>
                  <p className="text-sm text-amber-100/90">
                    Grossartig, {firstName}! Du hast alle {LEVELS.length} Level geschafft und <strong>{g.gold} Gold</strong> gesammelt.
                    {g.gold >= highscore && g.gold > 0 && ' Das ist ein neuer Rekord auf diesem Gerät!'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={restartAll}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-extrabold text-sm flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" /> Nochmals
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-600 text-amber-200 font-bold text-sm"
                    >
                      Zur Urkunde
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Steuerkreuz */}
      <div className="flex flex-col items-center gap-2 pt-1 pb-4">
        <DPadButton dir="up" label="nach oben">
          <ArrowUp className="w-6 h-6" />
        </DPadButton>
        <div className="flex gap-2">
          <DPadButton dir="left" label="nach links">
            <ArrowLeft className="w-6 h-6" />
          </DPadButton>
          <div className="w-14 h-14" />
          <DPadButton dir="right" label="nach rechts">
            <ArrowRight className="w-6 h-6" />
          </DPadButton>
        </div>
        <DPadButton dir="down" label="nach unten">
          <ArrowDown className="w-6 h-6" />
        </DPadButton>
      </div>
    </div>
  );
};
