import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Mock images for final fallback
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1636955860106-9eb84e578c3c?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
];

/**
 * Pollinations.ai image generation (Free fallback from ai-recipe)
 */
async function generateWithPollinations(prompt: string): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt + ', high quality, clean merchandise design, professional vector style');
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;
}

/**
 * Gemini API Integration for Image Generation
 * Uses Gemini 1.5 Flash for Prompt Engineering
 * and uses Imagen 3 via Gemini API (Google AI Studio) for image generation.
 */
export async function POST(req: Request) {
  try {
    const { prompt, style, removeBackground } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn('GOOGLE_API_KEY is missing. Falling back to demo mode.');
    }

    // ------------------------------------------------------------------
    // Step 1: Prompt Engineering with Gemini 1.5 Flash
    // ------------------------------------------------------------------
    let enhancedPrompt = prompt;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const systemInstruction = `
          You are a professional AI Art Prompt Engineer for GOODZZ, a premium custom goods shop.
          Transform the user's idea into a high-quality, professional English prompt for Imagen 3.
          
          Design Guidelines:
          - Style: ${style || 'Clean & Professional Vector'}
          - Formatting: Flat design, vector art, sticker style, or clean digital illustration.
          - Background: ${removeBackground ? 'Pure solid white background, isolated object, no shadows' : 'Clean minimalist studio background'}
          - Quality: 8k resolution, sharp edges, vibrant colors, premium texture.
          - Constraints: Focus on designs that look good on T-shirts, mugs, and stickers. Return ONLY the English prompt.
        `;
        
        const result = await model.generateContent([systemInstruction, `User Input: ${prompt}`]);
        enhancedPrompt = result.response.text().trim();
        console.log('[Gemini] Enhanced Prompt:', enhancedPrompt);
      } catch (err) {
        console.error('Gemini Prompt Enhancement Error:', err);
      }
    }

    // ------------------------------------------------------------------
    // Step 2: Image Generation (Imagen 3 via Gemini API)
    // ------------------------------------------------------------------
    // Check for real mode (requires Gemini API Key)
    const isRealMode = !!apiKey;

    if (!isRealMode) {
      console.log('[AI-Recipe] Using Pollinations.ai fallback...');
      const pollinationsUrl = await generateWithPollinations(enhancedPrompt);
      
      return NextResponse.json({ 
        url: pollinationsUrl,
        enhancedPrompt,
        mode: 'pollinations',
        message: 'Running with free AI fallback (Pollinations.ai)'
      });
    }

    try {
      console.log('[Gemini] Generating image with Imagen 3...');
      
      // Using the Gemini API Imagen endpoint
      // Reference: https://ai.google.dev/gemini-api/docs/image-generation
      const imagenModel = 'imagen-3.0-generate-001';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${imagenModel}:predict?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: enhancedPrompt,
            },
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            outputMimeType: "image/png"
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini Imagen API error: ${response.status} ${errorBody}`);
      }
      
      const data = await response.json();
      const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

      if (!base64Image) {
        throw new Error('No image bytes returned from Gemini API');
      }

      return NextResponse.json({
        url: `data:image/png;base64,${base64Image}`,
        enhancedPrompt,
        mode: 'real'
      });
    } catch (genErr) {
      console.error('Image Generation Error:', genErr);
      // Fallback to Pollinations instead of static Unsplash
      const fallbackUrl = await generateWithPollinations(enhancedPrompt);
      return NextResponse.json({ 
        url: fallbackUrl,
        enhancedPrompt,
        mode: 'fallback-pollinations',
        message: 'Real generation failed, used Pollinations fallback. Error: ' + (genErr instanceof Error ? genErr.message : String(genErr))
      });
    }

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

