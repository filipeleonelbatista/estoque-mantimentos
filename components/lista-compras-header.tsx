"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { atualizarListaCompras } from "@/lib/data"
import Logo from "./logo"
import ThemeToggle from "./theme-toggle"
import LanguageSelector from "./language-selector"
import { useI18n } from "@/lib/i18n/i18n-context"

export default function ListaComprasHeader() {
  const { t } = useI18n()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateList = async () => {
    setIsUpdating(true)

    try {
      atualizarListaCompras()

      toast({
        title: t("shoppingList", "listUpdated"),
        description: t("shoppingList", "listUpdatedDesc"),
        variant: "success",
      })

      // Recarregar a página para mostrar os itens atualizados
      window.location.reload()
    } catch (error) {
      console.error("Erro ao atualizar lista:", error)

      toast({
        title: t("common", "error"),
        description: t("shoppingList", "errorUpdating"),
        variant: "destructive",
      })

      setIsUpdating(false)
    }
  }

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">{t("common", "back")}</span>
            </Button>
          </Link>
          <Logo />
        </div>
        <p className="text-muted-foreground">{t("shoppingList", "description")}</p>
      </div>
      <div className="flex gap-2 items-center">
        <Button onClick={handleUpdateList} className="flex items-center gap-2" disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("common", "loading")}
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              {t("shoppingList", "updateList")}
            </>
          )}
        </Button>
        <div className="flex items-center">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>
    </header>
  )
}

