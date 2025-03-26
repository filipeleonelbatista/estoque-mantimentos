"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Item } from "@/lib/types"
import { deleteItem } from "@/lib/data"
import { useI18n } from "@/lib/i18n/i18n-context"

interface DeleteItemDialogProps {
  item: Item
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemDeleted: () => void
}

export default function DeleteItemDialog({ item, open, onOpenChange, onItemDeleted }: DeleteItemDialogProps) {
  const { t } = useI18n()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      deleteItem(item.id)

      toast({
        title: t("item", "itemDeleted"),
        description: t("item", "itemDeletedDesc", { name: item.nome }),
        variant: "success",
      })

      onItemDeleted()
    } catch (error) {
      console.error("Erro ao excluir item:", error)

      toast({
        title: t("common", "error"),
        description: t("item", "errorDeleting"),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("item", "confirmDelete")}</AlertDialogTitle>
          <AlertDialogDescription>{t("item", "deleteConfirmation", { name: item.nome })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("common", "cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common", "loading")}
              </>
            ) : (
              t("common", "delete")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

