"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPublic } from "@/utils/api";
import { kanit } from "../project_submission_new/fonts";
import { SubmissionNewOut, SubmissionDetailCardsNew } from "../project_submission_new/detail-shared";
import "../project_submission_new/project_submission_new.css";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const titleRef = useRef<HTMLHeadingElement>(null);

  const [data, setData] = useState<SubmissionNewOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("ไม่พบรหัสผลงานที่ต้องการแสดง");
      setLoading(false);
      return;
    }
    getPublic(`/project-submissions-new/${id}`)
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

  // Twinkling stars around the title, every 5 seconds
  useEffect(() => {
    if (!data) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const starChars = ["✦", "✧", "⋆", "✩", "★"];
    const starColors = ["#ffffff", "#34d0ff", "#7c6bff", "#22c55e", "#ff8a5c"];

    const spawnTwinkleStars = () => {
      const titleEl = titleRef.current;
      if (!titleEl) return;
      const rect = titleEl.getBoundingClientRect();
      const count = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const el = document.createElement("span");
        el.className = "ps-sparkle-particle";
        el.textContent = starChars[Math.floor(Math.random() * starChars.length)];
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + (Math.random() * rect.height - rect.height * 0.4);
        const size = 10 + Math.random() * 14;
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.fontSize = size + "px";
        el.style.color = color;
        el.style.textShadow = `0 0 8px ${color}`;
        document.body.appendChild(el);
        const anim = el.animate(
          [
            { transform: "translate(-50%,-50%) scale(0)", opacity: 0 },
            { transform: "translate(-50%,-50%) scale(1.15)", opacity: 1, offset: 0.4 },
            { transform: "translate(-50%,-50%) scale(0.9)", opacity: 1, offset: 0.7 },
            { transform: "translate(-50%,-50%) scale(0)", opacity: 0 },
          ],
          { duration: 1300 + Math.random() * 500, easing: "ease-in-out" }
        );
        anim.onfinish = () => el.remove();
      }
    };

    spawnTwinkleStars();
    const twinkleInterval = setInterval(spawnTwinkleStars, 5000);
    return () => clearInterval(twinkleInterval);
  }, [data]);

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
    <div className={`ps-wizard detail-white-values ${kanit.variable}`}>
      <div className="thank-hero thank-hero-anchor-bottom">
        <img src="/images/space_dark.png" alt="" />
        <div className="thank-hero-content">
          <span className="eyebrow">&#9679; Idea to Innovation</span>
          <h1 ref={titleRef}>กิจกรรมเสนอความคิดสร้างสรรค์</h1>
          <p>ร่วมส่งไอเดียดีๆ เพื่อพัฒนาธนาคาร สู่ผลงานนวัตกรรมที่ยั่งยืน</p>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: 0.5,
              backgroundImage: "linear-gradient(90deg, #86efac, #22c55e 50%, #15803d)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Thank you
          </p>
        </div>
      </div>

      <div className="thank-cards" style={{ paddingTop: 14 }}>
        <SubmissionDetailCardsNew data={data} />
      </div>
    </div>
  );
}

export default function ProjectSubmissionNewThankPage() {
  return (
    <Suspense fallback={<div className={`ps-wizard ${kanit.variable}`}><div className="page">กำลังโหลด...</div></div>}>
      <ThankYouContent />
    </Suspense>
  );
}
