"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { atualizarListaCompras } from "@/lib/data"
import { I18nProvider } from "@/lib/i18n/i18n-context"
import { useEffect } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializa dados de exemplo quando o aplicativo é carregado pela primeira vez
    // initializeExampleData()

    // Inicializa a lista de compras com itens faltantes
    atualizarListaCompras()
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  )
}

