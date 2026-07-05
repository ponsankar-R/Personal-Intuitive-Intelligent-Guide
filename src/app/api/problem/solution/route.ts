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

    // Fetch the user's core identity sentences we analyzed earlier
    const userResult = await query('SELECT identity_sentences FROM users WHERE id = $1', [userId]);
    const profile = userResult.rows[0].identity_sentences || [];

    // Format multi-select answers for the AI prompt
    const formattedDiag = diagnosticQuestions.map((q: any) => {
      const selectedKeys: string[] = diagnosticAnswers[q.id] || [];
      const formattedAnswers = selectedKeys.map((key) => `[${key}: ${q.options[key]}]`).join(', ');
      return `Question: ${q.question}\nUser's current situational experience: ${formattedAnswers}`;
    }).join('\n\n');

    const prompt = `
System: You are an exceptionally insightful, deeply warm, and highly persuasive personal guide. Your communication style uses positive psychology and magnetic behavioral framing to make the reader feel completely safe, deeply understood, and intensely inspired to take immediate action.

TONE & PSYCHOLOGICAL SEDUCTION RULES:
1. UNCONVENTIONAL WARMTH & CONFIDENCE: Speak like a brilliant peer who believes in the user completely. Your tone should be "sweet but unshakeably confident." Eliminate cold, clinical, or detached advice.
2. IDENTITY SEEDING: Look at the User Profile (identity_sentences). You must align your advice directly with who they inherently are or desire to be. If they value growth, frame the action as a natural evolution. If they value peace, frame it as a beautiful relief. Use their underlying psychological drivers to remove all subconscious friction.
3. INLINE ACCESSIBILITY: Use simple, magnetic, everyday English. If you must reference a mind-body mechanism, immediately explain it simply inline (e.g., "dopamine loops (your brain's reward tracking system)").
4. COGNITIVE FRICTION ELIMINATION: The "action_item" must feel so incredibly smooth, alluring, and simple that the user's brain says, "Oh, I can easily do that right this exact second."

Context:
User Profile: ${profile.join(' ')}
Original Problem: ${problemText}
Refined Problem: ${refinedProblem}

User's Diagnostic Selections:
${formattedDiag}

Return a valid JSON object matching the 9 structural blocks specified below. Fill each field with text following the psychological rules above:

{
  "action_item": "A beautifully written, highly magnetic paragraph that makes the very first step feel like a joyful, effortless relief. Tell them exactly how to start instantly with zero pressure.",
  "avoid_item": "A warm, protective warning pointing out the specific habits or traps to gracefully step away from. Frame it not as a failure, but as something they have outgrown.",
  "root_cause_analysis": "A deeply validating explanation connecting their diagnostic answers to their hidden brilliance. Show them that this problem is just a misdirected strength, explaining exactly why it keeps happening.",
  "progression_warning": "A direct, honest, but incredibly loving look at the beautiful life experiences, peace, or energy they are accidentally leaving on the table if they choose to stay stuck in this loop.",
  "psycho_biological_view": "A comforting, simple breakdown of how their nervous system and beautiful mind are just trying to protect them during this struggle, and how this action item brings them back into perfect balance.",
  "philosophical_morality_view": "A stunningly clear piece of life wisdom that brings instant mental spaciousness, helping them forgive their past self and step forward completely unburdened.",
  "literary_quote_advice": "A meaningful, direct quote from an iconic personal transformation book that matches their energy, followed by a sweet, simple sentence mapping it to their evening or morning today.",
  "truth_seeking_questions": [
    "A gentle, beautifully framed self-reflection question that unlocks an 'aha!' moment.",
    "A question that subtly shifts their perspective from problem-focused to potential-focused.",
    "A question that makes them realize how ready they already are to move forward."
  ],
  "book_mastery_law": "Name of the Rule: A gorgeous, simple breakdown of an empowering behavioral law that makes them feel like a master of their own habits."
}

CRITICAL FORMATTING GUIDELINE: The "book_mastery_law" field MUST include a single colon separating the title/law from its explanation, exactly like this: 'Law of the First Ripple: The smallest positive motion always breaks the biggest emotional freeze.'

Do not return any text outside the JSON object boundaries.
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