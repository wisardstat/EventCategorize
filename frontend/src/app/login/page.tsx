"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postWithoutAuth } from "@/utils/api";

interface User {
  user_code: string;
  user_fname: string;
  user_lname: string;
  user_login: string;
  user_role?: string;
  token: string;
}

export default function LoginPage() {
  const [user_login, setUserLogin] = useState("");
  const [user_password, setUserPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting login with:", { user_login, user_password: "***" });
      const response = await postWithoutAuth(`/auth/login`, { user_login, user_password });

      console.log("Login response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log("Login error response:", errorData);
        throw new Error(errorData.detail || "Invalid username or password");
      }

      const data: User = await response.json();
      console.log("Login successful, received data:", data);
      
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      if (data.user_role) {
        localStorage.setItem("user_role", data.user_role);
      }
      
      // Dispatch custom event to notify AuthNav of authentication change
      window.dispatchEvent(new Event('auth-change'));
      
      // Redirect to idea_tank page
      router.push("/idea_tank");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img src="/idea_tank_logo.png" alt="Idea Tank Logo"></img>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            เข้าสู่ระบบ
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Innovation Conners
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="user_login" className="sr-only">
                ชื่อผู้ใช้งาน
              </label>
              <input
                id="user_login"
                name="user_login"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="ชื่อผู้ใช้งาน"
                value={user_login}
                onChange={(e) => setUserLogin(e.target.value)}
              />
            </div>

            <div className="mt-2">
              <label htmlFor="user_password" className="sr-only">
                รหัสผ่าน
              </label>
              <input
                id="user_password"
                name="user_password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="รหัสผ่าน"
                value={user_password}
                onChange={(e) => setUserPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white btn btn-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}