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
  oneTimePrice: number | null;
  dailyPrice: number | null;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  active: boolean;
  updatedAt: string;
  product: { id: string; name: string; description: string; stock: number | null; lowStockThreshold: number };
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

  const updateEdit = (id: string, field: string, value: string | number | boolean | null) => {
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
          oneTimePrice: edit.oneTimePrice ?? config.oneTimePrice,
          dailyPrice: edit.dailyPrice ?? config.dailyPrice,
          weeklyPrice: edit.weeklyPrice ?? config.weeklyPrice,
          monthlyPrice: edit.monthlyPrice ?? config.monthlyPrice,
          yearlyPrice: edit.yearlyPrice ?? config.yearlyPrice,
          active: edit.active ?? config.active,
          stock: (edit as any).stock !== undefined ? (edit as any).stock : config.product.stock,
          lowStockThreshold: (edit as any).lowStockThreshold ?? config.product.lowStockThreshold,
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
            const currentOneTime = edit.oneTimePrice ?? config.oneTimePrice;
            const currentDaily = edit.dailyPrice ?? config.dailyPrice;
            const currentWeekly = edit.weeklyPrice ?? config.weeklyPrice;
            const currentMonthly = edit.monthlyPrice ?? config.monthlyPrice;
            const currentYearly = edit.yearlyPrice ?? config.yearlyPrice;
            const currentActive = edit.active ?? config.active;
            const currentStock = (edit as any).stock !== undefined ? (edit as any).stock : config.product.stock;
            const currentThreshold = (edit as any).lowStockThreshold ?? config.product.lowStockThreshold;
            const hasChanges = Object.keys(edit).length > 0;
            const stockStatus = currentStock === null ? "Unlimited" : currentStock <= currentThreshold ? "Low" : "OK";

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

                  <div className="space-y-3">
                    {/* Stock Info */}
                    <div className="p-2 bg-stone-50 rounded border border-stone-200 text-[10px]">
                      <div className="flex justify-between">
                        <span>Stock: {currentStock ?? "Unlimited"}</span>
                        <span className={`font-medium ${stockStatus === "OK" ? "text-green-600" : stockStatus === "Low" ? "text-amber-600" : "text-stone-600"}`}>
                          {stockStatus}
                        </span>
                      </div>
                    </div>

                    {/* Base Prices */}
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

                    {/* Frequency-based Prices */}
                    <div className="border-t border-stone-200 pt-3">
                      <p className="text-[10px] font-medium text-stone-600 mb-2">Per-Frequency Prices (leave blank to use base price)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">One-Time</Label>
                          <Input
                            type="number"
                            value={currentOneTime || ""}
                            onChange={(e) =>
                              updateEdit(config.id, "oneTimePrice", parseInt(e.target.value) || null)
                            }
                            className="h-9 text-xs"
                            placeholder="Same as base"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Daily</Label>
                          <Input
                            type="number"
                            value={currentDaily || ""}
                            onChange={(e) =>
                              updateEdit(config.id, "dailyPrice", parseInt(e.target.value) || null)
                            }
                            className="h-9 text-xs"
                            placeholder="Same as base"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Weekly</Label>
                          <Input
                            type="number"
                            value={currentWeekly || ""}
                            onChange={(e) =>
                              updateEdit(config.id, "weeklyPrice", parseInt(e.target.value) || null)
                            }
                            className="h-9 text-xs"
                            placeholder="Same as base"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Monthly</Label>
                          <Input
                            type="number"
                            value={currentMonthly || ""}
                            onChange={(e) =>
                              updateEdit(config.id, "monthlyPrice", parseInt(e.target.value) || null)
                            }
                            className="h-9 text-xs"
                            placeholder="Same as base"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Yearly</Label>
                          <Input
                            type="number"
                            value={currentYearly || ""}
                            onChange={(e) =>
                              updateEdit(config.id, "yearlyPrice", parseInt(e.target.value) || null)
                            }
                            className="h-9 text-xs"
                            placeholder="Same as base"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stock Management */}
                    <div className="border-t border-stone-200 pt-3">
                      <p className="text-[10px] font-medium text-stone-600 mb-2">Inventory</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">Stock Amount</Label>
                          <Input
                            type="number"
                            value={currentStock ?? ""}
                            onChange={(e) =>
                              updateEdit(config.id, "stock", e.target.value === "" ? null : parseInt(e.target.value))
                            }
                            className="h-9 text-xs"
                            placeholder="null = unlimited"
                          />
                          <div className="text-[10px] text-[var(--muted-foreground)] mt-1">Leave blank for unlimited</div>
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Low Stock Threshold</Label>
                          <Input
                            type="number"
                            value={currentThreshold}
                            onChange={(e) =>
                              updateEdit(config.id, "lowStockThreshold", parseInt(e.target.value) || 0)
                            }
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>
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
