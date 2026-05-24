// groq.ts — Groq streaming client (Llama 3) for Mentora AI fallback
import Groq from 'groq-sdk'

const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']

export async function streamGroqAnswer(
  systemPrompt: string,
  question: string,
  onChunk: (text: string) => void,
): Promise<string> {
  const GROQ_KEY = import.meta.env.VITE_GROQ_KEY as string
  if (!GROQ_KEY) throw new Error('No GROQ key')
  // dangerouslyAllowBrowser: true because this is a local-only training tool
  const groq = new Groq({ apiKey: GROQ_KEY, dangerouslyAllowBrowser: true })

  let lastErr = ''
  for (const model of MODELS) {
    try {
      const stream = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        stream: true,
        max_tokens: 500,
        temperature: 0,
        top_p: 0.95,
      })

      let full = ''
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) { full += text; onChunk(text) }
      }
      return full
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err)
      if (!lastErr.includes('429') && !lastErr.includes('503') && !lastErr.includes('overload')) break
    }
  }
  throw new Error(lastErr)
}
