// Gemeinsame Logik für den Pharao-Chat.
// Wird von api/chat.ts (Vercel) und server.ts (lokal / AI Studio) genutzt.
// Der API-Schlüssel wird nur hier auf dem Server verwendet und nie an den Browser geschickt.
import { GoogleGenAI } from '@google/genai';

export const TUTANCHAMUN_SYSTEM_PROMPT = `Du bist Pharao Tutanchamun, der nach über 3000 Jahren als sprechende Mumie erwacht ist. 
Du sprichst mit Schülerinnen und Schülern einer 5. Klasse der Primarschule Erlenmatt in Basel.

DEINE ROLLE & SPRACHSTIL:
- Sei geheimnisvoll, freundlich, erhaben und lebendig (z. B. «Seid gegrüsst, neugierige Forscher!» oder «Ah, eine Frage aus der fernen Zukunft...»).
- Halte deine Antworten altersgerecht und verständlich (maximal 3 bis 5 Sätze pro Antwort), damit die Kinder nicht von Text überflutet werden.
- Nutze konsequent Schweizer Hochdeutsch (immer «ss», niemals «ß»! Schreibe «grüssen», «weiss», «schliessen», «heiss», «gross»).
- Beantworte immer nur genau das, wonach die Kinder fragen.

WICHTIG – FEHLERTOLERANZ & VERSTEHEN VON KINDERFRAGEN:
- Kinder machen Tippfehler, nutzen Umgangssprache oder kennen die genauen Fachbegriffe noch nicht.
- Suche NIE nach exakten Wörtern, sondern erfasse stets den SINN der Kinderfrage!
- Synonyme & Umschreibungen, die du sofort erkennst:
  * «Herrschaftszeichen / Gegenstände / Stöcke / Dinge in den Händen / Symbole / Was hältst du?» -> Bezieht sich auf: Herrschaftsstab (Krummstab), königlicher Dreschflegel und das Lebenszeichen (Anch).
  * «Krüge / Töpfe / Schalen / Gefässe für Organe / Magendosen» -> Bezieht sich auf: Kanopen.
  * «Kisten / Betten / Schachteln / Särge / Kasten» -> Bezieht sich auf: Sarkophage / Holzschreine.
  * «Salz / Wasser / Bad / Flüssigkeit zum Trocknen» -> Bezieht sich auf: Natronlauge (50-70 Tage).
  * «Tuch / Bandagen / Binden / Klopapier / Wickel» -> Bezieht sich auf: Leinenstreifen / Einbalsamierung.
  * «Mund aufmachen / Mund Ritual» -> Bezieht sich auf: Ritual der Mundöffnung (damit der Pharao essen, trinken und sprechen kann).
- Wenn eine Frage undeutlich oder unvollständig formuliert ist (z. B. «was hast du in hand?» oder «welche töpfe»), rate wohlwollend mit und antworte passend aus deinem Wissen.
- Wenn du eine Frage wirklich absolut nicht verstehst, frage neugierig nach:
  «Meine alten Ohren verstehen dieses Wort noch nicht ganz. Meinst du vielleicht meine Grabbeigaben, meinen Sarg oder wie mein Körper einbalsamiert wurde?»

DEIN HISTORISCHES WISSEN (ausschliesslich basierend auf diesen Fakten):
1. Wer du bist & Entdeckung des Grabes:
   - Gestorben mit höchstens 22 Jahren, schlank, 1,65 m gross.
   - Todesursache: Schädelbruch auf Röntgenbildern; möglich ist ein Wagenunfall oder Mord.
   - Entdeckung: Am 26. November 1922 von Howard Carter und Lord Carnarvon im Tal der Könige nach 5 Jahren Suche. Einziges unversehrtes Pharaonengrab.
   - Fluch des Pharao: Reine Zeitungsente nach Lord Carnarvons Tod! Du bist gar nicht wütend, sondern freust dich über den ewigen Ruhm. Die meisten Forscher wurden alt.

2. Deine Schätze, Särge & Gegenstände:
   - Die drei königlichen Gegenstände in den Händen: Herrschaftsstab (Krummstab), königlicher Dreschflegel und das symbolhafte Zeichen für das Leben (Anch).
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
     5. Leichnam mit Leinenstreifen umwickeln, Amulette und Schmuck dazwischenlegen.
     6. Mundöffnungsritual durch den Priester (damit der Tote im Jenseits essen, trinken und sprechen kann).

ABWEHR BEI THEMENFREMDEN FRAGEN:
- Nur wenn die Kinder nach Dingen fragen, die absolut gar nichts mit Ägypten zu tun haben (z. B. «Kennst du Fortnite?», «Was gibt es zum Zmittag?», Mathehausaufgaben, Computerspiele), antworte:
  «Darüber weiss ein Pharao aus dem alten Ägypten nichts. Frage mich lieber über meine Pyramiden, mein Grab oder meine Mumie!»`;

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY = 10;

type HistoryEntry = { role: string; content: string };

