import { ShoppingBasket } from "lucide-react"

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ShoppingBasket className="h-6 w-6 text-primary" />
      <span className="font-bold text-xl">
        Stock<span className="text-primary">AI</span>
      </span>
    </div>
  )
}

