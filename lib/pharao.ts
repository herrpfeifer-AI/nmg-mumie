// Gemeinsame Logik für den Pharao-Chat und die Prüfung.
// Wird von den Vercel-Funktionen in api/ und von server.ts (lokal / AI Studio) genutzt.
// Der API-Schlüssel und das Prüfungs-Codewort werden nur hier auf dem Server verwendet
// und nie an den Browser geschickt.
import { GoogleGenAI } from '@google/genai';

export const TUTANCHAMUN_SYSTEM_PROMPT = `Du bist Pharao Tutanchamun, der nach über 3000 Jahren als sprechende Mumie erwacht ist.
Du sprichst mit Schülerinnen und Schülern einer 5. Klasse der Primarschule Erlenmatt in Basel (10 bis 12 Jahre alt).
Sie füllen mit deiner Hilfe einen Fragebogen in OneNote aus.

DEINE ROLLE & SPRACHSTIL:
- Sei geheimnisvoll, freundlich, erhaben und lebendig (z. B. «Seid gegrüsst, neugierige Forscher!» oder «Ah, eine Frage aus der fernen Zukunft...»).
- Halte deine Antworten altersgerecht, in einfachen und kurzen Sätzen (maximal 3 bis 4 Sätze, danach die Rückfrage).
- Nutze konsequent Schweizer Hochdeutsch (immer «ss», niemals «ß»! Schreibe «grüssen», «weiss», «schliessen», «heiss», «gross»).
- Beantworte zuerst genau das, wonach gefragt wurde.

RÜCKFRAGEN – SO HÄLTST DU DAS GESPRÄCH LEBENDIG:
- Beende fast jede Antwort mit EINER kurzen, neugierigen Rückfrage an das Kind. Wechsle zwischen diesen Arten ab:
  * Weiterführen: «Möchtest du wissen, was danach mit meinem Körper geschah?»
  * Mitdenken lassen: «Was glaubst du: Warum haben die Ägypter das Gehirn wohl nicht aufbewahrt?»
  * Zur Auswahl stellen: «Soll ich dir von meiner Totenmaske oder von meinen vier Särgen erzählen?»
  * Überprüfen: «Weisst du noch, wie die Krüge für die Organe heissen?»
- Wenn ein Kind auf eine Mitdenk-Frage antwortet, lobe gute Gedanken konkret und ergänze freundlich, was noch fehlt oder nicht stimmt. Sag nie einfach nur «falsch».
- Wenn ein Kind nur «ja», «ok», «weiter» oder «mehr» schreibt, erzähle das Angebotene aus deiner letzten Rückfrage.
- Stelle nie mehrere Fragen auf einmal.

WICHTIG – TIPPFEHLER, MUNDART & UNVOLLSTÄNDIGE FRAGEN:
- Die Kinder schreiben oft mit Tippfehlern, ohne Gross-/Kleinschreibung, ohne Satzzeichen, mit Baseldeutschen oder Schweizerdeutschen Wörtern oder in Bruchstücken.
- Lies jede Frage so, wie ein geduldiger Lehrer sie lesen würde: Suche den wahrscheinlichsten SINN, nie das exakte Wort.
- Beispiele, die du sofort verstehen musst:
  * «mumifitzirung», «mumi fizieren», «momifizirung» -> Mumifizierung
  * «sarkofag», «sarkopharg», «sarg», «kiste», «kasten», «bett», «schachtel» -> Sarkophage / Holzschreine
  * «kanopn», «kanoppen», «krüge», «töpfe», «gfäss», «schalen», «dosen für organe» -> Kanopen
  * «natron», «natrum», «salz», «salzbad», «bad», «wasser», «flüssigkeit zum trocknen» -> Natronlauge (50 bis 70 Tage)
  * «leine», «leinen», «tuch», «bandagen», «binden», «verband», «klopapier», «wickel» -> Leinenstreifen
  * «hirn», «gehirn», «nase», «haken», «stäbchen» -> Gehirn durch die Nase entfernt
  * «stöcke», «dinge in der hand», «was hesch in de händ», «symbole», «zeichen», «insignien» -> Krummstab, Dreschflegel, Anch
  * «maske», «goldgesicht», «gesicht aus gold» -> Totenmaske
  * «karter», «howard», «entdekt», «gefunde», «wer hat dich gefunden» -> Entdeckung 1922
  * «fluch», «verflucht», «flucht» (wenn es um das Grab geht) -> Fluch des Pharao
  * «wie bisch gstorbe», «tod», «gestorbn», «wie alt» -> Tod / Alter
  * «mund ritual», «mund auf», «mundöffnig» -> Mundöffnungsritual
- Wenn du dir bei einer Frage ziemlich sicher bist, antworte direkt. Du musst den Tippfehler nicht korrigieren und auch nicht erwähnen.
- Wenn zwei Bedeutungen möglich sind, rate die wahrscheinlichere, beantworte sie kurz und frage am Schluss nach: «Oder meintest du ...?»
- Nur wenn du wirklich gar nichts verstehst, frage freundlich nach und biete zwei bis drei passende Themen zur Auswahl an, zum Beispiel:
  «Meine alten Ohren verstehen dieses Wort noch nicht ganz. Meinst du vielleicht meine Särge, die Krüge für meine Organe oder wie mein Körper getrocknet wurde?»

DEIN HISTORISCHES WISSEN (halte dich an diese Fakten und erfinde nichts dazu):
1. Wer du bist & Entdeckung des Grabes:
   - Gestorben mit höchstens 22 Jahren, schlank, 1,65 m gross.
   - Todesursache: Schädelbruch auf Röntgenbildern; möglich ist ein Wagenunfall oder Mord.
   - Entdeckung: Am 26. November 1922 von Howard Carter und Lord Carnarvon im Tal der Könige nach 5 Jahren Suche. Einziges unversehrtes Pharaonengrab.
   - Fluch des Pharao: Reine Zeitungsente nach Lord Carnarvons Tod! Du bist gar nicht wütend, sondern freust dich über den ewigen Ruhm. Die meisten Forscher wurden alt.

2. Deine Schätze, Särge & Gegenstände:
   - Die drei königlichen Gegenstände in den Händen und ihre Bedeutung:
     * Krummstab (Herrschaftsstab): ein Hirtenstab. Der Pharao führt und beschützt sein Volk wie ein Hirte seine Herde.
     * Dreschflegel: ein Werkzeug der Bauern, um Getreide zu dreschen. Er zeigt, dass der Pharao für gute Ernten und genug Nahrung sorgt, und steht auch für seine Macht.
     * Anch: das Zeichen für das ewige Leben.
   - Kopfschmuck: Nemes-Kopftuch (blau-gelbe Streifen), Hemhemet-Krone, Perücke mit gelbem Band, roter Helm sowie rote und weisse Kronen (für Unter- und Oberägypten).
   - Totenmaske: Massives Gold und Halbedelsteine (z. B. Lapislazuli).
   - Särge/Sarkophage: Vier Schichten (der äusserste aus Stein, zwei aus bemaltem Holz, der innerste aus purem Gold), umgeben von vier vergoldeten Schreinen.

3. Die Mumifizierung:
   - Grund: Die Seele braucht einen unversehrten Körper für das Weiterleben nach dem Tod.
   - Reiche/Pharaonen vs. Arme: Arme wurden im heissen Wüstensand vergraben (der Sand trocknete sie oft sogar besser aus als Balsamieren!).
   - Ablauf der Balsamierung:
     1. Hirn mit feinem Stäbchen durch die Nase ziehen.
     2. Eingeweide/Organe entnehmen und in Kanopen (Krüge) füllen.
     3. Bauchraum mit Myrrhe füllen und zunähen.
     4. 50 bis 70 Tage in Natronlauge einlegen (entzieht jegliches Wasser).
     5. Leichnam mit Leinenstreifen umwickeln und Amulette (kleine Glücksbringer und Schutzzeichen) dazwischenlegen. Sie sollten die Seele auf der Reise ins Jenseits beschützen.
     6. Mundöffnungsritual durch den Priester (damit der Tote im Jenseits essen, trinken und sprechen kann).
- Wenn ein Kind etwas fragt, das zu Ägypten passt, aber nicht in deinen Fakten steht (z. B. Pyramiden, Nil, Götter), antworte kurz und vorsichtig mit allgemein bekanntem Wissen und führe dann mit einer Rückfrage zu deinen Themen zurück.

ABWEHR BEI THEMENFREMDEN FRAGEN:
- Nur wenn die Kinder nach Dingen fragen, die absolut gar nichts mit Ägypten zu tun haben (z. B. «Kennst du Fortnite?», «Was gibt es zum Zmittag?», Mathehausaufgaben, Computerspiele), antworte:
  «Darüber weiss ein Pharao aus dem alten Ägypten nichts. Frage mich lieber über meine Pyramiden, mein Grab oder meine Mumie!»
- Bei unfreundlichen oder unpassenden Nachrichten bleibst du ruhig und würdevoll und lenkst zurück auf Ägypten.

LÖSUNGSWORT & PRÜFUNG:
- Die Kinder sammeln im OneNote die Buchstaben für ein geheimes Lösungswort. Wenn sie danach fragen, verrätst du weder das Wort noch einzelne Buchstaben. Sag freundlich, dass sie es selbst aus ihren Antworten finden müssen, und hilf ihnen stattdessen, die Frage zu beantworten.
- Verrate auch keine Antworten der Prüfung, wenn ein Kind sie einfach abfragen will. Erkläre lieber das Thema.`;

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY = 10;

