/**
 * UI strings. The answer language follows the UI locale and is sent to the
 * backend as X-User-Lang; the backend translates last. Cited quotes, [keys],
 * and the linked English PDF remain ground truth in every language.
 */

export const STRINGS = {
  en: { ask:'Ask', ph:'Ask a clinical question\u2026', tag:'Consensus answers, cited and verified', eyebrow:'ICM consensus answer', sources:'Sources', copy:'Copy answer', copied:'Answer copied', hint:'Quotations are validated against the source records before display.', none:'No relevant documents found.', thinking:'Searching the proceedings\u2026', loeLabel:'Level of evidence', voteLabel:'Delegate agreement', tryLabel:'Try asking', clear:'Clear', failed:'Request failed.' },
  es: { ask:'Preguntar', ph:'Haz una pregunta cl\u00ednica\u2026', tag:'Respuestas de consenso, citadas y verificadas', eyebrow:'Respuesta de consenso ICM', sources:'Fuentes', copy:'Copiar respuesta', copied:'Respuesta copiada', hint:'Las citas se validan contra los registros originales antes de mostrarse.', none:'No se encontraron documentos relevantes.', thinking:'Buscando en las actas\u2026', loeLabel:'Nivel de evidencia', voteLabel:'Acuerdo de delegados', tryLabel:'Prueba a preguntar', clear:'Limpiar', failed:'La solicitud fall\u00f3.' },
  fr: { ask:'Demander', ph:'Posez une question clinique\u2026', tag:'R\u00e9ponses de consensus, cit\u00e9es et v\u00e9rifi\u00e9es', eyebrow:'R\u00e9ponse de consensus ICM', sources:'Sources', copy:'Copier la r\u00e9ponse', copied:'R\u00e9ponse copi\u00e9e', hint:'Les citations sont valid\u00e9es par rapport aux documents sources avant affichage.', none:'Aucun document pertinent trouv\u00e9.', thinking:'Recherche dans les actes\u2026', loeLabel:'Niveau de preuve', voteLabel:'Accord des d\u00e9l\u00e9gu\u00e9s', tryLabel:'Essayez de demander', clear:'Effacer', failed:'\u00c9chec de la requ\u00eate.' },
  de: { ask:'Fragen', ph:'Stellen Sie eine klinische Frage\u2026', tag:'Konsensantworten, zitiert und verifiziert', eyebrow:'ICM-Konsensantwort', sources:'Quellen', copy:'Antwort kopieren', copied:'Antwort kopiert', hint:'Zitate werden vor der Anzeige gegen die Quelldokumente validiert.', none:'Keine relevanten Dokumente gefunden.', thinking:'Durchsuche die Protokolle\u2026', loeLabel:'Evidenzgrad', voteLabel:'Delegiertenzustimmung', tryLabel:'Fragen Sie zum Beispiel', clear:'L\u00f6schen', failed:'Anfrage fehlgeschlagen.' },
  pt: { ask:'Perguntar', ph:'Fa\u00e7a uma pergunta cl\u00ednica\u2026', tag:'Respostas de consenso, citadas e verificadas', eyebrow:'Resposta de consenso ICM', sources:'Fontes', copy:'Copiar resposta', copied:'Resposta copiada', hint:'As cita\u00e7\u00f5es s\u00e3o validadas contra os registros originais antes da exibi\u00e7\u00e3o.', none:'Nenhum documento relevante encontrado.', thinking:'Pesquisando nos anais\u2026', loeLabel:'N\u00edvel de evid\u00eancia', voteLabel:'Concord\u00e2ncia dos delegados', tryLabel:'Experimente perguntar', clear:'Limpar', failed:'A solicita\u00e7\u00e3o falhou.' },
  it: { ask:'Chiedi', ph:'Fai una domanda clinica\u2026', tag:'Risposte di consenso, citate e verificate', eyebrow:'Risposta di consenso ICM', sources:'Fonti', copy:'Copia risposta', copied:'Risposta copiata', hint:'Le citazioni sono convalidate rispetto ai documenti originali prima della visualizzazione.', none:'Nessun documento pertinente trovato.', thinking:'Ricerca negli atti\u2026', loeLabel:'Livello di evidenza', voteLabel:'Accordo dei delegati', tryLabel:'Prova a chiedere', clear:'Cancella', failed:'Richiesta non riuscita.' },
  ar: { ask:'\u0627\u0633\u0623\u0644', ph:'\u0627\u0637\u0631\u062d \u0633\u0624\u0627\u0644\u064b\u0627 \u0637\u0628\u064a\u064b\u0627\u2026', tag:'\u0625\u062c\u0627\u0628\u0627\u062a \u0625\u062c\u0645\u0627\u0639\u064a\u0629\u060c \u0645\u0648\u062b\u0651\u0642\u0629 \u0648\u0645\u064f\u062a\u062d\u0642\u0651\u064e\u0642 \u0645\u0646\u0647\u0627', eyebrow:'\u0625\u062c\u0627\u0628\u0629 \u0625\u062c\u0645\u0627\u0639 ICM', sources:'\u0627\u0644\u0645\u0635\u0627\u062f\u0631', copy:'\u0646\u0633\u062e \u0627\u0644\u0625\u062c\u0627\u0628\u0629', copied:'\u062a\u0645 \u0646\u0633\u062e \u0627\u0644\u0625\u062c\u0627\u0628\u0629', hint:'\u064a\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0627\u0642\u062a\u0628\u0627\u0633\u0627\u062a \u0645\u0642\u0627\u0628\u0644 \u0627\u0644\u0633\u062c\u0644\u0627\u062a \u0627\u0644\u0623\u0635\u0644\u064a\u0629 \u0642\u0628\u0644 \u0627\u0644\u0639\u0631\u0636.', none:'\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0630\u0627\u062a \u0635\u0644\u0629.', thinking:'\u062c\u0627\u0631\u064d \u0627\u0644\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0648\u0642\u0627\u0626\u0639\u2026', loeLabel:'\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0644\u064a\u0644', voteLabel:'\u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0645\u0646\u062f\u0648\u0628\u064a\u0646', tryLabel:'\u062c\u0631\u0651\u0628 \u0623\u0646 \u062a\u0633\u0623\u0644', clear:'\u0645\u0633\u062d', failed:'\u0641\u0634\u0644 \u0627\u0644\u0637\u0644\u0628.' },
  zh: { ask:'\u63d0\u95ee', ph:'\u8bf7\u63d0\u51fa\u4e34\u5e8a\u95ee\u9898\u2026', tag:'\u5171\u8bc6\u7b54\u6848\uff0c\u9644\u5f15\u7528\u5e76\u7ecf\u9a8c\u8bc1', eyebrow:'ICM \u5171\u8bc6\u7b54\u6848', sources:'\u6765\u6e90', copy:'\u590d\u5236\u7b54\u6848', copied:'\u5df2\u590d\u5236\u7b54\u6848', hint:'\u5f15\u6587\u5728\u663e\u793a\u524d\u5df2\u4e0e\u539f\u59cb\u8bb0\u5f55\u6838\u5bf9\u3002', none:'\u672a\u627e\u5230\u76f8\u5173\u6587\u6863\u3002', thinking:'\u6b63\u5728\u68c0\u7d22\u4f1a\u8bae\u7eaa\u8981\u2026', loeLabel:'\u8bc1\u636e\u7b49\u7ea7', voteLabel:'\u4ee3\u8868\u4e00\u81f4\u7387', tryLabel:'\u8bd5\u7740\u63d0\u95ee', clear:'\u6e05\u9664', failed:'\u8bf7\u6c42\u5931\u8d25\u3002' },
};

