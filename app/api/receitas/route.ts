import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Item } from "@/lib/types";

const ReceitaSchema = z.object({
  titulo: z.string(),
  descricao: z.string().optional().default(""),
  pessoasServe: z.number().optional(),
  ingredientes: z.array(z.string()),
  modoPreparo: z.array(z.string()),
  tempoPreparo: z.string(),
  dificuldade: z.string(),
});
const ReceitasResponseSchema = z.object({
  para1Pessoa: ReceitaSchema.refine(
    (data) => data.pessoasServe === 1 || !data.pessoasServe,
    { message: "pessoasServe deve ser 1 para a versão para 1 pessoa" }
  ),
  para2Pessoas: ReceitaSchema.refine(
    (data) => data.pessoasServe === 2 || !data.pessoasServe,
    { message: "pessoasServe deve ser 2 para a versão para 2 pessoas" }
  ),
  para4Pessoas: ReceitaSchema.refine(
    (data) => data.pessoasServe === 4 || !data.pessoasServe,
    { message: "pessoasServe deve ser 4 para a versão para 4 pessoas" }
  ),
});

const receitasFallback = {
  para1Pessoa: {
    titulo: "Sanduíche Rápido",
    descricao: "Um sanduíche simples e rápido para uma refeição individual.",
    pessoasServe: 1,
    ingredientes: [
      "1 pão francês",
      "1 fatia de queijo",
      "1 folha de alface",
      "1 rodela de tomate",
    ],
    modoPreparo: [
      "Corte o pão ao meio",
      "Adicione o queijo, alface e tomate",
      "Sirva imediatamente",
    ],
    tempoPreparo: "5 minutos",
    dificuldade: "Fácil",
  },
  para2Pessoas: {
    titulo: "Macarrão com Molho de Tomate",
    descricao: "Um prato de macarrão simples com molho de tomate para duas pessoas.",
    pessoasServe: 2,
    ingredientes: [
      "200g de macarrão",
      "1 xícara de molho de tomate",
      "Sal a gosto",
      "2 colheres de azeite",
    ],
    modoPreparo: [
      "Cozinhe o macarrão em água fervente com sal",
      "Escorra e reserve",
      "Aqueça o molho de tomate",
      "Misture o macarrão com o molho e sirva",
    ],
    tempoPreparo: "15 minutos",
    dificuldade: "Fácil",
  },
  para4Pessoas: {
    titulo: "Arroz com Feijão e Farofa",
    descricao: "Um prato tradicional brasileiro para quatro pessoas.",
    pessoasServe: 4,
    ingredientes: [
      "2 xícaras de arroz",
      "1 xícara de feijão cozido",
      "1 xícara de farofa",
      "Sal a gosto",
    ],
    modoPreparo: [
      "Cozinhe o arroz",
      "Aqueça o feijão",
      "Prepare a farofa",
      "Sirva tudo junto",
    ],
    tempoPreparo: "30 minutos",
    dificuldade: "Médio",
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const language = formData.get("language") as string
    const lista = formData.get("lista") as string

    const itens: Item[] = JSON.parse(lista)

    if (!itens || itens.length === 0) {
      return NextResponse.json(
        {
          error: "Nenhum item fornecido",
          receitas: receitasFallback,
        },
        { status: 200 }
      );
    }

    const alimentos = itens
      .filter((item) => !["Higiene", "Limpeza"].includes(item.categoria))
      .map((item) => `${item.nome} (${item.quantidadeAtual} unidades)`)
      .join(", ");

    if (!alimentos.length) {
      return NextResponse.json(
        {
          error: "Nenhum alimento disponível no estoque",
          receitas: receitasFallback,
        },
        { status: 200 }
      );
    }

    const prompt = `
Você é um chef especializado em criar receitas com os ingredientes disponíveis.
Baseado nos seguintes ingredientes disponíveis no estoque: ${alimentos}

Gere os textos neste idioma ${language}.

Crie 1 receita que possa ser preparada em 3 versões:
1. Para 1 pessoa
2. Para 2 pessoas
3. Para 4 pessoas

A receita deve ser a mesma, apenas ajustando as quantidades dos ingredientes para cada versão.

Para cada versão da receita, forneça:
- Título criativo (mesmo para todas as versões)
- Descrição breve da receita (mesmo para todas as versões)
- Número de pessoas que serve (1, 2 ou 4)
- Lista de ingredientes com quantidades ajustadas para cada versão
- Modo de preparo detalhado em passos (mesmo para todas as versões)
- Tempo estimado de preparo (pode variar ligeiramente entre as versões)
- Nível de dificuldade (Fácil, Médio ou Difícil - mesmo para todas as versões)

Responda em formato JSON seguindo exatamente esta estrutura:
{
  "para1Pessoa": {
    "titulo": "Nome da Receita",
    "descricao": "Breve descrição da receita",
    "pessoasServe": 1,
    "ingredientes": ["Ingrediente 1 com quantidade", "Ingrediente 2 com quantidade"],
    "modoPreparo": ["Passo 1", "Passo 2", "Passo 3"],
    "tempoPreparo": "XX minutos",
    "dificuldade": "Nível"
  },
  "para2Pessoas": {
    // mesma estrutura com quantidades ajustadas
  },
  "para4Pessoas": {
    // mesma estrutura com quantidades ajustadas
  }
}

Use apenas os ingredientes disponíveis ou subconjuntos deles. Seja criativo, mas realista.
    `;

    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      prompt,
      schema: ReceitasResponseSchema,
    });

    return NextResponse.json({ receitas: result.object });
  } catch (error) {
    console.error("Erro ao gerar receitas:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar a solicitação",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        receitas: receitasFallback,
      },
      { status: 500 }
    );
  }
}
