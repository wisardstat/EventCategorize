"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  canAccessIdeaTank,
  canAccessIdeaScore,
  canAccessUserList,
  canAccessIdeaTankImport,
  canAccessUserCreate,
  canAccessAnswerAnalytic,
  canAccessAnswerList,
  canAccessCreateQuestion,
  canAccessPresentAnswer,
  getCurrentUser
} from "@/utils/permissions";

interface User {
  user_code: string;
  user_fname: string;
  user_lname: string;
  user_login: string;
  user_role?: string;
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
  console.log('--------------------------------------------')
  console.log('canAccessIdeaTank:', canAccessIdeaTank);
  console.log('canAccessIdeaScore:', canAccessIdeaScore);
  console.log('canAccessUserList:', canAccessUserList);
  console.log('canAccessIdeaTankImport:', canAccessIdeaTankImport);
  console.log('--------------------------------------------')

  return (
    <div className="flex items-center gap-2">
      {isLoggedIn ? (
        <>
          {/* Idea Tank Menu - All roles can access */}
          {canAccessIdeaTank() && (
            <a
              href="/idea_tank"
              className="inline-flex items-center rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-semibold text-white transition"
            >
              Idea Tank
            </a>
          )}
          
          {/* สร้าง score Menu - Only admin and superuser can access */}
          {canAccessIdeaScore() && (
            <a
              href="/idea_score"
              className="inline-flex items-center rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-semibold text-white transition"
            >
              สร้าง score
            </a>
          )}
          
          {/* จัดการผู้ใช้งาน Menu - Only admin can access */}
          {canAccessUserList() && (
            <a
              href="/user_list"
              className="inline-flex items-center rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-semibold text-white transition"
            >
              จัดการผู้ใช้งาน
            </a>
          )}
          
          {/* นำเข้าข้อมูล Menu - Only admin and superuser can access */}
          {canAccessIdeaTankImport() && (
            <a
              href="/idea_tank_import"
              className="inline-flex items-center rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-semibold text-white transition"
            >
              นำเข้าข้อมูล
            </a>
          )}
          
          {/* สร้างผู้ใช้งาน Menu - Only admin can access */}
          {canAccessUserCreate() && (
            <a
              href="/user_create"
              className="inline-flex items-center rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-semibold text-white transition"
            >
              สร้างผู้ใช้งาน
            </a>
          )}
          
          {/* วิเคราะห์คำตอบ Menu - Only admin and superuser can access */}
          {canAccessAnswerAnalytic() && (
            <a
              href="/answer_analytic"
              className="inline-flex items-center rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-semibold text-white transition"
            >
              วิเคราะห์คำตอบ
            </a>
          )}
          
          {/* รายการคำตอบ Menu - Only admin and superuser can access */}
          {canAccessAnswerList() && (
            <a
              href="/answer_list"
              className="inline-flex items-center rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-semibold text-white transition"
            >
              รายการคำตอบ
            </a>
          )}
          
          {/* สร้างคำถาม Menu - Only admin and superuser can access */}
          {canAccessCreateQuestion() && (
            <a
              href="/create-question"
              className="inline-flex items-center rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-semibold text-white transition"
            >
              สร้างคำถาม
            </a>
          )}
          
          {/* นำเสนอคำตอบ Menu - Only admin and superuser can access */}
          {canAccessPresentAnswer() && (
            <a
              href="/present-answer"
              className="inline-flex items-center rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-semibold text-white transition"
            >
              นำเสนอคำตอบ
            </a>
          )}
          
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