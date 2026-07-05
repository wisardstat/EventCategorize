"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getWithAuth } from "@/utils/api";
import { CHALLENGES, INNOVATION_TYPES } from "../project_submission_new/constants";
import { kanit } from "../project_submission_new/fonts";
import "../project_submission_new/project_submission_new.css";

interface ProjectSubmissionNewListItem {
  ProjectId: number;
  TeamName: string | null;
  CreativeIdeaName: string;
  ChallengeText: string | null;
  InnovationTypeText: string | null;
  CreatedAt: string;
}

const PAGE_SIZE = 10;

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return value;
  }
}

export default function ProjectSubmissionNewListPage() {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [authChecked, setAuthChecked] = useState(false);
  const [items, setItems] = useState<ProjectSubmissionNewListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [teamNameInput, setTeamNameInput] = useState("");
  const [innovationTypeNo, setInnovationTypeNo] = useState("");
  const [challengeNo, setChallengeNo] = useState("");
  const [appliedTeamName, setAppliedTeamName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const buildParams = useCallback(
    (targetPage: number) => {
      const params = new URLSearchParams();
      params.set("page", String(targetPage));
      params.set("page_size", String(PAGE_SIZE));
      if (appliedTeamName.trim()) params.set("team_name", appliedTeamName.trim());
      if (innovationTypeNo) params.set("innovation_type_no", innovationTypeNo);
      if (challengeNo) params.set("challenge_no", challengeNo);
      return params;
    },
    [appliedTeamName, innovationTypeNo, challengeNo]
  );

  const loadPage = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = buildParams(targetPage);
        const res = await getWithAuth(`/project-submissions-new?${params.toString()}`);
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const data = await res.json();
        setItems(data.items);
        setTotal(data.total);
        setPage(data.page);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [buildParams]
  );

  useEffect(() => {
    if (!authChecked) return;
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, appliedTeamName, innovationTypeNo, challengeNo]);

  // ---- Twinkling stars around the title, every 5 seconds ----
  useEffect(() => {
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
    const interval = setInterval(spawnTwinkleStars, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => setAppliedTeamName(teamNameInput);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = buildParams(1);
      params.delete("page");
      params.delete("page_size");
      const res = await getWithAuth(`/project-submissions-new/export?${params.toString()}`);
      if (!res.ok) throw new Error("ส่งออกไฟล์ไม่สำเร็จ");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "project_submissions_new_export.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!authChecked) return null;

  return (
    <div className={`ps-wizard ${kanit.variable}`}>
      <div className="hero">
        <img src="/images/space_dark.png" alt="" />
        <div className="hero-content">
          <span className="hero-eyebrow">&#9679; Idea to Innovation</span>
          <h1 ref={titleRef}>กิจกรรมเสนอความคิดสร้างสรรค์</h1>
          <p>ร่วมส่งไอเดียดีๆ เพื่อพัฒนาธนาคาร สู่ผลงานนวัตกรรมที่ยั่งยืน</p>
        </div>
      </div>

      <div className="page">
        <div className="list-container">
        <div className="card">
          <div className="card-head"><div className="idx">&#128269;</div><h3>ค้นหา / กรองข้อมูล</h3></div>
          <div className="filter-bar">
            <div>
              <label className="field-label">ชื่อทีม / ชื่อความคิดสร้างสรรค์</label>
              <input
                type="text"
                value={teamNameInput}
                onChange={(e) => setTeamNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="ค้นหาชื่อทีมหรือชื่อผลงาน..."
              />
            </div>
            <div>
              <label className="field-label">ประเภทของนวัตกรรม</label>
              <select value={innovationTypeNo} onChange={(e) => setInnovationTypeNo(e.target.value)}>
                <option value="">ทั้งหมด</option>
                {INNOVATION_TYPES.map((t) => (
                  <option key={t.no} value={t.no}>{t.text}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">โจทย์นวัตกรรมที่เลือก</label>
              <select value={challengeNo} onChange={(e) => setChallengeNo(e.target.value)}>
                <option value="">ทั้งหมด</option>
                {CHALLENGES.map((c) => (
                  <option key={c.no} value={c.no}>โจทย์ {c.no}</option>
                ))}
              </select>
            </div>
            <div>
              <button type="button" className="btn btn-primary" onClick={handleSearch}>ค้นหา</button>
            </div>
          </div>
        </div>

        <div className="table-toolbar">
          <a href="/project_submission_new" className="btn btn-primary">+ ส่งผลงาน</a>
          <button type="button" className="btn btn-submit" onClick={handleExport} disabled={exporting}>
            {exporting ? "กำลังส่งออก..." : "⬇ Export Excel"}
          </button>
        </div>

        <div className="card">
          <div className="card-head"><div className="idx">&#128203;</div><h3>โครงการที่ส่งเข้าประกวด ({total})</h3></div>

          {error && <p className="field-error">{error}</p>}

          <div style={{ overflowX: "auto" }}>
            <table className="list-table">
              <thead>
                <tr>
                  <th style={{ width: "8%" }}>รหัสโครงการ</th>
                  <th style={{ width: "22%" }}>ชื่อความคิดสร้างสรรค์</th>
                  <th style={{ width: "22%" }}>โจทย์นวัตกรรมที่เลือก</th>
                  <th style={{ width: "16%" }}>ประเภทของนวัตกรรม</th>
                  <th style={{ width: "14%" }}>วันที่สร้าง</th>
                  <th style={{ width: "10%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 24 }}>กำลังโหลดข้อมูล...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 24 }} className="empty-note">ไม่พบข้อมูล</td></tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.ProjectId}>
                      <td>#{item.ProjectId}</td>
                      <td>{item.CreativeIdeaName}</td>
                      <td>{item.ChallengeText || "-"}</td>
                      <td>{item.InnovationTypeText || "-"}</td>
                      <td>{formatDateTime(item.CreatedAt)}</td>
                      <td>
                        <a
                          href={`/project_submission_new_view?id=${item.ProjectId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost"
                          style={{ padding: "7px 14px", fontSize: 13 }}
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button type="button" onClick={() => loadPage(1)} disabled={page <= 1}>&laquo;</button>
            <button type="button" onClick={() => loadPage(page - 1)} disabled={page <= 1}>&lsaquo; ก่อนหน้า</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p} style={{ display: "flex", gap: 8 }}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: "var(--text-faint)", alignSelf: "center" }}>...</span>}
                  <button type="button" className={p === page ? "active" : ""} onClick={() => loadPage(p)}>{p}</button>
                </span>
              ))}
            <button type="button" onClick={() => loadPage(page + 1)} disabled={page >= totalPages}>ถัดไป &rsaquo;</button>
            <button type="button" onClick={() => loadPage(totalPages)} disabled={page >= totalPages}>&raquo;</button>
          </div>
          <div className="pagination-info">หน้า {page} จาก {totalPages} (ทั้งหมด {total} รายการ)</div>
        </div>
        </div>
      </div>
    </div>
  );
}
