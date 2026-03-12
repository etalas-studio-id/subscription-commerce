import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DeliveryFormProps {
  form: {
    address: string;
    city: string;
    postalCode: string;
    deliveryNotes: string;
  };
  updateForm: (field: string, value: string) => void;
}

export function DeliveryAddress({ form, updateForm }: DeliveryFormProps) {
  return (
    <div>
      <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-bold">2</span>
        Delivery Address
      </h2>
      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <Label htmlFor="address" className="text-xs mb-1 block">Street Address</Label>
            <Input id="address" placeholder="Jl. Sudirman No. 123" value={form.address} onChange={(e) => updateForm("address", e.target.value)} className="h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city" className="text-xs mb-1 block">City</Label>
              <Input id="city" placeholder="Jakarta Selatan" value={form.city} onChange={(e) => updateForm("city", e.target.value)} className="h-11" />
            </div>
            <div>
              <Label htmlFor="postalCode" className="text-xs mb-1 block">Postal Code</Label>
              <Input id="postalCode" placeholder="12190" value={form.postalCode} onChange={(e) => updateForm("postalCode", e.target.value)} className="h-11" />
            </div>
          </div>
          <div>
            <Label htmlFor="notes" className="text-xs mb-1 block">Delivery Notes <span className="text-[var(--muted-foreground)]">(optional)</span></Label>
            <Textarea id="notes" placeholder="Leave at front gate, etc." rows={2} value={form.deliveryNotes} onChange={(e) => updateForm("deliveryNotes", e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
