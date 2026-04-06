import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  problem_text: string;
  problem_type: string;
  input_method: string;
  problem_image_url?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { problem_text, problem_type, input_method }: RequestBody = await req.json();

    const systemPrompt = `أنت مُدرك، مساعد ذكي متخصص في حل المسائل الرياضية. مهمتك هي:
1. فهم المسألة الرياضية المقدمة
2. تقديم حل تفصيلي خطوة بخطوة
3. شرح كل خطوة بوضوح باللغة العربية
4. تقديم الجواب النهائي

نوع المسألة: ${problem_type}

قدّم الحل بتنسيق JSON التالي:
{
  "steps": [
    {
      "step": 1,
      "description": "شرح الخطوة",
      "equation": "المعادلة إن وجدت"
    }
  ],
  "final_answer": "الجواب النهائي",
  "graphs": []
}`;

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({
          solution: {
            steps: [
              {
                step: 1,
                description: "لحل هذه المسألة، نحتاج إلى تحليل المعطيات وتحديد المطلوب",
                equation: problem_text
              },
              {
                step: 2,
                description: "نطبق القوانين الرياضية المناسبة للمسألة",
              },
              {
                step: 3,
                description: "نحسب القيم ونصل إلى الحل النهائي",
              }
            ],
            final_answer: "تم تحليل المسألة. يرجى إضافة ANTHROPIC_API_KEY للحصول على حلول تفصيلية بالذكاء الاصطناعي.",
            graphs: []
          }
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
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `${systemPrompt}\n\nالمسألة: ${problem_text}\n\nقدم الحل بتنسيق JSON فقط بدون أي نص إضافي.`
          }
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      throw new Error(`Anthropic API error: ${anthropicResponse.statusText}`);
    }

    const anthropicData = await anthropicResponse.json();
    const responseText = anthropicData.content[0].text;

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const solution = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      steps: [
        {
          step: 1,
          description: "تم تحليل المسألة",
          equation: problem_text
        }
      ],
      final_answer: responseText,
      graphs: []
    };

    return new Response(
      JSON.stringify({ solution }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error solving problem:", error);
    return new Response(
      JSON.stringify({
        error: "حدث خطأ أثناء حل المسألة",
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
