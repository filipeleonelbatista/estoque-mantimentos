import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para normalizar nomes de produtos para comparação
export function normalizarNomeProduto(nome: string): string {
  // Converte para minúsculas e remove espaços extras
  const normalizado = nome.toLowerCase().trim()

  // Lista de produtos base para verificar
  const produtosBase = [
    { base: "arroz", variantes: ["arroz", "tio joão", "namorado", "camil"] },
    { base: "feijão", variantes: ["feijão", "carioca", "preto", "fradinho"] },
    { base: "açúcar", variantes: ["açúcar", "cristal", "refinado", "demerara"] },
    { base: "café", variantes: ["café", "pilão", "melitta", "3 corações"] },
    { base: "óleo", variantes: ["óleo", "soja", "girassol", "canola"] },
    { base: "leite", variantes: ["leite", "integral", "desnatado", "semi"] },
    { base: "macarrão", variantes: ["macarrão", "espaguete", "parafuso", "penne"] },
    { base: "sabão", variantes: ["sabão", "em pó", "líquido", "omo", "ariel"] },
    { base: "papel higiênico", variantes: ["papel", "higiênico", "neve", "personal"] },
    { base: "detergente", variantes: ["detergente", "limpol", "ypê"] },
    { base: "desinfetante", variantes: ["desinfetante", "pinho", "veja", "lysoform"] },
  ]

  // Verifica se o nome contém alguma das variantes
  for (const produto of produtosBase) {
    for (const variante of produto.variantes) {
      if (normalizado.includes(variante)) {
        return produto.base
      }
    }
  }

  // Se não encontrou nenhuma correspondência, retorna o nome original normalizado
  return normalizado
}

