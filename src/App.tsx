import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  RotateCcw,
  Volume1,
  Square,
  HelpCircle,
  Copy,
  Check,
  MessageSquare,
  Home,
  Lock,
  Award,
} from 'lucide-react';
import { TutankhamunAvatar } from './components/TutankhamunAvatar';
import { DiscoveryLexikon } from './components/DiscoveryLexikon';
import { WelcomeGuide } from './components/WelcomeGuide';
import { PharaoPruefung } from './components/PharaoPruefung';
import { playMysticChime, playTombGong } from './utils/soundEffects';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const INITIAL_GREETING: Message = {
  id: 'init-1',
  role: 'assistant',
  content:
    'Seid gegrüsst, neugierige Forscherinnen und Forscher der 5. Klasse der Primarschule Erlenmatt! Nach mehr als 3000 Jahren tiefer Ruhe bin ich als sprechende Mumie erwacht. Fragt mich über mein Grab im Tal der Könige, meine goldenen Schätze oder die Geheimnisse der Mumifizierung für euer OneNote!',
  timestamp: 'Vor 3300 Jahren',
};

const SUGGESTED_QUESTIONS = [
  'Was hältst du in deinen königlichen Händen?',
  'Woraus besteht deine weltberühmte Totenmaske?',
  'In was für Kisten und Särgen liegst du?',
  'Wozu dienten die Krüge für die Organe (Kanopen)?',
  'Warum lag dein Körper im Natronsalzbad?',
  'Wie bist du eigentlich gestorben?',
  'Gibt es den Fluch des Pharao wirklich?',
  'Was machten arme Ägypter im heissen Wüstensand?',
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<'welcome' | 'chat' | 'pruefung'>('welcome');
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lexikonOpen, setLexikonOpen] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new chat messages
  useEffect(() => {
    if (currentTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, currentTab]);

  // Clean up speech synthesis if user navigates or stops
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputValue).trim();
    if (!question || isLoading) return;

    if (currentTab !== 'chat') {
      setCurrentTab('chat');
    }

    playMysticChime(soundEnabled);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          history,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Fehler bei der Antwort des Pharao');
      }

      playTombGong(soundEnabled);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Der Geist des Pharao schweigt für einen Augenblick. Versuche es erneut.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Ein Wüstensturm verweht meine Stimme. Bitte frage mich noch einmal, edle Schülerin, edler Schüler.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (currentTab === 'chat') {
          inputRef.current?.focus();
        }
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggleSpeak = (message: Message) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(message.id);

    const utterance = new SpeechSynthesisUtterance(message.content);
    const voices = window.speechSynthesis.getVoices();
    const deVoice =
      voices.find((v) => v.lang.includes('de-CH')) ||
      voices.find((v) => v.lang.includes('de-DE')) ||
      voices.find((v) => v.lang.startsWith('de'));

    if (deVoice) {
      utterance.voice = deVoice;
    }
    utterance.lang = deVoice?.lang || 'de-DE';
    utterance.rate = 0.95;
    utterance.pitch = 0.9;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    if (window.confirm('Möchtest du eine neue Audienz mit Pharao Tutanchamun beginnen?')) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageId(null);
      setMessages([INITIAL_GREETING]);
      playMysticChime(soundEnabled);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-[#f1ebd9] flex flex-col selection:bg-amber-500/30">
      
      {/* Ancient Egyptian Sun Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 shadow-lg shadow-amber-500/20" />

      {/* TOP NAVIGATION BAR */}
      <header className="border-b border-amber-500/30 bg-[#0c1222]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & School Badge */}
          <div
            onClick={() => setCurrentTab('welcome')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <TutankhamunAvatar size="sm" isLoading={isLoading} isSpeaking={!!speakingMessageId} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-pharaoh text-amber-300 tracking-wide group-hover:text-amber-200 transition-colors">
                  Pharao Tutanchamun
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  Die sprechende Mumie
                </span>
              </div>
              <p className="text-[11px] text-amber-200/70 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Primarschule Erlenmatt • Klasse 5 • Basel
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Tab: Willkommen */}
            <button
              onClick={() => {
                setCurrentTab('welcome');
                playMysticChime(soundEnabled);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                currentTab === 'welcome'
                  ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-md'
                  : 'bg-[#121a2d] hover:bg-amber-500/15 text-amber-200/90 border-amber-500/30'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Willkommen</span>
            </button>

            {/* Tab: Audienz (Chat) */}
            <button
              onClick={() => {
                setCurrentTab('chat');
                playMysticChime(soundEnabled);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                currentTab === 'chat'
                  ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-md'
                  : 'bg-[#121a2d] hover:bg-amber-500/15 text-amber-200/90 border-amber-500/30'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Audienz</span>
            </button>

            {/* Tab: Pharaonen-Prüfung & Urkunde (Code "luxor") */}
            <button
              onClick={() => {
                setCurrentTab('pruefung');
                playMysticChime(soundEnabled);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                currentTab === 'pruefung'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border-amber-300 shadow-md font-extrabold'
                  : 'bg-[#121a2d] hover:bg-amber-500/15 text-amber-200/90 border-amber-500/30'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Prüfung & Urkunde</span>
            </button>

            {/* Grabkammer-Lexikon Modal Trigger */}
            <button
              onClick={() => {
                setLexikonOpen(true);
                playMysticChime(soundEnabled);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/40 transition-all shadow-sm"
              title="Fakten-Lexikon öffnen"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Lexikon</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300/80 border border-amber-500/20 transition-colors"
              title={soundEnabled ? 'Töne ausschalten' : 'Töne einschalten'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Reset Chat */}
            {currentTab === 'chat' && (
              <button
                onClick={handleResetChat}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-amber-300/80 hover:text-rose-300 border border-amber-500/20 transition-colors"
                title="Neue Audienz beginnen"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="max-w-5xl w-full mx-auto flex-1 flex flex-col p-3 sm:p-5">
        
        {/* VIEW 1: WELCOME & ONBOARDING GUIDE */}
        {currentTab === 'welcome' && (
          <WelcomeGuide
            onStartChat={() => setCurrentTab('chat')}
            onOpenLexikon={() => setLexikonOpen(true)}
            onOpenPruefung={() => setCurrentTab('pruefung')}
          />
        )}

        {/* VIEW 2: PHARAONEN-PRÜFUNG & URKUNDE (Password: luxor) */}
        {currentTab === 'pruefung' && (
          <PharaoPruefung
            onBackToChat={() => setCurrentTab('chat')}
            soundEnabled={soundEnabled}
          />
        )}

        {/* VIEW 3: CHAT WITH TUTANKHAMUN */}
        {currentTab === 'chat' && (
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Top Stage Mini-Banner */}
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#11192e] via-[#162035] to-[#14120c] p-3.5 flex items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <TutankhamunAvatar size="sm" isLoading={isLoading} isSpeaking={!!speakingMessageId} />
                <div>
                  <h3 className="font-pharaoh font-bold text-amber-200 text-sm sm:text-base">
                    Audienz bei Pharao Tutanchamun
                  </h3>
                  <p className="text-[11px] text-amber-300/80">
                    Fülle dein OneNote aus! Frage nach Grab (1922), den 4 Särgen oder den 6 Schritten der Mumifizierung.
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setLexikonOpen(true)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Lexikon</span>
                </button>
                <button
                  onClick={() => setCurrentTab('pruefung')}
                  className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 font-bold"
                >
                  <Lock className="w-3 h-3" />
                  <span>Prüfung (Code: luxor)</span>
                </button>
              </div>
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-amber-300/80 font-bold px-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Klicke eine Frage an, um den Pharao direkt zu befragen:</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    disabled={isLoading}
                    onClick={() => handleSendMessage(q)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold bg-[#11192e] hover:bg-[#1a2745] text-amber-200/90 hover:text-amber-100 border border-amber-500/30 transition-all hover:border-amber-400/60 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 min-h-[380px] bg-[#0c1222]/80 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5 overflow-y-auto space-y-4 shadow-inner">
              {messages.map((message) => {
                const isPharaoh = message.role === 'assistant';

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 max-w-3xl ${isPharaoh ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-1">
                      {isPharaoh ? (
                        <TutankhamunAvatar
                          size="sm"
                          isSpeaking={speakingMessageId === message.id}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-800 border border-cyan-400/60 flex items-center justify-center text-cyan-100 font-bold shadow-md">
                          🎒
                        </div>
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`rounded-2xl p-4 text-sm leading-relaxed relative group transition-all ${
                        isPharaoh
                          ? 'bg-gradient-to-b from-[#18233c] to-[#121a2d] border-2 border-amber-500/40 text-amber-100/95 shadow-xl rounded-tl-sm'
                          : 'bg-gradient-to-r from-cyan-900/80 to-blue-900/80 border border-cyan-500/40 text-cyan-50 shadow-md rounded-tr-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-white/10 text-[11px]">
                        <span className={`font-bold ${isPharaoh ? 'font-pharaoh text-amber-300' : 'text-cyan-300'}`}>
                          {isPharaoh ? 'Pharao Tutanchamun' : 'Schüler/in (Klasse 5)'}
                        </span>
                        <span className="opacity-50 text-[10px]">{message.timestamp}</span>
                      </div>

                      <div className="whitespace-pre-wrap font-sans text-sm md:text-[15px]">
                        {message.content}
                      </div>

                      {isPharaoh && (
                        <div className="mt-3 pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleSpeak(message)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                                speakingMessageId === message.id
                                  ? 'bg-amber-400 text-amber-950 font-bold animate-pulse'
                                  : 'bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                              }`}
                              title="Lass den Pharao vorlesen"
                            >
                              {speakingMessageId === message.id ? (
                                <>
                                  <Square className="w-3 h-3 fill-current" />
                                  <span>Stopp</span>
                                </>
                              ) : (
                                <>
                                  <Volume1 className="w-3.5 h-3.5" />
                                  <span>Vorlesen</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleCopy(message.id, message.content)}
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/80 text-amber-300/80 hover:text-amber-200 border border-amber-500/20 transition-colors"
                              title="Text kopieren"
                            >
                              {copiedId === message.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-[11px] text-emerald-400">Kopiert</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span className="text-[11px]">Kopieren</span>
                                </>
                              )}
                            </button>
                          </div>

                          <span className="text-[10px] text-amber-400/60 font-pharaoh hidden sm:inline">
                            𓇋 𓈖 𓊪 𓅱 𓏏 𓊹
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 max-w-xl mr-auto items-center animate-fade-in">
                  <TutankhamunAvatar size="sm" isLoading={true} />
                  <div className="bg-[#18233c] border border-amber-500/40 rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-amber-300 flex items-center gap-3 shadow-lg">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <span>Pharao Tutanchamun durchdringt den Schleier der Zeit...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-[#0d1424] border-2 border-amber-500/50 focus-within:border-amber-400 rounded-2xl p-2 shadow-2xl transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Stelle Pharao Tutanchamun deine Frage für dein OneNote..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm md:text-base text-amber-100 placeholder:text-amber-200/40 focus:outline-none"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:pointer-events-none text-amber-950 font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <span>Fragen</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-amber-300/60">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Tipp: Wenn du dein OneNote ausgefüllt hast, hole dir den Code «luxor» bei der Lehrperson für die Prüfung & Urkunde!
                </span>
                <span className="hidden sm:inline">Konsequentes Schweizer Hochdeutsch (ss)</span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-amber-500/20 bg-[#070b14] py-3 px-4 text-center text-xs text-amber-400/60">
        <p>
          Interaktives historisches Lernprojekt für die 5. Klasse der <strong>Primarschule Erlenmatt</strong> in Basel • OneNote-Fragebogen, Code «luxor» & persönliche Pharaonen-Urkunde
        </p>
      </footer>

      {/* MODAL: LEXIKON */}
      <DiscoveryLexikon
        isOpen={lexikonOpen}
        onClose={() => setLexikonOpen(false)}
        onAskQuestion={(q) => handleSendMessage(q)}
      />
    </div>
  );
}
