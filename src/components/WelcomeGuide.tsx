import React from 'react';
import {
  MessageSquare,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  FileText,
  Lock,
} from 'lucide-react';
import { TutankhamunAvatar } from './TutankhamunAvatar';

interface WelcomeGuideProps {
  onStartChat: () => void;
  onOpenLexikon: () => void;
  onOpenPruefung: () => void;
}

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({
  onStartChat,
  onOpenLexikon,
  onOpenPruefung,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Welcome Hero Box */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 bg-gradient-to-b from-[#141d33] via-[#0d1424] to-[#1a1106] p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
          <div className="flex-shrink-0 torch-glow">
            <TutankhamunAvatar size="lg" />
          </div>

          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Willkommen, Klasse 5 der Primarschule Erlenmatt!</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-pharaoh text-amber-200 tracking-wide">
              Audienz bei Pharao Tutanchamun
            </h1>

            <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed max-w-2xl">
              Nach über 3000 Jahren im Wüstensand ist Pharao Tutanchamun als sprechende Mumie erwacht. 
              Befragt ihn zu seinem goldenen Grab, seinen Särgen und den 6 Schritten der Mumifizierung, um euren <strong>Fragebogen im OneNote</strong> auszufüllen!
            </p>

            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
              <button
                onClick={onStartChat}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-extrabold text-sm flex items-center gap-2 shadow-xl transition-all transform active:scale-95"
              >
                <span>Audienz beim Pharao starten</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenPruefung}
                className="px-5 py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 font-bold text-sm flex items-center gap-2 transition-all active:scale-95"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>Zur Pharaonen-Prüfung (Code nötig)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Steps Grid: The 4 Steps in Class */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold font-pharaoh text-amber-200 flex items-center gap-2 px-1">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>Euer Ablauf im Unterricht: Schritt für Schritt</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-[#0e1627] border-2 border-amber-500/30 flex flex-col justify-between shadow-lg">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-pharaoh font-bold text-sm">
                1
              </div>
              <h3 className="font-bold font-pharaoh text-amber-200 text-sm">
                OneNote Fragebogen
              </h3>
              <p className="text-xs text-amber-100/80 leading-relaxed">
                Öffnet euer OneNote und befragt Tutanchamun gezielt zu den Themen: Grabfund 1922, 4 Särge und 6 Mumifizierungsschritte.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-[#0e1627] border-2 border-amber-500/30 flex flex-col justify-between shadow-lg">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-pharaoh font-bold text-sm">
                2
              </div>
              <h3 className="font-bold font-pharaoh text-amber-200 text-sm">
                Genaue Fragen stellen
              </h3>
              <p className="text-xs text-amber-100/80 leading-relaxed">
                Fragt immer <strong>eine Sache auf einmal</strong>. Der Pharao versteht auch eure eigenen Worte («Stöcke», «Kisten», «Salzbad»).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-[#0e1627] border-2 border-amber-500/30 flex flex-col justify-between shadow-lg">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-pharaoh font-bold text-sm">
                3
              </div>
              <h3 className="font-bold font-pharaoh text-amber-200 text-sm">
                Code bei Lehrperson holen
              </h3>
              <p className="text-xs text-amber-100/80 leading-relaxed">
                Alles im OneNote eingetragen? Zeigt es eurer Lehrperson und holt euch das geheime Codewort!
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-[#0e1627] border-2 border-amber-500/30 flex flex-col justify-between shadow-lg">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-pharaoh font-bold text-sm">
                4
              </div>
              <h3 className="font-bold font-pharaoh text-amber-200 text-sm">
                Quiz & Urkunde!
              </h3>
              <p className="text-xs text-amber-100/80 leading-relaxed">
                Löst das Quiz und den Lückentext mit Textbausteinen. Holt euch eure persönliche Urkunde mit eigenem Pharaonen-Namen!
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Rules & Help Showcase */}
      <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-[#11192e] via-[#162035] to-[#11192e] p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold font-pharaoh text-amber-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Hilfe, wenn die Mumie eine Antwort nicht weiss:
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tool 1 */}
          <div
            onClick={onOpenLexikon}
            className="p-4 rounded-xl bg-[#0b101d] border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 group-hover:bg-amber-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-amber-200 text-sm">Das Grabkammer-Lexikon aufschlagen</h4>
            </div>
            <p className="text-xs text-slate-300">
              Dort findet ihr alle 3 Hauptthemen übersichtlich zusammengefasst: Entdeckung 1922, die 4 Särge und die 6 Schritte der Mumifizierung!
            </p>
          </div>

          {/* Tool 2 */}
          <div
            onClick={onOpenPruefung}
            className="p-4 rounded-xl bg-[#0b101d] border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 group-hover:bg-amber-500/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-amber-200 text-sm">Prüfung & Urkunde (mit Codewort)</h4>
            </div>
            <p className="text-xs text-slate-300">
              Schliesst die Lücken im Text mit den durchmischten Wortbausteinen und erhaltet eure feierliche Pharaonen-Urkunde!
            </p>
          </div>
        </div>
      </div>

      {/* Rules summary banner */}
      <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-amber-200 text-sm">Schweizer Hochdeutsch</h4>
            <p className="text-xs text-amber-300/80">
              Der Pharao antwortet euch stets in reinem Schweizer Hochdeutsch (immer «ss», niemals «ß»).
            </p>
          </div>
        </div>

        <button
          onClick={onStartChat}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0"
        >
          Zum Chat mit Tutanchamun →
        </button>
      </div>

    </div>
  );
};
