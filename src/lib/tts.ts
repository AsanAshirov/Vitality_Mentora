// tts.ts — Web Speech API TTS with quality-sorted voice selection and language fallback

const LANG_CHAIN: Record<string, string[]> = {
  RU: ['ru-RU', 'ru'],
  EN: ['en-US', 'en-GB', 'en'],
  UZ: ['uz-UZ', 'uz', 'ru-RU', 'ru'],
}

const QUALITY_KEYWORDS = ['Natural', 'Neural', 'Online', 'Wavenet', 'Premium', 'Enhanced']

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name
  return QUALITY_KEYWORDS.reduce((s, kw) => s + (name.includes(kw) ? 1 : 0), 0)
}

function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices()
    if (voices.length > 0) { resolve(voices); return }
    const handler = () => { resolve(speechSynthesis.getVoices()) }
    speechSynthesis.addEventListener('voiceschanged', handler, { once: true })
    setTimeout(() => { resolve(speechSynthesis.getVoices()) }, 1200)
  })
}

let keepAliveTimer: ReturnType<typeof setInterval> | null = null

function startKeepAlive() {
  stopKeepAlive()
  keepAliveTimer = setInterval(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause()
      speechSynthesis.resume()
    }
  }, 10000)
}

function stopKeepAlive() {
  if (keepAliveTimer !== null) { clearInterval(keepAliveTimer); keepAliveTimer = null }
}

export async function speak(text: string, lang = 'RU'): Promise<void> {
  if (!text.trim() || typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  stopKeepAlive()

  const voices = await getVoicesAsync()
  const chain = LANG_CHAIN[lang] ?? LANG_CHAIN.RU

  let chosen: SpeechSynthesisVoice | null = null
  for (const locale of chain) {
    const candidates = voices.filter(v => v.lang.startsWith(locale.split('-')[0]))
    const localeMatch = candidates.filter(v => v.lang === locale)
    const pool = localeMatch.length > 0 ? localeMatch : candidates
    if (pool.length > 0) {
      chosen = pool.sort((a, b) => scoreVoice(b) - scoreVoice(a))[0]
      break
    }
  }

  return new Promise((resolve) => {
    const utt = new SpeechSynthesisUtterance(text)
    if (chosen) utt.voice = chosen
    utt.lang = chosen?.lang ?? (LANG_CHAIN[lang]?.[0] ?? 'ru-RU')
    utt.rate = 1.0
    utt.pitch = 1.0
    utt.volume = 1.0
    utt.onend = () => { stopKeepAlive(); resolve() }
    utt.onerror = () => { stopKeepAlive(); resolve() }
    startKeepAlive()
    speechSynthesis.speak(utt)
  })
}

export function stopSpeaking(): void {
  stopKeepAlive()
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}

export function isSpeaking(): boolean {
  return typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking
}
