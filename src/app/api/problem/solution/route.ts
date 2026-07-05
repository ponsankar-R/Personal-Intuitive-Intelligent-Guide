import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { query } from '@/lib/db';
import { generateContent } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { problemText, refinedProblem, diagnosticAnswers, diagnosticQuestions } = await request.json();

    const userResult = await query('SELECT identity_sentences FROM users WHERE id = $1', [userId]);
    const profile = userResult.rows[0].identity_sentences;

    // Properly handle and format multi-select answers for the AI prompt
    const formattedDiag = diagnosticQuestions.map((q: any) => {
      const selectedKeys: string[] = diagnosticAnswers[q.id] || [];
      const formattedAnswers = selectedKeys.map((key) => `[${key}: ${q.options[key]}]`).join(', ');
      return `Question: ${q.question}\nUser selected these matching situations/behaviors: ${formattedAnswers}`;
    }).join('\n\n');

    const prompt = `
System: You are a friendly, highly intuitive guide. You are reviewing a user's problem profile and their selections from a diagnostic checklist. They were allowed to select multiple answers because their behaviors and feelings change depending on the situation.

Your job is to build a clear, simple, and direct roadmap to help them move forward.

CRITICAL RULES FOR LANGUAGE & STYLE:
1. Use SIMPLE, EVERYDAY ENGLISH. Do not use heavy psychological jargon, overly academic words, or complex sentence structures. Write so that a regular person reads it and instantly feels understood.
2. Keep your explanations clear, down-to-earth, and directly useful.

Context:
User Profile: ${profile.join(' ')}
Original Problem: ${problemText}
Refined Problem: ${refinedProblem}

User's Diagnostic Selections:
${formattedDiag}

You must return a valid JSON object matching the 7 structural blocks specified below. Fill each field with text written in simple English:

{
  "action_item": "A clear, simple paragraph telling the user exactly what practical steps to take right now.",
  "avoid_item": "A clear, simple paragraph pointing out exactly what habits, traps, or reactions to stop doing completely.",
  "root_cause_analysis": "A simple explanation of why this specific problem keeps happening to them based on their profile and answers.",
  "progression_warning": "A direct, honest warning of what will realistically happen to their daily life if they do not change this pattern.",
  "psycho_biological_view": "A simple breakdown of how their mind and physical stress/energy systems react during this problem.",
  "philosophical_morality_view": "A comforting, high-level perspective or life wisdom to give them mental clarity and peace of mind.",
  "literary_quote_advice": "A meaningful, direct quote from a famous personal growth or human nature book (like Atomic Habits, The Laws of Human Nature, etc.) followed by a simple sentence explaining how to apply it today."
}

Do not return any text outside the JSON object.
`;

    const responseText = await generateContent(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
       throw new Error('Invalid Solution response format');
    }
    const solutionData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(solutionData);
  } catch (error) {
    console.error('Solution generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}