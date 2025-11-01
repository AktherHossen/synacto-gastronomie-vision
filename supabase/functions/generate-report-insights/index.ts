import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { OpenAI } from "https://deno.land/x/openai/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getPrompt = (language, reportType, reportData, userPrompt) => {
    
    const salesPrompt = `You are a business analyst. Summarize the restaurant sales. Write the summary in ${language}. Focus on total revenue, peak days, top-selling items, and order volume trends. Use friendly business language for a restaurant owner in ${language}.`;
    const inventoryPrompt = `You are a supply chain analyst for a restaurant. Summarize the inventory usage report in ${language}. Focus on the most used ingredients, any potential stock shortages, and items that are driving the most consumption. Use professional, clear language in ${language}.`;
    const staffPrompt = `You are a restaurant manager. Summarize the staff performance report in ${language}. Highlight the most productive staff based on orders and revenue, identify potential areas for training, and comment on overall team efficiency. Use encouraging and professional language in ${language}.`;

    let basePrompt;
    switch(reportType) {
        case 'inventory':
            basePrompt = inventoryPrompt;
            break;
        case 'staff':
            basePrompt = staffPrompt;
            break;
        case 'sales':
        default:
            basePrompt = salesPrompt;
            break;
    }

    if (userPrompt) {
      return `Given the following report data, answer the user's question in ${language}. Be concise and helpful. Data: ${JSON.stringify(reportData)}. Question: "${userPrompt}"`;
    }
    
    return `${basePrompt}\nHere is the data: ${JSON.stringify(reportData)}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reportData, userPrompt, language = 'de', reportType = 'sales' } = await req.json();
    const openAI = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

    const formattedStartDate = new Date(reportData.revenuePerDay[0]?.date).toLocaleDateString(language);
    const formattedEndDate = new Date(reportData.revenuePerDay[reportData.revenuePerDay.length - 1]?.date).toLocaleDateString(language);

    const prompt = getPrompt(language, reportType, reportData, userPrompt);

    const completion = await openAI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.6,
    });

    const aiResponse = completion.choices[0].message.content;

    return new Response(JSON.stringify({ summary: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 