export interface Item {
  id: string
  nome: string
  categoria: string
  quantidadeAtual: number
  quantidadeDesejada: number
}

export interface ItemCompra {
  id: string
  itemId: string // ID do item original no estoque
  nome: string
  categoria: string
  quantidade: number
  quantidadeAtual: number
  quantidadeDesejada: number
  valor?: number
}

