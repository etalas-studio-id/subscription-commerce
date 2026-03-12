import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerFormProps {
  form: {
    name: string;
    email: string;
    phone: string;
  };
  updateForm: (field: string, value: string) => void;
}

export function CustomerDetails({ form, updateForm }: CustomerFormProps) {
  return (
    <div>
      <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-bold">1</span>
        Your Details
      </h2>
      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <Label htmlFor="name" className="text-xs mb-1 block">Full Name</Label>
            <Input id="name" placeholder="Sarah Wijaya" value={form.name} onChange={(e) => updateForm("name", e.target.value)} className="h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email" className="text-xs mb-1 block">Email</Label>
              <Input id="email" type="email" placeholder="sarah@email.com" value={form.email} onChange={(e) => updateForm("email", e.target.value)} className="h-11" />
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs mb-1 block">Phone</Label>
              <Input id="phone" placeholder="+62812..." value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className="h-11" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
