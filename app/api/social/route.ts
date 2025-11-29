import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
    const { content, apiKey } = await req.json();

    if (!apiKey) {
        return new Response("API key is required", { status: 400 });
    }

    const google = createGoogleGenerativeAI({
        apiKey: apiKey,
    });

    const prompt = `
     You are a world-class social media strategist. Take the following long-form blog post and break it into 8–15 bite-sized posts optimized for LinkedIn, Twitter/X, and Instagram/Facebook (threads/carousels).

     For each post return JSON with this structure:
     [
       {
         "platform": "Twitter" | "LinkedIn" | "Instagram",
         "type": "single" | "thread_start" | "thread_middle" | "thread_end" | "carousel_slide",
         "text": "the post copy (keep under platform character limits)",
         "suggested_hashtags": ["#example1", "#example2"],
         "emoji_strategy": "where to place emojis for maximum engagement",
         "call_to_action": "e.g. Save this, reply with your thoughts, etc."
       },
       ...
     ]

     Prioritize hook → value → CTA in every single post. Make them feel native to each platform. Use curiosity gaps, numbers, and emotional triggers.

     Blog Post Content:
     ${content}
  `;

    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];

    for (const currentModel of modelsToTry) {
        try {
            console.log(`Attempting social generation with model: ${currentModel}`);
            const result = await streamText({
                model: google(currentModel),
                system: 'You are a social media expert. Return ONLY valid JSON array.',
                prompt: prompt,
            });
            return result.toTextStreamResponse();
        } catch (error: any) {
            console.warn(`Failed with model ${currentModel}:`, error.message);
            if (currentModel === modelsToTry[modelsToTry.length - 1]) {
                console.error("All social model fallbacks failed.");
                return new Response(JSON.stringify({ error: error.message }), { status: 500 });
            }
        }
    }
    return new Response("Social generation failed", { status: 500 });
}
