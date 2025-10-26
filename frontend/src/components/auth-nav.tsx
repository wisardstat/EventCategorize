"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  user_code: string;
  user_fname: string;
  user_lname: string;
  user_login: string;
}

export default function AuthNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for storage events (when localStorage changes in other tabs/windows)
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    // Listen for custom auth-change events
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    
    // Set up an interval to check auth status more frequently
    const intervalId = setInterval(checkAuthStatus, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
      clearInterval(intervalId);
    };
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (error) {
        // Invalid user data, clear storage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setCurrentUser(null);
    
    // Dispatch custom event to notify other components of authentication change
    window.dispatchEvent(new Event('auth-change'));
    
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-8 bg-gray-600 rounded animate-pulse"></div>
        <div className="w-24 h-8 bg-gray-600 rounded animate-pulse"></div>
        <div className="w-20 h-8 bg-gray-600 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isLoggedIn ? (
        <>
          <a 
            href="/idea_tank" 
            className="inline-flex items-center rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-semibold text-white transition"
          >
            Idea Tank
          </a>
          <a 
            href="/user_list" 
            className="inline-flex items-center rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-semibold text-white transition"
          >
            จัดการผู้ใช้งาน
          </a>
          <div className="flex items-center gap-2 ml-2">
            {currentUser && (
              <span className="text-sm text-white/80">
                {currentUser.user_fname} {currentUser.user_lname}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center rounded-full bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-semibold text-white transition"
            >
              ออกจากระบบ
            </button>
          </div>
        </>
      ) : (
        <a 
          href="/login" 
          className="ml-2 inline-flex items-center rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          เข้าสู่ระบบ
        </a>
      )}
    </div>
  );
}