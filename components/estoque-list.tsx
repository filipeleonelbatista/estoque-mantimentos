"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus, Minus, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getItems, updateItem } from "@/lib/data"
import type { Item } from "@/lib/types"
import EditItemDialog from "./edit-item-dialog"
import DeleteItemDialog from "./delete-item-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n/i18n-context"

export default function EstoqueList() {
  const { t } = useI18n()
  const [items, setItems] = useState<Item[]>([])
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [deleteItem, setDeleteItem] = useState<Item | null>(null)
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Simular um pequeno atraso para mostrar o skeleton
        await new Promise((resolve) => setTimeout(resolve, 300))

        setItems(getItems())
      } catch (error) {
        console.error("Erro ao carregar itens:", error)
        toast({
          title: t("common", "error"),
          description: t("item", "errorLoading"),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Adicionar listener para atualizar a lista quando os itens forem atualizados
    const handleItemsUpdated = () => {
      setItems(getItems())
    }

    window.addEventListener("itemsUpdated", handleItemsUpdated)

    return () => {
      window.removeEventListener("itemsUpdated", handleItemsUpdated)
    }
  }, [t])

  const handleItemUpdated = () => {
    setItems(getItems())
    setEditItem(null)
  }

  const handleItemDeleted = () => {
    setItems(getItems())
    setDeleteItem(null)
  }

  const handleUpdateQuantity = async (item: Item, increment: boolean) => {
    // Marcar o item como carregando
    setLoadingItems((prev) => ({ ...prev, [item.id]: true }))

    try {
      const newQuantity = increment ? item.quantidadeAtual + 1 : Math.max(0, item.quantidadeAtual - 1)

      updateItem({
        ...item,
        quantidadeAtual: newQuantity,
      })

      setItems(getItems())

      // Mostrar toast apenas para alterações significativas
      if (increment && newQuantity === item.quantidadeDesejada) {
        toast({
          title: t("item", "idealQuantityReached"),
          description: t("item", "idealQuantityReachedDesc", { name: item.nome }),
          variant: "success",
        })
      } else if (!increment && newQuantity === 0) {
        toast({
          title: t("item", "itemOutOfStock"),
          description: t("item", "itemOutOfStockDesc", { name: item.nome }),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error)
      toast({
        title: t("common", "error"),
        description: t("item", "errorUpdating"),
        variant: "destructive",
      })
    } finally {
      // Remover o estado de carregamento
      setLoadingItems((prev) => {
        const newState = { ...prev }
        delete newState[item.id]
        return newState
      })
    }
  }

  // Renderização condicional com skeleton
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("item", "name")}</TableHead>
              <TableHead>{t("item", "category")}</TableHead>
              <TableHead className="text-center">{t("item", "currentQuantity")}</TableHead>
              <TableHead className="text-center">{t("item", "desiredQuantity")}</TableHead>
              <TableHead className="text-center">{t("item", "status")}</TableHead>
              <TableHead className="text-right">{t("item", "actions")}</TableHead>
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
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("item", "name")}</TableHead>
              <TableHead>{t("item", "category")}</TableHead>
              <TableHead className="text-center">{t("item", "currentQuantity")}</TableHead>
              <TableHead className="text-center">{t("item", "desiredQuantity")}</TableHead>
              <TableHead className="text-center">{t("item", "status")}</TableHead>
              <TableHead className="text-right">{t("item", "actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  {t("home", "noItems")}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell>{item.categoria}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateQuantity(item, false)}
                        disabled={loadingItems[item.id] || item.quantidadeAtual === 0}
                      >
                        {loadingItems[item.id] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        <span className="sr-only">{t("item", "decrease")}</span>
                      </Button>
                      <span>{item.quantidadeAtual}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateQuantity(item, true)}
                        disabled={loadingItems[item.id]}
                      >
                        {loadingItems[item.id] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                        <span className="sr-only">{t("item", "increase")}</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.quantidadeDesejada}</TableCell>
                  <TableCell className="text-center">
                    {item.quantidadeAtual === 0 ? (
                      <Badge variant="destructive">{t("item", "outOfStock")}</Badge>
                    ) : item.quantidadeAtual < item.quantidadeDesejada ? (
                      <Badge variant="warning">{t("item", "low")}</Badge>
                    ) : (
                      <Badge variant="success">{t("item", "inStock")}</Badge>
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
                        <span className="sr-only">{t("common", "edit")}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteItem(item)}
                        disabled={loadingItems[item.id]}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t("common", "delete")}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editItem && (
        <EditItemDialog
          item={editItem}
          open={!!editItem}
          onOpenChange={() => setEditItem(null)}
          onItemUpdated={handleItemUpdated}
        />
      )}

      {deleteItem && (
        <DeleteItemDialog
          item={deleteItem}
          open={!!deleteItem}
          onOpenChange={() => setDeleteItem(null)}
          onItemDeleted={handleItemDeleted}
        />
      )}
    </>
  )
}

