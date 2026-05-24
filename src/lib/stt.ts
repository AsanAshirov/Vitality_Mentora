// stt.ts — Web Speech API STT wrapper (RU/UZ/EN)
// Falls back gracefully if browser doesn't support it

const LANG_MAP: Record<string, string> = {
  RU: 'ru-RU',
  UZ: 'uz-UZ',
  EN: 'en-US',
}

type SpeechRecognitionEvent = {
  results: { [i: number]: { [j: number]: { transcript: string } } }
}

type SR = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

function getSR(): (new () => SR) | null {
  const w = window as unknown as Record<string, unknown>
  return (w['SpeechRecognition'] as (new () => SR) | undefined)
    ?? (w['webkitSpeechRecognition'] as (new () => SR) | undefined)
    ?? null
}

export function isSTTSupported(): boolean {
  return getSR() !== null
}

export function startListening(
  lang: 'RU' | 'UZ' | 'EN',
  onResult: (text: string) => void,
  onEnd: () => void,
  onError?: (err: string) => void,
): () => void {
  const SRClass = getSR()
  if (!SRClass) {
    onError?.('STT not supported in this browser')
    onEnd()
    return () => {}
  }

  const sr = new SRClass()
  sr.lang = LANG_MAP[lang] ?? 'ru-RU'
  sr.continuous = false
  sr.interimResults = false
  sr.maxAlternatives = 1

  sr.onresult = (e) => {
    const text = e.results[0]?.[0]?.transcript ?? ''
    if (text.trim()) onResult(text.trim())
  }
  sr.onerror = (e) => {
    onError?.(e.error)
    onEnd()
  }
  sr.onend = onEnd

  sr.start()
  return () => { try { sr.abort() } catch { /* noop */ } }
}
