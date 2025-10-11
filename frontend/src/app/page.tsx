"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function openLogin() {
    setError(null);
    setUsername("");
    setPassword("");
    setShowLogin(true);
  }

  function closeLogin() {
    setShowLogin(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === "admin" && password === "baac1234") {
      setShowLogin(false);
      router.push("/create-question");
    } else {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <main className="w-full max-w-xl text-center space-y-8">
        <h1 className="text-3xl font-bold">welcome to Innovation Conner</h1>
        <nav className="grid gap-4 sm:grid-cols-1">
          <button
            onClick={openLogin}
            className="block rounded-lg border border-black/10 dark:border-white/20 p-6 hover:bg-black/5 dark:hover:bg-white/10 transition text-center"
          >
            <span className="text-lg text-center font-medium">Create Question</span>
          </button>
          {/* <Link
            href="/answer_analytic"
            className="block rounded-lg border border-black/10 dark:border-white/20 p-6 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <span className="text-lg font-medium">Present Answer</span>
          </Link> */}
        </nav>
      </main>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeLogin} />
          <div className="relative z-10 w-full max-w-sm rounded-lg border border-black/10 dark:border-white/20 bg-[color:var(--background)] p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">เข้าสู่ระบบ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm">User</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-black/10 dark:border-white/20 p-2 bg-transparent"
                  // placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm">Password</label>
                <input
                  type="password"
                  className="w-full rounded-md border border-black/10 dark:border-white/20 p-2 bg-transparent"
                  // placeholder="baac1234"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={closeLogin} className="rounded-md border border-black/10 dark:border-white/20 px-3 py-1 text-sm">ยกเลิก</button>
                <button type="submit" className="rounded-md bg-black text-white px-4 py-1 text-sm dark:bg-white dark:text-black">เข้าสู่ระบบ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
