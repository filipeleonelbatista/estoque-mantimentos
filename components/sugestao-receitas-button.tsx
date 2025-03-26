"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChefHat, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getItems } from "@/lib/data"
import { toast } from "@/components/ui/use-toast"
import { useI18n } from "@/lib/i18n/i18n-context"

export default function SugestaoReceitasButton() {
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setIsLoading(true)

    try {
      // Obter todos os itens do estoque
      const itens = getItems()

      // Filtrar apenas alimentos (excluir itens de limpeza e higiene)
      const alimentos = itens.filter((item) => !["Higiene", "Limpeza"].includes(item.categoria))

      if (alimentos.length === 0) {
        toast({
          title: t("recipes", "noFood"),
          description: t("recipes", "noFoodDesc"),
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Redirecionar para a página de sugestões
      router.push("/sugestao-receitas")

      // Armazenar os itens no localStorage para serem usados na página de sugestões
      localStorage.setItem("sugestao-receitas-itens", JSON.stringify(alimentos))
    } catch (error) {
      console.error("Erro ao gerar sugestões:", error)
      toast({
        title: t("common", "error"),
        description: t("recipes", "errorGenerating"),
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading} className="flex items-center gap-2">
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("recipes", "generatingRecipes")}
        </>
      ) : (
        <>
          <ChefHat className="h-4 w-4" />
          {t("recipes", "suggestRecipes")}
        </>
      )}
    </Button>
  )
}

