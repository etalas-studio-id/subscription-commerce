'use client';

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n-context";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  variant?: "marketing" | "checkout";
}

export function Header({ variant = "marketing" }: HeaderProps) {
  const { t } = useI18n();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (variant === "checkout") {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/products" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Image src="/proball-logo.png" alt="ProBall Football" width={24} height={24} className="rounded-sm" />
              <span className="font-semibold text-sm">{t('header.checkout')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session?.user && (
              <span className="text-xs text-[var(--muted-foreground)]">
                {session.user.name}
              </span>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/proball-logo.png" alt="ProBall Football" width={28} height={28} className="rounded-sm" />
          <span className="font-semibold text-base text-[var(--foreground)]">
            ProBall Football
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {session?.user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[var(--color-blue-100)] flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-[var(--primary)]" />
                  </div>
                )}
                <span className="hidden sm:inline">{session.user.name}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-[var(--border)] shadow-lg py-1 z-50">
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--color-stone-50)] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="h-3.5 w-3.5" />
                    {t("account.title")}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--color-stone-50)] transition-colors w-full text-left text-red-600"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t("auth.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              {t("auth.login")}
            </Link>
          )}
          <Link href="/products">
            <Button size="sm" className="rounded-full text-xs px-4">
              {t('header.orderNow')}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
