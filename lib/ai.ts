import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function generateBlogPost(apiKey: string, prompt: string, model: string = 'gemini-1.5-flash') {
    const google = createGoogleGenerativeAI({
        apiKey: apiKey,
    });

    try {
        const result = await streamText({
            model: google(model),
            system: 'You are an expert blog post writer. Write clean, formatted HTML content suitable for a rich text editor. Use <h1>, <h2>, <p>, <ul>, <li>, <strong>, <em> tags where appropriate. Do not wrap the content in markdown code blocks or ```html. Just return the raw HTML content.',
            prompt: prompt,
        });

        return result;
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
}

export async function generateSocialThreads(apiKey: string, blogContent: string, model: string = 'gemini-1.5-flash') {
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
     ${blogContent}
  `;

    try {
        const result = await streamText({
            model: google(model),
            system: 'You are a social media expert. Return ONLY valid JSON array.',
            prompt: prompt,
            // We can use json mode if supported, but streamText with a strong prompt usually works. 
            // For structured output we might want 'generateObject' but let's stick to streamText for consistency and just parse the final JSON or stream it if we can handle partial JSON (harder).
            // Let's use generateObject if we want strict JSON, but streamText is requested for "streaming". 
            // However, for JSON it's often better to wait for full response or use object streaming.
            // Actually, let's use 'generateObject' for better reliability if we don't strictly need streaming text for this part, 
            // OR use streamObject from 'ai'.
        });

        // For simplicity in this iteration, let's just stream text and we will accumulate it in the UI and try to parse.
        return result;
    } catch (error) {
        console.error("Social Generation Error:", error);
        throw error;
    }
}
