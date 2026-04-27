// Edge function: gera questões clínicas estilo SUS/ENAMED via Lovable AI Gateway
// Recebe { theme, difficulty, count } e insere em clinical_questions.
// Apenas admins podem invocar.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VALID_THEMES = [
  "Clínica Médica",
  "Cirurgia Geral",
  "Pediatria",
  "Ginecologia e Obstetrícia",
  "Medicina de Família e Comunidade",
  "Saúde Coletiva",
];
const VALID_DIFFICULTIES = ["dificil", "muito_dificil", "tubarao"];

const difficultyDescription: Record<string, string> = {
  dificil:
    "Difícil (padrão ENAMED/SUS): caso clínico longo e realista de atenção primária ou hospitalar, com pegadinhas de protocolo do Ministério da Saúde e necessidade de raciocínio clínico sólido.",
  muito_dificil:
    "Muito difícil: diagnóstico diferencial complexo, paciente com comorbidades, múltiplas pistas conflitantes, exige integração fisiopatológica e conhecimento de protocolos SUS atualizados (Cadernos AB, SVS, CONITEC).",
  tubarao:
    "Tubarão (nível residência top): caso raro, apresentação atípica, condutas de emergência avançadas, armadilhas clássicas de prova, requer memória refinada de diretrizes e evidências recentes.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    // Auth: exige JWT do usuário + role admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabaseUser.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleCheck } = await supabaseAdmin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Apenas admins" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Input
    const { theme, difficulty, count = 5 } = await req.json();
    if (!VALID_THEMES.includes(theme)) {
      return new Response(JSON.stringify({ error: "Especialidade inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return new Response(JSON.stringify({ error: "Dificuldade inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const n = Math.max(1, Math.min(10, Number(count) || 5));

    const systemPrompt = `Você é um elaborador oficial de questões do ENAMED/Revalida, especialista em ${theme}, com domínio absoluto dos protocolos do SUS (Cadernos de Atenção Básica, PCDTs, SVS, PNI, linhas de cuidado do Ministério da Saúde) e das diretrizes brasileiras atualizadas. Elabore questões de caso clínico extensas (>= 120 palavras de cenário), com dados vitais, exame físico, exames complementares quando relevante, e 5 alternativas verossímeis com apenas UMA correta. O nível deve ser: ${difficultyDescription[difficulty]}. As alternativas erradas devem ser plausíveis (distratores de qualidade). A explicação deve justificar a correta E explicar por que cada alternativa errada está errada, citando protocolo/diretriz quando aplicável. Responda sempre em português brasileiro.`;

    const userPrompt = `Gere ${n} questões INÉDITAS, DIFERENTES entre si (temas/condições clínicas variadas dentro de ${theme}), no nível "${difficulty}". Não repita cenários. Retorne via tool call.`;

    // Lovable AI Gateway com tool calling para output estruturado
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "save_questions",
              description: "Salva as questões clínicas geradas",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        scenario: { type: "string", description: "Caso clínico completo (>=120 palavras)" },
                        question: { type: "string", description: "Enunciado da pergunta" },
                        options: {
                          type: "array",
                          minItems: 5,
                          maxItems: 5,
                          items: {
                            type: "object",
                            properties: {
                              text: { type: "string" },
                              is_correct: { type: "boolean" },
                            },
                            required: ["text", "is_correct"],
                            additionalProperties: false,
                          },
                        },
                        explanation: {
                          type: "string",
                          description: "Explicação justificando a correta e comentando cada distrator",
                        },
                      },
                      required: ["scenario", "question", "options", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "save_questions" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Aguarde e tente novamente." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos Lovable AI esgotados. Adicione em Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const txt = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, txt);
      return new Response(JSON.stringify({ error: "Erro no gateway AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("IA não retornou tool call");
    const parsed = JSON.parse(toolCall.function.arguments);
    const questions = parsed.questions as Array<{
      scenario: string;
      question: string;
      options: { text: string; is_correct: boolean }[];
      explanation: string;
    }>;

    // Validação: exatamente 1 correta por questão
    const valid = questions.filter(
      (q) =>
        Array.isArray(q.options) &&
        q.options.length === 5 &&
        q.options.filter((o) => o.is_correct).length === 1,
    );
    if (valid.length === 0) throw new Error("Nenhuma questão válida gerada");

    // Insert no banco
    const { data: maxOrder } = await supabaseAdmin
      .from("clinical_questions")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    let nextOrder = (maxOrder?.display_order ?? 0) + 1;

    const rows = valid.map((q) => ({
      theme,
      scenario: q.scenario,
      question: q.question,
      options: q.options,
      explanation: q.explanation,
      difficulty,
      display_order: nextOrder++,
    }));

    const { error: insertErr } = await supabaseAdmin.from("clinical_questions").insert(rows);
    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({ inserted: rows.length, requested: n, theme, difficulty }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-clinical-questions error:", e);
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
