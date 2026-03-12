"use client";

import { useState, useEffect } from "react";
import { DollarSign, Save, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PriceConfig {
  id: string;
  basePrice: number;
  comparePrice: number | null;
  active: boolean;
  updatedAt: string;
  product: { id: string; name: string; description: string };
}

function formatPrice(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function PricingPage() {
  const [configs, setConfigs] = useState<PriceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<PriceConfig>>>({});

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        setConfigs(data);
        setLoading(false);
      });
  }, []);

  const updateEdit = (id: string, field: string, value: string | number | boolean) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveConfig = async (config: PriceConfig) => {
    setSaving(config.id);
    const edit = edits[config.id] || {};
    try {
      await fetch("/api/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: config.id,
          basePrice: edit.basePrice ?? config.basePrice,
          comparePrice: edit.comparePrice ?? config.comparePrice,
          active: edit.active ?? config.active,
        }),
      });
      toast.success(`${config.product.name} pricing updated`);
      // Refresh
      const data = await fetch("/api/pricing").then((r) => r.json());
      setConfigs(data);
      setEdits((prev) => {
        const next = { ...prev };
        delete next[config.id];
        return next;
      });
    } catch {
      toast.error("Failed to update pricing");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="heading-display text-2xl">Pricing Management</h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Update product prices and availability
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {configs.map((config) => {
            const edit = edits[config.id] || {};
            const currentBase = edit.basePrice ?? config.basePrice;
            const currentCompare = edit.comparePrice ?? config.comparePrice;
            const currentActive = edit.active ?? config.active;
            const hasChanges = Object.keys(edit).length > 0;

            return (
              <Card key={config.id}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">
                        {config.product.name}
                      </h3>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {config.product.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${config.id}`} className="text-xs">
                        Active
                      </Label>
                      <Switch
                        id={`active-${config.id}`}
                        checked={currentActive}
                        onCheckedChange={(checked) =>
                          updateEdit(config.id, "active", checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">
                        Base Price (IDR)
                      </Label>
                      <Input
                        type="number"
                        value={currentBase}
                        onChange={(e) =>
                          updateEdit(config.id, "basePrice", parseInt(e.target.value) || 0)
                        }
                        className="h-10"
                      />
                      <div className="text-[10px] text-[var(--muted-foreground)] mt-1">
                        Display: {formatPrice(currentBase as number)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">
                        Compare Price (IDR)
                      </Label>
                      <Input
                        type="number"
                        value={currentCompare || ""}
                        onChange={(e) =>
                          updateEdit(
                            config.id,
                            "comparePrice",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="h-10"
                        placeholder="Optional"
                      />
                      {currentCompare && (
                        <div className="text-[10px] text-[var(--muted-foreground)] mt-1 line-through">
                          {formatPrice(currentCompare as number)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-[var(--muted-foreground)]">
                      Last updated:{" "}
                      {new Date(config.updatedAt).toLocaleDateString("en-GB")}
                    </div>
                    {hasChanges && (
                      <Button
                        size="sm"
                        onClick={() => saveConfig(config)}
                        disabled={saving === config.id}
                        className="text-xs"
                      >
                        {saving === config.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Save className="h-3 w-3 mr-1" />
                        )}
                        Save
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
