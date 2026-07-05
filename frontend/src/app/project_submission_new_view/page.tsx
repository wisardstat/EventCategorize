"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getWithAuth } from "@/utils/api";
import { kanit } from "../project_submission_new/fonts";
import { SubmissionNewOut, SubmissionDetailCardsNew } from "../project_submission_new/detail-shared";
import "../project_submission_new/project_submission_new.css";

function ViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const pageRef = useRef<HTMLDivElement>(null);
  const sideNavRef = useRef<HTMLDivElement>(null);

  const [authChecked, setAuthChecked] = useState(false);
  const [data, setData] = useState<SubmissionNewOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    if (!id) {
      setError("ไม่พบรหัสผลงานที่ต้องการแสดง");
      setLoading(false);
      return;
    }
    getWithAuth(`/project-submissions-new/${id}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.detail || "ไม่พบข้อมูลผลงานนี้");
        setData(json);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [authChecked, id]);

  // ---- Floating side-nav for detail cards ----
  useEffect(() => {
    if (!data || !pageRef.current || !sideNavRef.current) return;
    const cards = Array.from(pageRef.current.querySelectorAll<HTMLDivElement>(".thank-cards .card"));
    const nav = sideNavRef.current;
    nav.innerHTML = cards
      .map((card, i) => {
        const id = "psnv-sec-" + (i + 1);
        card.id = id;
        const title = card.querySelector(".card-head h3")?.textContent?.trim() || `ส่วนที่ ${i + 1}`;
        return `<div class="side-nav-item">
          <div class="side-nav-dot" data-target="${id}">${i + 1}</div>
          <div class="side-nav-tooltip">${title}</div>
        </div>`;
      })
      .join("");

    nav.querySelectorAll<HTMLDivElement>(".side-nav-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        const target = document.getElementById(dot.dataset.target || "");
        if (!target) return;
        const y = target.getBoundingClientRect().top + window.scrollY - 20;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          nav.querySelectorAll(".side-nav-dot").forEach((d) => d.classList.remove("active"));
          const dot = nav.querySelector(`.side-nav-dot[data-target="${entry.target.id}"]`);
          dot?.classList.add("active");
        });
      },
      { root: null, rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    cards.forEach((c) => observer.observe(c));
    nav.classList.add("visible");

    return () => {
      observer.disconnect();
      nav.classList.remove("visible");
    };
  }, [data]);

  if (!authChecked) return null;

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
    <div className={`ps-wizard detail-white-values ${kanit.variable}`} ref={pageRef}>
      <div className="side-nav" ref={sideNavRef}></div>
      <div className="thank-hero thank-hero-compact">
        <img src="/images/space_dark.png" alt="" />
        <div className="thank-hero-content">
          <span className="eyebrow">&#9679; Idea to Innovation</span>
          <h1>กิจกรรมเสนอความคิดสร้างสรรค์</h1>
          <p>ร่วมส่งไอเดียดีๆ เพื่อพัฒนาธนาคาร สู่ผลงานนวัตกรรมที่ยั่งยืน</p>
        </div>
      </div>

      <div className="thank-cards" style={{ paddingTop: 16 }}>
        <div className="wizard-nav" style={{ marginTop: 0 }}>
          <a href="/project_submission_new_list" className="btn btn-ghost">&larr; กลับไปหน้ารายการ</a>
        </div>
        <SubmissionDetailCardsNew data={data} />
      </div>
    </div>
  );
}

export default function ProjectSubmissionNewViewPage() {
  return (
    <Suspense fallback={<div className={`ps-wizard ${kanit.variable}`}><div className="page">กำลังโหลด...</div></div>}>
      <ViewContent />
    </Suspense>
  );
}
