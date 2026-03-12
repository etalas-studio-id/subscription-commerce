"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Leaf, Loader2, Shield } from "lucide-react";

function PaymentRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMock = searchParams.get("mock") === "true";
  const type = searchParams.get("type") || "subscription";
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isMock) {
      // Simulate redirect delay in mock mode
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Simulate success (80% of the time) or failure
            const isSuccess = Math.random() > 0.2;
            router.push(
              isSuccess
                ? `/payment/success?type=${type}&mock=true`
                : `/payment/failed?type=${type}&mock=true`
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isMock, type, router]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-5">
      <div className="text-center max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-emerald-50)] to-[var(--color-emerald-100)] flex items-center justify-center">
            <Leaf className="h-8 w-8 text-[var(--primary)]" />
          </div>
        </div>

        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>

        {/* Message */}
        <h1 className="heading-display text-xl mb-2">
          Redirecting to Secure Payment
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6 leading-relaxed">
          {type === "subscription"
            ? "You're being redirected to a secure payment authorization page to set up your recurring subscription."
            : "You're being redirected to complete your payment securely."}
        </p>

        {isMock && (
          <div className="bg-[var(--color-emerald-50)] rounded-xl p-4 mb-4">
            <p className="text-xs text-[var(--color-emerald-800)]">
              <strong>Mock Mode:</strong> Simulating Xendit hosted payment page redirect...
            </p>
            <p className="text-sm font-bold text-[var(--primary)] mt-1">
              Redirecting in {countdown}s
            </p>
          </div>
        )}

        {/* Trust indicator */}
        <div className="flex items-center justify-center gap-2 text-[var(--muted-foreground)]">
          <Shield className="h-3.5 w-3.5" />
          <span className="text-[10px]">
            Secured by Xendit • 256-bit SSL encryption
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-5">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    }>
      <PaymentRedirect />
    </Suspense>
  );
}
