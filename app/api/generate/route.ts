import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
    const { prompt, apiKey } = await req.json();

    if (!apiKey) {
        return new Response("API key is required", { status: 400 });
    }

    const google = createGoogleGenerativeAI({
        apiKey: apiKey,
    });

    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];

    for (const currentModel of modelsToTry) {
        try {
            console.log(`Attempting generation with model: ${currentModel}`);
            const result = await streamText({
                model: google(currentModel),
                system: 'You are an expert blog post writer. Write clean, formatted HTML content suitable for a rich text editor. Use <h1>, <h2>, <p>, <ul>, <li>, <strong>, <em> tags where appropriate. Do not wrap the content in markdown code blocks or ```html. Just return the raw HTML content.',
                prompt: prompt,
            });
            return result.toTextStreamResponse();
        } catch (error: any) {
            console.warn(`Failed with model ${currentModel}:`, error.message);
            // If this was the last model, throw the error
            if (currentModel === modelsToTry[modelsToTry.length - 1]) {
                console.error("All model fallbacks failed.");
                return new Response(JSON.stringify({ error: error.message }), { status: 500 });
            }
            // Otherwise continue to next model
        }
    }
    return new Response("Generation failed", { status: 500 });
}
