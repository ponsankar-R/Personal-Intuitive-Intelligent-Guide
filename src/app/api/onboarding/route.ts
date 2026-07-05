import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { query } from '@/lib/db';
import { generateContent } from '@/lib/gemini';
import { ONBOARDING_QUESTIONS } from '@/components/quiz/questions';

export const maxDuration = 60; 

interface ProfilePayload {
  profile_name: string;
  identity_sentences: string[];
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate user session
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse payload safely
    const { answers } = await request.json();
    if (!answers) {
      return NextResponse.json({ error: 'Missing answers payload' }, { status: 400 });
    }

    // 3. Format quiz data (Supports both number or string keys coming from the frontend)
    const formattedAnswers = ONBOARDING_QUESTIONS.map(q => {
      const selectedOptionIds = (answers[q.id] || answers[String(q.id)]) as string[] || [];
      const selectedOptions = q.options.filter(o => selectedOptionIds.includes(o.id));
      return `Q${q.id}: ${q.question}\nUser Answers: ${selectedOptions.map(o => `${o.id}) ${o.text}`).join(', ')}`;
    }).join('\n\n');

    const prompt = `
System: You are an expert psychological profiling engine. Analyze the user's selected answers from the 10 multi-choice personality archetype questions. Generate a cohesive, deeply analytical, and nuanced psychological profile. 

User Data:
${formattedAnswers}

Output must be STRICT, VALID JSON fitting this exact structure:
{
  "profile_name": "Subject Identity Analysis",
  "identity_sentences": [
    "Sentence 1 detailing core value paradoxes based on Q1.",
    "Sentence 2 detailing risk navigation paradigms based on Q2.",
    "Sentence 3 detailing stress response patterns based on Q3.",
    "Sentence 4 detailing decision-making styles based on Q4.",
    "Sentence 5 detailing core motivations based on Q5.",
    "Sentence 6 detailing blind spots based on Q6.",
    "Sentence 7 detailing adaptation to change based on Q7.",
    "Sentence 8 detailing social energy dynamics based on Q8.",
    "Sentence 9 detailing conflict resolution styles based on Q9.",
    "Sentence 10 detailing agency and control perceptions based on Q10."
  ]
}

CRITICAL RULES:
- Ensure the response contains exactly 10 impactful, multi-faceted profile sentences matching the user's input vectors.
- Do not return any conversational text outside the JSON object.
- Avoid trailing commas inside arrays or objects, as they will break the standard JSON parser.
`;

    // 4. Request generation from LLM wrapper
    let responseText: string;
    try {
      responseText = await generateContent(prompt);
      if (!responseText || typeof responseText !== 'string') {
        throw new Error('LLM did not return a valid string response.');
      }
    } catch (llmErr) {
      console.error('--> Error during Gemini API generation:', llmErr);
      throw new Error(`Gemini Generation failed: ${llmErr instanceof Error ? llmErr.message : 'Unknown LLM failure'}`);
    }
    
    // 5. Bulletproof JSON block extraction and cleanup
    let profile: ProfilePayload;
    try {
      // Isolate the actual JSON block using open/close braces to discard any stray LLM commentary or markdown code-ticks
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('Could not find standard JSON boundary markers ({ }) in LLM output.');
      }
      
      const cleanJsonString = responseText.substring(firstBrace, lastBrace + 1).trim();
      profile = JSON.parse(cleanJsonString);

      // Validate schema compliance
      if (!profile.profile_name || !Array.isArray(profile.identity_sentences) || profile.identity_sentences.length === 0) {
        throw new Error('Parsed JSON object structure is corrupt or missing required fields.');
      }
    } catch (parseErr) {
      console.error('--> Raw LLM output failed to parse. Content was:\n', responseText);
      throw new Error(`JSON Parsing Phase Failed: ${parseErr instanceof Error ? parseErr.message : 'Invalid JSON format'}`);
    }

    // 6. Database Operations
    try {
      /**
       * DB CONFIGNOTE: 
       * - If your database column `identity_sentences` is a native Postgres string array (TEXT[]), use: `profile.identity_sentences`
       * - If your database column is JSON or JSONB, you must stringify it first: `JSON.stringify(profile.identity_sentences)`
       */
      const dbSentencesParam = profile.identity_sentences; 
      // const dbSentencesParam = JSON.stringify(profile.identity_sentences); // Uncomment if using JSONB column

      await query(
        'UPDATE users SET profile_name = $1, identity_sentences = $2 WHERE id = $3',
        [profile.profile_name, dbSentencesParam, userId]
      );

      await query(
        'INSERT INTO user_problems (user_id, problem_text, recommendation, frequency) VALUES ($1, $2, $3, $4)',
        [userId, 'I Need to handle problems better', 'write it down', 1]
      );
    } catch (dbErr) {
      console.error('--> Database Query Execution Failed:', dbErr);
      throw new Error(`Database Error: ${dbErr instanceof Error ? dbErr.message : 'Failed writing onboarding results to SQL database'}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('CRITICAL Onboarding Error Details:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}