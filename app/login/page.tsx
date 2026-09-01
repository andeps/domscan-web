"use client";
import { FormEvent, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "登录失败");
      localStorage.setItem("domscan-token", d.token);
      localStorage.setItem("domscan-user", JSON.stringify(d.user));
      location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell title="登录 domscan" subtitle="登录后使用批量扫描和域名监控">
      <form onSubmit={submit} className="grid gap-4">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱地址"
          className="h-12 rounded-lg border px-4 outline-none focus:border-brand focus:ring-4 focus:ring-orange-100"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          className="h-12 rounded-lg border px-4 outline-none focus:border-brand focus:ring-4 focus:ring-orange-100"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button disabled={loading}>{loading ? "登录中…" : "登录"}</Button>
        <p className="text-center text-sm text-slate-500">
          还没有账号？{" "}
          <a className="text-brand" href="/register">
            免费注册
          </a>
        </p>
      </form>
    </AuthShell>
  );
}
function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-orange-50 via-white to-blue-50 px-6">
      <section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl shadow-slate-200/60">
        <a href="/" className="text-lg font-bold text-navy">
          domscan
        </a>
        <h1 className="mt-10 text-3xl font-semibold text-navy">{title}</h1>
        <p className="mt-2 mb-8 text-sm text-slate-500">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
