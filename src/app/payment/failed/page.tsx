'use client';

import Image from "next/image";

import Link from "next/link";
import { XCircle, ArrowRight,  RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n-context";

export default function PaymentFailedPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-5">
      <div className="max-w-md w-full animate-fade-in-up">
        {/* Failed icon */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <h1 className="heading-display text-2xl mb-2">{t('paymentFailed.heading')}</h1>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            {t('paymentFailed.body')}
          </p>
        </div>

        {/* Info card */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="heading-label mb-1">{t('paymentFailed.whatToDo')}</div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <RefreshCw className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">{t('paymentFailed.step1Title')}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {t('paymentFailed.step1Desc')}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">{t('paymentFailed.step2Title')}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {t('paymentFailed.step2Desc')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/checkout">
            <Button className="w-full rounded-full h-12 text-sm font-medium" size="lg">
              {t('paymentFailed.tryAgain')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              className="w-full rounded-full h-12 text-sm font-medium"
              size="lg"
            >
              {t('paymentFailed.backHome')}
            </Button>
          </Link>
        </div>

        {/* Logo footer */}
        <div className="flex items-center justify-center gap-2 mt-8 text-[var(--muted-foreground)]">
          <Image src="/proball-logo.png" alt="ProBall Football" width={16} height={16} className="rounded-sm" />
          <span className="text-xs">ProBall Football</span>
        </div>
      </div>
    </div>
  );
}
