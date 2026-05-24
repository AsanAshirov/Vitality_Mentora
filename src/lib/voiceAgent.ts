// voiceAgent.ts — PTT → keyword extract → AI stream → sentence-by-sentence TTS
import { useClickyStore } from '../store/clickyStore'
import { extractTarget } from './keywordMap'
import { streamGeminiAnswer } from './gemini'
import { speak, stopSpeaking } from './tts'

const VOICE_INSTRUCTION: Record<string, string> = {
  RU: 'РЕЖИМ ГОЛОСА: отвечай максимум 2–3 предложения. Без списков, без markdown, только обычная речь.',
  UZ: 'OVOZ REJIMI: maksimal 2-3 jumlada javob ber. Ro\'yxatsiz, markdownsiz, faqat oddiy nutq.',
  EN: 'VOICE MODE: answer in 2–3 sentences max. No bullet points, no markdown, plain speech only.',
}

let dismissTimer: ReturnType<typeof setTimeout> | null = null
let cancelled = false

function nextSentenceEnd(text: string, from: number): number {
  for (let i = from; i < text.length; i++) {
    if ('.!?'.includes(text[i])) {
      // skip ellipsis
      if (text[i] === '.' && text[i + 1] === '.' ) continue
      return i + 1
    }
  }
  return -1
}

export async function processVoiceInput(
  speech: string,
  lang: 'RU' | 'UZ' | 'EN',
): Promise<void> {
  cancelled = false
  const store = useClickyStore.getState()

  // Highlight immediately
  const target = extractTarget(speech)
  store.setTarget(target)
  store.setActive(true)
  store.setBubble('', true)

  if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null }

  const docContext = VOICE_INSTRUCTION[lang]
  let accumulated = ''
  let spokeTo = 0

  await streamGeminiAnswer(
    speech,
    lang,
    // onChunk
    (chunk) => {
      if (cancelled) return
      accumulated += chunk
      useClickyStore.getState().setBubble(accumulated, true)

      // Speak completed sentences in real-time
      let end: number
      while ((end = nextSentenceEnd(accumulated, spokeTo)) !== -1) {
        const sentence = accumulated.slice(spokeTo, end).trim()
        spokeTo = end
        if (sentence) speak(sentence, lang).catch(() => {})
      }
    },
    // onDone
    (fullText) => {
      if (cancelled) return
      // Speak any remaining fragment
      const remaining = fullText.slice(spokeTo).trim()
      if (remaining) speak(remaining, lang).catch(() => {})
      useClickyStore.getState().setBubble(fullText, false)
      // Auto-dismiss after 6s
      dismissTimer = setTimeout(() => {
        useClickyStore.getState().dismiss()
        dismissTimer = null
      }, 6000)
    },
    // onError
    (_err) => {
      if (cancelled) return
      useClickyStore.getState().setBubble('', false)
      useClickyStore.getState().dismiss()
    },
    docContext,
  )
}

export function cancelVoiceAgent(): void {
  cancelled = true
  stopSpeaking()
  if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null }
  useClickyStore.getState().dismiss()
}
