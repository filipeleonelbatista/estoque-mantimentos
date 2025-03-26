"use client"

import { Suspense } from "react"
import EstoqueHeader from "@/components/estoque-header"
import EstoqueList from "@/components/estoque-list"
import EstoqueStats from "@/components/estoque-stats"
import { Skeleton } from "@/components/ui/skeleton"
import AddItemButton from "@/components/add-item-button"
import DicaIA from "@/components/dica-ia"
import { useI18n } from "@/lib/i18n/i18n-context"

export default function Home() {
  const { t } = useI18n()
  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <EstoqueHeader />
      <div className="grid gap-6 mt-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-3">
            <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
              <EstoqueStats />
            </Suspense>
          </div>
        </div>

        <div className="flex flex-col justify-between items-center">
          <DicaIA />
        </div>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">{t('home', 'stockItems')}</h2>
          <AddItemButton />
        </div>
        <Suspense
          fallback={
            <div className="space-y-2">
              <Skeleton className="h-[60px] w-full" />
              <Skeleton className="h-[60px] w-full" />
              <Skeleton className="h-[60px] w-full" />
            </div>
          }
        >
          <EstoqueList />
        </Suspense>
      </div>
      <footer className="flex w-full text-center justify-center p-6">
        <div
          dangerouslySetInnerHTML={{
            __html: t('home', 'footer')
          }}
          className="text-center text-xs text-muted-foreground"
        >

        </div>
      </footer>
    </main>
  )
}

