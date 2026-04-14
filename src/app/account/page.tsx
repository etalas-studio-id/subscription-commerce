"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Trash2, Plus, MapPin, Package, Pencil, X, Check, CreditCard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n-context";

interface Address {
  id: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryNotes: string;
}

interface Payment {
  amount: number;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
}

interface OrderItem {
  id: string;
  productName: string;
  orderType: string;
  frequency: string | null;
  amount: number;
  status: string;
  createdAt: string;
  subscription: { status: string; nextChargeDate: string | null } | null;
  payments: Payment[];
}

function formatPrice(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  PROCESSING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const subStatusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  DRAFT: "bg-gray-100 text-gray-600",
  REQUIRES_ACTION: "bg-yellow-100 text-yellow-800",
  PAUSED: "bg-blue-100 text-blue-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  SUCCESS: "bg-emerald-100 text-emerald-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  REQUIRES_ACTION: "bg-blue-100 text-blue-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function AccountPage() {
  const { t } = useI18n();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);

  // Profile edit modal
  const [editingProfile, setEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ name: "", phone: "" });

  // Address states
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ address: "", city: "", postalCode: "", deliveryNotes: "" });
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [editAddressForm, setEditAddressForm] = useState({ address: "", city: "", postalCode: "", deliveryNotes: "" });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data.profile);
        setAddresses(data.addresses);
        setOrders(data.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editProfileForm.name, phone: editProfileForm.phone }),
      });
      if (res.ok) {
        setProfile((p) => ({ ...p, name: editProfileForm.name, phone: editProfileForm.phone }));
        setEditingProfile(false);
        toast.success(t("account.saved"));
      }
    } catch {
      toast.error("Failed to save");
    }
    setSaving(false);
  };

  const openEditProfile = () => {
    setEditProfileForm({ name: profile.name, phone: profile.phone ?? "" });
    setEditingProfile(true);
  };

  const addAddress = async () => {
    if (!newAddress.address || !newAddress.city || !newAddress.postalCode) return;
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      if (res.ok) {
        const addr = await res.json();
        setAddresses((prev) => [addr, ...prev]);
        setNewAddress({ address: "", city: "", postalCode: "", deliveryNotes: "" });
        setShowAddAddress(false);
        toast.success(t("account.saved"));
      }
    } catch {
      toast.error("Failed to add address");
    }
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setEditAddressForm({ address: addr.address, city: addr.city, postalCode: addr.postalCode, deliveryNotes: addr.deliveryNotes });
  };

  const saveEditAddress = async () => {
    if (!editingAddress) return;
    setSavingAddress(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingAddress.id, ...editAddressForm }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setEditingAddress(null);
        toast.success(t("account.saved"));
      }
    } catch {
      toast.error("Failed to update address");
    }
    setSavingAddress(false);
  };

  const deleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      toast.error("Failed to delete address");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  const subscriptionOrders = orders.filter((o) => o.orderType === "SUBSCRIPTION");
  const oneTimeOrders = orders.filter((o) => o.orderType === "ONE_TIME");

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
      <h1 className="text-xl font-semibold">{t("account.title")}</h1>

      {/* Profile */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-bold">1</span>
          {t("account.profile")}
        </h2>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1 text-sm">
                <div className="font-medium">{profile.name}</div>
                <div className="text-[var(--muted-foreground)]">{profile.email}</div>
                {profile.phone && <div className="text-[var(--muted-foreground)]">{profile.phone}</div>}
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={openEditProfile}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Addresses */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-bold">2</span>
            {t("account.addresses")}
          </h2>
          <Button variant="outline" size="xs" onClick={() => setShowAddAddress(!showAddAddress)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t("account.addAddress")}
          </Button>
        </div>

        {showAddAddress && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label>{t("checkout.address")}</Label>
                <Input value={newAddress.address} onChange={(e) => setNewAddress((p) => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("checkout.city")}</Label>
                  <Input value={newAddress.city} onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("checkout.postalCode")}</Label>
                  <Input value={newAddress.postalCode} onChange={(e) => setNewAddress((p) => ({ ...p, postalCode: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("checkout.deliveryNotes")} <span className="text-[var(--muted-foreground)]">{t("checkout.deliveryNotesOptional")}</span></Label>
                <Textarea
                  value={newAddress.deliveryNotes}
                  onChange={(e) => setNewAddress((p) => ({ ...p, deliveryNotes: e.target.value }))}
                  placeholder={t("checkout.deliveryNotesPlaceholder")}
                />
              </div>
              <Button size="sm" onClick={addAddress}>{t("account.addAddress")}</Button>
            </CardContent>
          </Card>
        )}

        {addresses.length === 0 && !showAddAddress ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-[var(--muted-foreground)]">
              <MapPin className="h-5 w-5 mx-auto mb-2 opacity-40" />
              {t("account.noAddresses")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {addresses.map((addr) => (
              <Card key={addr.id}>
                <CardContent className="p-4 flex items-start justify-between">
                  <div className="text-sm">
                    <div className="font-medium">{addr.address}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{addr.city}, {addr.postalCode}</div>
                    {addr.deliveryNotes && (
                      <div className="text-xs text-[var(--muted-foreground)] mt-1 italic">{addr.deliveryNotes}</div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 ml-3">
                    <Button variant="ghost" size="icon-xs" onClick={() => openEditAddress(addr)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteAddress(addr.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Transaction History */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-bold">3</span>
          {t("account.transactions")}
        </h2>

        {/* Subscriptions */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
            <RefreshCw className="h-3.5 w-3.5" />
            {t("account.recurring")}
          </div>
          {subscriptionOrders.length === 0 ? (
            <Card>
              <CardContent className="p-5 text-center text-sm text-[var(--muted-foreground)]">
                <RefreshCw className="h-5 w-5 mx-auto mb-2 opacity-40" />
                {t("account.noSubscriptions")}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {subscriptionOrders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{order.productName}</span>
                      {order.subscription && (
                        <Badge className={`text-[10px] ${subStatusColors[order.subscription.status] || "bg-gray-100 text-gray-600"}`}>
                          {order.subscription.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <span>{order.frequency}</span>
                      <span className="font-medium text-[var(--foreground)]">{formatPrice(order.amount)}</span>
                    </div>
                    {order.subscription?.nextChargeDate && (
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t("account.nextCharge")}: {new Date(order.subscription.nextChargeDate).toLocaleDateString("id-ID")}
                      </div>
                    )}
                    {order.payments.length > 0 && (
                      <div className="border-t pt-2 space-y-1">
                        {order.payments.slice(0, 3).map((p, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px]">
                            <span className="text-[var(--muted-foreground)]">
                              {new Date(p.createdAt).toLocaleDateString("id-ID")}
                              {p.paymentMethod && ` · ${p.paymentMethod}`}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span>{formatPrice(p.amount)}</span>
                              <Badge className={`text-[9px] px-1 py-0 ${paymentStatusColors[p.status] || "bg-gray-100 text-gray-600"}`}>
                                {p.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* One-time Purchases */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
            <CreditCard className="h-3.5 w-3.5" />
            {t("account.oneTime")}
          </div>
          {oneTimeOrders.length === 0 ? (
            <Card>
              <CardContent className="p-5 text-center text-sm text-[var(--muted-foreground)]">
                <Package className="h-5 w-5 mx-auto mb-2 opacity-40" />
                {t("account.noOneTime")}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {oneTimeOrders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-stone-300">
                  <CardContent className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{order.productName}</span>
                      <Badge className={`text-[10px] ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <span>{new Date(order.createdAt).toLocaleDateString("id-ID")}</span>
                      <span className="font-medium text-[var(--foreground)]">{formatPrice(order.amount)}</span>
                    </div>
                    {order.payments[0] && (
                      <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                        <span>{order.payments[0].paymentMethod || "—"}</span>
                        <Badge className={`text-[9px] px-1 py-0 ${paymentStatusColors[order.payments[0].status] || "bg-gray-100 text-gray-600"}`}>
                          {order.payments[0].status}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Profile Edit Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingProfile(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">{t("account.editProfile")}</h2>
              <button onClick={() => setEditingProfile(false)} className="p-1 rounded-lg hover:bg-[var(--color-stone-100)] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">{t("checkout.fullName")}</label>
                <Input
                  value={editProfileForm.name}
                  onChange={(e) => setEditProfileForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">{t("checkout.email")}</label>
                <Input value={profile.email} disabled className="h-9 text-sm opacity-60" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">{t("checkout.phone")}</label>
                <Input
                  value={editProfileForm.phone}
                  onChange={(e) => setEditProfileForm((f) => ({ ...f, phone: e.target.value }))}
                  className="h-9 text-sm"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setEditingProfile(false)} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1 text-xs" onClick={saveProfile} disabled={saving}>
                <Check className="h-3.5 w-3.5 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Address Edit Modal */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingAddress(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">{t("account.editAddress")}</h2>
              <button onClick={() => setEditingAddress(null)} className="p-1 rounded-lg hover:bg-[var(--color-stone-100)] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">{t("checkout.address")}</label>
                <Input
                  value={editAddressForm.address}
                  onChange={(e) => setEditAddressForm((f) => ({ ...f, address: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">{t("checkout.city")}</label>
                  <Input
                    value={editAddressForm.city}
                    onChange={(e) => setEditAddressForm((f) => ({ ...f, city: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">{t("checkout.postalCode")}</label>
                  <Input
                    value={editAddressForm.postalCode}
                    onChange={(e) => setEditAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">
                  {t("checkout.deliveryNotes")} <span className="text-[var(--muted-foreground)] font-normal">{t("checkout.deliveryNotesOptional")}</span>
                </label>
                <Textarea
                  value={editAddressForm.deliveryNotes}
                  onChange={(e) => setEditAddressForm((f) => ({ ...f, deliveryNotes: e.target.value }))}
                  placeholder={t("checkout.deliveryNotesPlaceholder")}
                  className="text-sm"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setEditingAddress(null)} disabled={savingAddress}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1 text-xs" onClick={saveEditAddress} disabled={savingAddress}>
                <Check className="h-3.5 w-3.5 mr-1" />
                {savingAddress ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
