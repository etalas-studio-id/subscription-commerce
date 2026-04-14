"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UnlockPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0e1e3a" }}>
      <div className="w-full max-w-lg px-6 py-10 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-berkala.png"
            alt="Berkala"
            width={480}
            className="object-contain"
          />
          <p className="text-neutral-400 text-sm">Masukkan kata sandi untuk melanjutkan</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kata sandi"
            autoFocus
            className="w-full px-4 py-3 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-white" style={{ backgroundColor: "#162d52", border: "1px solid #2a4470" }}
          />
          {error && (
            <p className="text-red-400 text-sm text-center">Kata sandi salah.</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 disabled:opacity-40 transition"
          >
            {loading ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