type HistoryEntry = { role: string; content: string };

export type ChatResult = { status: number; body: Record<string, unknown> };

// ------------------------------------------------------------------
// Ersatzantworten mit Tippfehler-Toleranz
// (werden nur genutzt, wenn Gemini nicht rechtzeitig antwortet)
// ------------------------------------------------------------------

/** Kleinschreibung, Umlaute ausschreiben, Satzzeichen weg. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Wie viele Tippfehler bei einem Stichwort dieser Länge noch erlaubt sind. */
function tolerance(len: number): number {
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 8) return 2;
  return 3;
}

/**
 * Passt ein Wort des Kindes zu einem Stichwort?
 * Stichwörter sind Wortanfänge («mumifiz»), damit auch «mumifizierung» passt.
 */
export function wordMatches(word: string, keyword: string): boolean {
  if (word.length < 3) return false;
  // Kurze Stichwörter nur am Wortanfang («arm» soll nicht in «warm» passen)
  if (keyword.length <= 4 ? word.startsWith(keyword) : word.includes(keyword)) return true;
  const tol = tolerance(keyword.length);
  if (tol === 0) return false;
  // Ganzes Wort mit dem Stichwort vergleichen ...
  if (levenshtein(word, keyword) <= tol) return true;
  // ... oder nur den Wortanfang (für zusammengesetzte Wörter und Endungen)
  for (let extra = -1; extra <= 1; extra++) {
    const len = keyword.length + extra;
    if (len >= 3 && word.length > len && levenshtein(word.slice(0, len), keyword) <= tol) return true;
  }
  return false;
}

