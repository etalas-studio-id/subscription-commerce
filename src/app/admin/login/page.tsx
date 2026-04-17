'use client';

import Image from 'next/image';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "1";

  // Synchronously initialize — avoids flash if already authenticated
  const [redirecting, setRedirecting] = useState(
    () => !isExpired && typeof window !== 'undefined' && localStorage.getItem("adminAuth") === "true"
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Clear stale localStorage when redirected back due to expired/invalid session
    if (isExpired) {
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("adminUsername");
      return;
    }
    if (localStorage.getItem("adminAuth") === "true") {
      setRedirecting(true);
      router.push("/admin");
    }
  }, [router, isExpired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        setError('Invalid username or password');
        setPassword('');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-blue-50)] via-white to-[var(--color-blue-100)] flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/proball-logo.png" alt="ProBall Football" width={28} height={28} className="rounded" />
            <span className="font-bold text-xl">ProBall Football</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Admin Login</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Enter your credentials to access the admin dashboard
          </p>
        </div>

        <Card className="border-[var(--border)]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <Label htmlFor="username" className="text-xs font-medium mb-1.5 block">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="h-10"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-xs font-medium mb-1.5 block">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-10"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full rounded-lg h-10 text-sm font-medium"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
          © 2026 ProBall Football. Admin Panel.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-emerald-50)] via-white to-[var(--color-emerald-100)] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