export const MT_NOTE = {
  en:'Machine-translated \u2014 verify wording against the cited English source.',
  es:'Traducci\u00f3n autom\u00e1tica \u2014 verifique el texto con la fuente original en ingl\u00e9s citada.',
  fr:'Traduction automatique \u2014 v\u00e9rifiez le texte avec la source anglaise cit\u00e9e.',
  de:'Maschinell \u00fcbersetzt \u2014 Wortlaut mit der zitierten englischen Quelle abgleichen.',
  pt:'Tradu\u00e7\u00e3o autom\u00e1tica \u2014 verifique o texto com a fonte original em ingl\u00eas citada.',
  it:'Traduzione automatica \u2014 verificare il testo con la fonte inglese citata.',
  ar:'\u062a\u0631\u062c\u0645\u0629 \u0622\u0644\u064a\u0629 \u2014 \u064a\u064f\u0631\u062c\u0649 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0635\u064a\u0627\u063a\u0629 \u0645\u0642\u0627\u0628\u0644 \u0627\u0644\u0645\u0635\u062f\u0631 \u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a \u0627\u0644\u0645\u064f\u0633\u062a\u0634\u0647\u062f \u0628\u0647.',
  zh:'\u673a\u5668\u7ffb\u8bd1 \u2014 \u8bf7\u5bf9\u7167\u6240\u5f15\u7528\u7684\u82f1\u6587\u539f\u6587\u6838\u5bf9\u63aa\u8f9e\u3002',
};

