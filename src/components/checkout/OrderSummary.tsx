import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";

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
  return (
    <div>
      <h2 className="font-semibold text-sm mb-3">Order Summary</h2>
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">{product?.name}</span>
            <span>{formatPrice(price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Delivery</span>
            <span className="text-[var(--primary)] font-medium">Free</span>
          </div>
          {orderType === "SUBSCRIPTION" && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Frequency</span>
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 text-[var(--primary)]" />
                {frequencies.find((f) => f.frequency === frequency)?.label || frequency}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-base pt-1">
            <span>Total</span>
            <span>{formatPrice(price)}</span>
          </div>
          {orderType === "SUBSCRIPTION" && (
            <div className="text-[10px] text-[var(--muted-foreground)] text-right">
              Billed {frequencies.find((f) => f.frequency === frequency)?.label.toLowerCase() || "recurring"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
