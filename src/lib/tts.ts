// tts.ts — Google Cloud TTS with Web Speech API fallback
// Supports RU (Wavenet-D), EN (Neural2-F), UZ (Standard-A)

const GCP_TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize'
const API_KEY = 'AIzaSyCrBKVm6CIBn7ih0ToM406XYKZniE3-8mg'

// ─── Voice map ────────────────────────────────────────────────────────────────

const VOICES: Record<string, { languageCode: string; name: string; ssmlGender: string }> = {
  RU: { languageCode: 'ru-RU', name: 'ru-RU-Wavenet-D', ssmlGender: 'FEMALE' },
  EN: { languageCode: 'en-US', name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' },
  UZ: { languageCode: 'uz-UZ', name: 'uz-UZ-Standard-A', ssmlGender: 'FEMALE' },
}

// ─── Audio cache ──────────────────────────────────────────────────────────────

const audioCache = new Map<string, string>() // key → object URL
let currentAudio: HTMLAudioElement | null = null

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
}

// ─── Google Cloud TTS ─────────────────────────────────────────────────────────

async function gcpSpeak(text: string, lang: 'RU' | 'UZ' | 'EN'): Promise<void> {
  const cacheKey = `${lang}:${text}`
  let url = audioCache.get(cacheKey)

  if (!url) {
    const voice = VOICES[lang] ?? VOICES.RU
    const res = await fetch(`${GCP_TTS_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice,
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          effectsProfileId: ['headphone-class-device'],
        },
      }),
    })

    if (!res.ok) throw new Error(`TTS HTTP ${res.status}`)
    const data = await res.json() as { audioContent: string }
    const bytes = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'audio/mp3' })
    url = URL.createObjectURL(blob)
    audioCache.set(cacheKey, url)
  }

  stopCurrent()
  const audio = new Audio(url)
  currentAudio = audio
  audio.volume = 0.85
  await audio.play()
}

// ─── Web Speech API fallback ──────────────────────────────────────────────────

function wssSpeak(text: string, lang: 'RU' | 'UZ' | 'EN'): void {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang === 'RU' ? 'ru-RU' : lang === 'UZ' ? 'uz-UZ' : 'en-US'
  utt.rate = 1.0
  utt.pitch = 1.0
  const voices = window.speechSynthesis.getVoices()
  const match = voices.find(v => v.lang.startsWith(utt.lang.slice(0, 2)))
  if (match) utt.voice = match
  window.speechSynthesis.speak(utt)
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function speak(text: string, lang: 'RU' | 'UZ' | 'EN' = 'RU'): Promise<void> {
  if (!text.trim()) return
  // Strip HTML tags
  const clean = text.replace(/<[^>]+>/g, '')
  try {
    await gcpSpeak(clean, lang)
  } catch {
    wssSpeak(clean, lang)
  }
}

export function stopSpeaking(): void {
  stopCurrent()
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

export function isSpeaking(): boolean {
  return !!(currentAudio && !currentAudio.paused && !currentAudio.ended)
}
