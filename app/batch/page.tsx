"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
type Result = {
  domain: string;
  status: "available" | "registered" | "unknown";
  expirationTime?: string;
  durationMs?: number;
  cached?: boolean;
};
const statusText = (s: Result["status"]) =>
  ({ available: "可注册", registered: "已注册", unknown: "未知" })[s];
export default function Batch() {
  const [token, setToken] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<Result | null>(null);
  const [showAvailable, setShowAvailable] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [tlds, setTlds] = useState("com, net, io");
  const [limit, setLimit] = useState(100);
  const [min, setMin] = useState(4);
  const [max, setMax] = useState(12);
  const [digit, setDigit] = useState("forbid");
  const [fuzzy, setFuzzy] = useState("none");
  const [hyphen, setHyphen] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => setToken(localStorage.getItem("domscan-token") || ""), []);
  const available = results.filter((r) => r.status === "available");
  async function start() {
    if (!token) {
      setNote("请先登录会员账号");
      return;
    }
    setRunning(true);
    setResults([]);
    setNote("正在检测…");
    abort.current = new AbortController();
    try {
      const r = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: abort.current.signal,
        body: JSON.stringify({
          options: {
            keywords: keyword.split(/[,\s，]+/).filter(Boolean),
            tlds: tlds.split(/[,\s，]+/).filter(Boolean),
            minLength: min,
            maxLength: max,
            digitMode: digit,
            fuzzyMode: fuzzy,
            hyphen,
            limit,
          },
          concurrency: 8,
        }),
      });
      if (!r.ok) throw Error("登录已失效或请求失败");
      const reader = r.body?.getReader();
      if (!reader) throw Error("无法读取检测流");
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const chunk = await reader.read();
        buffer += decoder.decode(chunk.value || new Uint8Array(), { stream: !chunk.done });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const row = JSON.parse(line) as Result & { event?: string; fresh?: number; cachedSkipped?: number };
          if (row.event === "summary") setNote(`完成：新检测 ${row.fresh ?? 0} 个，跳过缓存 ${row.cachedSkipped ?? 0} 个`);
          else setResults(old => [...old, row]);
        }
        if (chunk.done) break;
      }
      if (buffer.trim()) { const row = JSON.parse(buffer) as Result & { event?: string }; if (!row.event) setResults(old => [...old, row]); }
    } catch (e) {
      if ((e as Error).name === "AbortError") setNote("检测已停止");
      else setNote((e as Error).message);
    } finally {
      setRunning(false);
    }
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-navy">
            domscan
          </Link>
          <Link href="/" className="text-sm text-slate-600">
            返回首页
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold tracking-[.25em] text-brand">
            MEMBER TOOL
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-navy">批量扫描</h1>
        </div>
        {!token ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <p className="text-slate-500">登录会员后使用批量扫描</p>
            <Link
              href="/login"
              className="mt-5 inline-flex rounded-lg bg-brand px-6 py-3 text-white"
            >
              登录
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-navy">扫描设置</h2>
              <div className="grid gap-4 text-sm">
                <label>
                  关键词
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="可留空，自动组合"
                    className="mt-2 h-10 w-full rounded-lg border px-3"
                  />
                </label>
                <label>
                  域名后缀
                  <input
                    value={tlds}
                    onChange={(e) => setTlds(e.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border px-3"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    最小长度
                    <input
                      type="number"
                      value={min}
                      onChange={(e) => setMin(+e.target.value)}
                      className="mt-2 h-10 w-full rounded-lg border px-3"
                    />
                  </label>
                  <label>
                    最大长度
                    <input
                      type="number"
                      value={max}
                      onChange={(e) => setMax(+e.target.value)}
                      className="mt-2 h-10 w-full rounded-lg border px-3"
                    />
                  </label>
                </div>
                <label>
                  数字规则
                  <select
                    value={digit}
                    onChange={(e) => setDigit(e.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border px-3"
                  >
                    <option value="forbid">不包含数字</option>
                    <option value="allow">可以包含数字</option>
                    <option value="require">必须包含数字</option>
                  </select>
                </label>
                <label>
                  模糊组合
                  <select
                    value={fuzzy}
                    onChange={(e) => setFuzzy(e.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border px-3"
                  >
                    <option value="none">不启用</option>
                    <option value="prefix">关键词前追加</option>
                    <option value="suffix">关键词后追加</option>
                    <option value="both">两侧追加</option>
                  </select>
                </label>
                <label>
                  候选数量
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={limit}
                    onChange={(e) => setLimit(+e.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border px-3"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hyphen}
                    onChange={(e) => setHyphen(e.target.checked)}
                  />
                  生成中划线组合
                </label>
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={start} disabled={running}>
                  {running ? "检测中…" : "开始检测"}
                </Button>
                {running && (
                  <Button
                    variant="outline"
                    onClick={() => abort.current?.abort()}
                  >
                    停止
                  </Button>
                )}
              </div>
            </aside>
            <section className="min-w-0 overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="border-b px-6 py-5">
                <h2 className="font-semibold text-navy">检测结果</h2>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  <Stat label="已检测" value={results.length} />
                  <button
                    className="rounded-lg bg-green-50 p-3 text-left"
                    onClick={() => setShowAvailable(true)}
                  >
                    <b className="block text-xl text-green-700">
                      {available.length}
                    </b>
                    <span className="text-xs text-green-700">
                      可注册（点击查看）
                    </span>
                  </button>
                  <Stat
                    label="已注册"
                    value={
                      results.filter((r) => r.status === "registered").length
                    }
                  />
                  <Stat
                    label="未知"
                    value={results.filter((r) => r.status === "unknown").length}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-500">{note}</p>
              </div>
              <div className="max-h-[600px] overflow-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-3">域名</th>
                      <th className="px-6 py-3">状态</th>
                      <th className="px-6 py-3">到期时间</th>
                      <th className="px-6 py-3">耗时</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr
                        key={i}
                        className="cursor-pointer border-t hover:bg-slate-50"
                        onClick={() =>
                          r.status === "available" && setSelected(r)
                        }
                      >
                        <td className="px-6 py-3 font-medium">{r.domain}</td>
                        <td className="px-6 py-3">
                          {statusText(r.status)}
                          {r.cached && " · 缓存"}
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {r.expirationTime || "—"}
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {r.durationMs ?? "—"} ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
        {showAvailable && (
          <div
            className="fixed inset-0 z-10 grid place-items-center bg-slate-900/40 p-6"
            onClick={() => setShowAvailable(false)}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold text-navy">
                可注册域名（{available.length}）
              </h2>
              <div className="mt-5 max-h-96 space-y-2 overflow-auto">
                {available.map((r, i) => (
                  <button
                    key={i}
                    className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:border-brand"
                    onClick={() => {
                      setSelected(r);
                      setShowAvailable(false);
                    }}
                  >
                    <span className="font-medium">{r.domain}</span>
                    <span className="text-xs text-slate-500">
                      {r.expirationTime || "暂无"}
                    </span>
                  </button>
                ))}
              </div>
              <Button
                className="mt-5 w-full"
                onClick={() => setShowAvailable(false)}
              >
                关闭
              </Button>
            </div>
          </div>
        )}
        {selected && (
          <div
            className="fixed inset-0 z-10 grid place-items-center bg-slate-900/40 p-6"
            onClick={() => setSelected(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold text-navy">域名详情</h2>
              <p className="mt-5 text-xl font-medium">{selected.domain}</p>
              <p className="mt-3 text-sm text-slate-500">
                状态：{statusText(selected.status)}
                <br />
                到期时间：{selected.expirationTime || "暂无"}
                <br />
                检测耗时：{selected.durationMs ?? "—"} ms
              </p>
              <Button className="mt-6 w-full" onClick={() => setSelected(null)}>
                关闭
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <b className="block text-xl text-navy">{value}</b>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
