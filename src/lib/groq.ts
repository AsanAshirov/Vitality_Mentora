// groq.ts — Groq streaming client (fallback for Gemini)
import Groq from 'groq-sdk'

const KEY = import.meta.env.VITE_GROQ_KEY as string | undefined

export async function streamGroqAnswer(
  question: string,
  lang: string,
  systemPrompt: string,
  onChunk: (chunk: string) => void,
  onDone: (full: string, citations: string[]) => void,
  onError: (err: unknown) => void,
): Promise<void> {
  if (!KEY) { onError('No Groq key'); return }

  const client = new Groq({ apiKey: KEY, dangerouslyAllowBrowser: true })

  try {
    const stream = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      stream: true,
      max_tokens: 512,
    })

    let full = ''
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? ''
      if (delta) { full += delta; onChunk(delta) }
    }

    const citations = extractCitations(full)
    onDone(full, citations)
  } catch (err) {
    onError(err)
  }
}

function extractCitations(text: string): string[] {
  const matches = text.match(/\b(KYC-PROC|AML-HB|SANCTIONS-PROC|TRANSFER-OPS|DEPOSIT-OPS|CARD-ISSUE|SWIFT-LIMITS|FX-RATES|PEP-HB|ESCAL-PROC)\b/g)
  return matches ? [...new Set(matches)] : []
}
