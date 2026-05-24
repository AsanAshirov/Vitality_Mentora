// stt.ts — Web Speech API STT (RU/EN reliable; UZ falls back to RU)

// Try each locale in order until one succeeds
const LANG_CHAIN: Record<string, string[]> = {
  RU: ['ru-RU'],
  EN: ['en-US'],
  UZ: ['uz-UZ', 'ru-RU'],
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

function getSRClass(): (new () => SR) | null {
  const w = window as unknown as Record<string, unknown>
  return (w['SpeechRecognition'] as (new () => SR) | undefined)
    ?? (w['webkitSpeechRecognition'] as (new () => SR) | undefined)
    ?? null
}

export function isSTTSupported(): boolean {
  return getSRClass() !== null
}

function attemptListen(
  SRClass: new () => SR,
  chain: string[],
  onResult: (text: string) => void,
  onEnd: () => void,
  onError?: (err: string) => void,
  idx = 0,
): () => void {
  const sr = new SRClass()
  sr.lang = chain[idx]
  sr.continuous = false
  sr.interimResults = false
  sr.maxAlternatives = 1

  let done = false

  sr.onresult = (e) => {
    const text = e.results[0]?.[0]?.transcript?.trim() ?? ''
    if (text) onResult(text)
  }

  sr.onerror = (e) => {
    if (done) return
    // language-not-supported or network → try next locale in chain
    if (
      (e.error === 'language-not-supported' || e.error === 'network') &&
      idx + 1 < chain.length
    ) {
      attemptListen(SRClass, chain, onResult, onEnd, onError, idx + 1)
      return
    }
    onError?.(e.error)
    onEnd()
  }

  sr.onend = () => {
    if (!done) onEnd()
  }

  try {
    sr.start()
  } catch {
    onError?.('failed-to-start')
    onEnd()
  }

  return () => {
    done = true
    try { sr.abort() } catch { /* noop */ }
  }
}

export function startListening(
  lang: 'RU' | 'UZ' | 'EN',
  onResult: (text: string) => void,
  onEnd: () => void,
  onError?: (err: string) => void,
): () => void {
  const SRClass = getSRClass()
  if (!SRClass) {
    onError?.('not-supported')
    onEnd()
    return () => {}
  }

  const chain = LANG_CHAIN[lang] ?? ['ru-RU']
  return attemptListen(SRClass, chain, onResult, onEnd, onError)
}
