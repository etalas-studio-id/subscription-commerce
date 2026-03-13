'use client';

import { Truck, RefreshCw, Shield, Leaf, Check, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n-context";

export function TrustBar() {
  const { t } = useI18n();

  return (
    <section className="border-y border-[var(--border)] bg-white">
      <div className="max-w-6xl mx-auto px-5 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Leaf, key: "trust.organic" },
            { icon: Truck, key: "trust.delivery" },
            { icon: RefreshCw, key: "trust.schedule" },
            { icon: Shield, key: "trust.payment" },
          ].map(({ icon: Icon, key }) => (
            <div key={key} className="flex items-center gap-2.5 justify-center">
              <Icon className="h-4 w-4 text-[var(--primary)] shrink-0" />
              <span className="text-xs font-medium text-[var(--foreground)]">{t(key)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const { t } = useI18n();

  return (
    <section
      id="how-it-works"
      className="bg-white border-y border-[var(--border)]"
    >
      <div className="max-w-6xl mx-auto px-5 py-14 md:py-20">
        <div className="text-center mb-10">
          <div className="heading-label mb-2">{t('howItWorks.label')}</div>
          <h2 className="heading-display text-2xl md:text-3xl text-[var(--foreground)]">
            {t('howItWorks.heading')}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              titleKey: "howItWorks.step1Title",
              descKey: "howItWorks.step1Desc",
            },
            {
              step: "02",
              titleKey: "howItWorks.step2Title",
              descKey: "howItWorks.step2Desc",
            },
            {
              step: "03",
              titleKey: "howItWorks.step3Title",
              descKey: "howItWorks.step3Desc",
            },
          ].map((item) => (
            <div key={item.step} className="text-center md:text-left">
              <div className="text-3xl font-bold text-[var(--color-emerald-200)] mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-base mb-2">{t(item.titleKey)}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {t(item.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OrderTypes() {
  const { t } = useI18n();

  return (
    <section className="max-w-6xl mx-auto px-5 py-14 md:py-20">
      <div className="text-center mb-10">
        <div className="heading-label mb-2">{t('orderTypes.label')}</div>
        <h2 className="heading-display text-2xl md:text-3xl text-[var(--foreground)]">
          {t('orderTypes.heading')}
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="pt-10 px-6 pb-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-stone-100)] flex items-center justify-center">
              <Star className="h-4 w-4 text-[var(--color-stone-500)]" />
            </div>
            {t('orderTypes.oneTimeTitle')}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">
            {t('orderTypes.oneTimeDesc')}
          </p>
          <ul className="space-y-2">
            {[
              "orderTypes.oneTimeBenefit1",
              "orderTypes.oneTimeBenefit2",
              "orderTypes.oneTimeBenefit3",
            ].map((key) => (
              <li key={key} className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-[var(--primary)]" />
                {t(key)}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="pt-10 px-6 pb-6 ring-2 ring-[var(--primary)] hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-2 left-4 px-2 py-0.5 bg-[var(--primary)] text-white text-[9px] font-semibold tracking-wider uppercase rounded-full whitespace-nowrap">
            {t('orderTypes.recommended')}
          </div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 break-words">
            <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--color-emerald-50)] flex items-center justify-center">
              <RefreshCw className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <span>{t('orderTypes.subscriptionTitle')}</span>
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">
            {t('orderTypes.subscriptionDesc')}
          </p>
          <ul className="space-y-2">
            {[
              "orderTypes.subscriptionBenefit1",
              "orderTypes.subscriptionBenefit2",
              "orderTypes.subscriptionBenefit3",
              "orderTypes.subscriptionBenefit4",
            ].map((key) => (
              <li key={key} className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-[var(--primary)]" />
                {t(key)}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}

export function PaymentTrust() {
  const { t } = useI18n();

  return (
    <section className="bg-[var(--color-emerald-900)] text-white">
      <div className="max-w-6xl mx-auto px-5 py-14 md:py-20">
        <div className="text-center mb-10">
          <div className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--color-emerald-200)] mb-2">
            {t('paymentTrust.label')}
          </div>
          <h2 className="heading-display text-2xl md:text-3xl text-white">
            {t('paymentTrust.heading')}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              titleKey: "paymentTrust.bankTransfer",
              descKey: "paymentTrust.bankDesc",
            },
            {
              titleKey: "paymentTrust.creditCard",
              descKey: "paymentTrust.creditDesc",
            },
            {
              titleKey: "paymentTrust.eWallet",
              descKey: "paymentTrust.eWalletDesc",
            },
            {
              titleKey: "paymentTrust.directDebit",
              descKey: "paymentTrust.directDebitDesc",
            },
          ].map((method) => (
            <div key={method.titleKey} className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <Shield className="h-5 w-5 text-[var(--color-emerald-200)]" />
              </div>
              <div className="font-medium text-sm mb-0.5">{t(method.titleKey)}</div>
              <div className="text-xs text-[var(--color-emerald-200)] opacity-80">
                {t(method.descKey)}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <p className="text-xs text-[var(--color-emerald-200)] opacity-70 max-w-md mx-auto">
            {t('paymentTrust.note')}
          </p>
        </div>
      </div>
    </section>
  );
}
