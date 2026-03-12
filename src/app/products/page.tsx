"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Check, ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  description: string;
  tags: string;
  priceConfig: {
    basePrice: number;
    comparePrice: number | null;
  } | null;
}

function formatPrice(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedId);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-[var(--primary)]" />
            <span className="font-semibold text-sm">Choose Your Box</span>
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="max-w-2xl mx-auto px-5 pt-5 pb-2">
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <span className="text-[var(--primary)] font-semibold">1. Select</span>
          <span className="text-[var(--border)]">→</span>
          <span>2. Checkout</span>
          <span className="text-[var(--border)]">→</span>
          <span>3. Pay</span>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-2xl mx-auto px-5 pt-4 space-y-4">
        <div>
          <h1 className="heading-display text-2xl mb-1">Pick your harvest box</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Select one box to continue to checkout.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const isSelected = selectedId === product.id;
              const tags = product.tags ? product.tags.split(",").map((t) => t.trim()) : [];
              const isFeatured = tags.includes("popular");

              return (
                <Card
                  key={product.id}
                  className={`relative overflow-hidden cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-[var(--primary)] shadow-lg bg-[var(--color-emerald-50)]/30"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedId(product.id)}
                >
                  {isFeatured && (
                    <div className="bg-[var(--primary)] text-white text-[10px] font-semibold tracking-wider uppercase py-1 text-center">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image placeholder */}
                      <div className="w-20 h-20 shrink-0 bg-gradient-to-br from-[var(--color-emerald-50)] to-[var(--color-emerald-100)] rounded-xl flex items-center justify-center">
                        <Leaf className="h-8 w-8 text-[var(--primary)] opacity-40" />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-sm">{product.name}</h3>
                            <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-0.5 leading-relaxed">
                              {product.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
                              <Check className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-base font-bold">
                            {product.priceConfig
                              ? formatPrice(product.priceConfig.basePrice)
                              : "N/A"}
                          </span>
                          {product.priceConfig?.comparePrice && (
                            <span className="text-xs text-[var(--muted-foreground)] line-through">
                              {formatPrice(product.priceConfig.comparePrice)}
                            </span>
                          )}
                        </div>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[10px] px-2 py-0 font-normal"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="sticky-bottom-cta">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-[var(--muted-foreground)]">
              {selectedProduct ? selectedProduct.name : "No box selected"}
            </div>
            {selectedProduct?.priceConfig && (
              <div className="text-sm font-bold">
                {formatPrice(selectedProduct.priceConfig.basePrice)}
              </div>
            )}
          </div>
          <Button
            className="w-full rounded-full h-12 text-sm font-medium"
            size="lg"
            disabled={!selectedId}
            onClick={() => {
              if (selectedId) {
                router.push(`/checkout?product=${selectedId}`);
              }
            }}
          >
            Continue to Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
