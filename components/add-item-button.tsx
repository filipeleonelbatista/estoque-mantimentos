"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import EditItemDialog from "./edit-item-dialog"
import { useI18n } from "@/lib/i18n/i18n-context"

export default function AddItemButton() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState(0)

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      // Force re-render of dialog when reopening
      setKey((prev) => prev + 1)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {t('addEditItem', 'addItem')}
      </Button>

      <EditItemDialog
        key={key}
        open={open}
        onOpenChange={handleOpenChange}
        onItemUpdated={() => {
          // Force re-render of components that use getItems
          const event = new CustomEvent("itemsUpdated")
          window.dispatchEvent(event)
        }}
      />
    </>
  )
}

