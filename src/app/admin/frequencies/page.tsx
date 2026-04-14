"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Save, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FrequencySetting {
  id: string;
  frequency: string;
  label: string;
  description: string;
  interval: string;
  intervalCount: number;
  enabled: boolean;
  updatedAt: string;
}

export default function FrequenciesPage() {
  const [settings, setSettings] = useState<FrequencySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<FrequencySetting>>>({});

  const fetchAll = async () => {
    const res = await fetch("/api/frequencies?all=true");
    // Get all frequencies including disabled ones
    const data = await res.json();
    setSettings(data);
    setLoading(false);
  };

  useEffect(() => {
    // Fetch all frequency settings (including disabled)
    fetch("/api/frequencies")
      .then((r) => r.json())
      .then((data) => {
        setSettings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateEdit = (id: string, field: string, value: string | number | boolean) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveSetting = async (setting: FrequencySetting) => {
    setSaving(setting.id);
    const edit = edits[setting.id] || {};
    try {
      await fetch("/api/frequencies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: setting.id,
          label: edit.label ?? setting.label,
          description: edit.description ?? setting.description,
          interval: edit.interval ?? setting.interval,
          intervalCount: edit.intervalCount ?? setting.intervalCount,
          enabled: edit.enabled ?? setting.enabled,
        }),
      });
      toast.success(`${setting.label} updated`);
      // Refresh
      const data = await fetch("/api/frequencies").then((r) => r.json());
      setSettings(data);
      setEdits((prev) => {
        const next = { ...prev };
        delete next[setting.id];
        return next;
      });
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="heading-display text-2xl">Frequency Settings</h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Configure available subscription delivery frequencies
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {settings.map((setting) => {
            const edit = edits[setting.id] || {};
            const currentLabel = (edit.label ?? setting.label) as string;
            const currentDesc = (edit.description ?? setting.description) as string;
            const currentEnabled = (edit.enabled ?? setting.enabled) as boolean;
            const hasChanges = Object.keys(edit).length > 0;

            return (
              <Card key={setting.id} className={!currentEnabled ? "opacity-60" : ""}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-emerald-50)] flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{setting.frequency}</div>
                        <div className="text-[10px] text-[var(--muted-foreground)]">
                          Every {setting.intervalCount} {setting.interval.toLowerCase()}(s)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`enabled-${setting.id}`} className="text-xs">
                        {currentEnabled ? "Enabled" : "Disabled"}
                      </Label>
                      <Switch
                        id={`enabled-${setting.id}`}
                        checked={currentEnabled}
                        onCheckedChange={(checked) =>
                          updateEdit(setting.id, "enabled", checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">Label</Label>
                      <Input
                        value={currentLabel}
                        onChange={(e) =>
                          updateEdit(setting.id, "label", e.target.value)
                        }
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Description</Label>
                      <Input
                        value={currentDesc}
                        onChange={(e) =>
                          updateEdit(setting.id, "description", e.target.value)
                        }
                        className="h-10"
                      />
                    </div>
                  </div>

                  {hasChanges && (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => saveSetting(setting)}
                        disabled={saving === setting.id}
                        className="text-xs"
                      >
                        {saving === setting.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Save className="h-3 w-3 mr-1" />
                        )}
                        Save
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
