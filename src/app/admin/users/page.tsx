"use client";

import { useState, useEffect } from "react";
import { Search, Users, Pencil, X, Check, LayoutList, Loader2, Trash2, Plus, RefreshCw, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  isRegistered: boolean;
  _count: { orders: number };
}

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

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
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

export default function UsersPage() {
  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "REGISTERED" | "GUEST">("ALL");

  // Edit profile modal
  const [editingUser, setEditingUser] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  // User details modal (addresses + transactions)
  const [detailUser, setDetailUser] = useState<Customer | null>(null);
  const [detailAddresses, setDetailAddresses] = useState<Address[]>([]);
  const [detailOrders, setDetailOrders] = useState<OrderItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Address editing within details modal
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddressForm, setEditAddressForm] = useState({ address: "", city: "", postalCode: "", deliveryNotes: "" });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({ address: "", city: "", postalCode: "", deliveryNotes: "" });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter((user) => {
    const matchesSearch =
      !search ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      filterType === "ALL" ||
      (filterType === "REGISTERED" && user.isRegistered) ||
      (filterType === "GUEST" && !user.isRegistered);

    return matchesSearch && matchesType;
  });

  function openEdit(user: Customer) {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, phone: user.phone ?? "" });
  }

  function closeEdit() {
    setEditingUser(null);
  }

  async function saveEdit() {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser.id, name: editForm.name, email: editForm.email, phone: editForm.phone || null }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      toast.success("User updated");
      closeEdit();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  async function openDetail(user: Customer) {
    setDetailUser(user);
    setDetailLoading(true);
    setDetailAddresses([]);
    setDetailOrders([]);
    setEditingAddressId(null);
    setShowAddAddress(false);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`);
      const data = await res.json();
      setDetailAddresses(data.addresses || []);
      setDetailOrders(data.orders || []);
    } catch {
      toast.error("Failed to load user details");
    }
    setDetailLoading(false);
  }

  function closeDetail() {
    setDetailUser(null);
    setEditingAddressId(null);
    setShowAddAddress(false);
  }

  function startEditAddress(addr: Address) {
    setEditingAddressId(addr.id);
    setEditAddressForm({ address: addr.address, city: addr.city, postalCode: addr.postalCode, deliveryNotes: addr.deliveryNotes });
  }

  async function saveAddress() {
    if (!detailUser || !editingAddressId) return;
    setSavingAddress(true);
    try {
      const res = await fetch(`/api/admin/users/${detailUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: editingAddressId, ...editAddressForm }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setDetailAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditingAddressId(null);
      toast.success("Address updated");
    } catch {
      toast.error("Failed to update address");
    }
    setSavingAddress(false);
  }

  async function addAddress() {
    if (!detailUser) return;
    if (!newAddressForm.address || !newAddressForm.city || !newAddressForm.postalCode) return;
    setSavingAddress(true);
    try {
      const res = await fetch(`/api/admin/users/${detailUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddressForm),
      });
      if (!res.ok) throw new Error("Failed");
      const created = await res.json();
      setDetailAddresses((prev) => [created, ...prev]);
      setNewAddressForm({ address: "", city: "", postalCode: "", deliveryNotes: "" });
      setShowAddAddress(false);
      toast.success("Address added");
    } catch {
      toast.error("Failed to add address");
    }
    setSavingAddress(false);
  }

  async function deleteAddress(addressId: string) {
    if (!detailUser) return;
    try {
      const res = await fetch(`/api/admin/users/${detailUser.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId }),
      });
      if (!res.ok) throw new Error("Failed");
      setDetailAddresses((prev) => prev.filter((a) => a.id !== addressId));
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete address");
    }
  }

  const registeredCount = users.filter((u) => u.isRegistered).length;
  const guestCount = users.filter((u) => !u.isRegistered).length;

  const subscriptionOrders = detailOrders.filter((o) => o.orderType === "SUBSCRIPTION");
  const oneTimeOrders = detailOrders.filter((o) => o.orderType === "ONE_TIME");

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="heading-display text-2xl">Users</h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {users.length} total · {registeredCount} registered · {guestCount} guests
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>
        <select
          className="h-10 px-3 border border-[var(--border)] rounded-lg text-xs bg-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
        >
          <option value="ALL">All Users</option>
          <option value="REGISTERED">Registered</option>
          <option value="GUEST">Guest</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">No users found</p>
          <p className="text-xs mt-1">
            {search || filterType !== "ALL"
              ? "Try adjusting your filters"
              : "Users will appear here once customers start checking out"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => (
            <Card
              key={user.id}
              className={`border-l-4 ${user.isRegistered ? "border-l-emerald-600" : "border-l-stone-300"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{user.name}</span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-2 py-0 ${user.isRegistered ? "badge-success" : "badge-neutral"}`}
                      >
                        {user.isRegistered ? "Registered" : "Guest"}
                      </Badge>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{user.email}</div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[var(--muted-foreground)]">
                      {user.phone && <span>{user.phone}</span>}
                      <span>Joined {formatDate(user.createdAt)}</span>
                      <span>{user._count.orders} order{user._count.orders !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-3">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openDetail(user)} title="View details">
                      <LayoutList className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(user)} title="Edit profile">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Edit User</h2>
              <button onClick={closeEdit} className="p-1 rounded-lg hover:bg-[var(--color-stone-100)] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">Name</label>
                <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">Email</label>
                <Input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">Phone</label>
                <Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} className="h-9 text-sm" placeholder="Optional" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={closeEdit} disabled={saving}>Cancel</Button>
              <Button size="sm" className="flex-1 text-xs" onClick={saveEdit} disabled={saving}>
                <Check className="h-3.5 w-3.5 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal (Addresses + Transactions) */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeDetail} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b shrink-0">
              <div>
                <h2 className="font-semibold text-sm">{detailUser.name}</h2>
                <p className="text-xs text-[var(--muted-foreground)]">{detailUser.email}</p>
              </div>
              <button onClick={closeDetail} className="p-1 rounded-lg hover:bg-[var(--color-stone-100)] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-5 space-y-6">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
                </div>
              ) : (
                <>
                  {/* Addresses */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Addresses</h3>
                      <Button variant="outline" size="xs" onClick={() => { setShowAddAddress(!showAddAddress); setEditingAddressId(null); }}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add
                      </Button>
                    </div>

                    {showAddAddress && (
                      <div className="border rounded-lg p-3 space-y-2 bg-[var(--color-stone-50)]">
                        <Input
                          placeholder="Address"
                          value={newAddressForm.address}
                          onChange={(e) => setNewAddressForm((f) => ({ ...f, address: e.target.value }))}
                          className="h-8 text-xs"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="City"
                            value={newAddressForm.city}
                            onChange={(e) => setNewAddressForm((f) => ({ ...f, city: e.target.value }))}
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="Postal Code"
                            value={newAddressForm.postalCode}
                            onChange={(e) => setNewAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
                            className="h-8 text-xs"
                          />
                        </div>
                        <Textarea
                          placeholder="Delivery Notes (optional)"
                          value={newAddressForm.deliveryNotes}
                          onChange={(e) => setNewAddressForm((f) => ({ ...f, deliveryNotes: e.target.value }))}
                          className="text-xs"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button variant="outline" size="xs" onClick={() => setShowAddAddress(false)} disabled={savingAddress}>Cancel</Button>
                          <Button size="xs" onClick={addAddress} disabled={savingAddress}>
                            {savingAddress ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add Address"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {detailAddresses.length === 0 && !showAddAddress ? (
                      <p className="text-xs text-[var(--muted-foreground)] text-center py-3">No addresses saved</p>
                    ) : (
                      <div className="space-y-2">
                        {detailAddresses.map((addr) => (
                          <div key={addr.id} className="border rounded-lg p-3">
                            {editingAddressId === addr.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editAddressForm.address}
                                  onChange={(e) => setEditAddressForm((f) => ({ ...f, address: e.target.value }))}
                                  className="h-8 text-xs"
                                  placeholder="Address"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    value={editAddressForm.city}
                                    onChange={(e) => setEditAddressForm((f) => ({ ...f, city: e.target.value }))}
                                    className="h-8 text-xs"
                                    placeholder="City"
                                  />
                                  <Input
                                    value={editAddressForm.postalCode}
                                    onChange={(e) => setEditAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
                                    className="h-8 text-xs"
                                    placeholder="Postal Code"
                                  />
                                </div>
                                <Textarea
                                  value={editAddressForm.deliveryNotes}
                                  onChange={(e) => setEditAddressForm((f) => ({ ...f, deliveryNotes: e.target.value }))}
                                  className="text-xs"
                                  rows={2}
                                  placeholder="Delivery Notes (optional)"
                                />
                                <div className="flex gap-2">
                                  <Button variant="outline" size="xs" onClick={() => setEditingAddressId(null)} disabled={savingAddress}>Cancel</Button>
                                  <Button size="xs" onClick={saveAddress} disabled={savingAddress}>
                                    {savingAddress ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between">
                                <div className="text-xs">
                                  <div className="font-medium">{addr.address}</div>
                                  <div className="text-[var(--muted-foreground)]">{addr.city}, {addr.postalCode}</div>
                                  {addr.deliveryNotes && <div className="italic text-[var(--muted-foreground)] mt-0.5">{addr.deliveryNotes}</div>}
                                </div>
                                <div className="flex gap-1 shrink-0 ml-2">
                                  <Button variant="ghost" size="icon-xs" onClick={() => { startEditAddress(addr); setShowAddAddress(false); }}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon-xs" className="text-red-500 hover:text-red-700" onClick={() => deleteAddress(addr.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Transaction History */}
                  <section className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Transaction History</h3>

                    {/* Subscriptions */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Subscriptions
                      </div>
                      {subscriptionOrders.length === 0 ? (
                        <p className="text-xs text-[var(--muted-foreground)] text-center py-2">No subscriptions</p>
                      ) : (
                        <div className="space-y-2">
                          {subscriptionOrders.map((order) => (
                            <div key={order.id} className="border-l-4 border-l-emerald-500 border rounded-lg p-3 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">{order.productName}</span>
                                {order.subscription && (
                                  <Badge className={`text-[9px] px-1 py-0 ${subStatusColors[order.subscription.status] || "bg-gray-100 text-gray-600"}`}>
                                    {order.subscription.status}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                                <span>{order.frequency}</span>
                                <span className="font-medium text-[var(--foreground)]">{formatPrice(order.amount)}</span>
                              </div>
                              {order.subscription?.nextChargeDate && (
                                <div className="text-[11px] text-[var(--muted-foreground)]">
                                  Next charge: {new Date(order.subscription.nextChargeDate).toLocaleDateString("id-ID")}
                                </div>
                              )}
                              {order.payments.length > 0 && (
                                <div className="border-t pt-1.5 space-y-1">
                                  {order.payments.slice(0, 3).map((p, i) => (
                                    <div key={i} className="flex items-center justify-between text-[10px]">
                                      <span className="text-[var(--muted-foreground)]">
                                        {new Date(p.createdAt).toLocaleDateString("id-ID")}
                                        {p.paymentMethod && ` · ${p.paymentMethod}`}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <span>{formatPrice(p.amount)}</span>
                                        <Badge className={`text-[8px] px-1 py-0 ${paymentStatusColors[p.status] || "bg-gray-100 text-gray-600"}`}>
                                          {p.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* One-time */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                        <CreditCard className="h-3.5 w-3.5" />
                        One-time Purchases
                      </div>
                      {oneTimeOrders.length === 0 ? (
                        <p className="text-xs text-[var(--muted-foreground)] text-center py-2">No one-time purchases</p>
                      ) : (
                        <div className="space-y-2">
                          {oneTimeOrders.map((order) => (
                            <div key={order.id} className="border-l-4 border-l-stone-300 border rounded-lg p-3 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">{order.productName}</span>
                                <Badge className={`text-[9px] px-1 py-0 ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                                <span>{new Date(order.createdAt).toLocaleDateString("id-ID")}</span>
                                <span className="font-medium text-[var(--foreground)]">{formatPrice(order.amount)}</span>
                              </div>
                              {order.payments[0] && (
                                <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                                  <span>{order.payments[0].paymentMethod || "—"}</span>
                                  <Badge className={`text-[8px] px-1 py-0 ${paymentStatusColors[order.payments[0].status] || "bg-gray-100 text-gray-600"}`}>
                                    {order.payments[0].status}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
