"use client";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "注册失败");
      location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-orange-50 via-white to-blue-50 px-6">
      <section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl shadow-slate-200/60">
        <a href="/" className="text-lg font-bold text-navy">
          domscan
        </a>
        <h1 className="mt-10 text-3xl font-semibold text-navy">创建账号</h1>
        <p className="mt-2 mb-8 text-sm text-slate-500">
          使用邮箱注册，开启域名发现工具。
        </p>
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
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码（至少 8 位）"
            className="h-12 rounded-lg border px-4 outline-none focus:border-brand focus:ring-4 focus:ring-orange-100"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button disabled={loading}>{loading ? "注册中…" : "注册"}</Button>
          <p className="text-center text-sm text-slate-500">
            已有账号？{" "}
            <a className="text-brand" href="/login">
              立即登录
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}
