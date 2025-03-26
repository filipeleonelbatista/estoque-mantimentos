"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations, type Language, type TranslationKey, type NestedTranslationKey } from "./translations"

type I18nContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: <T extends TranslationKey, K extends NestedTranslationKey<T>>(
    section: T,
    key: K,
    params?: Record<string, string>,
  ) => string
  getLanguageName: (lang: Language) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = "stockai-language"

const languageNames: Record<Language, string> = {
  "pt-BR": "Português",
  "en-US": "English",
  "es-ES": "Español",
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt-BR")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null

    if (storedLanguage && Object.keys(translations).includes(storedLanguage)) {
      setLanguageState(storedLanguage)
    } else {
      // Detectar idioma do navegador
      const browserLang = navigator.language
      if (browserLang.startsWith("pt")) {
        setLanguageState("pt-BR")
      } else if (browserLang.startsWith("es")) {
        setLanguageState("es-ES")
      } else {
        setLanguageState("en-US")
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  }

  const t = <T extends TranslationKey, K extends NestedTranslationKey<T>>(
    section: T,
    key: K,
    params?: Record<string, string>,
  ): string => {
    if (!mounted) return ""

    // @ts-ignore - Complexidade de tipos
    let text = translations[language][section][key] || `${section}.${key}`

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, value)
      })
    }

    return text
  }

  const getLanguageName = (lang: Language): string => {
    return languageNames[lang]
  }

  return <I18nContext.Provider value={{ language, setLanguage, t, getLanguageName }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

