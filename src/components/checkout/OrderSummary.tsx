'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

interface Product {
  name: string;
}

interface FrequencySetting {
  frequency: string;
  label: string;
}

interface OrderSummaryProps {
  product: Product | null;
  price: number;
  orderType: "ONE_TIME" | "SUBSCRIPTION";
  frequency: string;
  frequencies: FrequencySetting[];
  formatPrice: (amount: number) => string;
}

export function OrderSummary({
  product,
  price,
  orderType,
  frequency,
  frequencies,
  formatPrice,
}: OrderSummaryProps) {
  const { t } = useI18n();

  return (
    <div>
      <h2 className="font-semibold text-sm mb-3">{t('orderSummary.title')}</h2>
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">{product?.name}</span>
            <span>{formatPrice(price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">{t('orderSummary.delivery')}</span>
            <span className="text-[var(--primary)] font-medium">{t('orderSummary.free')}</span>
          </div>
          {orderType === "SUBSCRIPTION" && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">{t('orderSummary.frequency')}</span>
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 text-[var(--primary)]" />
                {frequencies.find((f) => f.frequency === frequency)?.label || frequency}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-base pt-1">
            <span>{t('orderSummary.total')}</span>
            <span>{formatPrice(price)}</span>
          </div>
          {orderType === "SUBSCRIPTION" && (
            <div className="text-[10px] text-[var(--muted-foreground)] text-right">
              {t('orderSummary.billed')} {frequencies.find((f) => f.frequency === frequency)?.label.toLowerCase() || "recurring"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
