
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const GOLD_CHARP_KNOWLEDGE = `
You are GoldBot, an expert AI assistant for Gold Charp Investments Limited, Uganda's premier real estate and financial services company.

COMPANY PROFILE:
- Gold Charp Investments Limited: Leading real estate and financial services company in Uganda
- Services: Real estate investment, mortgage loans, refinancing, home equity loans, property evaluation, money transfers
- Contact: info@goldcharpinvestments.com, +256-393103974
- Headquarters: Uganda with global investment opportunities

EXPERTISE AREAS:

1. UGANDA REAL ESTATE MARKET:
- Property prices in Kampala, Entebbe, Jinja, Mbarara, Gulu
- Land acquisition laws and procedures in Uganda
- Property registration with Ministry of Lands
- Mailo land, freehold, leasehold systems
- Investment opportunities in residential, commercial, agricultural land
- Market trends and growth areas
- Property taxes and fees in Uganda

2. LOAN PRODUCTS & CREDIT:
- Mortgage loans: 5-30% down payment, competitive rates
- Refinancing options: Lower rates, cash-out refinancing
- Home equity loans: Access property value for investments
- Business loans for real estate development
- Credit scoring and eligibility requirements
- Interest rates and payment schedules
- Loan application process and documentation

3. GLOBAL REAL ESTATE KNOWLEDGE:
- International property investment strategies
- Cross-border financing options
- Global market trends and opportunities
- Currency considerations and exchange rates
- Legal frameworks in different countries
- Investment migration programs

4. FINANCIAL SERVICES:
- Money transfer services globally
- Exchange rate information
- Investment advisory
- Property valuation services
- Insurance options
- Risk assessment

COMMUNICATION STYLE:
- Professional yet approachable
- Provide specific, actionable advice
- Always mention Gold Charp's relevant services
- Include contact information when appropriate
- Be culturally sensitive to Ugandan context
- Offer to connect users with human experts for complex matters

COMPLIANCE:
- Always include disclaimers for financial advice
- Recommend professional consultation for legal matters
- Provide current market information with timestamps
- Maintain confidentiality and data protection standards

Remember: You represent Gold Charp Investments Limited's commitment to excellence and professional service.
`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  userContext?: {
    isLoggedIn?: boolean;
    userRole?: string;
    location?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('AI Chatbot function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if OpenAI API key is configured
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not configured');
      throw new Error('OpenAI API key is not configured. Please contact the administrator.');
    }

    if (!openAIApiKey.startsWith('sk-')) {
      console.error('Invalid OpenAI API key format');
      throw new Error('Invalid OpenAI API key format. The key should start with "sk-".');
    }

    const { message, conversationHistory = [], userContext = {} }: ChatRequest = await req.json();

    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    console.log('Processing chat message:', message);
    console.log('User context:', userContext);

    // Build conversation context
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: GOLD_CHARP_KNOWLEDGE
      },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI API with updated model
    console.log('Calling OpenAI API with gpt-4.1-2025-04-14 model');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14', // Updated to latest model
        messages,
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 1,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error response:', errorData);
      console.error('OpenAI API status:', response.status);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received successfully');
    
    const botResponse = data.choices[0]?.message?.content;

    if (!botResponse) {
      console.error('No response content from OpenAI API');
      throw new Error('No response from AI model');
    }

    console.log('AI response generated successfully');

    // Log conversation for analytics (optional)
    try {
      await supabase.from('chat_analytics').insert({
        user_message: message,
        bot_response: botResponse,
        user_context: userContext,
        created_at: new Date().toISOString()
      });
    } catch (logError) {
      console.warn('Failed to log chat analytics:', logError);
    }

    return new Response(JSON.stringify({
      response: botResponse,
      timestamp: new Date().toISOString(),
      conversationId: crypto.randomUUID()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in AI chatbot function:', error);
    
    let fallbackResponse = "I apologize, but I'm experiencing technical difficulties. Please contact Gold Charp Investments directly at info@goldcharpinvestments.com or +256-393103974 for immediate assistance with your real estate and credit inquiries.";
    
    // Provide more specific error messages for common issues
    if (error.message.includes('API key')) {
      fallbackResponse = "There's an issue with the AI service configuration. Please contact Gold Charp Investments at info@goldcharpinvestments.com or +256-393103974 for assistance.";
    } else if (error.message.includes('OpenAI API error: 429')) {
      fallbackResponse = "Our AI assistant is temporarily unavailable due to high demand. Please try again in a few minutes or contact Gold Charp Investments directly at info@goldcharpinvestments.com or +256-393103974 for immediate assistance.";
    } else if (error.message.includes('insufficient_quota')) {
      fallbackResponse = "Our AI service is temporarily unavailable due to capacity limits. Please contact Gold Charp Investments directly at info@goldcharpinvestments.com or +256-393103974 for immediate assistance with your real estate and credit inquiries.";
    } else if (error.message.includes('OpenAI API error: 401')) {
      fallbackResponse = "The AI service authentication needs to be updated. Please contact Gold Charp Investments at info@goldcharpinvestments.com or +256-393103974 for assistance.";
    }
    
    return new Response(JSON.stringify({
      response: fallbackResponse,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
