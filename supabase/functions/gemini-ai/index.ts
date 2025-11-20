import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { GoogleGenAI } from 'npm:@google/genai@^1.30.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Action 1: Chat (for Chatbot)
    if (action === 'chat') {
      const { message, systemInstruction } = payload;

      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: { systemInstruction },
      });

      const result = await chat.sendMessage({ message });

      return new Response(
        JSON.stringify({
          success: true,
          text: result.text || 'Keine Antwort',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Action 2: Generate Avatar
    if (action === 'generate-avatar') {
      const { prompt } = payload;

      const unifiedPrompt = `A cute, 3D claymation style avatar of: ${prompt}. 
      Minimalist, colorful, friendly, white background, soft lighting, high quality, centered.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: unifiedPrompt }] },
        config: { responseModalities: ['IMAGE'] },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      const base64Image = parts && parts[0]?.inlineData ? parts[0].inlineData.data : null;

      return new Response(
        JSON.stringify({
          success: !!base64Image,
          image: base64Image,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = error as { message: string };
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

