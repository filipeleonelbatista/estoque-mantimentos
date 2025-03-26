"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { normalizarNomeProduto } from "@/lib/utils"
import type { Item, ItemCompra } from "@/lib/types"
import { addItem, updateItem, updateItemCompra, getItems } from "@/lib/data"
import { useI18n } from "@/lib/i18n/i18n-context"

interface EditItemDialogProps {
  item?: Item | ItemCompra
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemUpdated: () => void
}

export default function EditItemDialog({ item, open, onOpenChange, onItemUpdated }: EditItemDialogProps) {
  const { t } = useI18n()

  const categorias = [
    { value: "Grãos", label: t("categories", "grains") },
    { value: "Enlatados", label: t("categories", "canned") },
    { value: "Congelados", label: t("categories", "frozen") },
    { value: "Laticínios", label: t("categories", "dairy") },
    { value: "Bebidas", label: t("categories", "beverages") },
    { value: "Higiene", label: t("categories", "hygiene") },
    { value: "Limpeza", label: t("categories", "cleaning") },
    { value: "Outros", label: t("categories", "others") },
  ]

  const [formData, setFormData] = useState<Partial<Item>>({
    nome: "",
    categoria: "Outros",
    quantidadeAtual: 0,
    quantidadeDesejada: 1,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [similarItems, setSimilarItems] = useState<Item[]>([])
  const [selectedSimilarItem, setSelectedSimilarItem] = useState<Item | null>(null)
  const [showSimilarItemAlert, setShowSimilarItemAlert] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        nome: item.nome,
        categoria: item.categoria,
        quantidadeAtual: item.quantidadeAtual,
        quantidadeDesejada: item.quantidadeDesejada,
      })
    } else {
      setFormData({
        nome: "",
        categoria: "Outros",
        quantidadeAtual: 0,
        quantidadeDesejada: 1,
      })
    }
    setErrors({})
    setSimilarItems([])
    setSelectedSimilarItem(null)
    setShowSimilarItemAlert(false)
  }, [item, open])

  const handleChange = (field: keyof Item, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Verificar itens similares quando o nome é alterado
    if (field === "nome" && typeof value === "string" && value.trim().length > 2 && !item?.id) {
      checkSimilarItems(value)
    } else if (field === "nome" && (!value || typeof value !== "string" || value.trim().length <= 2)) {
      setSimilarItems([])
      setSelectedSimilarItem(null)
      setShowSimilarItemAlert(false)
    }
  }

  const checkSimilarItems = (nome: string) => {
    if (!nome || nome.trim().length <= 2) return

    const nomeNormalizado = normalizarNomeProduto(nome)
    const estoqueItems = getItems()

    const similares = estoqueItems.filter((item) => {
      const itemNomeNormalizado = normalizarNomeProduto(item.nome)
      return itemNomeNormalizado === nomeNormalizado
    })

    if (similares.length > 0) {
      setSimilarItems(similares)
      setSelectedSimilarItem(similares[0])
      setShowSimilarItemAlert(true)
    } else {
      setSimilarItems([])
      setSelectedSimilarItem(null)
      setShowSimilarItemAlert(false)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome?.trim()) {
      newErrors.nome = t("addEditItem", "nameRequired")
    }

    if (formData.quantidadeAtual === undefined || formData.quantidadeAtual < 0) {
      newErrors.quantidadeAtual = t("addEditItem", "currentQuantityInvalid")
    }

    if (formData.quantidadeDesejada === undefined || formData.quantidadeDesejada <= 0) {
      newErrors.quantidadeDesejada = t("addEditItem", "desiredQuantityInvalid")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)

    try {
      // Se um item similar foi selecionado e o usuário optou por adicionar a ele
      if (selectedSimilarItem && showSimilarItemAlert) {
        // Atualizar o item existente adicionando a quantidade
        updateItem({
          ...selectedSimilarItem,
          quantidadeAtual: selectedSimilarItem.quantidadeAtual + (formData.quantidadeAtual || 0),
          quantidadeDesejada: Math.max(selectedSimilarItem.quantidadeDesejada, formData.quantidadeDesejada || 0),
        })

        toast({
          title: t("addEditItem", "itemUpdated"),
          description: t("addEditItem", "quantityAddedToExisting", { name: selectedSimilarItem.nome }),
          variant: "success",
        })
      } else {
        // Verificar se é um item da lista de compras (tem a propriedade 'itemId')
        if ("itemId" in formData) {
          updateItemCompra({
            id: (item as ItemCompra).id,
            itemId: (item as ItemCompra).itemId,
            nome: formData.nome!,
            categoria: formData.categoria!,
            quantidade: (formData as any).quantidade || (item as ItemCompra).quantidade,
            quantidadeAtual: Number(formData.quantidadeAtual),
            quantidadeDesejada: Number(formData.quantidadeDesejada),
            valor: (formData as any).valor || (item as ItemCompra).valor,
          })

          toast({
            title: t("addEditItem", "itemUpdated"),
            description: t("addEditItem", "itemUpdatedDesc", { name: formData.nome }),
            variant: "success",
          })
        } else if (item?.id) {
          updateItem({
            id: item.id,
            nome: formData.nome!,
            categoria: formData.categoria!,
            quantidadeAtual: Number(formData.quantidadeAtual),
            quantidadeDesejada: Number(formData.quantidadeDesejada),
          })

          toast({
            title: t("addEditItem", "itemUpdated"),
            description: t("addEditItem", "itemUpdatedDesc", { name: formData.nome }),
            variant: "success",
          })
        } else {
          addItem({
            nome: formData.nome!,
            categoria: formData.categoria!,
            quantidadeAtual: Number(formData.quantidadeAtual),
            quantidadeDesejada: Number(formData.quantidadeDesejada),
          })

          toast({
            title: t("addEditItem", "itemAdded"),
            description: t("addEditItem", "itemAddedDesc", { name: formData.nome }),
            variant: "success",
          })
        }
      }

      onItemUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar item:", error)
      toast({
        title: t("common", "error"),
        description: t("addEditItem", "errorSaving"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectSimilarItem = (itemId: string) => {
    const selected = similarItems.find((item) => item.id === itemId)
    if (selected) {
      setSelectedSimilarItem(selected)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? t("addEditItem", "editItem") : t("addEditItem", "addItem")}</DialogTitle>
        </DialogHeader>

        {showSimilarItemAlert && selectedSimilarItem && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("addEditItem", "similarItemFound")}</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                {t("addEditItem", "similarItemFoundDesc")}: <strong>{selectedSimilarItem.nome}</strong>
              </p>

              {similarItems.length > 1 && (
                <Select value={selectedSimilarItem.id} onValueChange={handleSelectSimilarItem}>
                  <SelectTrigger className="mb-2">
                    <SelectValue placeholder={t("addEditItem", "selectSimilarItem")} />
                  </SelectTrigger>
                  <SelectContent>
                    {similarItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nome} ({t("item", "currentQuantity")}: {item.quantidadeAtual},{" "}
                        {t("item", "desiredQuantity")}: {item.quantidadeDesejada})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <p>{t("addEditItem", "addToExisting")}</p>

              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowSimilarItemAlert(false)}>
                  {t("addEditItem", "createNewItem")}
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
                  {t("addEditItem", "addToExistingConfirm")}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">{t("addEditItem", "name")}</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              placeholder={t("addEditItem", "namePlaceholder")}
              className={errors.nome ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="categoria">{t("addEditItem", "category")}</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => handleChange("categoria", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="categoria">
                <SelectValue placeholder={t("addEditItem", "selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantidadeAtual">{t("addEditItem", "currentQuantity")}</Label>
              <Input
                inputMode="numeric"
                id="quantidadeAtual"
                type="number"
                min="0"
                value={formData.quantidadeAtual}
                onChange={(e) => handleChange("quantidadeAtual", Number.parseInt(e.target.value) || 0)}
                className={errors.quantidadeAtual ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.quantidadeAtual && <p className="text-sm text-red-500">{errors.quantidadeAtual}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantidadeDesejada">{t("addEditItem", "desiredQuantity")}</Label>
              <Input
                inputMode="numeric"
                id="quantidadeDesejada"
                type="number"
                min="1"
                value={formData.quantidadeDesejada}
                onChange={(e) => handleChange("quantidadeDesejada", Number.parseInt(e.target.value) || 1)}
                className={errors.quantidadeDesejada ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.quantidadeDesejada && <p className="text-sm text-red-500">{errors.quantidadeDesejada}</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("common", "cancel")}
          </Button>
          {!showSimilarItemAlert && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common", "loading")}
                </>
              ) : item ? (
                t("common", "save")
              ) : (
                t("common", "add")
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

