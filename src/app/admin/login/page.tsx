'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        // JWT is set in httpOnly cookie by the API
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-emerald-50)] via-white to-[var(--color-emerald-100)] flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-6 w-6 text-[var(--primary)]" />
            <span className="font-bold text-xl">Panen Baik</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Admin Login</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Enter your credentials to access the admin dashboard
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-[var(--border)]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error message */}
              {error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Username field */}
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

              {/* Password field */}
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

              {/* Submit button */}
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

        {/* Footer */}
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
          © 2024 Panen Baik. Admin Panel.
        </p>
      </div>
    </div>
  );
}