export const RTL_LANGS = new Set(['ar', 'he', 'fa', 'ur']);

/** Browser locale -> supported base language tag. */
export function detectLang(explicit) {
  const raw = explicit
    || (typeof navigator !== 'undefined'
        && ((navigator.languages && navigator.languages[0]) || navigator.language))
    || 'en';
  return String(raw).toLowerCase().split('-')[0];
}

export function stringsFor(lang) {
  return STRINGS[lang] || STRINGS.en;
}

export function mtNoteFor(lang) {
  return MT_NOTE[lang] || MT_NOTE.en;
}

/**
 * First-run example questions. A blank search box is a bounce risk: new users
 * often don't know what the corpus covers. These demonstrate scope (DAIR,
 * two-stage revision, VTE prophylaxis) and produce well-cited answers.
 */
export const EXAMPLES = {
  en: ['When is DAIR appropriate for acute PJI?', 'How long should antibiotics continue after two-stage revision?', 'Is aspirin adequate for VTE prophylaxis after TKA?'],
  es: ['\u00bfCu\u00e1ndo es apropiado el DAIR en una IAP aguda?', '\u00bfCu\u00e1nto tiempo deben continuar los antibi\u00f3ticos tras una revisi\u00f3n en dos tiempos?', '\u00bfEs suficiente la aspirina como profilaxis de ETV tras una ATR?'],
  fr: ['Quand le DAIR est-il indiqu\u00e9 dans une IAP aigu\u00eb\u202f?', "Combien de temps poursuivre l'antibioth\u00e9rapie apr\u00e8s une r\u00e9vision en deux temps\u202f?", "L'aspirine suffit-elle en pr\u00e9vention de la MTEV apr\u00e8s PTG\u202f?"],
  de: ['Wann ist DAIR bei akuter Protheseninfektion angezeigt?', 'Wie lange sollte die Antibiotikatherapie nach zweizeitigem Wechsel fortgesetzt werden?', 'Reicht Aspirin zur VTE-Prophylaxe nach Knie-TEP aus?'],
  pt: ['Quando o DAIR \u00e9 apropriado na IAP aguda?', 'Por quanto tempo manter os antibi\u00f3ticos ap\u00f3s revis\u00e3o em dois tempos?', 'A aspirina \u00e9 suficiente para profilaxia de TEV ap\u00f3s ATJ?'],
  it: ['Quando \u00e8 indicato il DAIR nella IAP acuta?', 'Per quanto tempo continuare gli antibiotici dopo una revisione in due tempi?', "L'aspirina \u00e8 sufficiente per la profilassi del TEV dopo PTG?"],
  ar: ['\u0645\u062a\u0649 \u064a\u0643\u0648\u0646 DAIR \u0645\u0646\u0627\u0633\u0628\u064b\u0627 \u0644\u0639\u062f\u0648\u0649 \u0627\u0644\u0645\u0641\u0635\u0644 \u0627\u0644\u0635\u0646\u0627\u0639\u064a \u0627\u0644\u062d\u0627\u062f\u0629\u061f', '\u0643\u0645 \u062a\u0633\u062a\u0645\u0631 \u0627\u0644\u0645\u0636\u0627\u062f\u0627\u062a \u0627\u0644\u062d\u064a\u0648\u064a\u0629 \u0628\u0639\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0639\u0644\u0649 \u0645\u0631\u062d\u0644\u062a\u064a\u0646\u061f', '\u0647\u0644 \u0627\u0644\u0623\u0633\u0628\u0631\u064a\u0646 \u0643\u0627\u0641\u064d \u0644\u0644\u0648\u0642\u0627\u064a\u0629 \u0645\u0646 \u0627\u0644\u062c\u0644\u0637\u0627\u062a \u0628\u0639\u062f \u0627\u0633\u062a\u0628\u062f\u0627\u0644 \u0627\u0644\u0631\u0643\u0628\u0629\u061f'],
  zh: ['\u6025\u6027\u5047\u4f53\u5468\u56f4\u611f\u67d3\u4f55\u65f6\u9002\u5408 DAIR\uff1f', '\u4e8c\u671f\u7ffb\u4fee\u540e\u6297\u751f\u7d20\u5e94\u6301\u7eed\u591a\u4e45\uff1f', '\u5168\u819d\u5173\u8282\u7f6e\u6362\u540e\u963f\u53f8\u5339\u6797\u80fd\u5426\u6ee1\u8db3 VTE \u9884\u9632\uff1f'],
};

export function examplesFor(lang) {
  return EXAMPLES[lang] || EXAMPLES.en;
}
