"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { postPublic, putPublic } from "@/utils/api";
import RichTextEditor from "./RichTextEditor";
import { kanit } from "./fonts";
import {
  CHALLENGES,
  CHALLENGE_CATEGORIES,
  STRATEGIC_OBJECTIVES,
  IDEA_SOURCES,
  TARGET_CUSTOMER_TYPES,
  INNOVATION_TYPES,
  DIGITAL_INNOVATION_TYPES,
  NOVELTY_LEVELS,
  FINANCIAL_VALUE_ITEMS,
  NONFINANCIAL_VALUE_ITEMS,
} from "./constants";
import "./project_submission_new.css";

interface MemberRow {
  EmpCode: string;
  FullNameTh: string;
  PositionName: string;
  OrgName: string;
  MobileNo: string;
  IsTeamLeader: boolean;
  IsMainContact: boolean;
}

type Step2Data = Record<string, boolean | string | number | null>;

function emptyMember(isLeader = false, isMain = false): MemberRow {
  return { EmpCode: "", FullNameTh: "", PositionName: "", OrgName: "", MobileNo: "", IsTeamLeader: isLeader, IsMainContact: isMain };
}

function defaultStep2(): Step2Data {
  const data: Step2Data = {
    ChallengeNo: null,
    ChallengeText: "",
    ChallengeCategoryNo: null,
    ChallengeCategoryText: "",
    TargetCustomerTypeNo: null,
    TargetCustomerTypeText: "",
    TargetCustomerProblemHtml: "",
    InnovationTypeNo: null,
    InnovationTypeText: "",
    IdeaConceptHtml: "",
    DigitalInnovationNo: null,
    DigitalInnovationText: "",
    NoveltyLevelNo: null,
    NoveltyLevelText: "",
    InnovationValueFinancial: false,
    FinancialValueRevenue: false,
    FinancialValueCostSaving: false,
    FinancialValueDetailHtml: "",
    InnovationValueNonFinancial: false,
    NonFinancialValueCustomerSatisfaction: false,
    NonFinancialValueWorkEfficiency: false,
    NonFinancialValueCustomerQuality: false,
    NonFinancialValueEnvironment: false,
    NonFinancialValueDetailHtml: "",
  };
  STRATEGIC_OBJECTIVES.forEach(({ key }) => { data[`StrategicObjective${key}`] = false; });
  IDEA_SOURCES.forEach(({ key }) => {
    data[`IdeaSource${key}`] = false;
    data[`IdeaSource${key}Detail`] = "";
  });
  return data;
}

async function parseJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
  }
  return data;
}