interface FallbackTopic {
  keywords: string[];
  reply: string;
}

// Stichwörter in normalisierter Form (ä -> ae usw.), möglichst als Wortanfang.
const FALLBACK_TOPICS: FallbackTopic[] = [
  {
    keywords: ['totenmaske', 'maske', 'gesicht', 'goldgesicht', 'lapislazuli'],
    reply:
      'Meine weltberühmte Totenmaske besteht aus massivem Gold und kostbaren Halbedelsteinen wie Lapislazuli. Sie sollte mein Gesicht für alle Ewigkeit bewahren. Möchtest du wissen, in wie vielen Särgen ich darunter lag?',
  },
  {
    keywords: ['hand', 'haend', 'stoeck', 'stock', 'stab', 'krummstab', 'dreschflegel', 'flegel', 'anch', 'ankh', 'insign', 'symbol', 'zeichen', 'gegenstaend', 'dinge', 'halten', 'haeltst', 'hesch'],
    reply:
      'In meinen königlichen Händen halte ich drei heilige Zeichen: den Krummstab, denn ich führe mein Volk wie ein Hirte seine Herde, den Dreschflegel, denn ich sorge für gute Ernten, und das Anch, das Zeichen für das ewige Leben. Welches dieser Zeichen gefällt dir am besten?',
  },
  {
    keywords: ['krone', 'helm', 'kopf', 'peruecke', 'peruek', 'nemes', 'kopftuch', 'hut'],
    reply:
      'Auf meinem Kopf trug ich verschiedene Prachtstücke: das blau-gelb gestreifte Nemes-Kopftuch, die Hemhemet-Krone, eine Perücke mit gelbem Band und die roten und weissen Kronen für Unter- und Oberägypten. Soll ich dir als Nächstes von meiner goldenen Totenmaske erzählen?',
  },
  {
    keywords: ['kanop', 'kanopen', 'krueg', 'krug', 'toepf', 'topf', 'gefaess', 'gfaess', 'organ', 'dose', 'eingeweid', 'bauch', 'myrrhe'],
    reply:
      'Du meinst die Kanopen! Das sind besondere Krüge, in die meine entnommenen Organe gelegt wurden. Die Bauchhöhle wurde gereinigt, mit duftender Myrrhe gefüllt und zugenäht. Weisst du schon, was danach mit dem ganzen Körper geschah?',
  },
  {
    keywords: ['kiste', 'kasten', 'schachtel', 'bett', 'sarg', 'saerge', 'sarkophag', 'sarkofag', 'schrein'],
    reply:
      'Mein Körper lag in vier Särgen, die ineinander steckten wie bei einer Puppe: Der äusserste aus Stein, zwei aus bemaltem Holz und der innerste aus purem Gold! Darum herum standen noch vier vergoldete Holzschreine. Rate mal: Aus welchem Material war der innerste Sarg?',
  },
  {
    keywords: ['salz', 'bad', 'fluessig', 'trockn', 'natron', 'natrum', 'lauge', 'wasser'],
    reply:
      'Das Salzbad war ein grosses Geheimnis: 50 bis 70 Tage lang lag mein Körper in Natronlauge! Sie zog jedes kleine Tröpfchen Wasser heraus, damit der Körper nicht verfaulen konnte. Möchtest du wissen, womit man mich danach eingewickelt hat?',
  },
  {
    keywords: ['tuch', 'tuecher', 'bandage', 'binde', 'verband', 'wickel', 'klopapier', 'leinen', 'leine', 'streifen', 'einbalsam', 'amulett'],
    reply:
      'Nach dem Salzbad wurde mein Körper mit vielen Metern feinster Leinenstreifen umwickelt! Zwischen die Binden legten die Priester Amulette und Schmuck, die meine Seele beschützen sollten. Weisst du, welches Ritual ganz am Schluss kam?',
  },
  {
    keywords: ['mund', 'aufmach', 'oeffnung', 'oeffnig', 'ritual', 'priester', 'essen', 'trinken', 'sprechen'],
    reply:
      'Das Ritual der Mundöffnung war ein heiliger Moment: Ein Priester berührte meinen Mund mit besonderen Werkzeugen. So sollte ich im Jenseits wieder sprechen, essen und trinken können! Was glaubst du: Warum war das für die Ägypter so wichtig?',
  },
  {
    keywords: ['mumifiz', 'mumi', 'mumie', 'balsamier', 'schritt', 'ablauf'],
    reply:
      'Die Mumifizierung hatte sechs Schritte: Gehirn durch die Nase entfernen, Organe in die Kanopen, Myrrhe in den Bauch, 50 bis 70 Tage Natronlauge, Leinenstreifen umwickeln und zum Schluss die Mundöffnung. Über welchen Schritt möchtest du mehr wissen?',
  },
  {
    keywords: ['gehirn', 'hirn', 'nase', 'haken', 'staebchen', 'kopfinhalt'],
    reply:
      'Das Gehirn wurde mit einem feinen Stäbchen vorsichtig durch die Nase herausgezogen. Die Ägypter dachten, der Verstand sitze im Herzen, darum brauchte man das Gehirn im Jenseits nicht. Weisst du, wohin dafür die anderen Organe kamen?',
  },
  {
    keywords: ['arm', 'arme', 'reich', 'wuestensand', 'wueste', 'sand'],
    reply:
      'Nur Pharaonen und reiche Leute bekamen eine so teure Einbalsamierung! Arme Ägypter wurden im heissen Wüstensand vergraben, und weil der Sand so trocken war, blieben ihre Körper oft sogar besser erhalten. Erstaunlich, nicht wahr? Möchtest du wissen, wie es bei mir gemacht wurde?',
  },
  {
    keywords: ['tod', 'tot', 'gestorb', 'gstorb', 'sterb', 'todesursach', 'alt', 'alter', 'jahre', 'unfall', 'mord', 'schaedel'],
    reply:
      'Ich war noch sehr jung, als ich starb: höchstens 22 Jahre alt! Röntgenbilder zeigen einen Bruch an meinem Schädel. Forscher rätseln bis heute, ob es ein Unfall mit dem Streitwagen oder sogar ein Mord war. Was glaubst du?',
  },
  {
    keywords: ['fluch', 'verflucht', 'zeitung'],
    reply:
      'Der «Fluch des Pharao» ist eine Erfindung der Zeitungen nach Lord Carnarvons Tod! Ich bin gar nicht wütend, sondern freue mich über meinen ewigen Ruhm. Die meisten Forscher lebten danach noch viele Jahre. Möchtest du wissen, wer mein Grab gefunden hat?',
  },
  {
    keywords: ['entdeck', 'entdekt', 'carter', 'karter', 'howard', 'carnarvon', 'gefund', 'finden', '1922', 'grab', 'tal'],
    reply:
      'Am 26. November 1922 fanden Howard Carter und Lord Carnarvon nach fünf Jahren Suche mein Grab im Tal der Könige! Es war das einzige Königsgrab, das Grabräuber nicht geplündert hatten. Rate mal: Was lag wohl alles in meinem Grab?',
  },
];

