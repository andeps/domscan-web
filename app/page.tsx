"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/account-menu";
type Result = {
  domain: string;
  status: "available" | "registered" | "unknown";
  expirationTime?: string;
};
const tldPool = [
  "com",
  "net",
  "org",
  "io",
  "ai",
  "cn",
  "dev",
  "app",
  "xyz",
  "tech",
  "cloud",
  "co",
  "me",
  "info",
  "site",
  "online",
  "store",
  "pro",
  "top",
  "vip",
];
const randomTlds = () =>
  [...tldPool].sort(() => Math.random() - 0.5).slice(0, 6);
export default function Home() {
  const [domain, setDomain] = useState("");
  const [displayTlds, setDisplayTlds] = useState(tldPool.slice(0, 6));
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => setDisplayTlds(randomTlds()), []);
  async function check(name = domain) {
    const value = name.trim().toLowerCase();
    if (!value) return;
    setDomain(value);
    setLoading(true);
    try {
      const r = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains: [value], concurrency: 1 }),
      });
      const text = await r.text();
      setResult(JSON.parse(text.split("\n")[0]));
    } catch {
      setResult({ domain: value, status: "unknown" });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-navy">
            domscan
          </Link>
          <nav className="hidden gap-8 text-sm text-slate-600 md:flex">
            <a href="#check">域名检测</a>
            <Link href="/batch">批量扫描</Link>
            <a href="#discover">域名发现</a>
          </nav>
          <AccountMenu />
        </div>
      </header>
      <main>
        <section
          id="check"
          className="bg-gradient-to-br from-orange-50 via-white to-blue-50 px-6 py-20 text-center"
        >
          <p className="text-xs font-bold tracking-[.28em] text-brand">
            DOMAIN INTELLIGENCE
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-navy md:text-6xl">
            快速发现可注册域名，
            <br />
            <span className="text-brand">监控域名到期状态。</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-slate-500">
            输入域名，立即获取注册状态和到期时间。
          </p>
          <form
            className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              void check();
            }}
          >
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="h-14 min-w-0 flex-1 rounded-xl bg-slate-50 px-5 text-lg outline-none focus:ring-4 focus:ring-orange-100"
              placeholder="输入域名，例如 domscan.com"
            />
            <Button disabled={loading}>
              {loading ? "查询中…" : "立即检测"}
            </Button>
            <Link
              href="/batch"
              className="grid h-11 place-items-center rounded-lg border px-6 text-sm font-semibold"
            >
              批量检测
            </Link>
          </form>
          {result && (
            <div className="mx-auto mt-6 max-w-3xl rounded-xl bg-white p-5 text-left shadow">
              <strong>{result.domain}</strong>
              <span className="ml-3 text-sm text-green-700">
                {result.status === "available"
                  ? "可注册"
                  : result.status === "registered"
                    ? "已注册"
                    : "未知"}
              </span>
              <p className="mt-2 text-sm text-slate-500">
                到期时间：{result.expirationTime || "暂无"}
              </p>
            </div>
          )}
        </section>
        <section className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="mb-6 text-2xl font-semibold text-navy">
            热门后缀快速检测
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {displayTlds.map((t) => (
              <button
                key={t}
                className="rounded-xl border bg-white p-5 text-left shadow-sm hover:border-brand"
                onClick={() =>
                  void check(`${domain.split(".")[0] || "domscan"}.${t}`)
                }
              >
                <strong>
                  {domain.split(".")[0] || "domscan"}.{t}
                </strong>
                <span className="mt-2 block text-xs text-slate-400">
                  点击检测
                </span>
              </button>
            ))}
          </div>
        </section>
        <section
          id="discover"
          className="mx-auto grid max-w-7xl gap-5 px-6 pb-20 md:grid-cols-3"
        >
          {[
            ["域名检测", "查询注册状态和到期时间"],
            ["批量扫描", "一次检测多个域名"],
            ["域名发现", "输入关键词，自动发现可注册组合"],
          ].map(([title, desc]) => (
            <article
              key={title}
              className="rounded-2xl border bg-white p-7 shadow-sm"
            >
              <div className="mb-5 text-2xl text-brand">✦</div>
              <h3 className="text-lg font-semibold text-navy">{title}</h3>
              <p className="mt-2 text-sm text-slate-500">{desc}</p>
            </article>
          ))}
        </section>
      </main>
      <footer className="border-t bg-white py-8 text-center text-sm text-slate-500">
        © 2026 FHCode · About · Privacy · Terms ·{" "}
        <a href="https://github.com" className="hover:text-brand">
          GitHub
        </a>
      </footer>
    </div>
  );
}
