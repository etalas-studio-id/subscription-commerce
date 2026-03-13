"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Leaf,
  CreditCard,
  Wallet,
  Building2,
  Shield,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { CustomerDetails } from "@/components/checkout/CustomerForm";
import { DeliveryAddress } from "@/components/checkout/DeliveryAddress";
import { OrderSummary } from "@/components/checkout/OrderSummary";

interface Product {
  id: string;
  name: string;
  description: string;
  priceConfig: { basePrice: number; comparePrice: number | null } | null;
}

interface FrequencySetting {
  id: string;
  frequency: string;
  label: string;
  description: string;
  enabled: boolean;
}

function formatPrice(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

const paymentMethods = {
  oneTime: [
    { id: "bank_transfer", label: "Bank Transfer", icon: Building2, desc: "BCA, BNI, Mandiri" },
    { id: "credit_card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard" },
    { id: "e_wallet", label: "E-Wallet", icon: Wallet, desc: "OVO, GoPay, ShopeePay" },
  ],
  subscription: [
    { id: "credit_card", label: "Credit / Debit Card", icon: CreditCard, desc: "Required for auto-billing", recommended: true },
    { id: "direct_debit", label: "Direct Debit", icon: Building2, desc: "Automatic bank debit" },
    { id: "e_wallet", label: "E-Wallet", icon: Wallet, desc: "Selected e-wallets" },
  ],
};

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("product");

  const [product, setProduct] = useState<Product | null>(null);
  const [frequencies, setFrequencies] = useState<FrequencySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [orderType, setOrderType] = useState<"ONE_TIME" | "SUBSCRIPTION">("ONE_TIME");
  const [frequency, setFrequency] = useState("WEEKLY");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    deliveryNotes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/frequencies").then((r) => r.json()),
    ]).then(([products, freqs]) => {
      const found = products.find((p: Product) => p.id === productId);
      setProduct(found || products[0]);
      setFrequencies(freqs);
      setLoading(false);
    });
  }, [productId]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isPhoneValid = /^(\+62|62|0)[0-9]{9,12}$/.test(form.phone.replace(/[\s-]/g, ""));
  const isFormValid =
    form.name && isEmailValid && isPhoneValid && form.address && form.city && form.postalCode;

  const handleSubmit = async () => {
    if (!product || !isFormValid) return;
    setSubmitting(true);

    try {
      const endpoint =
        orderType === "SUBSCRIPTION"
          ? "/api/checkout/subscription"
          : "/api/checkout/one-time";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          orderType,
          frequency: orderType === "SUBSCRIPTION" ? frequency : undefined,
          paymentMethod,
          customer: form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push("/payment/success?orderId=" + data.orderId);
      }
    } catch {
      router.push("/payment/failed");
    } finally {
      setSubmitting(false);
    }
  };

  const currentMethods = orderType === "SUBSCRIPTION" ? paymentMethods.subscription : paymentMethods.oneTime;
  const price = product?.priceConfig?.basePrice || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">
      <Header variant="checkout" />

      {/* Step indicator */}
      <div className="max-w-2xl mx-auto px-5 pt-5 pb-2">
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <span className="text-[var(--primary)] opacity-60">1. Select</span>
          <span className="text-[var(--border)]">→</span>
          <span className="text-[var(--primary)] font-semibold">2. Checkout</span>
          <span className="text-[var(--border)]">→</span>
          <span>3. Pay</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-4 space-y-5">
        {/* ─── Selected Product ──────────────────────────────────────────── */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3 items-center">
              <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-[var(--color-emerald-50)] to-[var(--color-emerald-100)] rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-[var(--primary)] opacity-40" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{product?.name}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{product?.description}</div>
              </div>
              <div className="text-base font-bold shrink-0">{formatPrice(price)}</div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Customer Details ──────────────────────────────────────────── */}
        <CustomerDetails form={form} updateForm={updateForm} emailError={!!form.email && !isEmailValid} phoneError={!!form.phone && !isPhoneValid} />

        {/* ─── Delivery Details ──────────────────────────────────────────── */}
        <DeliveryAddress form={form} updateForm={updateForm} />

        {/* ─── Frequency Selector ────────────────────────────────────────── */}
        <div>
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-bold">3</span>
            Order Type
          </h2>
          <Card>
            <CardContent className="p-4">
              <RadioGroup
                value={orderType}
                onValueChange={(v) => setOrderType(v as "ONE_TIME" | "SUBSCRIPTION")}
                className="space-y-3"
              >
                {/* One-time */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    orderType === "ONE_TIME"
                      ? "border-[var(--primary)] bg-[var(--color-emerald-50)]/50"
                      : "border-[var(--border)] hover:border-[var(--color-stone-300)]"
                  }`}
                >
                  <RadioGroupItem value="ONE_TIME" className="mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">One-Time Order</div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      Single delivery, no commitment
                    </div>
                  </div>
                </label>
                {/* Subscription */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    orderType === "SUBSCRIPTION"
                      ? "border-[var(--primary)] bg-[var(--color-emerald-50)]/50"
                      : "border-[var(--border)] hover:border-[var(--color-stone-300)]"
                  }`}
                >
                  <RadioGroupItem value="SUBSCRIPTION" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      Subscribe & Save
                      <Badge className="bg-[var(--primary)] text-white text-[10px] px-1.5 py-0">
                        Recommended
                      </Badge>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      Automatic recurring delivery
                    </div>
                  </div>
                </label>
              </RadioGroup>

              {/* Frequency options */}
              {orderType === "SUBSCRIPTION" && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="text-xs font-medium mb-2 text-[var(--muted-foreground)]">
                    Delivery Frequency
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {frequencies.map((freq) => (
                      <button
                        key={freq.frequency}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          frequency === freq.frequency
                            ? "border-[var(--primary)] bg-[var(--color-emerald-50)]/50"
                            : "border-[var(--border)] hover:border-[var(--color-stone-300)]"
                        }`}
                        onClick={() => setFrequency(freq.frequency)}
                      >
                        <div className="font-medium text-sm">{freq.label}</div>
                        <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                          {freq.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Payment Method ────────────────────────────────────────────── */}
        <div>
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-bold">4</span>
            Payment Method
          </h2>
          <Card>
            <CardContent className="p-4">
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-2"
              >
                {currentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? "border-[var(--primary)] bg-[var(--color-emerald-50)]/50"
                          : "border-[var(--border)] hover:border-[var(--color-stone-300)]"
                      }`}
                    >
                      <RadioGroupItem value={method.id} />
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-stone-100)] flex items-center justify-center">
                        <Icon className="h-4 w-4 text-[var(--color-stone-600)]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm flex items-center gap-2">
                          {method.label}
                          {("recommended" in method && method.recommended === true) && (
                            <Badge className="bg-[var(--color-emerald-100)] text-[var(--color-emerald-800)] text-[10px] px-1.5 py-0 font-normal">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--muted-foreground)]">
                          {method.desc}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>

              {/* Subscription payment note */}
              {orderType === "SUBSCRIPTION" && (
                <div className="mt-3 p-3 rounded-xl bg-[var(--color-emerald-50)] flex gap-2">
                  <Info className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--color-emerald-800)] leading-relaxed">
                    To activate automatic recurring billing, you&apos;ll be redirected to a secure payment authorization page after checkout.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Order Summary ─────────────────────────────────────────────── */}
        <OrderSummary
          product={product}
          price={price}
          orderType={orderType}
          frequency={frequency}
          frequencies={frequencies}
          formatPrice={formatPrice}
        />

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 py-2">
          <Shield className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <span className="text-[10px] text-[var(--muted-foreground)]">
            Secured by Xendit • 256-bit encryption
          </span>
        </div>
      </div>

      {/* ─── Sticky CTA ──────────────────────────────────────────────────── */}
      <div className="sticky-bottom-cta">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {orderType === "SUBSCRIPTION" ? `${frequencies.find(f => f.frequency === frequency)?.label} Subscription` : "One-Time Order"}
              </div>
              <div className="text-base font-bold">{formatPrice(price)}</div>
            </div>
          </div>
          <Button
            className="w-full rounded-full h-12 text-sm font-medium"
            size="lg"
            disabled={!isFormValid || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : orderType === "SUBSCRIPTION" ? (
              "Continue to Payment Authorization"
            ) : (
              "Place Order"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
