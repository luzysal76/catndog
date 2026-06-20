// Pollinations.ai를 사용한 대변 사진 AI 분석
const API_URL = 'https://text.pollinations.ai/openai'

const SYSTEM_PROMPT = `당신은 반려동물 건강 전문 AI입니다.
제공된 반려동물 대변 사진을 분석하여 아래 형식의 JSON만 반환하세요.
절대 다른 텍스트를 포함하지 마세요.

{
  "status": "normal|soft|diarrhea|constipation|blood|unknown",
  "confidence": 0~100,
  "description": "분석 결과 설명 (한국어, 2-3문장)",
  "advice": "보호자 조언 (한국어, 1-2문장)",
  "urgency": "low|medium|high"
}`

/**
 * 이미지(base64)를 분석하여 대변 상태를 반환합니다.
 * @param {string} base64Image - "data:image/jpeg;base64,..." 형태
 * @returns {Promise<{status, confidence, description, advice, urgency}>}
 */
export async function analyzePoopImage(base64Image) {
  if (!navigator.onLine) {
    throw new Error('오프라인 상태입니다. 인터넷 연결을 확인해주세요.')
  }

  const payload = {
    model: 'openai-large',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: base64Image },
          },
          {
            type: 'text',
            text: '이 반려동물의 대변 사진을 분석해주세요.',
          },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 512,
  }

  // 30초 타임아웃 — 네트워크 hang 방지
  const controller = new AbortController()
  const timeoutId  = setTimeout(() => controller.abort(), 30_000)

  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error('AI 서버 응답이 너무 늦습니다. 잠시 후 다시 시도해주세요.')
    }
    throw e
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error(`AI 분석 서버 오류 (${response.status})`)
  }

  // text() 먼저 받고 JSON 파싱 — Content-Type이 text/plain으로 올 경우 대응
  const rawText = await response.text()
  let data
  try {
    data = JSON.parse(rawText)
  } catch (_) {
    throw new Error('AI 서버 응답을 파싱할 수 없습니다. 잠시 후 다시 시도해주세요.')
  }

  const content = data?.choices?.[0]?.message?.content || ''

  // JSON 파싱 시도
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      // 필수 필드 검증
      if (parsed.status && parsed.description) {
        return parsed
      }
    }
  } catch (_) {}

  // 파싱 실패 시 명확한 오류 메시지 포함 기본값 반환
  throw new Error('AI가 분석 결과를 반환하지 않았습니다. 사진을 다시 확인하거나 잠시 후 재시도해주세요.')
}

/**
 * 이미지를 리사이징합니다 (최대 800px, quality 0.7)
 * @param {File} file
 * @returns {Promise<string>} base64 dataURL
 */
export function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 800
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width)
            width = MAX
          } else {
            width = Math.round((width * MAX) / height)
            height = MAX
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
