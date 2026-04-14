'use client';

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-white border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/proball-logo.png" alt="ProBall Football" width={20} height={20} className="rounded-sm" />
            <span className="font-semibold text-sm">ProBall Football</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[var(--muted-foreground)]">
            <Link href="/products" className="hover:text-[var(--foreground)] transition-colors">
              {t('footer.products')}
            </Link>
            <Link href="/checkout" className="hover:text-[var(--foreground)] transition-colors">
              {t('footer.checkout')}
            </Link>
            <Link href="/admin" className="hover:text-[var(--foreground)] transition-colors">
              {t('footer.admin')}
            </Link>
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {t('footer.copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
}
