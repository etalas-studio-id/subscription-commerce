"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

  // Add product state
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", description: "", basePrice: "", comparePrice: "", tags: "",
  });

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchConfigs = () =>
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => setConfigs(Array.isArray(data) ? data : []))
      .catch(() => setLoading(false));

  useEffect(() => {
    fetchConfigs().finally(() => setLoading(false));
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
      toast.success(`${config.product.name} updated`);
      await fetchConfigs();
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

  const createProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.description.trim() || !newProduct.basePrice) {
      toast.error("Name, description, and base price are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          basePrice: parseInt(newProduct.basePrice),
          comparePrice: newProduct.comparePrice ? parseInt(newProduct.comparePrice) : null,
          tags: newProduct.tags,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create product");
        return;
      }
      toast.success("Product created");
      setNewProduct({ name: "", description: "", basePrice: "", comparePrice: "", tags: "" });
      setShowAddForm(false);
      await fetchConfigs();
    } catch {
      toast.error("Failed to create product");
    } finally {
      setCreating(false);
    }
  };

  const deleteProduct = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: deleteTarget.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete product");
        return;
      }
      toast.success("Product deleted");
      setConfigs((prev) => prev.filter((c) => c.product.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="heading-display text-2xl">Products</h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Manage products, pricing and availability
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddForm((v) => !v)}
          variant={showAddForm ? "outline" : "default"}
          className="text-xs"
        >
          {showAddForm ? (
            <><X className="h-3 w-3 mr-1" />Cancel</>
          ) : (
            <><Plus className="h-3 w-3 mr-1" />Add Product</>
          )}
        </Button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <Card className="border-dashed">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">New Product</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs mb-1 block">Name *</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Veggie Box Large"
                  className="h-9 text-xs"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs mb-1 block">Description *</Label>
                <Textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description shown to customers"
                  className="text-xs resize-none"
                  rows={2}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Base Price (IDR) *</Label>
                <Input
                  type="number"
                  value={newProduct.basePrice}
                  onChange={(e) => setNewProduct((p) => ({ ...p, basePrice: e.target.value }))}
                  placeholder="e.g. 150000"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Compare Price (IDR)</Label>
                <Input
                  type="number"
                  value={newProduct.comparePrice}
                  onChange={(e) => setNewProduct((p) => ({ ...p, comparePrice: e.target.value }))}
                  placeholder="Optional — shown as original price"
                  className="h-9 text-xs"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs mb-1 block">Tags</Label>
                <Input
                  value={newProduct.tags}
                  onChange={(e) => setNewProduct((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="comma-separated, e.g. popular,organic"
                  className="h-9 text-xs"
                />
                <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                  Add &quot;popular&quot; to show a &quot;Most Popular&quot; badge
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  setShowAddForm(false);
                  setNewProduct({ name: "", description: "", basePrice: "", comparePrice: "", tags: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs"
                onClick={createProduct}
                disabled={creating}
              >
                {creating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                Create Product
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget({ id: config.product.id, name: config.product.name })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-sm">Delete Product</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Are you sure you want to permanently delete{" "}
                <span className="font-medium text-[var(--foreground)]">{deleteTarget.name}</span>?
                This cannot be undone.
              </p>
              <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-2">
                Products with existing orders cannot be deleted. Use the Active toggle to hide a product from customers instead.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs bg-red-600 hover:bg-red-700 text-white"
                onClick={deleteProduct}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Trash2 className="h-3 w-3 mr-1" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
