"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getItems } from "@/lib/data"
import { Package, ShoppingCart, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n/i18n-context"

export default function EstoqueStats() {
  const { t } = useI18n()

  const [stats, setStats] = useState({
    total: 0,
    emFalta: 0,
    abaixoDoDesejado: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const updateStats = async () => {
    setIsLoading(true)
    try {
      // Simular um pequeno atraso para mostrar o skeleton
      await new Promise((resolve) => setTimeout(resolve, 300))

      const items = getItems()
      setStats({
        total: items.length,
        emFalta: items.filter((item) => item.quantidadeAtual === 0).length,
        abaixoDoDesejado: items.filter(
          (item) => item.quantidadeAtual < item.quantidadeDesejada && item.quantidadeAtual > 0,
        ).length,
      })
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    updateStats()

    // Adicionar listener para atualizar as estatísticas quando os itens forem atualizados
    const handleItemsUpdated = () => {
      updateStats()
    }

    window.addEventListener("itemsUpdated", handleItemsUpdated)

    return () => {
      window.removeEventListener("itemsUpdated", handleItemsUpdated)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('home', 'totalItems')}</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('home', 'outOfStock')}</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.emFalta}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('home', 'belowDesired')}</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.abaixoDoDesejado}</div>
        </CardContent>
      </Card>
    </div>
  )
}

