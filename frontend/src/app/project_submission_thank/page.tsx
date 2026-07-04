"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPublic } from "@/utils/api";
import { kanit } from "../project_submission/fonts";
import { SubmissionOut, SubmissionDetailCards } from "../project_submission/detail-shared";
import "../project_submission/project_submission.css";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<SubmissionOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("ไม่พบรหัสผลงานที่ต้องการแสดง");
      setLoading(false);
      return;
    }
    getPublic(`/project-submissions/${id}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.detail || "ไม่พบข้อมูลผลงานนี้");
        setData(json);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  // Shooting star every 5 seconds
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const glowColors = ["rgba(124,107,255,.45)", "rgba(52,208,255,.45)", "rgba(34,197,94,.45)"];

    const spawnOneShootingStar = () => {
      const glowColor = glowColors[Math.floor(Math.random() * glowColors.length)];
      const startX = -60 + Math.random() * (window.innerWidth * 0.3);
      const startY = -30 + Math.random() * (window.innerHeight * 0.2);
      const travel = Math.max(window.innerWidth, window.innerHeight) * 1.05;
      const angle = 28 + Math.random() * 18;
      const rad = (angle * Math.PI) / 180;
      const dx = Math.cos(rad) * travel;
      const dy = Math.sin(rad) * travel;
      const length = 100 + Math.random() * 80;

      const star = document.createElement("div");
      star.className = "ps-shooting-star";
      star.style.setProperty("--glow", glowColor);
      star.style.width = length + "px";
      star.style.left = startX + "px";
      star.style.top = startY + "px";
      document.body.appendChild(star);

      const duration = 1000 + Math.random() * 400;
      const anim = star.animate(
        [
          { transform: `translate(0,0) rotate(${angle}deg)`, opacity: 0 },
          { transform: `translate(${dx * 0.1}px, ${dy * 0.1}px) rotate(${angle}deg)`, opacity: 1, offset: 0.12 },
          { transform: `translate(${dx * 0.8}px, ${dy * 0.8}px) rotate(${angle}deg)`, opacity: 1, offset: 0.78 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${angle}deg)`, opacity: 0 },
        ],
        { duration, easing: "cubic-bezier(.3,.6,.4,1)" }
      );
      anim.onfinish = () => star.remove();
    };

    const spawnStarBurst = () => {
      for (let i = 0; i < 3; i++) {
        setTimeout(spawnOneShootingStar, i * 180 + Math.random() * 150);
      }
    };

    spawnStarBurst();
    const interval = setInterval(spawnStarBurst, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`ps-wizard ${kanit.variable}`}>
        <div className="page" style={{ textAlign: "center", paddingTop: 100 }}>กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`ps-wizard ${kanit.variable}`}>
        <div className="page" style={{ textAlign: "center", paddingTop: 100 }}>
          <p className="empty-note">{error || "ไม่พบข้อมูลผลงาน"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ps-wizard ${kanit.variable}`}>
      <div className="thank-hero">
        <img src="/images/space_dark.png" alt="" />
        <div className="thank-hero-content">
          <span className="eyebrow">&#10024; IDEA TANK 2026</span>
          <h1>Thank You!</h1>
          <p>ขอบคุณที่ร่วมส่งผลงาน &ldquo;{data.TeamName}&rdquo; เข้าประกวด ทีมงานจะพิจารณาและติดต่อกลับโดยเร็วที่สุด</p>
        </div>
      </div>

      <div className="thank-cards">
        <SubmissionDetailCards data={data} />
      </div>
    </div>
  );
}

export default function ProjectSubmissionThankPage() {
  return (
    <Suspense fallback={<div className={`ps-wizard ${kanit.variable}`}><div className="page">กำลังโหลด...</div></div>}>
      <ThankYouContent />
    </Suspense>
  );
}
