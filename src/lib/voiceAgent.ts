// voiceAgent.ts — PTT speech → AI answer → real-time TTS + Clicky highlight
import { streamGeminiAnswer } from './gemini'
import { speak, stopSpeaking } from './tts'
import { extractTarget } from './keywordMap'
import { useClickyStore } from '../store/clickyStore'

// Instruction prepended as docContext to make Gemini answer concisely for voice
const VOICE_INSTRUCTION: Record<string, string> = {
  RU: 'РЕЖИМ ГОЛОСА: отвечай максимум 2–3 предложения. Без списков, без markdown, только обычная речь.',
  UZ: "OVOZ REJIMI: maksimal 2-3 jumlada javob ber. Ro'yxatlarsiz, oddiy nutq.",
  EN: 'VOICE MODE: answer in 2–3 sentences max. No bullet points, no markdown, plain speech only.',
}

// Detect sentence boundary: .!? followed by space/end
function nextSentenceEnd(text: string, from: number): number {
  for (let i = from; i < text.length; i++) {
    if ('.!?'.includes(text[i])) {
      if (i + 1 >= text.length || text[i + 1] === ' ' || text[i + 1] === '\n') {
        return i + 1
      }
    }
  }
  return -1
}

let dismissTimer: ReturnType<typeof setTimeout> | null = null

function clearDismissTimer() {
  if (dismissTimer !== null) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}

export async function processVoiceInput(
  speech: string,
  lang: 'RU' | 'UZ' | 'EN',
): Promise<void> {
  const store = useClickyStore.getState()

  // Cancel any previous session
  clearDismissTimer()
  stopSpeaking()
  store.dismiss()

  // 1. Keyword → target (highlights immediately)
  const target = extractTarget(speech)
  store.setTarget(target)
  store.setActive(true)
  store.setBubble('', true)

  let accumulated = ''
  let spokenUpTo = 0

  const speakPendingSentences = () => {
    let end = nextSentenceEnd(accumulated, spokenUpTo)
    while (end !== -1) {
      const sentence = accumulated.slice(spokenUpTo, end).trim()
      if (sentence.length > 4) {
        speak(sentence, lang).catch(() => {})
      }
      spokenUpTo = end
      // skip leading space
      if (spokenUpTo < accumulated.length && accumulated[spokenUpTo] === ' ') spokenUpTo++
      end = nextSentenceEnd(accumulated, spokenUpTo)
    }
  }

  // 2. Stream AI answer with voice instruction injected as docContext
  await streamGeminiAnswer(
    speech,
    lang,
    (chunk) => {
      accumulated += chunk
      useClickyStore.getState().setBubble(accumulated, true)
      speakPendingSentences()
    },
    (fullText) => {
      // Speak any remaining fragment
      const remaining = fullText.slice(spokenUpTo).trim()
      if (remaining.length > 4) {
        speak(remaining, lang).catch(() => {})
      }
      useClickyStore.getState().setBubble(fullText, false)
      // Auto-dismiss 6s after done
      dismissTimer = setTimeout(() => {
        stopSpeaking()
        useClickyStore.getState().dismiss()
      }, 6000)
    },
    () => {
      // On error: still dismiss gracefully
      useClickyStore.getState().setBubble(
        lang === 'RU' ? 'Не удалось получить ответ.' :
        lang === 'UZ' ? 'Javob olishda xatolik.' :
        'Could not get a response.',
        false,
      )
      dismissTimer = setTimeout(() => {
        useClickyStore.getState().dismiss()
      }, 4000)
    },
    VOICE_INSTRUCTION[lang],
  )
}

export function cancelVoiceAgent(): void {
  clearDismissTimer()
  stopSpeaking()
  useClickyStore.getState().dismiss()
}
