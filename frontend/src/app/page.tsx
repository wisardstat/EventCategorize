"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page immediately when accessing the website
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-white">
      <main className="w-full max-w-xl text-center space-y-8">
        <h1 className="text-3xl font-bold">กำลังนำทางไปยังหน้าเข้าสู่ระบบ...</h1>
      </main>
    </div>
  );
}
