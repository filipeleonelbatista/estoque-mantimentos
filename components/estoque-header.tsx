"use client"

import { Search, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import SugestaoReceitasButton from "./sugestao-receitas-button"
import Logo from "./logo"
import ThemeToggle from "./theme-toggle"
import LanguageSelector from "./language-selector"
import { useI18n } from "@/lib/i18n/i18n-context"

export default function EstoqueHeader() {
  const { t } = useI18n()

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <Logo className="mb-2" />
        <p className="text-muted-foreground">{t("app", "description")}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder={t("common", "search")} className="w-full pl-8" />
        </div> */}
        <div className="flex gap-2 items-center">
          <SugestaoReceitasButton />
          <Link href="/lista-compras">
            <Button variant="outline" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {t("shoppingList", "title")}
            </Button>
          </Link>
          <div className="flex items-center">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  )
}

