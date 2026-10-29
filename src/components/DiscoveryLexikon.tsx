import React, { useState } from 'react';
import { X, BookOpen, Crown, Sparkles, Scroll, ArrowRight, ShieldCheck } from 'lucide-react';

interface DiscoveryLexikonProps {
  isOpen: boolean;
  onClose: () => void;
  onAskQuestion: (question: string) => void;
}

export const DiscoveryLexikon: React.FC<DiscoveryLexikonProps> = ({
  isOpen,
  onClose,
  onAskQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'tomb' | 'sarcophagus' | 'mummy'>('tomb');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0f172a] border-2 border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Hieroglyphic styling */}
        <div className="bg-gradient-to-r from-amber-950 via-[#1e1b4b] to-amber-950 px-6 py-4 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-400/40 text-amber-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-pharaoh text-amber-200 tracking-wide">
                Das Grabkammer-Lexikon
              </h2>
              <p className="text-xs text-amber-400/80">
                Historische Fakten für die 5. Klasse der Primarschule Erlenmatt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-amber-400/80 hover:text-amber-200 hover:bg-amber-900/40 rounded-full transition-colors"
            title="Schliessen"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-amber-500/30 bg-[#090d16] overflow-x-auto">
          <button
            onClick={() => setActiveTab('tomb')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'tomb'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-amber-200/60 hover:text-amber-200 hover:bg-amber-500/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            1. Entdeckung des Grabes (1922)
          </button>

          <button
            onClick={() => setActiveTab('sarcophagus')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'sarcophagus'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-amber-200/60 hover:text-amber-200 hover:bg-amber-500/5'
            }`}
          >
            <Crown className="w-4 h-4" />
            2. Die 4 Sarkophage & Schätze
          </button>

          <button
            onClick={() => setActiveTab('mummy')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'mummy'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-amber-200/60 hover:text-amber-200 hover:bg-amber-500/5'
            }`}
          >
            <Scroll className="w-4 h-4" />
            3. Die 6 Schritte der Mumifizierung
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-amber-100/90 leading-relaxed text-sm">
          {activeTab === 'tomb' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Sensationsfund</span>
                <h3 className="text-lg font-bold text-amber-200 mt-1">26. November 1922 im Tal der Könige</h3>
                <p className="mt-2 text-amber-100/80">
                  Der englische Archäologe <strong className="text-amber-300">Howard Carter</strong> und sein Geldgeber <strong className="text-amber-300">Lord Carnarvon</strong> suchten fünf lange Jahre vergeblich im Wüstensand. Fast wollten sie aufgeben – doch dann stiessen sie auf die erste Steinstufe, die in die Grabkammer hinabführte!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#161f33] border border-amber-500/20">
                  <h4 className="font-bold text-amber-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Ein junger Pharao
                  </h4>
                  <p className="text-xs mt-2 text-slate-300">
                    Tutanchamun starb sehr jung, mit <strong>höchstens 22 Jahren</strong>. Er war schlank und etwa <strong>1,65 m</strong> gross. Röntgenbilder des Schädels zeigen einen Bruch – starb er bei einem Streitwagenunfall oder wurde er ermordet?
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#161f33] border border-amber-500/20">
                  <h4 className="font-bold text-amber-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Der angebliche «Fluch des Pharao»
                  </h4>
                  <p className="text-xs mt-2 text-slate-300">
                    Eine reine Erfindung der Sensationszeitungen nach Carnarvons Tod! Tutanchamun ist nicht böse – durch den Fund erhielt er ewigen Ruhm. Zudem wurden fast alle Ausgräber uralt.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-amber-300/80 mb-2 font-semibold">Möchtest du den Pharao direkt dazu befragen?</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      onAskQuestion('Wie bist du eigentlich gestorben?');
                      onClose();
                    }}
                    className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors"
                  >
                    «Wie bist du eigentlich gestorben?» <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      onAskQuestion('Gibt es den Fluch des Pharao wirklich?');
                      onClose();
                    }}
                    className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors"
                  >
                    «Gibt es den Fluch des Pharao wirklich?» <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sarcophagus' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Die königliche Hülle</span>
                <h3 className="text-lg font-bold text-amber-200 mt-1">4 ineinandergeschachtelte Särge</h3>
                <p className="mt-2 text-amber-100/80">
                  Umgeben von <strong>vier vergoldeten Holzschreinen</strong> lag der Pharao wie eine russische Matrjoschka-Puppe in vier Särgen:
                </p>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  <li><strong>1. Äusserster Sarg:</strong> Aus massivem, schwerem Quarzit-Stein</li>
                  <li><strong>2. & 3. Mittlere Särge:</strong> Aus kunstvoll geschnitztem und bemaltem Holz</li>
                  <li><strong>4. Innerster Sarg:</strong> Aus über 110 kg purem, massivem Gold!</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#161f33] border border-amber-500/20">
                  <h4 className="font-bold text-amber-300">Die goldene Totenmaske</h4>
                  <p className="text-xs mt-2 text-slate-300">
                    Besteht aus <strong>massivem Gold</strong> und eingelegten <strong>Halbedelsteinen</strong> (wie Lapislazuli für die Augen und Streifen). Sie schützte das Gesicht der Mumie.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#161f33] border border-amber-500/20">
                  <h4 className="font-bold text-amber-300">Insignien der Macht</h4>
                  <p className="text-xs mt-2 text-slate-300">
                    Er hielt den <strong>Krummstab</strong> (Schutz des Hirten) und den <strong>königlichen Dreschflegel</strong> gekreuzt vor der Brust, sowie das <strong>Anch</strong> (Schlüssel des ewigen Lebens). Auf dem Kopf trug er das gestreifte <strong>Nemes-Kopftuch</strong> oder die <strong>Hemhemet-Krone</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-amber-300/80 mb-2 font-semibold">Frage Tutanchamun dazu:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      onAskQuestion('Woraus besteht deine Totenmaske und dein Sarg?');
                      onClose();
                    }}
                    className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors"
                  >
                    «Woraus besteht deine Totenmaske und dein Sarg?» <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      onAskQuestion('Was bedeuten Krummstab, Dreschflegel und das Anch?');
                      onClose();
                    }}
                    className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors"
                  >
                    «Was bedeuten Krummstab, Dreschflegel und das Anch?» <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mummy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Der Glaube an die Ewigkeit</span>
                <h3 className="text-lg font-bold text-amber-200 mt-1">Warum wurden Menschen mumifiziert?</h3>
                <p className="mt-2 text-amber-100/80">
                  Die Ägypter glaubten an ein Weiterleben nach dem Tod im Jenseits. Die Seele brauchte einen intakten Körper als Wohnung. 
                  Arme Menschen wurden einfach im heissen Sand vergraben (der trocknete sie oft sogar besser aus als teure Balsamierung!).
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-amber-300 text-sm">Die 6 genauen Schritte:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-[#161f33] rounded-lg border border-amber-500/20">
                    <span className="font-bold text-amber-400">1. Gehirn:</span> Mit einem feinen Stäbchen vorsichtig durch die Nase herausgezogen.
                  </div>
                  <div className="p-3 bg-[#161f33] rounded-lg border border-amber-500/20">
                    <span className="font-bold text-amber-400">2. Kanopen:</span> Organe & Eingeweide entnommen und in 4 spezielle Krüge gelegt.
                  </div>
                  <div className="p-3 bg-[#161f33] rounded-lg border border-amber-500/20">
                    <span className="font-bold text-amber-400">3. Myrrhe:</span> Bauchhöhle mit wohlriechender Myrrhe gefüllt und sauber zugenäht.
                  </div>
                  <div className="p-3 bg-[#161f33] rounded-lg border border-amber-500/20">
                    <span className="font-bold text-amber-400">4. Natronsalz:</span> 50 bis 70 Tage in Natronlauge eingelegt für vollständige Entwässerung.
                  </div>
                  <div className="p-3 bg-[#161f33] rounded-lg border border-amber-500/20">
                    <span className="font-bold text-amber-400">5. Leinenstreifen:</span> Hundert Meter Binden umwickelt, geschützt mit Amuletten.
                  </div>
                  <div className="p-3 bg-[#161f33] rounded-lg border border-amber-500/20">
                    <span className="font-bold text-amber-400">6. Mundöffnung:</span> Priester berührte Mund & Augen, um Sinne im Jenseits zu wecken.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-amber-300/80 mb-2 font-semibold">Frage Tutanchamun:</p>
                <button
                  onClick={() => {
                    onAskQuestion('Erkläre mir Schritt für Schritt, wie deine Mumifizierung ablief.');
                    onClose();
                  }}
                  className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors"
                >
                  «Erkläre mir Schritt für Schritt, wie deine Mumifizierung ablief.» <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0b0f19] px-6 py-3 border-t border-amber-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md"
          >
            Zurück zur Audienz
          </button>
        </div>
      </div>
    </div>
  );
};
