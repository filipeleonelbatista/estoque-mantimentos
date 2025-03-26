import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"


const DicaSchema = z.object({
  titulo: z.string(),
  descricao: z.string(),
  tipo: z.enum(["comida", "limpeza", "organização", "economia"]),
  icone: z.enum(["chef-hat", "spray-can", "boxes", "piggy-bank"]),
})

const dicasFallback = [
  {
    titulo: "Organize seu estoque por categorias",
    descricao:
      "Separar os itens por categorias facilita encontrar o que você precisa e identificar o que está em falta.",
    tipo: "organização",
    icone: "boxes",
  },
  {
    titulo: "Receita rápida: Macarrão com molho",
    descricao: "Cozinhe o macarrão e misture com molho de tomate. Adicione temperos a gosto para uma refeição rápida.",
    tipo: "comida",
    icone: "chef-hat",
  },
  {
    titulo: "Economize comprando em quantidade",
    descricao: "Itens não perecíveis podem ser comprados em maior quantidade quando estiverem em promoção.",
    tipo: "economia",
    icone: "piggy-bank",
  },
  {
    titulo: "Limpeza eficiente da geladeira",
    descricao:
      "Limpe sua geladeira semanalmente para evitar o acúmulo de resíduos e manter os alimentos frescos por mais tempo.",
    tipo: "limpeza",
    icone: "spray-can",
  },
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const language = formData.get("language") as string

    let prompt = `
      Você é um assistente especializado em economia doméstica.
      
      Crie uma dica de economia para compras de mantimentos e gestão do estoque doméstico.

      Use esta linguagem para gerar os textos neste idioma ${language}
      
      Responda em formato JSON seguindo exatamente esta estrutura:
      {
        "titulo": "Título curto e atrativo para a dica",
        "descricao": "Descrição detalhada da dica em até 2 frases",
        "tipo": "economia",
        "icone": "piggy-bank"
      }
      `

    try {
      const result = await generateObject({
        model: google("gemini-1.5-flash"),
        prompt,
        schema: DicaSchema,
      })

      return NextResponse.json({ dica: result.object });
    } catch (aiError) {
      console.error("Erro ao chamar a API do Google:", aiError)

      return NextResponse.json({
        error: "Erro ao processar a solicitação na API do Google",
        details: aiError instanceof Error ? aiError.message : "Erro desconhecido",
        dica: dicasFallback[Math.floor(Math.random() * dicasFallback.length)],
      })
    }
  } catch (error) {
    console.error("Erro ao gerar dica:", error)
    return NextResponse.json({
      error: "Erro ao processar a solicitação",
      details: error instanceof Error ? error.message : "Erro desconhecido",
      dica: dicasFallback[Math.floor(Math.random() * dicasFallback.length)],
    })
  }
}

