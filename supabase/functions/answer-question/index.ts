import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  problem_id: string;
  question: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { problem_id, question }: RequestBody = await req.json();

    const { data: problem, error: problemError } = await supabase
      .from("problems")
      .select("*")
      .eq("id", problem_id)
      .single();

    if (problemError || !problem) {
      throw new Error("Problem not found");
    }

    const systemPrompt = `أنت مُدرك، مساعد ذكي متخصص في شرح المسائل الرياضية. لديك مسألة رياضية مع حلها الكامل، ودورك هو الإجابة على أسئلة الطالب حول خطوات الحل.

المسألة الأصلية: ${problem.problem_text}
نوع المسألة: ${problem.problem_type}

الحل الكامل:
${JSON.stringify(problem.solution, null, 2)}

قم بالإجابة على سؤال الطالب بطريقة واضحة وتعليمية باللغة العربية. اشرح المفاهيم والخطوات بطريقة مبسطة.`;

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({
          answer: "شكراً على سؤالك! للحصول على إجابات تفاعلية مدعومة بالذكاء الاصطناعي، يرجى إضافة ANTHROPIC_API_KEY إلى إعدادات المشروع."
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `${systemPrompt}\n\nسؤال الطالب: ${question}\n\nقدم إجابة واضحة ومفيدة باللغة العربية.`
          }
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      throw new Error(`Anthropic API error: ${anthropicResponse.statusText}`);
    }

    const anthropicData = await anthropicResponse.json();
    const answer = anthropicData.content[0].text;

    return new Response(
      JSON.stringify({ answer }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error answering question:", error);
    return new Response(
      JSON.stringify({
        error: "حدث خطأ أثناء الإجابة على السؤال",
        details: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
