"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWithAuth } from "@/utils/api";
import { CHALLENGES, INNOVATION_TYPES } from "../project_submission/constants";
import { kanit } from "../project_submission/fonts";
import "../project_submission/project_submission.css";

interface ProjectSubmissionListItem {
  ProjectId: number;
  TeamName: string;
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

export default function ProjectSubmissionListPage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [items, setItems] = useState<ProjectSubmissionListItem[]>([]);
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
        const res = await getWithAuth(`/project-submissions?${params.toString()}`);
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

  const handleSearch = () => setAppliedTeamName(teamNameInput);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = buildParams(1);
      params.delete("page");
      params.delete("page_size");
      const res = await getWithAuth(`/project-submissions/export?${params.toString()}`);
      if (!res.ok) throw new Error("ส่งออกไฟล์ไม่สำเร็จ");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "project_submissions_export.xlsx";
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
          <span className="hero-eyebrow">&#9679; HACKATHON 2026</span>
          <h1>IDEA Tank 2026</h1>
          <p>รายการโครงการทั้งหมดที่ส่งเข้าประกวด</p>
        </div>
      </div>

      <div className="page">
        <div className="list-container">
        <div className="card">
          <div className="card-head"><div className="idx">&#128269;</div><h3>ค้นหา / กรองข้อมูล</h3></div>
          <div className="filter-bar">
            <div>
              <label className="field-label">ชื่อทีม / ชื่อผลงาน</label>
              <input
                type="text"
                value={teamNameInput}
                onChange={(e) => setTeamNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="ค้นหาชื่อทีม..."
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
          <a href="/project_submission" className="btn btn-primary">+ ส่งผลงาน</a>
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
                  <th style={{ width: "22%" }}>ชื่อทีม</th>
                  <th style={{ width: "28%" }}>โจทย์นวัตกรรมที่เลือก</th>
                  <th style={{ width: "18%" }}>ประเภทของนวัตกรรม</th>
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
                      <td>{item.TeamName}</td>
                      <td>{item.ChallengeText || "-"}</td>
                      <td>{item.InnovationTypeText || "-"}</td>
                      <td>{formatDateTime(item.CreatedAt)}</td>
                      <td>
                        <a
                          href={`/project_submission_view?id=${item.ProjectId}`}
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
