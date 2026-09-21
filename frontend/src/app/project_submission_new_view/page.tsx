"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { deleteWithAuth, getWithAuth, postWithAuth, putWithAuth } from "@/utils/api";
import {
  canEvaluateProjectSubmissionCommittee,
  canEvaluateProjectSubmissionVp,
  canScoreProjectSubmissions,
} from "@/utils/permissions";
import { kanit } from "../project_submission_new/fonts";
import { SubmissionNewOut, SubmissionDetailCardsNew } from "../project_submission_new/detail-shared";
import "../project_submission_new/project_submission_new.css";

type SubmissionEvaluationModalProps = {
  id: string;
  title: string;
  status: string;
  comment: string;
  statusOptions: string[];
  saving: boolean;
  error: string | null;
  onStatusChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

function SubmissionEvaluationModal({
  id,
  title,
  status,
  comment,
  statusOptions,
  saving,
  error,
  onStatusChange,
  onCommentChange,
  onClose,
  onSave,
}: SubmissionEvaluationModalProps) {
  return (
    <div
      className="evaluation-modal-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !saving) onClose();
      }}
    >
      <section
        className="evaluation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !saving) onClose();
          if (event.key === "Tab") {
            const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
              "button:not([disabled]), select:not([disabled]), textarea:not([disabled])"
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <div className="evaluation-modal-header">
            <h2 id={`${id}-title`}>{title}</h2>
            <button type="button" className="evaluation-modal-close" onClick={onClose} disabled={saving} aria-label="ปิดหน้าต่าง">
              ×
            </button>
          </div>
          <div className="evaluation-modal-body">
            <label className="field-label" htmlFor={`${id}-status`}>ผลการประเมิน</label>
            <select
              id={`${id}-status`}
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              autoFocus
              required
            >
              <option value="">เลือกผลการประเมิน</option>
              {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <label className="field-label" htmlFor={`${id}-comment`}>ความคิดเห็นเพิ่มเติม / เหตุผลในการประเมิน</label>
            <textarea
              id={`${id}-comment`}
              rows={5}
              maxLength={5000}
              value={comment}
              onChange={(event) => onCommentChange(event.target.value)}
              placeholder="ระบุความคิดเห็นเพิ่มเติม (ถ้ามี)"
            />
            {error ? <p className="evaluation-modal-error" role="alert">{error}</p> : null}
          </div>
          <div className="evaluation-modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !status} aria-busy={saving}>
              {saving ? <><FaSpinner className="animate-spin" aria-hidden="true" /> กำลังบันทึก...</> : "บันทึกผล"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

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
  const [deleting, setDeleting] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [showVpEvaluation, setShowVpEvaluation] = useState(false);
  const [showCommitteeEvaluation, setShowCommitteeEvaluation] = useState(false);
  const [vpStatus, setVpStatus] = useState("");
  const [vpComment, setVpComment] = useState("");
  const [committeeStatus, setCommitteeStatus] = useState("");
  const [committeeComment, setCommitteeComment] = useState("");
  const [savingVpEvaluation, setSavingVpEvaluation] = useState(false);
  const [savingCommitteeEvaluation, setSavingCommitteeEvaluation] = useState(false);
  const [vpEvaluationError, setVpEvaluationError] = useState<string | null>(null);
  const [committeeEvaluationError, setCommitteeEvaluationError] = useState<string | null>(null);

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

  const deleteSubmission = async () => {
    if (!id || deleting) return;

    const confirmResult = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบผลงาน?",
      text: "ข้อมูลผลงานและรายชื่อสมาชิกจะถูกลบอย่างถาวร",
      showCancelButton: true,
      confirmButtonText: "ลบผลงาน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#3a3f75",
    });
    if (!confirmResult.isConfirmed) return;

    setDeleting(true);
    try {
      const res = await deleteWithAuth(`/project-submissions-new/${id}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.detail || "ลบผลงานไม่สำเร็จ");
      await Swal.fire({ icon: "success", title: "ลบเสร็จแล้ว" });
      router.push("/project_submission_new_list");
    } catch (e) {
      await Swal.fire({ icon: "error", title: "ลบผลงานไม่สำเร็จ", text: (e as Error).message });
    } finally {
      setDeleting(false);
    }
  };

  const scoreSubmission = async () => {
    if (!id || scoring) return;
    const replacing = data?.AiScore !== null && data?.AiScore !== undefined;
    const confirmed = await Swal.fire({ icon: "warning", title: replacing ? "ประมวลผลใหม่และแทนที่ผลเดิม?" : "ให้ AI ประมวลผล?", text: "AI จะสร้างคะแนน 5 เกณฑ์ และสรุป Pain point → Solution → Benefit", showCancelButton: true, confirmButtonText: "ให้ AI ประมวลผล", cancelButtonText: "ยกเลิก" });
    if (!confirmed.isConfirmed) return;
    setScoring(true);
    try {
      const res = await postWithAuth(`/project-submissions-new/${id}/score`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.detail || "ประเมินไม่สำเร็จ");
      setData(json);
      await Swal.fire({ icon: "success", title: "ประมวลผลเสร็จแล้ว" });
    } catch (e) {
      await Swal.fire({ icon: "error", title: "ประเมินไม่สำเร็จ", text: (e as Error).message });
    } finally { setScoring(false); }
  };

  const openVpEvaluation = () => {
    setVpStatus(data?.VpEvaluationStatus || "");
    setVpComment(data?.VpEvaluationComment || "");
    setVpEvaluationError(null);
    setShowVpEvaluation(true);
  };

  const saveVpEvaluation = async () => {
    if (!id || savingVpEvaluation || !vpStatus) return;
    setSavingVpEvaluation(true);
    setVpEvaluationError(null);
    try {
      const res = await putWithAuth(`/project-submissions-new/${id}/vp-evaluation`, {
        status: vpStatus,
        comment: vpComment || null,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.detail || "บันทึกผลการประเมินโดย วพ. ไม่สำเร็จ");
      setData(json);
      setShowVpEvaluation(false);
      await Swal.fire({ icon: "success", title: "บันทึกผลการประเมินโดย วพ. แล้ว" });
    } catch (e) {
      setVpEvaluationError((e as Error).message);
    } finally {
      setSavingVpEvaluation(false);
    }
  };

  const openCommitteeEvaluation = () => {
    setCommitteeStatus(data?.CommitteeEvaluationStatus || "");
    setCommitteeComment(data?.CommitteeEvaluationComment || "");
    setCommitteeEvaluationError(null);
    setShowCommitteeEvaluation(true);
  };

  const saveCommitteeEvaluation = async () => {
    if (!id || savingCommitteeEvaluation || !committeeStatus) return;
    setSavingCommitteeEvaluation(true);
    setCommitteeEvaluationError(null);
    try {
      const res = await putWithAuth(`/project-submissions-new/${id}/committee-evaluation`, {
        status: committeeStatus,
        comment: committeeComment || null,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.detail || "บันทึกผลการประเมินโดยกรรมการไม่สำเร็จ");
      setData(json);
      setShowCommitteeEvaluation(false);
      await Swal.fire({ icon: "success", title: "บันทึกผลการประเมินโดยกรรมการแล้ว" });
    } catch (e) {
      setCommitteeEvaluationError((e as Error).message);
    } finally {
      setSavingCommitteeEvaluation(false);
    }
  };

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
              <div className="view-action-group">
                {canEvaluateProjectSubmissionVp() && <button type="button" className="btn btn-ghost" onClick={openVpEvaluation}>บันทึกผลการประเมินโดย วพ.</button>}
                {canEvaluateProjectSubmissionCommittee() && <button type="button" className="btn btn-ghost" onClick={openCommitteeEvaluation}>บันทึกผลการประเมินโดยกรรมการ</button>}
                {canScoreProjectSubmissions() && <button type="button" className="btn btn-primary" onClick={scoreSubmission} disabled={scoring}>{scoring ? "กำลังประเมิน..." : "ให้ AI ประมวลผล"}</button>}
            <button
              type="button"
              className="btn btn-danger btn-icon-only"
              onClick={deleteSubmission}
              disabled={deleting}
              aria-label={deleting ? "กำลังลบผลงาน..." : "ลบผลงาน"}
              aria-busy={deleting}
              title={deleting ? "กำลังลบผลงาน..." : "ลบผลงาน"}
            >
              {deleting ? <FaSpinner className="animate-spin" aria-hidden="true" /> : <FaTrash aria-hidden="true" />}
            </button>
          </div>
          </div>
          <SubmissionDetailCardsNew data={data} />
        </div>
        {showVpEvaluation ? (
          <SubmissionEvaluationModal
            id="vp-evaluation"
            title="บันทึกผลการประเมินโดย วพ."
            status={vpStatus}
            comment={vpComment}
            statusOptions={["ส่งแนวคิด", "ผ่านคัดเลือก", "ไม่ผ่านคัดเลือก"]}
            saving={savingVpEvaluation}
            error={vpEvaluationError}
            onStatusChange={setVpStatus}
            onCommentChange={setVpComment}
            onClose={() => setShowVpEvaluation(false)}
            onSave={saveVpEvaluation}
          />
        ) : null}
        {showCommitteeEvaluation ? (
          <SubmissionEvaluationModal
            id="committee-evaluation"
            title="บันทึกผลการประเมินโดยกรรมการ"
            status={committeeStatus}
            comment={committeeComment}
            statusOptions={["ผ่านคัดเลือก", "ไม่ผ่านคัดเลือก"]}
            saving={savingCommitteeEvaluation}
            error={committeeEvaluationError}
            onStatusChange={setCommitteeStatus}
            onCommentChange={setCommitteeComment}
            onClose={() => setShowCommitteeEvaluation(false)}
            onSave={saveCommitteeEvaluation}
          />
        ) : null}
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
