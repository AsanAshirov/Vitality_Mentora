// tts.ts — Web Speech API TTS with async voice loading
// RU/EN work well; UZ falls back to RU (uz-UZ voices rarely exist in browsers)

// Language preference chains: try each code until voices found
const LANG_CHAIN: Record<string, string[]> = {
  RU: ['ru-RU', 'ru'],
  EN: ['en-US', 'en-GB', 'en'],
  UZ: ['uz-UZ', 'uz', 'ru-RU', 'ru'],
}

// Higher index = higher quality (we prefer these in voice names)
const QUALITY_KEYWORDS = ['Natural', 'Neural', 'Online', 'Wavenet', 'Premium', 'Enhanced']

let voicesReady: SpeechSynthesisVoice[] = []

function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    const immediate = window.speechSynthesis.getVoices()
    if (immediate.length > 0) {
      voicesReady = immediate
      resolve(immediate)
      return
    }
    const handler = () => {
      voicesReady = window.speechSynthesis.getVoices()
      resolve(voicesReady)
    }
    window.speechSynthesis.addEventListener('voiceschanged', handler, { once: true })
    setTimeout(() => {
      voicesReady = window.speechSynthesis.getVoices()
      resolve(voicesReady)
    }, 1200)
  })
}

// Pre-load voices as soon as possible
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getVoicesAsync().catch(() => {})
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: 'RU' | 'UZ' | 'EN'): SpeechSynthesisVoice | null {
  const chain = LANG_CHAIN[lang] ?? LANG_CHAIN.RU
  for (const code of chain) {
    const prefix = code.slice(0, 2)
    const matching = voices.filter(v => v.lang === code || v.lang.startsWith(prefix + '-') || v.lang === prefix)
    if (matching.length === 0) continue

    // Sort: online/natural voices first, then local
    const scored = matching
      .map(v => {
        const qi = QUALITY_KEYWORDS.findIndex(k => v.name.includes(k))
        return { voice: v, score: qi === -1 ? 99 : qi }
      })
      .sort((a, b) => a.score - b.score)

    return scored[0].voice
  }
  return voices[0] ?? null
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function speak(text: string, lang: 'RU' | 'UZ' | 'EN' = 'RU'): Promise<void> {
  if (!text.trim() || !('speechSynthesis' in window)) return

  const clean = text.replace(/<[^>]+>/g, '').trim().slice(0, 600)

  window.speechSynthesis.cancel()

  const voices = voicesReady.length > 0 ? voicesReady : await getVoicesAsync()
  const voice = pickVoice(voices, lang)

  const utt = new SpeechSynthesisUtterance(clean)
  // Use detected voice lang, or fall back to RU for UZ (no UZ voices in most browsers)
  utt.lang = voice?.lang ?? (lang === 'EN' ? 'en-US' : 'ru-RU')
  utt.rate = 1.0
  utt.pitch = 1.05
  utt.volume = 0.9
  if (voice) utt.voice = voice

  window.speechSynthesis.speak(utt)

  // Chrome bug: long utterances stop mid-way — keep synthesis alive
  const keepAlive = setInterval(() => {
    if (!window.speechSynthesis.speaking) {
      clearInterval(keepAlive)
      return
    }
    window.speechSynthesis.pause()
    window.speechSynthesis.resume()
  }, 10_000)

  utt.onend = () => clearInterval(keepAlive)
  utt.onerror = () => clearInterval(keepAlive)
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

export function isSpeaking(): boolean {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking
}
