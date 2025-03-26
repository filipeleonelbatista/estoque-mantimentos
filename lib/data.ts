"use client"

import type { Item, ItemCompra } from "./types"

const STORAGE_KEY = "estoque-mantimentos"
const STORAGE_KEY_COMPRAS = "estoque-mantimentos-compras"

// Função para gerar um ID único
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Função para obter todos os itens do localStorage
export const getItems = (): Item[] => {
  if (typeof window === "undefined") return []

  const items = localStorage.getItem(STORAGE_KEY)
  return items ? JSON.parse(items) : []
}

// Função para adicionar um novo item
export const addItem = (item: Omit<Item, "id">): Item => {
  const newItem = {
    ...item,
    id: generateId(),
  }

  const items = getItems()
  const updatedItems = [...items, newItem]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems))

  return newItem
}

// Função para atualizar um item existente
export const updateItem = (updatedItem: Item): Item => {
  const items = getItems()
  const updatedItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item))

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems))
  return updatedItem
}

// Função para excluir um item
export const deleteItem = (id: string): void => {
  const items = getItems()
  const updatedItems = items.filter((item) => item.id !== id)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems))
}

// Funções para a lista de compras
export const getListaCompras = (): ItemCompra[] => {
  if (typeof window === "undefined") return []

  const items = localStorage.getItem(STORAGE_KEY_COMPRAS)
  return items ? JSON.parse(items) : []
}

export const addItemCompra = (item: Omit<ItemCompra, "id">): ItemCompra => {
  const newItem = {
    ...item,
    id: generateId(),
  }

  const items = getListaCompras()
  const updatedItems = [...items, newItem]
  localStorage.setItem(STORAGE_KEY_COMPRAS, JSON.stringify(updatedItems))

  return newItem
}

export const updateItemCompra = (updatedItem: ItemCompra): ItemCompra => {
  const items = getListaCompras()
  const updatedItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item))

  localStorage.setItem(STORAGE_KEY_COMPRAS, JSON.stringify(updatedItems))
  return updatedItem
}

export const removeItemCompra = (id: string): void => {
  const items = getListaCompras()
  const updatedItems = items.filter((item) => item.id !== id)

  localStorage.setItem(STORAGE_KEY_COMPRAS, JSON.stringify(updatedItems))
}

export const atualizarListaCompras = (): void => {
  const estoqueItems = getItems()
  const listaCompras = getListaCompras()

  // Filtrar itens em falta ou abaixo do desejado
  const itensFaltantes = estoqueItems.filter(
    (item) => item.quantidadeAtual === 0 || item.quantidadeAtual < item.quantidadeDesejada,
  )

  // Criar um mapa dos itens já na lista de compras
  const itemsMap = new Map<string, ItemCompra>()
  listaCompras.forEach((item) => {
    itemsMap.set(item.itemId, item)
  })

  // Adicionar novos itens faltantes à lista de compras
  itensFaltantes.forEach((item) => {
    if (!itemsMap.has(item.id)) {
      addItemCompra({
        itemId: item.id,
        nome: item.nome,
        categoria: item.categoria,
        quantidade: item.quantidadeDesejada - item.quantidadeAtual,
        quantidadeAtual: item.quantidadeAtual,
        quantidadeDesejada: item.quantidadeDesejada,
        valor: 0,
      })
    } else {
      // Atualizar informações do item existente
      const existingItem = itemsMap.get(item.id)!
      updateItemCompra({
        ...existingItem,
        nome: item.nome,
        categoria: item.categoria,
        quantidadeAtual: item.quantidadeAtual,
        quantidadeDesejada: item.quantidadeDesejada,
      })
    }
  })

  // Remover itens que não estão mais faltando
  const itemIds = new Set(itensFaltantes.map((item) => item.id))
  listaCompras.forEach((item) => {
    if (!itemIds.has(item.itemId)) {
      removeItemCompra(item.id)
    }
  })
}

// Função para inicializar dados de exemplo (se necessário)
export const initializeExampleData = (): void => {
  const items = getItems()

  if (items.length === 0) {
    const exampleItems: Omit<Item, "id">[] = [
      {
        nome: "Arroz",
        categoria: "Grãos",
        quantidadeAtual: 2,
        quantidadeDesejada: 3,
      },
      {
        nome: "Feijão",
        categoria: "Grãos",
        quantidadeAtual: 3,
        quantidadeDesejada: 2,
      },
      {
        nome: "Massas",
        categoria: "Grãos",
        quantidadeAtual: 4,
        quantidadeDesejada: 2,
      },
      {
        nome: "Carne",
        categoria: "Proteínas",
        quantidadeAtual: 2,
        quantidadeDesejada: 3,
      },
      {
        nome: "Frango",
        categoria: "Proteínas",
        quantidadeAtual: 1,
        quantidadeDesejada: 2,
      },
      {
        nome: "Molho de Tomate",
        categoria: "Enlatados",
        quantidadeAtual: 3,
        quantidadeDesejada: 4,
      },
      {
        nome: "Salsicha",
        categoria: "Proteínas",
        quantidadeAtual: 5,
        quantidadeDesejada: 2,
      },
      {
        nome: "Pão Francês",
        categoria: "Padaria",
        quantidadeAtual: 6,
        quantidadeDesejada: 8,
      },
      {
        nome: "Alface",
        categoria: "Vegetais",
        quantidadeAtual: 1,
        quantidadeDesejada: 2,
      },
      {
        nome: "Tomate",
        categoria: "Vegetais",
        quantidadeAtual: 4,
        quantidadeDesejada: 3,
      },
      {
        nome: "Farofa",
        categoria: "Grãos",
        quantidadeAtual: 1,
        quantidadeDesejada: 1,
      },
      {
        nome: "Leite",
        categoria: "Laticínios",
        quantidadeAtual: 2,
        quantidadeDesejada: 6,
      },
      {
        nome: "Papel Higiênico",
        categoria: "Higiene",
        quantidadeAtual: 12,
        quantidadeDesejada: 8,
      },
      {
        nome: "Sabão em Pó",
        categoria: "Limpeza",
        quantidadeAtual: 1,
        quantidadeDesejada: 2,
      },
    ]

    exampleItems.forEach((item) => addItem(item))
  }
}

