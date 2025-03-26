"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Plus, Minus, Loader2, ShoppingBag } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getListaCompras, updateItemCompra, removeItemCompra, getItems, updateItem, addItem } from "@/lib/data"
import { normalizarNomeProduto } from "@/lib/utils"
import type { ItemCompra } from "@/lib/types"
import EditItemDialog from "./edit-item-dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function ListaComprasContent() {
  const [items, setItems] = useState<ItemCompra[]>([])
  const [editItem, setEditItem] = useState<ItemCompra | null>(null)
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({})
  const [isAddingToStock, setIsAddingToStock] = useState(false)
  const [itemValues, setItemValues] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Simular um pequeno atraso para mostrar o skeleton
        await new Promise((resolve) => setTimeout(resolve, 300))

        const listaCompras = getListaCompras()
        setItems(listaCompras)

        // Inicializar os valores dos inputs
        const initialValues: Record<string, string> = {}
        listaCompras.forEach((item) => {
          initialValues[item.id] = item.valor ? item.valor.toString() : ""
        })
        setItemValues(initialValues)
      } catch (error) {
        console.error("Erro ao carregar lista de compras:", error)
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar a lista de compras.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Adicionar listener para atualizar a lista quando os itens forem atualizados
    const handleItemsUpdated = () => {
      const updatedItems = getListaCompras()
      setItems(updatedItems)

      // Atualizar os valores dos inputs
      const updatedValues: Record<string, string> = {}
      updatedItems.forEach((item) => {
        updatedValues[item.id] = item.valor ? item.valor.toString() : ""
      })
      setItemValues(updatedValues)
    }

    window.addEventListener("itemsUpdated", handleItemsUpdated)

    return () => {
      window.removeEventListener("itemsUpdated", handleItemsUpdated)
    }
  }, [])

  // Resto do código permanece o mesmo...

  // Renderização condicional com skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-center">Valor Unitário</TableHead>
                <TableHead className="text-center">Subtotal</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-6 w-16 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-6 w-16 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-6 w-20 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-6 w-16 mx-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    )
  }

  const handleItemUpdated = () => {
    setItems(getListaCompras())
    setEditItem(null)
  }

  const handleRemoveItem = async (id: string, nome: string) => {
    setLoadingItems((prev) => ({ ...prev, [id]: true }))

    try {
      removeItemCompra(id)
      const updatedItems = getListaCompras()
      setItems(updatedItems)

      // Atualizar os valores dos inputs
      const updatedValues = { ...itemValues }
      delete updatedValues[id]
      setItemValues(updatedValues)

      toast({
        title: "Item removido",
        description: `O item "${nome}" foi removido da lista de compras.`,
        variant: "destructive",
      })
    } catch (error) {
      console.error("Erro ao remover item:", error)

      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o item da lista.",
        variant: "destructive",
      })
    } finally {
      setLoadingItems((prev) => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
    }
  }

  const handleUpdateQuantidade = async (item: ItemCompra, increment: boolean) => {
    setLoadingItems((prev) => ({ ...prev, [item.id]: true }))

    try {
      const newQuantidade = increment ? item.quantidade + 1 : Math.max(1, item.quantidade - 1)

      updateItemCompra({
        ...item,
        quantidade: newQuantidade,
      })

      const updatedItems = getListaCompras()
      setItems(updatedItems)
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error)

      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a quantidade.",
        variant: "destructive",
      })
    } finally {
      setLoadingItems((prev) => {
        const newState = { ...prev }
        delete newState[item.id]
        return newState
      })
    }
  }

  const handleValorChange = (id: string, valor: string) => {
    // Atualizar o estado local do input
    setItemValues((prev) => ({
      ...prev,
      [id]: valor,
    }))
  }

  const handleValorBlur = (item: ItemCompra) => {
    const valor = itemValues[item.id]
    const numericValue = valor.replace(/[^0-9.,]/g, "").replace(",", ".")
    const newValor = numericValue === "" ? "0" : numericValue

    updateItemCompra({
      ...item,
      valor: Number.parseFloat(newValor),
    })

    // Atualizar o valor formatado no input
    setItemValues((prev) => ({
      ...prev,
      [item.id]: Number.parseFloat(newValor).toString(),
    }))

    const updatedItems = getListaCompras()
    setItems(updatedItems)
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const totalEstimado = items.reduce((total, item) => {
    return total + (item.valor || 0) * item.quantidade
  }, 0)

  // Função para adicionar itens da lista de compras ao estoque
  const handleAddToStock = async () => {
    if (items.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Não há itens na lista de compras para adicionar ao estoque.",
        variant: "destructive",
      })
      return
    }

    setIsAddingToStock(true)

    try {
      const estoqueItems = getItems()
      const itemsAdicionados: string[] = []
      const itemsAtualizados: string[] = []

      // Processar cada item da lista de compras
      for (const itemCompra of items) {
        const nomeNormalizado = normalizarNomeProduto(itemCompra.nome)

        // Verificar se já existe um item similar no estoque
        const itemExistente = estoqueItems.find((item) => {
          const itemNomeNormalizado = normalizarNomeProduto(item.nome)
          return itemNomeNormalizado === nomeNormalizado
        })

        if (itemExistente) {
          // Atualizar o item existente
          updateItem({
            ...itemExistente,
            quantidadeAtual: itemExistente.quantidadeAtual + itemCompra.quantidade,
          })
          itemsAtualizados.push(itemExistente.nome)
        } else {
          // Adicionar novo item ao estoque
          addItem({
            nome: itemCompra.nome,
            categoria: itemCompra.categoria,
            quantidadeAtual: itemCompra.quantidade,
            quantidadeDesejada: itemCompra.quantidadeDesejada,
          })
          itemsAdicionados.push(itemCompra.nome)
        }

        // Remover o item da lista de compras
        removeItemCompra(itemCompra.id)
      }

      // Atualizar a lista de compras
      const updatedItems = getListaCompras()
      setItems(updatedItems)

      // Atualizar os valores dos inputs
      const updatedValues: Record<string, string> = {}
      updatedItems.forEach((item) => {
        updatedValues[item.id] = item.valor ? item.valor.toString() : ""
      })
      setItemValues(updatedValues)

      // Disparar evento para atualizar outros componentes
      const event = new CustomEvent("itemsUpdated")
      window.dispatchEvent(event)

      // Mostrar mensagem de sucesso
      if (itemsAdicionados.length > 0 || itemsAtualizados.length > 0) {
        let mensagem = ""

        if (itemsAdicionados.length > 0) {
          mensagem += `Itens adicionados: ${itemsAdicionados.join(", ")}`
        }

        if (itemsAtualizados.length > 0) {
          if (mensagem) mensagem += "\n"
          mensagem += `Itens atualizados: ${itemsAtualizados.join(", ")}`
        }

        toast({
          title: "Estoque atualizado",
          description: mensagem,
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Erro ao adicionar itens ao estoque:", error)

      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar itens ao estoque.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToStock(false)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Quantidade</TableHead>
              <TableHead className="text-center">Valor Unitário</TableHead>
              <TableHead className="text-center">Subtotal</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Nenhum item na lista de compras. Clique em "Atualizar Lista" para buscar itens em falta.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell>{item.categoria}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateQuantidade(item, false)}
                        disabled={loadingItems[item.id] || item.quantidade <= 1}
                      >
                        {loadingItems[item.id] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        <span className="sr-only">Diminuir</span>
                      </Button>
                      <Input
                        inputMode="numeric"
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value) || 1
                          updateItemCompra({
                            ...item,
                            quantidade: value,
                          })
                          setItems(getListaCompras())
                        }}
                        className="w-16 text-center"
                        disabled={loadingItems[item.id]}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateQuantidade(item, true)}
                        disabled={loadingItems[item.id]}
                      >
                        {loadingItems[item.id] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                        <span className="sr-only">Aumentar</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      inputMode="numeric"
                      type="text"
                      value={itemValues[item.id] || ""}
                      onChange={(e) => handleValorChange(item.id, e.target.value)}
                      onBlur={() => handleValorBlur(item)}
                      placeholder="0,00"
                      className="w-24"
                      disabled={loadingItems[item.id]}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {item.valor ? formatCurrency(item.valor * item.quantidade) : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.quantidadeAtual === 0 ? (
                      <Badge variant="destructive">Em Falta</Badge>
                    ) : (
                      <Badge variant="warning">Baixo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditItem(item)}
                        disabled={loadingItems[item.id]}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id, item.nome)}
                        disabled={loadingItems[item.id]}
                      >
                        {loadingItems[item.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
        {items.length > 0 && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-lg font-semibold">Total Estimado: {formatCurrency(totalEstimado)}</p>
          </div>
        )}

        <Button
          onClick={handleAddToStock}
          disabled={isAddingToStock || items.length === 0}
          className="w-full sm:w-auto"
        >
          {isAddingToStock ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adicionando ao Estoque...
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Adicionar ao Estoque
            </>
          )}
        </Button>
      </div>

      {editItem && (
        <EditItemDialog
          item={editItem}
          open={!!editItem}
          onOpenChange={() => setEditItem(null)}
          onItemUpdated={handleItemUpdated}
        />
      )}
    </>
  )
}