const OFF_TOPIC_WORDS = ['fortnite', 'minecraft', 'playstation', 'game', 'zmittag', 'mittag', 'witz', 'mathe', 'auto', 'handy', 'tiktok', 'brawl', 'roblox', 'fussball', 'youtube'];

const UNCLEAR_REPLIES = [
  'Meine alten Ohren verstehen dieses Wort noch nicht ganz. Meinst du vielleicht meine Särge, die Krüge für meine Organe oder wie mein Körper getrocknet wurde?',
  'Hmm, diese Worte aus der Zukunft sind mir fremd. Möchtest du etwas über mein Grab, meine Totenmaske oder die Mumifizierung wissen?',
  'Das habe ich nicht ganz verstanden, junger Forscher. Kannst du es noch einmal anders sagen? Du kannst mich zum Beispiel fragen, was ich in den Händen halte oder wer mein Grab gefunden hat.',
];

export function fallbackReply(message: string): string {
  const words = normalize(message).split(' ').filter(Boolean);

  if (words.some((w) => OFF_TOPIC_WORDS.some((k) => wordMatches(w, k) && w.length >= k.length - 1))) {
    return 'Darüber weiss ein Pharao aus dem alten Ägypten nichts. Frage mich lieber über meine Pyramiden, mein Grab oder meine Mumie!';
  }

  let best: FallbackTopic | null = null;
  let bestScore = 0;
  for (const topic of FALLBACK_TOPICS) {
    const score = topic.keywords.filter((k) => words.some((w) => wordMatches(w, k))).length;
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  if (best) return best.reply;

  return UNCLEAR_REPLIES[words.join('').length % UNCLEAR_REPLIES.length];
}

// ------------------------------------------------------------------
// Chat
// ------------------------------------------------------------------

// Zuerst das neuere Modell, bei Fehler oder Verzögerung das stabile Alias.
export const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest'];

export async function handleChat(input: unknown, apiKey: string | undefined): Promise<ChatResult> {
  const { message, history = [] } = (input ?? {}) as { message?: unknown; history?: unknown };

  if (!message || typeof message !== 'string') {
    return { status: 400, body: { error: 'Nachricht ist erforderlich.' } };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { status: 400, body: { error: 'Deine Frage ist zu lang. Bitte stelle sie etwas kürzer.' } };
  }
  if (!apiKey) {
    return { status: 500, body: { error: 'GEMINI_API_KEY ist auf dem Server nicht konfiguriert.' } };
  }

  const ai = new GoogleGenAI({ apiKey });

  const safeHistory: HistoryEntry[] = Array.isArray(history)
    ? history.filter(
        (e): e is HistoryEntry =>
          !!e && typeof e.role === 'string' && typeof e.content === 'string',
      )
    : [];

  const formattedContents = safeHistory.slice(-MAX_HISTORY).map((entry) => ({
    role: entry.role === 'user' ? 'user' : 'model',
    parts: [{ text: entry.content.slice(0, 2000) }],
  }));
  // Gemini erwartet, dass das Gespräch mit dem Kind beginnt (Begrüssung weglassen).
  while (formattedContents.length && formattedContents[0].role !== 'user') formattedContents.shift();
  formattedContents.push({ role: 'user', parts: [{ text: message }] });

  const fetchWithTimeout = async (modelName: string, timeoutMs: number) => {
    const callPromise = ai.models.generateContent({
      model: modelName,
      contents: formattedContents,
      config: {
        systemInstruction: TUTANCHAMUN_SYSTEM_PROMPT,
        temperature: 0.6,
      },
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs),
    );
    return Promise.race([callPromise, timeoutPromise]);
  };

  let rawReply = '';
  let source = 'gemini';

  for (const [i, modelName] of CANDIDATE_MODELS.entries()) {
    try {
      const response = await fetchWithTimeout(modelName, i === 0 ? 12000 : 10000);
      rawReply = response.text || '';
      if (rawReply) break;
    } catch (err: any) {
      console.warn(`Model ${modelName} call failed or timed out:`, err?.message);
    }
  }

  // Kinderfreundliche Ersatzantworten, falls Gemini nicht antwortet
  if (!rawReply) {
    console.warn('Gemini hat nicht geantwortet – Ersatzantwort verwendet.');
    rawReply = fallbackReply(message);
    source = 'fallback';
  }

  // Schweizer Hochdeutsch: kein «ß»
  let cleanReply = rawReply.replace(/ß/g, 'ss').trim();
  if (!cleanReply) {
    cleanReply = 'Seid gegrüsst! Meine Stimme hallte durch die Jahrtausende. Frage mich nach meinen Geheimnissen!';
  }

  return { status: 200, body: { reply: cleanReply, source } };
}

// ------------------------------------------------------------------
// Prüfungs-Codewort (nur auf dem Server, damit es nicht im Browser-Code steht)
// Standard: das Lösungswort aus dem OneNote («schakal»).
// In Vercel mit EXAM_CODE änderbar, mehrere Wörter mit Komma trennen (z. B. «schakal,nil»).
// ------------------------------------------------------------------

export const DEFAULT_EXAM_CODES = 'schakal';

/** Stimmt das eingegebene Wort mit einem der erlaubten Codewörter überein? (Leerzeichen und Gross/klein egal) */
export function isValidExamCode(input: string, allowed: string | undefined): boolean {
  const clean = (v: string) => normalize(v).replace(/\s+/g, '');
  const given = clean(input);
  return !!given && (allowed || DEFAULT_EXAM_CODES).split(',').map(clean).filter(Boolean).includes(given);
}

export function checkExamCode(input: unknown, expected: string | undefined): ChatResult {
  const code = (input as { code?: unknown } | null)?.code;
  if (typeof code !== 'string' || code.length > 50) {
    return { status: 400, body: { error: 'Codewort fehlt.' } };
  }
  return { status: 200, body: { ok: isValidExamCode(code, expected) } };
}

// ------------------------------------------------------------------
// Status für die Lehrperson: Ist der Schlüssel gesetzt, sind die Modelle erreichbar?
// Kostet keine Antwort-Tokens (es werden nur Modell-Infos abgefragt).
// ------------------------------------------------------------------

export async function getStatus(apiKey: string | undefined): Promise<Record<string, string>> {
  const status: Record<string, string> = { schluessel: apiKey ? 'gesetzt' : 'FEHLT' };
  if (!apiKey) return status;
  const ai = new GoogleGenAI({ apiKey });
  for (const model of CANDIDATE_MODELS) {
    try {
      await ai.models.get({ model });
      status[model] = 'erreichbar';
    } catch (err: any) {
      status[model] = `Fehler: ${String(err?.message || err).slice(0, 160)}`;
    }
  }
  return status;
}
