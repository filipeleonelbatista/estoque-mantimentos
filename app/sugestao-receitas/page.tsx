"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import type { Item } from "@/lib/types"
import { useI18n } from "@/lib/i18n/i18n-context"
import ThemeToggle from "@/components/theme-toggle"
import LanguageSelector from "@/components/language-selector"

interface Receita {
  titulo: string
  descricao?: string
  pessoasServe?: number
  ingredientes: string[]
  modoPreparo: string[]
  tempoPreparo: string
  dificuldade: string
}

interface SugestaoReceitas {
  para1Pessoa: Receita
  para2Pessoas: Receita
  para4Pessoas: Receita
}

interface ApiResponse {
  error?: string
  details?: string
  receitas?: SugestaoReceitas
}

export default function SugestaoReceitasPage() {
  const { t, language } = useI18n()
  const [isLoading, setIsLoading] = useState(true)
  const [receitas, setReceitas] = useState<SugestaoReceitas | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    const fetchReceitas = async () => {
      try {
        // Obter os itens do localStorage
        const itensJson = localStorage.getItem("sugestao-receitas-itens")

        if (!itensJson) {
          throw new Error(t("recipes", "noItemsProvided"))
        }

        let itens: Item[]
        try {
          itens = JSON.parse(itensJson) as Item[]
        } catch (parseError) {
          console.error("Erro ao fazer parse dos itens:", parseError)
          throw new Error(t("recipes", "invalidItemsFormat"))
        }

        if (itens.length === 0) {
          throw new Error(t("recipes", "noFoodDesc"))
        }

        console.log("Enviando requisição para a API com", itens.length, "alimentos")

        try {
          const formData = new FormData()
          formData.append("language", language)
          formData.append("lista", JSON.stringify(itens))

          const response = await fetch("/api/receitas", {
            method: "POST",
            body: formData,
          })

          // Verificar se a resposta é OK
          if (!response.ok) {
            const errorText = await response.text()
            console.error("Resposta da API com erro:", errorText)
            throw new Error(`${t("recipes", "apiError")}: ${response.status} ${response.statusText}`)
          }

          // Tentar fazer o parse da resposta como JSON
          let data: ApiResponse
          try {
            data = await response.json()
          } catch (jsonError) {
            console.error("Erro ao fazer parse da resposta como JSON:", jsonError)
            throw new Error(t("recipes", "invalidJsonResponse"))
          }

          // Verificar se há erro na resposta
          if (data.error) {
            setWarning(data.error)
            console.warn("Aviso da API:", data.error)
          }

          // Se temos receitas, mesmo com erro, usamos as receitas
          if (data.receitas) {
            setReceitas(data.receitas)

            // Se houver erro mas temos receitas de fallback, mostramos um toast
            if (data.error) {
              toast({
                title: t("recipes", "warning"),
                description: `${data.error}. ${t("recipes", "alternativeRecipes")}`,
                variant: "default",
              })
            } else {
              // Mostrar toast de sucesso quando as receitas são geradas com sucesso
              toast({
                title: t("recipes", "recipesGenerated"),
                description: t("recipes", "recipesGeneratedDesc"),
                variant: "success",
              })
            }
          } else {
            throw new Error(t("recipes", "noRecipesReturned"))
          }
        } catch (fetchError) {
          console.error("Erro ao fazer fetch:", fetchError)
          throw fetchError
        }
      } catch (err) {
        console.error("Erro ao buscar receitas:", err)
        setError(err instanceof Error ? err.message : t("common", "unknownError"))

        toast({
          title: t("common", "error"),
          description: err instanceof Error ? err.message : t("common", "unknownError"),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReceitas()
  }, [t, language])

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">{t("common", "back")}</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{t("recipes", "title")}</h1>
        </div>
        <div className="flex items-center">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>

      {warning && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("recipes", "warning")}</AlertTitle>
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[40px] w-[300px]" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <p className="font-medium">{t("recipes", "cannotGenerate")}</p>
          <p>{error}</p>
          <div className="mt-4">
            <Link href="/">
              <Button variant="outline">{t("common", "back")}</Button>
            </Link>
          </div>
        </div>
      ) : receitas ? (
        <Tabs defaultValue="1pessoa">
          <TabsList className="mb-4">
            <TabsTrigger value="1pessoa">{t("recipes", "for1Person")}</TabsTrigger>
            <TabsTrigger value="2pessoas">{t("recipes", "for2People")}</TabsTrigger>
            <TabsTrigger value="4pessoas">{t("recipes", "for4People")}</TabsTrigger>
          </TabsList>

          <TabsContent value="1pessoa">
            <ReceitaCard receita={receitas.para1Pessoa} />
          </TabsContent>

          <TabsContent value="2pessoas">
            <ReceitaCard receita={receitas.para2Pessoas} />
          </TabsContent>

          <TabsContent value="4pessoas">
            <ReceitaCard receita={receitas.para4Pessoas} />
          </TabsContent>
        </Tabs>
      ) : null}
    </main>
  )
}

function ReceitaCard({ receita }: { receita: Receita }) {
  const { t } = useI18n()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{receita.titulo}</CardTitle>
        <CardDescription>
          {receita.descricao && (
            <>
              {receita.descricao}
              <br />
            </>
          )}
          {receita.pessoasServe && (
            <>
              {t("recipes", "serves")}: {receita.pessoasServe}{" "}
              {receita.pessoasServe === 1 ? t("recipes", "person") : t("recipes", "people")} •{" "}
            </>
          )}
          {t("recipes", "prepTime")}: {receita.tempoPreparo} • {t("recipes", "difficulty")}: {receita.dificuldade}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{t("recipes", "ingredients")}</h3>
            <ul className="list-disc pl-5 space-y-1">
              {receita.ingredientes.map((ingrediente, index) => (
                <li key={index}>{ingrediente}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">{t("recipes", "preparation")}</h3>
            <ol className="list-decimal pl-5 space-y-2">
              {receita.modoPreparo.map((passo, index) => (
                <li key={index}>{passo}</li>
              ))}
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

