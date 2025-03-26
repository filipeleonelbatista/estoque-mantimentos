import { Suspense } from "react"
import ListaComprasHeader from "@/components/lista-compras-header"
import ListaComprasContent from "@/components/lista-compras-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function ListaComprasPage() {
  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <ListaComprasHeader />
      <div className="grid gap-6 mt-6">
        <Suspense
          fallback={
            <div className="space-y-2">
              <Skeleton className="h-[60px] w-full" />
              <Skeleton className="h-[60px] w-full" />
              <Skeleton className="h-[60px] w-full" />
            </div>
          }
        >
          <ListaComprasContent />
        </Suspense>
      </div>
    </main>
  )
}

