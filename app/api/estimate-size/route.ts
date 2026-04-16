import { NextRequest } from 'next/server';

const MOCK_ESTIMATE = {
  size: 'M',
  confidence: 'MEDIUM',
  rationale: 'No API key configured. This is a placeholder estimate. Add ANTHROPIC_API_KEY to your environment to enable real AI estimation.',
  factors: ['Feature scope appears medium complexity', 'Requires API key to estimate accurately', 'Configure ANTHROPIC_API_KEY in .env.local'],
  assumptions: 'Mock response — set ANTHROPIC_API_KEY for real estimates.',
};

export async function POST(req: NextRequest) {
  // Return mock when no API key is available
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(MOCK_ESTIMATE);
  }

  try {
    const { title, problemStatement } = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a senior product manager at a B2B freight logistics company. Estimate the t-shirt size complexity of this feature.

Feature title: ${title}
Problem statement: ${problemStatement}

Respond with ONLY valid JSON in exactly this shape:
{
  "size": "XS",
  "confidence": "HIGH",
  "rationale": "3-5 sentence explanation of the sizing decision",
  "factors": ["factor 1", "factor 2", "factor 3"],
  "assumptions": "brief assumptions made"
}

Size must be one of: XS, S, M, L, XL
Confidence must be one of: HIGH, MEDIUM, LOW

Size guide:
XS = under 1 week (trivial UI change, no backend)
S  = 1-2 weeks (small feature, minimal backend)
M  = 2-4 weeks (medium feature, some API/data work)
L  = 1-2 months (large feature, significant backend + UI)
XL = 2+ months (major feature, multiple systems affected)

Consider: API integrations, data model changes, UI complexity, external dependencies, regulatory concerns.`,
          },
        ],
      }),
    });

    const data = await response.json();

    // Log full response in dev to help debug
    if (process.env.NODE_ENV !== 'production') {
      console.log('[estimate-size] status:', response.status);
      console.log('[estimate-size] response:', JSON.stringify(data, null, 2));
    }

    if (!response.ok) {
      console.error('[estimate-size] Anthropic error:', data);
      return Response.json({ error: true, detail: data }, { status: 502 });
    }

    const text = data.content[0].text;

    // Strip markdown code fences if model wraps the JSON
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return Response.json(parsed);
  } catch (err) {
    console.error('[estimate-size]', err);
    return Response.json({ error: true }, { status: 500 });
  }
}
