// app/api/email/polish/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { textToPolish } = await request.json();

    if (!textToPolish || typeof textToPolish !== 'string' || textToPolish.trim() === '') {
      return NextResponse.json({ message: 'textToPolish is required and must be a non-empty string.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI API Key is not configured.");
      return NextResponse.json({ message: 'AI service not configured' }, { status: 500 });
    }

    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const model = "gpt-4.1-nano"; // Or your preferred model like "gpt-4"

    const messages = [
      {
        role: "system",
        content: "You are an expert email copywriter. Polish the following sales email content. Make it more professional, concise, and engaging. Ensure a friendly yet assertive tone. Correct any grammatical errors or awkward phrasing. The email is intended for a business lead."
      },
      {
        role: "user",
        content: textToPolish
      }
    ];

    const payload = {
      model: model,
      messages: messages,
      temperature: 0.7, // Adjust for creativity vs. precision
      max_tokens: 1000, // Adjust as needed
    };

    const openaiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.json(); // OpenAI usually returns JSON errors
      console.error("OpenAI API error response:", errorBody);
      throw new Error(`OpenAI API request failed with status ${openaiResponse.status}: ${errorBody.error?.message || 'Unknown error'}`);
    }
    
    const result = await openaiResponse.json();

    if (result.choices && result.choices.length > 0 && result.choices[0].message && result.choices[0].message.content) {
      const polishedText = result.choices[0].message.content.trim();
      return NextResponse.json({ polishedText }, { status: 200 });
    } else {
      console.error("Unexpected OpenAI API response structure:", result);
      return NextResponse.json({ message: 'Failed to polish text due to unexpected API response from OpenAI.' }, { status: 500 });
    }

  } catch (error) {
    console.error('API Error polishing email with OpenAI:', error);
    return NextResponse.json({ message: 'Failed to polish email.', error: error.message }, { status: 500 });
  }
}

