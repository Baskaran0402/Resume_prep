"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard"); // Redirect after login
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm px-6 py-10 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-6">
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-zinc-50">Welcome back</h1>
          <p className="text-sm text-zinc-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-zinc-200">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-zinc-300 hover:text-white underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
