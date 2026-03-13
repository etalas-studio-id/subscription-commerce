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
import { useI18n } from "@/lib/i18n-context";

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

const acceptedPayments = [
  { label: "Bank Transfer", icon: Building2, desc: "BCA, BNI, Mandiri" },
  { label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard" },
  { label: "E-Wallet", icon: Wallet, desc: "OVO, GoPay, ShopeePay" },
];

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const productId = searchParams.get("product");

  const [product, setProduct] = useState<Product | null>(null);
  const [frequencies, setFrequencies] = useState<FrequencySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [orderType, setOrderType] = useState<"ONE_TIME" | "SUBSCRIPTION">("SUBSCRIPTION");
  const [frequency, setFrequency] = useState("WEEKLY");
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

  // Validation checks for each section
  const customerDetailsComplete = form.name && form.email && form.phone && isEmailValid && isPhoneValid;
  const deliveryDetailsComplete = form.address && form.city && form.postalCode;
  const isFormValid = customerDetailsComplete && deliveryDetailsComplete;

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
          <span className="text-[var(--primary)] opacity-60">{t('checkout.stepSelect')}</span>
          <span className="text-[var(--border)]">→</span>
          <span className="text-[var(--primary)] font-semibold">{t('checkout.stepCheckout')}</span>
          <span className="text-[var(--border)]">→</span>
          <span>{t('checkout.stepPay')}</span>
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
        {!customerDetailsComplete && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              {t('checkout.validationDetails')}
            </p>
          </div>
        )}
        <CustomerDetails form={form} updateForm={updateForm} emailError={!!form.email && !isEmailValid} phoneError={!!form.phone && !isPhoneValid} />

        {/* ─── Delivery Details ──────────────────────────────────────────── */}
        {!deliveryDetailsComplete && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              {t('checkout.validationAddress')}
            </p>
          </div>
        )}
        <DeliveryAddress form={form} updateForm={updateForm} />

        {/* ─── Frequency Selector ────────────────────────────────────────── */}
        <div>
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-bold">3</span>
            {t('checkout.orderType')}
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
                    <div className="font-medium text-sm">{t('checkout.oneTime')}</div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {t('checkout.oneTimeDesc')}
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
                      {t('checkout.subscription')}
                      <Badge className="bg-[var(--primary)] text-white text-[10px] px-1.5 py-0">
                        {t('checkout.recommended')}
                      </Badge>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {t('checkout.subscriptionDesc')}
                    </div>
                  </div>
                </label>
              </RadioGroup>

              {/* Frequency options */}
              {orderType === "SUBSCRIPTION" && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="text-xs font-medium mb-2 text-[var(--muted-foreground)]">
                    {t('checkout.frequency')}
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

        {/* ─── Order Summary ─────────────────────────────────────────────── */}
        <OrderSummary
          product={product}
          price={price}
          orderType={orderType}
          frequency={frequency}
          frequencies={frequencies}
          formatPrice={formatPrice}
        />

        {/* ─── Payment Info ──────────────────────────────────────────────── */}
        <div>
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-bold">4</span>
            {t('checkout.paymentMethod')}
          </h2>
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3 mb-3">
                {acceptedPayments.map(({ label, icon: Icon, desc }) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[var(--color-stone-50)] border border-[var(--border)]">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Icon className="h-4 w-4 text-[var(--color-stone-600)]" />
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-medium leading-tight">{label}</div>
                      <div className="text-[9px] text-[var(--muted-foreground)] leading-tight">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 p-3 rounded-xl bg-[var(--color-emerald-50)]">
                <Info className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-emerald-800)] leading-relaxed">
                  {t('checkout.paymentNote')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 py-2">
          <Shield className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <span className="text-[10px] text-[var(--muted-foreground)]">
            {t('checkout.securedBy')}
          </span>
        </div>
      </div>

      {/* ─── Sticky CTA ──────────────────────────────────────────────────── */}
      <div className="sticky-bottom-cta">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {orderType === "SUBSCRIPTION" ? `${frequencies.find(f => f.frequency === frequency)?.label} ${t('checkout.subscriptionLabel')}` : t('checkout.oneTimeLabel')}
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
                {t('checkout.processing')}
              </>
            ) : orderType === "SUBSCRIPTION" ? (
              t('checkout.continuePayment')
            ) : (
              t('checkout.placeOrder')
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
