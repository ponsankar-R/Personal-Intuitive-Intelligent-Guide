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

    const { problemText } = await request.json();

    // Fetch user profile and history
    const userResult = await query('SELECT identity_sentences FROM users WHERE id = $1', [userId]);
    const historyResult = await query(
      'SELECT id, problem_text, frequency FROM user_problems WHERE user_id = $1 ORDER BY frequency DESC, updated_at DESC LIMIT 50',
      [userId]
    );

    const profile = userResult.rows[0].identity_sentences;
    const history = historyResult.rows;

    // Parallel execution - Start background update (Route 1)
    const backgroundUpdate = async () => {
      const historyPrompt = `
System: You are a database synchronization engine. Review the user's newly submitted problem alongside their existing history of up to 50 problems.
Write everything using simple, easy-to-understand English sentences.

Tasks:
1. Determine if the new problem matches or is highly correlated with an existing problem row.
2. If it matches, increment the "frequency" metric of that existing row by 1. Update its timestamp to current.
3. If it is a new problem, add it as a new row entry with "frequency": 1. Update the "recommendation" placeholder text with a short 1-sentence supportive mental framing tip using simple vocabulary.
4. Ensure the total list does not exceed 50 rows. If it does, drop the oldest row that carries the lowest frequency.
5. Sort the final output: Highest frequency rows first. For items sharing the same frequency, place the newest entry ABOVE the oldest entry.

New Problem: ${problemText}
Current History: ${JSON.stringify(history)}

Output must be returned as a clean JSON array representing the entire updated table. 
Example Format: [{"problem_text": "...", "recommendation": "...", "frequency": 2, "updated_at": "..."}]
`;
      try {
        const responseText = await generateContent(historyPrompt);
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const updatedHistory = JSON.parse(jsonMatch[0]);
          
          await query('DELETE FROM user_problems WHERE user_id = $1', [userId]);
          for (const item of updatedHistory.slice(0, 50)) {
            await query(
              'INSERT INTO user_problems (user_id, problem_text, recommendation, frequency, updated_at) VALUES ($1, $2, $3, $4, $5)',
              [userId, item.problem_text, item.recommendation, item.frequency || 1, item.updated_at || new Date()]
            );
          }
        }
      } catch (err) {
        console.error('Background history update failed:', err);
      }
    };

    // Trigger Route 1 in background
    backgroundUpdate();

    // Route 2: Diagnostic Question Generator
    const diagnosticPrompt = `
System: You are a helpful guide finding the root cause of a user's problem. 
Read the user's Problem Statement and look at their Core Personality Profile sentences. 
Generate between 3 to 7 highly relevant multiple-choice questions to deeply understand why they are facing this issue.

CRITICAL RULES FOR LANGUAGE & STYLE:
1. Use SIMPLE ENGLISH. Avoid complex, academic, psychological, or fancy words. Use sentences that a regular person uses in daily life.
2. The questions must be powerful and insightful, targeting hidden habits, fears, or situational responses.
3. MULTI-SELECT DESIGN: The user can choose MORE THAN ONE answer for each question because people behave differently depending on the situation. Design the options (A, B, C, D) so they reflect different realistic behaviors, feelings, or situations that can happen at the same time or alternate.

Problem Statement: ${problemText}
Core Personality Profile: ${profile.join(' ')}

Output must follow this exact structured JSON format for seamless frontend UI rendering:
{
  "refined_problem_statement": "A very clear, simple, and direct sentence explaining what the user is truly struggling with.",
  "diagnostic_questions": [
    {
      "id": 1,
      "question": "Clear, simple diagnostic question text here?",
      "options": {
        "A": "Simple description of a behavioral response or feeling.",
        "B": "Simple description of a behavioral response or feeling.",
        "C": "Simple description of a behavioral response or feeling.",
        "D": "Simple description of a behavioral response or feeling."
      }
    }
  ]
}
`;

    const diagnosticResponse = await generateContent(diagnosticPrompt);
    const jsonMatch = diagnosticResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid Diagnostic response format');
    }
    const diagnosticData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(diagnosticData);
  } catch (error) {
    console.error('Problem submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}