// stt.ts — Web Speech API STT with per-language fallback chain

const LANG_CHAIN: Record<string, string[]> = {
  RU: ['ru-RU'],
  EN: ['en-US'],
  UZ: ['uz-UZ', 'ru-RU'],
}

type SRConstructor = new () => SpeechRecognition

export function isSTTSupported(): boolean {
  return typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition)
}

function getSRClass(): SRConstructor | null {
  if (typeof window === 'undefined') return null
  return (window.SpeechRecognition || (window as any).webkitSpeechRecognition) ?? null
}

function attemptListen(
  SRClass: SRConstructor,
  chain: string[],
  onResult: (text: string) => void,
  onEnd: () => void,
  onError?: (e: string) => void,
  idx = 0,
): () => void {
  if (idx >= chain.length) {
    onEnd()
    return () => {}
  }

  const sr = new SRClass()
  sr.lang = chain[idx]
  sr.continuous = false
  sr.interimResults = false

  let stopped = false

  sr.onresult = (e: SpeechRecognitionEvent) => {
    const text = e.results[0]?.[0]?.transcript ?? ''
    if (text) onResult(text)
  }

  sr.onerror = (e: SpeechRecognitionErrorEvent) => {
    if (e.error === 'language-not-supported' || e.error === 'network') {
      // Try next locale in chain
      if (!stopped) attemptListen(SRClass, chain, onResult, onEnd, onError, idx + 1)
    } else {
      onError?.(e.error)
      onEnd()
    }
  }

  sr.onend = () => {
    if (!stopped) onEnd()
  }

  sr.start()

  return () => {
    stopped = true
    try { sr.stop() } catch { /* ignore */ }
  }
}

export function startListening(
  lang: 'RU' | 'UZ' | 'EN',
  onResult: (text: string) => void,
  onEnd: () => void,
  onError?: (e: string) => void,
): () => void {
  const SRClass = getSRClass()
  if (!SRClass) { onEnd(); return () => {} }
  const chain = LANG_CHAIN[lang] ?? LANG_CHAIN.RU
  return attemptListen(SRClass, chain, onResult, onEnd, onError)
}
