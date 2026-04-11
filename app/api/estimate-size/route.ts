import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
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
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a senior product manager at a B2B freight logistics company. Estimate the t-shirt size complexity of this feature.

Feature title: ${title}
Problem statement: ${problemStatement}

Respond with ONLY valid JSON in exactly this shape:
{
  "size": "XS" | "S" | "M" | "L" | "XL",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "rationale": "3-5 sentence explanation of the sizing decision",
  "factors": ["factor 1", "factor 2", "factor 3"],
  "assumptions": "brief assumptions made"
}

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
    const text = data.content[0].text;
    const parsed = JSON.parse(text);
    return Response.json(parsed);
  } catch (err) {
    console.error('[estimate-size]', err);
    return Response.json({ error: true }, { status: 500 });
  }
}
