'use client';

import Link from "next/link";
import { Leaf, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar, HowItWorks, OrderTypes, PaymentTrust } from "@/components/home/FeaturesSection";
import { useI18n } from "@/lib/i18n-context";
import { Suspense, useState, useEffect } from "react";

function formatPrice(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function ProductsPreviewContent() {
  const { t } = useI18n();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Show first 3 products or fallback to a default
  const displayProducts = products.slice(0, 3);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-5">
        {displayProducts.map((product, idx) => (
          <Card
            key={product.id}
            className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
              idx === 1 && product.tags?.includes("popular") ? "ring-2 ring-[var(--primary)] shadow-md" : ""
            }`}
          >
            {idx === 1 && product.tags?.includes("popular") && (
              <div className="bg-[var(--primary)] text-white text-[10px] font-semibold tracking-wider uppercase py-1 text-center">
                {t('home.mostPopularBanner')}
              </div>
            )}
            <CardContent className="p-5">
              <div className="w-full h-32 bg-gradient-to-br from-[var(--color-emerald-50)] to-[var(--color-emerald-100)] rounded-lg mb-4 flex items-center justify-center">
                <Leaf className="h-10 w-10 text-[var(--primary)] opacity-50" />
              </div>
              <h3 className="font-semibold text-base mb-1">{product.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-3 leading-relaxed line-clamp-2">
                {product.description}
              </p>
              {product.priceConfig && (
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-[var(--foreground)]">
                    {formatPrice(product.priceConfig.basePrice)}
                  </span>
                  {product.priceConfig.comparePrice && (
                    <span className="text-xs text-[var(--muted-foreground)] line-through">
                      {formatPrice(product.priceConfig.comparePrice)}
                    </span>
                  )}
                </div>
              )}
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
    </>
  );
}

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
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          </div>
        }>
          <ProductsPreviewContent />
        </Suspense>
      </section>

      <HowItWorks />
      <OrderTypes />
      <PaymentTrust />
      <Footer />
    </div>
  );
}
