'use client';

import Link from "next/link";
import { Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar, HowItWorks, OrderTypes, PaymentTrust } from "@/components/home/FeaturesSection";
import { useI18n } from "@/lib/i18n-context";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <HeroSection />
      <TrustBar />

      {/* ─── Products Preview ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-14 md:py-20">
        <div className="text-center mb-10">
          <div className="heading-label mb-2">{t('home.sectionLabel')}</div>
          <h2 className="heading-display text-2xl md:text-3xl text-[var(--foreground)]">
            {t('home.sectionHeading')}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              name: "Veggie Box Small",
              desc: "5 packs of seasonal vegetables. Perfect for 1-2 people.",
              price: "Rp 99.000",
              compare: "Rp 129.000",
              tagKey: "home.starter",
            },
            {
              name: "Veggie Box Medium",
              desc: "10 packs of seasonal vegetables with premium greens. Ideal for 3-4 people.",
              price: "Rp 179.000",
              compare: "Rp 229.000",
              tagKey: "home.mostPopularBanner",
              featured: true,
            },
            {
              name: "Veggie Box Family",
              desc: "20 packs of premium vegetables, fruits mix & specialty greens. Feeds 5+.",
              price: "Rp 299.000",
              compare: "Rp 379.000",
              tagKey: "home.bestValue",
            },
          ].map((product) => (
            <Card
              key={product.name}
              className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                product.featured ? "ring-2 ring-[var(--primary)] shadow-md" : ""
              }`}
            >
              {product.featured && (
                <div className="bg-[var(--primary)] text-white text-[10px] font-semibold tracking-wider uppercase py-1 text-center">
                  {t('home.mostPopularBanner')}
                </div>
              )}
              <CardContent className="p-5">
                <div className="w-full h-32 bg-gradient-to-br from-[var(--color-emerald-50)] to-[var(--color-emerald-100)] rounded-lg mb-4 flex items-center justify-center">
                  <Leaf className="h-10 w-10 text-[var(--primary)] opacity-50" />
                </div>
                <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--primary)] mb-1">
                  {t(product.tagKey)}
                </div>
                <h3 className="font-semibold text-base mb-1">{product.name}</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-3 leading-relaxed">
                  {product.desc}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-[var(--foreground)]">
                    {product.price}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] line-through">
                    {product.compare}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/products">
            <Button className="rounded-full px-8" size="lg">
              {t('home.browseAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <HowItWorks />
      <OrderTypes />
      <PaymentTrust />
      <Footer />
    </div>
  );
}
