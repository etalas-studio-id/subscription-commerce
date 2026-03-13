'use client';

import Link from "next/link";
import { CheckCircle2, ArrowRight, Leaf, Package, RefreshCw, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n-context";

export default function PaymentSuccessPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-5">
      <div className="max-w-md w-full animate-fade-in-up">
        {/* Success icon */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-[var(--color-emerald-50)] flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-[var(--primary)]" />
            </div>
          </div>
          <h1 className="heading-display text-2xl mb-2">{t('paymentSuccess.heading')}</h1>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            {t('paymentSuccess.body')}
          </p>
        </div>

        {/* Order summary card */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="heading-label mb-1">{t('paymentSuccess.whatsNext')}</div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-emerald-50)] flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-[var(--primary)]" />
                </div>
                <div>
                  <div className="font-medium text-sm">{t('paymentSuccess.step1Title')}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {t('paymentSuccess.step1Desc')}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-emerald-50)] flex items-center justify-center shrink-0">
                  <RefreshCw className="h-4 w-4 text-[var(--primary)]" />
                </div>
                <div>
                  <div className="font-medium text-sm">{t('paymentSuccess.step2Title')}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {t('paymentSuccess.step2Desc')}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-emerald-50)] flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-[var(--primary)]" />
                </div>
                <div>
                  <div className="font-medium text-sm">{t('paymentSuccess.step3Title')}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {t('paymentSuccess.step3Desc')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full rounded-full h-12 text-sm font-medium" size="lg">
              {t('paymentSuccess.backHome')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/admin">
            <Button
              variant="outline"
              className="w-full rounded-full h-12 text-sm font-medium"
              size="lg"
            >
              {t('paymentSuccess.adminDashboard')}
            </Button>
          </Link>
        </div>

        {/* Logo footer */}
        <div className="flex items-center justify-center gap-2 mt-8 text-[var(--muted-foreground)]">
          <Leaf className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-xs">Panen Baik</span>
        </div>
      </div>
    </div>
  );
}
