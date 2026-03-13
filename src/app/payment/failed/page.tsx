import Link from "next/link";
import { XCircle, ArrowRight, Leaf, RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentFailedPage() {
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
          <h1 className="heading-display text-2xl mb-2">Payment Unsuccessful</h1>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            We weren&apos;t able to process your payment. Don&apos;t worry — no charges
            have been made. You can try again or contact us for help.
          </p>
        </div>

        {/* Info card */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="heading-label mb-1">What you can do</div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <RefreshCw className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Try again</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    Check your payment details and try a different payment method
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Contact support</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    Reach out to hello@thegoodharvest.id for assistance
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
              Try Again
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              className="w-full rounded-full h-12 text-sm font-medium"
              size="lg"
            >
              Back to Home
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
