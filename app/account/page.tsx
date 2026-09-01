"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Account() {
  const [user, setUser] = useState<{ email: string; avatar?: string } | null>(
    null,
  );
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const r = localStorage.getItem("domscan-user");
    if (r) setUser(JSON.parse(r));
  }, []);
  if (!user)
    return (
      <main className="grid min-h-screen place-items-center">
        <Link href="/login" className="text-brand">
          请先登录
        </Link>
      </main>
    );
  const request = async (path: string, body: object) => {
    const r = await fetch(`/api/auth/${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("domscan-token") || ""}`,
      },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) throw Error(d.error || "操作失败");
    return d;
  };
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <section className="mx-auto max-w-xl rounded-2xl border bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm text-slate-500">
          ← 返回首页
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-navy">账户设置</h1>
        <div className="mt-8 flex items-center gap-4">
          <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-orange-100 text-2xl text-brand">
            {user.avatar ? (
              <img
                src={user.avatar}
                className="h-full w-full object-cover"
                alt="头像"
              />
            ) : (
              user.email[0].toUpperCase()
            )}
          </div>
          <label className="cursor-pointer rounded-lg border px-4 py-2 text-sm">
            上传头像
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const rd = new FileReader();
                rd.onload = async () => {
                  try {
                    const d = await request("avatar", {
                      email: user.email,
                      avatar: rd.result,
                    });
                    const next = { ...user, avatar: d.avatar };
                    setUser(next);
                    localStorage.setItem("domscan-user", JSON.stringify(next));
                    setMsg("头像更新成功");
                  } catch (err) {
                    setMsg((err as Error).message);
                  }
                };
                rd.readAsDataURL(f);
              }}
            />
          </label>
        </div>
        <form
          className="mt-8 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const email = new FormData(e.currentTarget).get(
                "email",
              ) as string;
              await request("email", { newEmail: email });
              const next = { ...user, email };
              setUser(next);
              localStorage.setItem("domscan-user", JSON.stringify(next));
              setMsg("邮箱修改成功");
            } catch (err) {
              setMsg((err as Error).message);
            }
          }}
        >
          <input
            name="email"
            type="email"
            defaultValue={user.email}
            className="h-11 rounded-lg border px-3"
          />
          <Button>修改邮箱</Button>
        </form>
        <form
          className="mt-5 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const password = new FormData(e.currentTarget).get(
                "password",
              ) as string;
              await request("password", { email: user.email, password });
              e.currentTarget.reset();
              setMsg("密码修改成功");
            } catch (err) {
              setMsg((err as Error).message);
            }
          }}
        >
          <input
            name="password"
            type="password"
            minLength={8}
            placeholder="新密码（至少 8 位）"
            className="h-11 rounded-lg border px-3"
          />
          <Button variant="outline">修改密码</Button>
        </form>
        <p className="mt-4 text-sm text-slate-500">{msg}</p>
        <button
          type="button"
          className="mt-6 w-full rounded-lg border border-red-200 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
          onClick={() => {
            localStorage.removeItem("domscan-token");
            localStorage.removeItem("domscan-user");
            location.href = "/";
          }}
        >
          退出登录
        </button>
      </section>
    </main>
  );
}
