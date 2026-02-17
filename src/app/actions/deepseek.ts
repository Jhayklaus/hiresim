'use server';

import OpenAI from 'openai';
import { ChatMessage, CandidateProfile, InterviewFeedback } from '@/types';

const API_KEY = process.env.NEXT_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || '';

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: API_KEY
});

export async function generateInterviewResponse(
  history: ChatMessage[], 
  newMessage: string, 
  profile: CandidateProfile,
  timeLeftSeconds: number
): Promise<{ text: string; error?: string }> {
  try {
    if (!API_KEY) {
      return { text: '', error: 'Server configuration error: DeepSeek API Key missing' };
    }

    const minutesLeft = Math.floor(timeLeftSeconds / 60);
    const secondsLeft = timeLeftSeconds % 60;

    const systemPrompt = `
      Your name is Mitch.
      You are a professional technical recruiter conducting a 10-minute video interview for a ${profile.jobRole} position.
      Candidate Name: ${profile.name}
      CV Content Snippet: ${profile.cvText.slice(0, 3000)}...
      Job Description: ${profile.jobDescription || "Standard industry requirements"}
      Remaining time in the interview: approximately ${minutesLeft} minutes and ${secondsLeft} seconds.
      
      Your goal is to assess the candidate's technical skills, communication, and cultural fit.
      - Be professional but polite.
      - Ask one question at a time.
      - Keep responses concise (under 3 sentences) to maintain conversation flow.
      - If the candidate's answer is vague, probe deeper.
      - Do not be repetitive.
      - If this is the start of the conversation, introduce yourself and ask them to introduce themselves.
      - If there is about one minute left (60 seconds or less), clearly tell the candidate that time is almost up and begin to wrap up the interview with a final question or summary.
    `;

    // Convert internal ChatMessage to OpenAI/DeepSeek format
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map(msg => ({
        role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.text
      }))
    ];

    // Add the new message if it's not already in history (it usually isn't for the current turn)
    if (newMessage && newMessage !== "START_INTERVIEW") {
      messages.push({ role: "user", content: newMessage });
    } else if (newMessage === "START_INTERVIEW" && history.length === 0) {
      // Initial trigger, the system prompt covers the intro, but we can add a user nudge if needed.
      // Or just let the model start based on system prompt? 
      // DeepSeek usually waits for user input. Let's send a "Hello" or empty user message to trigger start?
      // Or just rely on the fact that we sent the system prompt. 
      // OpenAI chat completion usually requires a user message to start effectively or we can just send the system prompt.
      // However, usually we send a dummy user message like "Hi, I'm ready for the interview." if it's the start.
      messages.push({ role: "user", content: "Hi, I am ready for the interview." });
    }

    const completion = await openai.chat.completions.create({
      messages,
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 150, // Keep it concise
    });

    const responseText = completion.choices[0]?.message?.content || '';

    return { text: responseText };
  } catch (error: unknown) {
    console.error("DeepSeek Interview Error:", error);
    return { text: '', error: 'Failed to generate response' };
  }
}

export async function generateFeedback(
  transcript: ChatMessage[], 
  jobRole: string
): Promise<{ feedback: InterviewFeedback; error?: string }> {
  try {
    if (!API_KEY) {
      return { 
        feedback: {} as InterviewFeedback, 
        error: 'Server configuration error: API Key missing' 
      };
    }

    const prompt = `
      You are an expert technical interviewer. Analyze the following interview transcript for a ${jobRole} position.
      Provide detailed feedback including scores (0-100) and specific improvement points.
      Return the response in strictly valid JSON format matching this schema:
      {
        "score": number,
        "breakdown": {
          "clarity": number,
          "technicalAccuracy": number,
          "confidence": number,
          "relevance": number,
          "depth": number
        },
        "strengths": string[],
        "improvements": string[],
        "roadmap": string,
        "exampleAnswers": string[]
      }

      Transcript:
      ${transcript.map(m => `${m.role}: ${m.text}`).join('\n')}
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant that outputs JSON." },
        { role: "user", content: prompt }
      ],
      model: "deepseek-chat", // DeepSeek V3 is good at JSON too
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const text = completion.choices[0]?.message?.content || '{}';
    
    // Clean up potential markdown code blocks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const feedback = JSON.parse(cleanText) as InterviewFeedback;
    return { feedback };
  } catch (error) {
    console.error('Error generating feedback:', error);
    return { 
      feedback: {} as InterviewFeedback, 
      error: 'Failed to generate feedback' 
    };
  }
}