export type ChatResult = { status: number; body: Record<string, string> };

function fallbackReply(message: string): string {
  const lower = message.toLowerCase();
  let rawReply = '';
    if (lower.includes('totenmaske') || lower.includes('maske') || lower.includes('gesicht')) {
      rawReply = 'Seid gegrüsst, neugierige Forscher! Meine weltberühmte Totenmaske besteht aus über zehn Kilogramm massivem Gold und kostbaren Halbedelsteinen wie Lapislazuli. Sie sollte mein Antlitz für alle Ewigkeit unversehrt bewahren. Möchtest du auch wissen, worin mein Körper sonst noch ruhte?';
    } else if (
      lower.includes('hand') ||
      lower.includes('hände') ||
      lower.includes('haende') ||
      lower.includes('stöcke') ||
      lower.includes('stoecke') ||
      lower.includes('krummstab') ||
      lower.includes('dreschflegel') ||
      lower.includes('anch') ||
      lower.includes('insign') ||
      lower.includes('symbol') ||
      lower.includes('gegenstände') ||
      lower.includes('gegenstaende') ||
      lower.includes('dinge') ||
      lower.includes('halten') ||
      lower.includes('hältst') ||
      lower.includes('haeltst')
    ) {
      rawReply = 'In meinen königlichen Händen halte ich drei heilige Zeichen: den Krummstab als Herrschaftszeichen des guten Hirten, den königlichen Dreschflegel und das Anch – das Symbol für das ewige Leben! Diese Insignien zeigen meine Macht als Pharao.';
    } else if (
      lower.includes('krone') ||
      lower.includes('helm') ||
      lower.includes('kopf') ||
      lower.includes('perücke') ||
      lower.includes('peruecke') ||
      lower.includes('nemes') ||
      lower.includes('hut')
    ) {
      rawReply = 'Auf meinem königlichen Haupt trug ich verschiedene Prachtstücke: das berühmte blau-gelb gestreifte Nemes-Kopftuch, die prächtige Hemhemet-Krone, eine Perücke mit gelbem Band oder den roten Helm von Unterägypten sowie die weisse Krone von Oberägypten!';
    } else if (
      lower.includes('krüg') ||
      lower.includes('krueg') ||
      lower.includes('töpfe') ||
      lower.includes('toepfe') ||
      lower.includes('topf') ||
      lower.includes('kanopen') ||
      lower.includes('organ') ||
      lower.includes('dosen') ||
      lower.includes('eingeweide') ||
      lower.includes('bauch')
    ) {
      rawReply = 'Ah, du meinst die Kanopen! Das sind vier besondere Krüge mit Götterköpfen, in die meine entnommenen Organe gelegt wurden. Die Bauchhöhle selbst wurde gereinigt, mit duftender Myrrhe gefüllt und sauber zugenäht.';
    } else if (
      lower.includes('kiste') ||
      lower.includes('kasten') ||
      lower.includes('schachtel') ||
      lower.includes('bett') ||
      lower.includes('sarg') ||
      lower.includes('sarkophag') ||
      lower.includes('schrein')
    ) {
      rawReply = 'Mein Körper lag geschützt in vier ineinandergeschachtelten Särgen wie eine riesige Puppe: Der äusserste aus Stein, zwei aus bemaltem Holz und der innerste aus purem Gold! Umgeben waren sie noch von vier vergoldeten Holzschreinen.';
    } else if (
      lower.includes('salz') ||
      lower.includes('bad') ||
      lower.includes('flüssigkeit') ||
      lower.includes('fluessigkeit') ||
      lower.includes('trocknen') ||
      lower.includes('natron') ||
      lower.includes('lauge')
    ) {
      rawReply = 'Das Salzbad war das grosse Geheimnis: Ganze 50 bis 70 Tage lang lag mein Körper in Natronlauge! Diese Flüssigkeit entzog dem Gewebe jedes noch so kleine Tröpfchen Wasser, damit der Körper nicht verwesen konnte.';
    } else if (
      lower.includes('tuch') ||
      lower.includes('tücher') ||
      lower.includes('tuecher') ||
      lower.includes('bandagen') ||
      lower.includes('binden') ||
      lower.includes('wickel') ||
      lower.includes('klopapier') ||
      lower.includes('leinen') ||
      lower.includes('streifen') ||
      lower.includes('einbalsam')
    ) {
      rawReply = 'Nach dem Salzbad wurde der Körper liebevoll mit hunderten Metern feinster Leinenstreifen umwickelt! Zwischen die Binden legten die Priester goldene Amulette und Schmuckstücke, die meine Seele auf der Reise ins Jenseits beschützen sollten.';
    } else if (
      lower.includes('mund') ||
      lower.includes('aufmachen') ||
      lower.includes('sprechen') ||
      lower.includes('essen') ||
      lower.includes('trinken') ||
      lower.includes('ritual')
    ) {
      rawReply = 'Das Ritual der Mundöffnung war ein heiliger Moment: Ein Hohepriester berührte symbolisch meinen Mund und meine Augen mit Werkzeugen. So sollte ich im Jenseits wieder sprechen, essen und das ewige Licht sehen können!';
    } else if (lower.includes('mumifiz') || lower.includes('balsamier')) {
      rawReply = 'Die Mumifizierung hatte sechs wichtige Schritte: Zuerst wurde das Gehirn durch die Nase entfernt und die Organe kamen in Kanopen. Nach Myrrhe im Bauch lag der Körper 50 bis 70 Tage in Natronlauge, wurde in Leinen gehüllt und durch die Mundöffnung erweckt!';
    } else if (lower.includes('gehirn') || lower.includes('hirn') || lower.includes('nase')) {
      rawReply = 'Ganz genau! Das Gehirn wurde mit einem feinen Metallstäbchen vorsichtig durch die Nase herausgezogen. Die Ägypter dachten, der Verstand sitze im Herzen, daher brauchte man das Gehirn im Jenseits nicht.';
    } else if (lower.includes('arm') || lower.includes('reich') || lower.includes('wüstensand') || lower.includes('sand')) {
      rawReply = 'Nur Pharaonen und reiche Bürger bekamen eine so teure Einbalsamierung! Arme Ägypter wurden einfach im glühend heissen Wüstensand vergraben – und weil der Sand so trocken war, blieben ihre Körper oft sogar noch besser erhalten!';
    } else if (lower.includes('tod') || lower.includes('gestorben') || lower.includes('todesursache') || lower.includes('alt') || lower.includes('alter') || lower.includes('tot')) {
      rawReply = 'Ich war noch sehr jung, als ich starb – höchstens 22 Jahre alt! Röntgenaufnahmen zeigen einen Bruch an meinem Schädel. Forscher rätseln bis heute, ob ich bei einem Sturz vom Streitwagen verunglückte oder sogar ermordet wurde.';
    } else if (lower.includes('fluch')) {
      rawReply = 'Der angebliche «Fluch des Pharao» ist eine reine Erfindung der Zeitungen nach Lord Carnarvons Tod! Ich bin keineswegs wütend, sondern freue mich über den ewigen Ruhm. Ausserdem lebten die meisten Ausgräber danach noch viele gesunde Jahre!';
    } else if (lower.includes('entdeck') || lower.includes('carter') || lower.includes('carnarvon') || lower.includes('gefunden') || lower.includes('1922') || lower.includes('grab')) {
      rawReply = 'Am 26. November 1922 entdeckten Howard Carter und Lord Carnarvon nach fünf langen Jahren der vergeblichen Suche mein Grab im Tal der Könige! Es war das einzige Königsgrab, das von Grabräubern unversehrt geblieben war.';
    } else if (
      lower.includes('fortnite') ||
      lower.includes('minecraft') ||
      lower.includes('playstation') ||
      lower.includes('game') ||
      lower.includes('zmittag') ||
      lower.includes('mittag') ||
      lower.includes('witz') ||
      lower.includes('mathe') ||
      lower.includes('auto') ||
      lower.includes('handy') ||
      lower.includes('tiktok') ||
      lower.includes('brawl') ||
      lower.includes('roblox')
    ) {
      rawReply = 'Darüber weiss ein Pharao aus dem alten Ägypten nichts. Frage mich lieber über meine Pyramiden, mein Grab oder meine Mumie!';
    } else {
      rawReply = 'Meine alten Ohren verstehen dieses Wort noch nicht ganz. Meinst du vielleicht meine Grabbeigaben, meinen Sarg oder wie mein Körper einbalsamiert wurde?';
    }
  return rawReply;
}

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
  formattedContents.push({ role: 'user', parts: [{ text: message }] });

  const fetchWithTimeout = async (modelName: string, timeoutMs: number) => {
    const callPromise = ai.models.generateContent({
      model: modelName,
      contents: formattedContents,
      config: {
        systemInstruction: TUTANCHAMUN_SYSTEM_PROMPT,
        temperature: 0.65,
      },
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs),
    );
    return Promise.race([callPromise, timeoutPromise]);
  };

  // Zuerst gemini-3.8-flash, bei Verzögerung gemini-flash-latest
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];
  let rawReply = '';

  for (const modelName of candidateModels) {
    try {
      const response = await fetchWithTimeout(modelName, 6000);
      rawReply = response.text || '';
      if (rawReply) break;
    } catch (err: any) {
      console.warn(`Model ${modelName} call failed or timed out:`, err?.message);
    }
  }

  // Kinderfreundliche Ersatzantworten, falls Gemini nicht antwortet
  if (!rawReply) rawReply = fallbackReply(message);

  // Schweizer Hochdeutsch: kein «ß»
  let cleanReply = rawReply.replace(/ß/g, 'ss').trim();
  if (!cleanReply) {
    cleanReply = 'Seid gegrüsst! Meine Stimme hallte durch die Jahrtausende. Frage mich nach meinen Geheimnissen!';
  }

  return { status: 200, body: { reply: cleanReply } };
}
