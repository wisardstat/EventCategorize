"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getWithAuth } from "@/utils/api";
import { kanit } from "../project_submission/fonts";
import { SubmissionOut, SubmissionDetailCards } from "../project_submission/detail-shared";
import "../project_submission/project_submission.css";

function ViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [authChecked, setAuthChecked] = useState(false);
  const [data, setData] = useState<SubmissionOut | null>(null);
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
    getWithAuth(`/project-submissions/${id}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.detail || "ไม่พบข้อมูลผลงานนี้");
        setData(json);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [authChecked, id]);

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
    <div className={`ps-wizard psv-page ${kanit.variable}`}>
      <div className="thank-hero thank-hero-compact">
        <img src="/images/space_dark.png" alt="" />
        <div className="thank-hero-content">
          <span className="eyebrow">&#128203; IDEA TANK 2026</span>
          <h1>รายละเอียดโครงการ</h1>
          <p>โครงการ &ldquo;{data.TeamName}&rdquo; &mdash; รหัสโครงการ #{data.ProjectId}</p>
        </div>
      </div>

      <div className="thank-cards" style={{ paddingTop: 16 }}>
        <div className="wizard-nav" style={{ marginTop: 0 }}>
          <a href="/project_submission_list" className="btn btn-ghost">&larr; กลับไปหน้ารายการ</a>
        </div>
        <SubmissionDetailCards data={data} />
      </div>
    </div>
  );
}

export default function ProjectSubmissionViewPage() {
  return (
    <Suspense fallback={<div className={`ps-wizard ${kanit.variable}`}><div className="page">กำลังโหลด...</div></div>}>
      <ViewContent />
    </Suspense>
  );
}