export default function ProjectSubmissionNewPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const sideNavRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [projectId, setProjectId] = useState<number | null>(null);

  const [creativeIdeaName, setCreativeIdeaName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [submissionType, setSubmissionType] = useState<"INDIVIDUAL" | "TEAM">("INDIVIDUAL");
  const [members, setMembers] = useState<MemberRow[]>([emptyMember(true, true)]);

  const [step2, setStep2] = useState<Step2Data>(defaultStep2());

  const [savingStep1, setSavingStep1] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---- Step 1 handlers ----
  const selectType = (type: "INDIVIDUAL" | "TEAM") => {
    setSubmissionType(type);
    setMembers((prev) => {
      const leader = { ...prev[0], IsTeamLeader: true, IsMainContact: true };
      if (type === "INDIVIDUAL") return [leader];
      const rest = [leader, ...prev.slice(1)];
      while (rest.length < 3) rest.push(emptyMember());
      return rest;
    });
  };

  const addMember = () => {
    if (members.length >= 5) return;
    setMembers((prev) => [...prev, emptyMember()]);
  };

  const removeMember = (idx: number) => {
    if (idx === 0) return;
    if (members.length <= 3) {
      Swal.fire({ icon: "warning", text: "ประเภททีมต้องมีสมาชิกอย่างน้อย 3 ท่าน" });
      return;
    }
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateMember = (idx: number, field: keyof MemberRow, value: string) => {
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  };

  const validateStep1 = (): string | null => {
    if (!creativeIdeaName.trim()) return "กรุณากรอกชื่อความคิดสร้างสรรค์";
    if (submissionType === "TEAM" && !teamName.trim()) return "กรุณากรอกชื่อทีม";
    if (submissionType === "TEAM" && (members.length < 3 || members.length > 5)) {
      return "ประเภททีมต้องมีสมาชิก 3-5 คน";
    }
    if (submissionType === "INDIVIDUAL" && members.length !== 1) return "ประเภทบุคคลต้องมีสมาชิก 1 คน";
    for (const m of members) {
      if (!m.EmpCode.trim() || !m.FullNameTh.trim()) {
        return "กรุณากรอกรหัสพนักงานและชื่อ-นามสกุลของสมาชิกทุกคนให้ครบถ้วน";
      }
    }
    return null;
  };

  const goNext = async () => {
    const err = validateStep1();
    if (err) {
      Swal.fire({ icon: "warning", title: "กรอกข้อมูลไม่ครบถ้วน", text: err });
      return;
    }
    setSavingStep1(true);
    try {
      const payload = {
        CreativeIdeaName: creativeIdeaName.trim(),
        TeamName: submissionType === "TEAM" ? teamName.trim() : null,
        SubmissionTypeCode: submissionType,
        Members: members,
      };
      const res = projectId
        ? await putPublic(`/project-submissions-new/${projectId}/step1`, payload)
        : await postPublic("/project-submissions-new", payload);
      const data = await parseJson(res);
      setProjectId(data.ProjectId);
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: (e as Error).message });
    } finally {
      setSavingStep1(false);
    }
  };

  const backToStep1 = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- Step 2 handlers ----
  const setChallenge = (no: number, text: string) => setStep2((prev) => ({ ...prev, ChallengeNo: no, ChallengeText: text }));
  const setChallengeCategory = (no: number, text: string) => setStep2((prev) => ({ ...prev, ChallengeCategoryNo: no, ChallengeCategoryText: text }));
  const toggleStrategicObjective = (key: string) => setStep2((prev) => ({ ...prev, [`StrategicObjective${key}`]: !prev[`StrategicObjective${key}`] }));
  const toggleIdeaSource = (key: string) => setStep2((prev) => ({ ...prev, [`IdeaSource${key}`]: !prev[`IdeaSource${key}`] }));
  const setIdeaSourceDetail = (key: string, value: string) => setStep2((prev) => ({ ...prev, [`IdeaSource${key}Detail`]: value }));
  const setTargetCustomerType = (no: number, text: string) => setStep2((prev) => ({ ...prev, TargetCustomerTypeNo: no, TargetCustomerTypeText: text }));
  const setInnovationType = (no: number, text: string) => setStep2((prev) => ({ ...prev, InnovationTypeNo: no, InnovationTypeText: text }));
  const setDigitalInnovation = (no: number, text: string) => setStep2((prev) => ({ ...prev, DigitalInnovationNo: no, DigitalInnovationText: text }));
  const setNoveltyLevel = (no: number, text: string) => setStep2((prev) => ({ ...prev, NoveltyLevelNo: no, NoveltyLevelText: text }));
  const toggleFinancialValue = (key: string) => setStep2((prev) => ({ ...prev, [`FinancialValue${key}`]: !prev[`FinancialValue${key}`] }));
  const toggleNonFinancialValue = (key: string) => setStep2((prev) => ({ ...prev, [`NonFinancialValue${key}`]: !prev[`NonFinancialValue${key}`] }));
  const setField = (field: string, value: string) => setStep2((prev) => ({ ...prev, [field]: value }));
  const toggleBoolField = (field: string) => setStep2((prev) => ({ ...prev, [field]: !prev[field] }));

  const saveDraft = async () => {
    if (!projectId) return;
    setSavingDraft(true);
    try {
      await parseJson(await putPublic(`/project-submissions-new/${projectId}/step2`, step2));
      Swal.fire({ icon: "success", title: "บันทึกร่างเรียบร้อย", timer: 1600, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ icon: "error", title: "บันทึกร่างไม่สำเร็จ", text: (e as Error).message });
    } finally {
      setSavingDraft(false);
    }
  };

  const submitFinal = async () => {
    if (!projectId) return;
    const confirmResult = await Swal.fire({
      icon: "question",
      title: "ยืนยันการส่งผลงาน?",
      text: "เมื่อส่งผลงานแล้วจะไม่สามารถแก้ไขข้อมูลได้อีก",
      showCancelButton: true,
      confirmButtonText: "ส่งผลงาน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#3a3f75",
    });
    if (!confirmResult.isConfirmed) return;

    setSubmitting(true);
    try {
      await parseJson(await postPublic(`/project-submissions-new/${projectId}/submit`, step2));
      router.push(`/project_submission_new_thank?id=${projectId}`);
    } catch (e) {
      Swal.fire({ icon: "error", title: "ส่งผลงานไม่สำเร็จ", text: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Floating side-nav for step 2 cards ----
  useEffect(() => {
    if (step !== 2 || !pageRef.current || !sideNavRef.current) return;
    const cards = Array.from(pageRef.current.querySelectorAll<HTMLDivElement>("#ps-step2 .card"));
    const nav = sideNavRef.current;
    nav.innerHTML = cards
      .map((card, i) => {
        const id = "psn-sec-" + (i + 1);
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
  }, [step]);

  // ---- Twinkling stars around the title, every 3 seconds ----
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
    const interval = setInterval(spawnTwinkleStars, 3000);
    return () => clearInterval(interval);
  }, []);

  // ---- Shooting star intro + click sparkles ----
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const spawnOneShootingStar = (glowColor: string) => {
      const startX = -60 + Math.random() * (window.innerWidth * 0.22);
      const startY = -30 + Math.random() * (window.innerHeight * 0.16);
      const travel = Math.max(window.innerWidth, window.innerHeight) * 1.05;
      const angle = 32 + Math.random() * 14;
      const rad = (angle * Math.PI) / 180;
      const dx = Math.cos(rad) * travel;
      const dy = Math.sin(rad) * travel;
      const length = 90 + Math.random() * 70;

      const star = document.createElement("div");
      star.className = "ps-shooting-star";
      star.style.setProperty("--glow", glowColor);
      star.style.width = length + "px";
      star.style.left = startX + "px";
      star.style.top = startY + "px";
      document.body.appendChild(star);

      const duration = 950 + Math.random() * 350;
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

    const glowColors = ["rgba(124,107,255,.45)", "rgba(52,208,255,.45)", "rgba(34,197,94,.45)"];
    const timers = glowColors.map((glow, i) => setTimeout(() => spawnOneShootingStar(glow), 300 + i * 380 + Math.random() * 220));

    const sparkleColors = ["#22c55e", "#4ade80", "#ff8a5c", "#7c6bff", "#34d0ff", "#ffffff"];
    const sparkleChars = ["✦", "✧", "⋆", "✩"];
    const spawnSparkles = (e: MouseEvent) => {
      const count = 7 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const el = document.createElement("span");
        el.className = "ps-sparkle-particle";
        el.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
        const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6 - 0.3);
        const distance = 26 + Math.random() * 42;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        const size = 8 + Math.random() * 11;
        const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
        const spin = Math.random() > 0.5 ? 200 : -200;
        el.style.left = e.clientX + "px";
        el.style.top = e.clientY + "px";
        el.style.fontSize = size + "px";
        el.style.color = color;
        el.style.textShadow = `0 0 6px ${color}`;
        document.body.appendChild(el);
        const anim = el.animate(
          [
            { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.15) rotate(${spin}deg)`, opacity: 0 },
          ],
          { duration: 500 + Math.random() * 300, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
        anim.onfinish = () => el.remove();
      }
    };
    document.addEventListener("click", spawnSparkles);

    return () => {
      timers.forEach(clearTimeout);
      document.removeEventListener("click", spawnSparkles);
    };
  }, []);

  return (
    <div className={`ps-wizard ${kanit.variable}`} ref={pageRef}>
      <div className="hero">
        <img src="/images/space_dark.png" alt="" className="hero-bg" />
        <div className="hero-content">
          <img src="/BAAC_Logo.svg.png" alt="BAAC" className="hero-logo" />
          <span className="hero-eyebrow">&#9679; Idea to Innovation</span>
          <h1 ref={titleRef}>กิจกรรมเสนอความคิดสร้างสรรค์</h1>
          <p>ร่วมส่งไอเดียดีๆ เพื่อพัฒนาธนาคาร สู่ผลงานนวัตกรรมที่ยั่งยืน</p>
        </div>
      </div>

      <div className={`side-nav${step === 2 ? " visible" : ""}`} ref={sideNavRef}></div>

      <div className="page">
        <div className="stepper">
          <div className={`step-item${step === 1 ? " active" : ""}${step === 2 ? " done" : ""}`}>
            <div className="step-dot">1</div>
            <div>
              <div className="step-title">ชื่อผลงานและรายชื่อทีม</div>
              <div className="step-sub">ตั้งชื่อความคิดสร้างสรรค์และเลือกประเภทผู้ส่งประกวด</div>
            </div>
          </div>
          <div className={`step-item${step === 2 ? " active" : ""}`}>
            <div className="step-dot">2</div>
            <div>
              <div className="step-title">รายละเอียดโครงการ</div>
              <div className="step-sub">ข้อมูลแนวคิดและนวัตกรรม</div>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div id="ps-step1">
            <div className="card">
              <div className="card-head"><div className="idx">1</div><h3>ชื่อความคิดสร้างสรรค์ และประเภทการประกวด</h3></div>

              <label className="field-label">ชื่อความคิดสร้างสรรค์<span className="req">*</span></label>
              <input type="text" value={creativeIdeaName} onChange={(e) => setCreativeIdeaName(e.target.value)} placeholder="เช่น ระบบวิเคราะห์ข้อมูลลูกค้าเกษตรกรอัจฉริยะ" />

              <label className="field-label" style={{ marginTop: 20 }}>ส่งในนาม<span className="req">*</span></label>
              <div className="type-grid">
                <div className={`type-card${submissionType === "INDIVIDUAL" ? " selected" : ""}`} onClick={() => selectType("INDIVIDUAL")}>
                  <div className="row-top"><span className="ico">🧑‍💼</span><span className="radio-dot"></span></div>
                  <div className="ttl">ประเภทบุคคล</div>
                  <div className="desc">ส่งผลงานในนามตนเอง 1 คน ไม่ต้องเพิ่มสมาชิกทีม</div>
                </div>
                <div className={`type-card${submissionType === "TEAM" ? " selected" : ""}`} onClick={() => selectType("TEAM")}>
                  <div className="row-top"><span className="ico">👥</span><span className="radio-dot"></span></div>
                  <div className="ttl">ประเภททีม</div>
                  <div className="desc">รวมทีมสมาชิก 3-5 ท่าน ทำงานร่วมกัน</div>
                </div>
              </div>

              {submissionType === "TEAM" && (
                <>
                  <label className="field-label" style={{ marginTop: 20 }}>ชื่อทีม<span className="req">*</span></label>
                  <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="เช่น ทีมนวัตกรรมสร้างสรรค์" />
                </>
              )}

              <div className="member-box">
                <div className="member-box-head">
                  <h4>รายชื่อสมาชิกในทีม</h4>
                  <span className="pill">{submissionType === "INDIVIDUAL" ? "ประเภทบุคคล 1 ท่าน" : "จำนวนสมาชิก 3-5 ท่าน"}</span>
                </div>
                <table className="member-table">
                  <thead>
                    <tr>
                      <th style={{ width: "14%" }}>รหัสพนักงาน*</th>
                      <th style={{ width: "18%" }}>ชื่อ-นามสกุล*</th>
                      <th style={{ width: "15%" }}>ตำแหน่ง</th>
                      <th style={{ width: "18%" }}>สังกัด(สำนักวิจัยและนวัตกรรม(วพ.))</th>
                      <th style={{ width: "15%" }}>เบอร์ติดต่อ</th>
                      <th style={{ width: "12%" }}></th>
                      <th style={{ width: "4%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, idx) => (
                      <tr key={idx}>
                        <td data-label="รหัสพนักงาน*"><input type="text" value={m.EmpCode} onChange={(e) => updateMember(idx, "EmpCode", e.target.value)} placeholder="รหัสพนักงาน" style={{ width: 90 }} /></td>
                        <td data-label="ชื่อ-นามสกุล*"><input type="text" value={m.FullNameTh} onChange={(e) => updateMember(idx, "FullNameTh", e.target.value)} placeholder="ชื่อ-นามสกุล" /></td>
                        <td data-label="ตำแหน่ง"><input type="text" value={m.PositionName} onChange={(e) => updateMember(idx, "PositionName", e.target.value)} placeholder="ตำแหน่ง" /></td>
                        <td data-label="สังกัด(สำนักวิจัยและนวัตกรรม(วพ.))"><input type="text" value={m.OrgName} onChange={(e) => updateMember(idx, "OrgName", e.target.value)} placeholder="สังกัด" /></td>
                        <td data-label="เบอร์ติดต่อ"><input type="tel" value={m.MobileNo} onChange={(e) => updateMember(idx, "MobileNo", e.target.value)} placeholder="เบอร์ติดต่อ" /></td>
                        <td style={{ textAlign: "center" }}>{idx === 0 ? <span className="badge-leader">{submissionType === "TEAM" ? "หัวหน้าทีม" : "ผู้ส่งผลงาน"}</span> : null}</td>
                        <td>{idx > 0 ? <button type="button" className="icon-btn" onClick={() => removeMember(idx)}>&#10005;</button> : null}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {submissionType === "TEAM" && (
                  <button type="button" className="btn-add-member" onClick={addMember} disabled={members.length >= 5}>+ เพิ่มสมาชิก</button>
                )}
              </div>
            </div>

            <div className="wizard-nav" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-primary" onClick={goNext} disabled={savingStep1}>
                {savingStep1 ? "กำลังบันทึก..." : "ถัดไป: รายละเอียดโครงการ →"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div id="ps-step2">
            <div className="wizard-nav" style={{ marginTop: 0, marginBottom: 20 }}>
              <button type="button" className="btn btn-ghost" onClick={backToStep1}>← ย้อนกลับ</button>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" className="btn btn-draft" onClick={saveDraft} disabled={savingDraft}>
                  {savingDraft ? "กำลังบันทึก..." : "💾 บันทึกร่าง"}
                </button>
                <button type="button" className="btn btn-submit" onClick={submitFinal} disabled={submitting}>
                  {submitting ? "กำลังส่ง..." : "✓ ส่งผลงานเข้าประกวด"}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">1</div><h3>โจทย์นวัตกรรมที่ท่านต้องการแก้ปัญหา</h3></div>
              <div className="opt-grid">
                {CHALLENGES.map((c) => (
                  <label key={c.no} className={`opt-row${step2.ChallengeNo === c.no ? " checked" : ""}`} onClick={() => setChallenge(c.no, c.text)}>
                    <input type="radio" name="challenge" checked={step2.ChallengeNo === c.no} readOnly />
                    <div className="opt-body"><span className="opt-title">{c.no}. {c.text}</span></div>
                  </label>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">2</div><h3>ประเภทของโจทย์นวัตกรรม</h3></div>
              <div className="opt-grid">
                {CHALLENGE_CATEGORIES.map((c) => (
                  <label key={c.no} className={`opt-row${step2.ChallengeCategoryNo === c.no ? " checked" : ""}`} onClick={() => setChallengeCategory(c.no, c.text)}>
                    <input type="radio" name="challengeCategory" checked={step2.ChallengeCategoryNo === c.no} readOnly />
                    <div className="opt-body"><span className="opt-title">{c.text}</span></div>
                  </label>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">3</div><h3>ความสอดคล้องกับวัตถุประสงค์เชิงยุทธศาสตร์ (SO) (เลือกได้มากกว่า 1 ข้อ)</h3></div>
              <div className="opt-grid">
                {STRATEGIC_OBJECTIVES.map(({ key, label }) => {
                  const checked = Boolean(step2[`StrategicObjective${key}`]);
                  return (
                    <label key={key} className={`opt-row${checked ? " checked" : ""}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleStrategicObjective(key)} />
                      <div className="opt-body"><span className="opt-title">{label}</span></div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">4</div><h3>แหล่งที่มาของแนวคิด (เลือกได้มากกว่า 1 ข้อ)</h3></div>
              <div className="opt-grid">
                {IDEA_SOURCES.map(({ key, label }) => {
                  const checked = Boolean(step2[`IdeaSource${key}`]);
                  return (
                    <label key={key} className={`opt-row${checked ? " checked" : ""}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleIdeaSource(key)} />
                      <div className="opt-body">
                        <span className="opt-title">{label}</span>
                        {checked && (
                          <input
                            type="text"
                            className="opt-detail"
                            style={{ display: "block" }}
                            value={String(step2[`IdeaSource${key}Detail`] ?? "")}
                            onChange={(e) => setIdeaSourceDetail(key, e.target.value)}
                            placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                          />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">5</div><h3>ลูกค้ากลุ่มเป้าหมาย และประเด็นปัญหาของลูกค้ากลุ่มเป้าหมาย</h3></div>
              <label className="field-label">โปรดเลือกกลุ่มลูกค้าเป้าหมาย<span className="req">*</span></label>
              <div className="opt-list-single" style={{ marginBottom: 18 }}>
                {TARGET_CUSTOMER_TYPES.map((t) => (
                  <label key={t.no} className={`opt-row${step2.TargetCustomerTypeNo === t.no ? " checked" : ""}`} onClick={() => setTargetCustomerType(t.no, t.text)}>
                    <input type="radio" name="targetCustomerType" checked={step2.TargetCustomerTypeNo === t.no} readOnly />
                    <div className="opt-body"><span className="opt-title">{t.text}</span></div>
                  </label>
                ))}
              </div>
              <p className="hint">ระบุรายละเอียดของผู้ใช้งานหรือลูกค้าของแนวคิดที่นำเสนอพร้อมปัญหาของกลุ่มเป้าหมาย</p>
              <RichTextEditor
                value={String(step2.TargetCustomerProblemHtml ?? "")}
                onChange={(html) => setField("TargetCustomerProblemHtml", html)}
                placeholder="พิมพ์รายละเอียดที่นี่..."
              />
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">6</div><h3>ประเภทของนวัตกรรม</h3></div>
              <div className="opt-grid">
                {INNOVATION_TYPES.map((t) => (
                  <label key={t.no} className={`opt-row${step2.InnovationTypeNo === t.no ? " checked" : ""}`} onClick={() => setInnovationType(t.no, t.text)}>
                    <input type="radio" name="innoType" checked={step2.InnovationTypeNo === t.no} readOnly />
                    <div className="opt-body"><span className="opt-title">{t.text}</span></div>
                  </label>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">7</div><h3>นำเสนอแนวคิดนวัตกรรมโดยสังเขป</h3></div>
              <p className="hint">ระบุรายละเอียดหรือภาพรวมของแนวคิด เพื่อให้เข้าใจถึงแนวทางการนำไปใช้พัฒนา/แก้ไขปัญหาที่เกิดขึ้น</p>
              <RichTextEditor
                value={String(step2.IdeaConceptHtml ?? "")}
                onChange={(html) => setField("IdeaConceptHtml", html)}
                placeholder="พิมพ์แนวคิดนวัตกรรมที่นี่..."
              />
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">8</div><h3>ผลงานนวัตกรรมเทคโนโลยีดิจิทัล</h3></div>
              <div className="opt-list-single">
                {DIGITAL_INNOVATION_TYPES.map((t) => (
                  <label key={t.no} className={`opt-row${step2.DigitalInnovationNo === t.no ? " checked" : ""}`} onClick={() => setDigitalInnovation(t.no, t.text)}>
                    <input type="radio" name="digitalInnovation" checked={step2.DigitalInnovationNo === t.no} readOnly />
                    <div className="opt-body"><span className="opt-title">{t.text}</span></div>
                  </label>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">9</div><h3>ระดับความใหม่ของความคิดสร้างสรรค์</h3></div>
              <div className="opt-grid">
                {NOVELTY_LEVELS.map((t) => (
                  <label key={t.no} className={`opt-row${step2.NoveltyLevelNo === t.no ? " checked" : ""}`} onClick={() => setNoveltyLevel(t.no, t.text)}>
                    <input type="radio" name="noveltyLevel" checked={step2.NoveltyLevelNo === t.no} readOnly />
                    <div className="opt-body"><span className="opt-title">{t.text}</span></div>
                  </label>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">10</div><h3>มูลค่านวัตกรรม (Innovation Value)</h3></div>

              <div className="cap-group-title">ด้านการเงิน</div>
              <label className={`opt-row${step2.InnovationValueFinancial ? " checked" : ""}`} style={{ marginBottom: 10 }}>
                <input type="checkbox" checked={Boolean(step2.InnovationValueFinancial)} onChange={() => toggleBoolField("InnovationValueFinancial")} />
                <div className="opt-body"><span className="opt-title">ด้านการเงิน</span></div>
              </label>
              {Boolean(step2.InnovationValueFinancial) && (
                <>
                  <div className="opt-grid" style={{ marginBottom: 12 }}>
                    {FINANCIAL_VALUE_ITEMS.map(({ key, label }) => {
                      const checked = Boolean(step2[`FinancialValue${key}`]);
                      return (
                        <label key={key} className={`opt-row${checked ? " checked" : ""}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleFinancialValue(key)} />
                          <div className="opt-body"><span className="opt-title">{label}</span></div>
                        </label>
                      );
                    })}
                  </div>
                  <p className="hint">รายละเอียดเพิ่มเติม (ถ้ามี)</p>
                  <RichTextEditor
                    value={String(step2.FinancialValueDetailHtml ?? "")}
                    onChange={(html) => setField("FinancialValueDetailHtml", html)}
                    placeholder="พิมพ์รายละเอียดที่นี่..."
                  />
                </>
              )}

              <div className="cap-group-title" style={{ marginTop: 22 }}>ไม่ใช่การเงิน</div>
              <label className={`opt-row${step2.InnovationValueNonFinancial ? " checked" : ""}`} style={{ marginBottom: 10 }}>
                <input type="checkbox" checked={Boolean(step2.InnovationValueNonFinancial)} onChange={() => toggleBoolField("InnovationValueNonFinancial")} />
                <div className="opt-body"><span className="opt-title">ไม่ใช่การเงิน</span></div>
              </label>
              {Boolean(step2.InnovationValueNonFinancial) && (
                <>
                  <div className="opt-grid" style={{ marginBottom: 12 }}>
                    {NONFINANCIAL_VALUE_ITEMS.map(({ key, label }) => {
                      const checked = Boolean(step2[`NonFinancialValue${key}`]);
                      return (
                        <label key={key} className={`opt-row${checked ? " checked" : ""}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleNonFinancialValue(key)} />
                          <div className="opt-body"><span className="opt-title">{label}</span></div>
                        </label>
                      );
                    })}
                  </div>
                  <p className="hint">รายละเอียดเพิ่มเติม (ถ้ามี)</p>
                  <RichTextEditor
                    value={String(step2.NonFinancialValueDetailHtml ?? "")}
                    onChange={(html) => setField("NonFinancialValueDetailHtml", html)}
                    placeholder="พิมพ์รายละเอียดที่นี่..."
                  />
                </>
              )}

              <div style={{ marginTop: 22 }}>
                <h4 style={{ fontSize: 14.5, marginBottom: 10, color: "var(--text-dim)" }}>ทีมงานในโครงการ</h4>
                <table className="summary-table">
                  <thead><tr><th>รหัสพนักงาน</th><th>ชื่อ-นามสกุล</th><th>ตำแหน่ง</th><th>สังกัด(สำนักวิจัยและนวัตกรรม(วพ.))</th><th>เบอร์ติดต่อ</th></tr></thead>
                  <tbody>
                    {members.map((m, idx) => (
                      <tr key={idx}>
                        <td>{m.EmpCode}</td><td>{m.FullNameTh}</td><td>{m.PositionName || "-"}</td><td>{m.OrgName || "-"}</td><td>{m.MobileNo || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="wizard-nav">
              <button type="button" className="btn btn-ghost" onClick={backToStep1}>← ย้อนกลับ</button>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" className="btn btn-draft" onClick={saveDraft} disabled={savingDraft}>
                  {savingDraft ? "กำลังบันทึก..." : "💾 บันทึกร่าง"}
                </button>
                <button type="button" className="btn btn-submit" onClick={submitFinal} disabled={submitting}>
                  {submitting ? "กำลังส่ง..." : "✓ ส่งผลงานเข้าประกวด"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
