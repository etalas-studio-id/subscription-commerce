import Link from "next/link";
import { Leaf, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  variant?: "marketing" | "checkout";
}

export function Header({ variant = "marketing" }: HeaderProps) {
  if (variant === "checkout") {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/products" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-[var(--primary)]" />
            <span className="font-semibold text-sm">Checkout</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-[var(--primary)]" />
          <span className="font-semibold text-base text-[var(--foreground)]">
            Panen Baik
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Admin
          </Link>
          <Link href="/products">
            <Button size="sm" className="rounded-full text-xs px-4">
              Order Now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
