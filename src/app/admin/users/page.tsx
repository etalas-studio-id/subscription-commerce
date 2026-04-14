"use client";

import { useState, useEffect } from "react";
import { Search, Users, Pencil, X, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function UsersPage() {
  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "REGISTERED" | "GUEST">("ALL");
  const [editingUser, setEditingUser] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

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
        body: JSON.stringify({
          id: editingUser.id,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone || null,
        }),
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

  const registeredCount = users.filter((u) => u.isRegistered).length;
  const guestCount = users.filter((u) => !u.isRegistered).length;

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
              className={`border-l-4 ${
                user.isRegistered ? "border-l-emerald-600" : "border-l-stone-300"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{user.name}</span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-2 py-0 ${
                          user.isRegistered ? "badge-success" : "badge-neutral"
                        }`}
                      >
                        {user.isRegistered ? "Registered" : "Guest"}
                      </Badge>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {user.email}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[var(--muted-foreground)]">
                      {user.phone && <span>{user.phone}</span>}
                      <span>Joined {formatDate(user.createdAt)}</span>
                      <span>{user._count.orders} order{user._count.orders !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0 ml-3"
                    onClick={() => openEdit(user)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Edit User</h2>
              <button
                onClick={closeEdit}
                className="p-1 rounded-lg hover:bg-[var(--color-stone-100)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">
                  Name
                </label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">
                  Phone
                </label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="h-9 text-sm"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={closeEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs"
                onClick={saveEdit}
                disabled={saving}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
