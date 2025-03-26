"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import Logo from "./logo";
import { useI18n } from "@/lib/i18n/i18n-context";

interface Dica {
  titulo: string;
  descricao: string;
  tipo: "comida" | "limpeza" | "organização" | "economia";
  icone: "chef-hat" | "spray-can" | "boxes" | "piggy-bank";
}

export default function DicaIA() {
  const { t, language } = useI18n();
  const [dica, setDica] = useState<Dica | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDica() {

      const formData = new FormData()
      formData.append("language", language)

      try {
        const response = await fetch("/api/dicas", {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else if (data.dica) {
          setDica(data.dica);
        }
      } catch (err: any) {
        setError("Erro ao carregar dica");
      } finally {
        setLoading(false);
      }
    }

    fetchDica();
  }, [language]);

  if (loading) {
    return <Skeleton className="h-[120px] w-full" />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-600 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 border rounded shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-xl font-bold">{t('tips', 'tips')}</h3>
        <Logo />
      </div>
      <h3 className="text-lg font-bold mb-2">{dica?.titulo}</h3>
      <p>{dica?.descricao}</p>
    </div>
  );
}
