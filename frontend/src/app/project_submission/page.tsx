"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { postPublic, putPublic } from "@/utils/api";
import RichTextEditor from "./RichTextEditor";
import { kanit } from "./fonts";
import { CHALLENGES, INNOVATION_TYPES, IDEA_SOURCES, GEN_CAPS, DIGITAL_CAPS } from "./constants";
import "./project_submission.css";

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
    TargetCustomerHtml: "",
    InnovationTypeNo: null,
    InnovationTypeText: "",
    IdeaConceptHtml: "",
    ExpectedBenefitHtml: "",
    HackathonMotivationHtml: "",
    GenCapOtherDetail: "",
    DigitalCapOtherDetail: "",
  };
  IDEA_SOURCES.forEach(({ key }) => {
    data[`IdeaSource${key}`] = false;
    data[`IdeaSource${key}Detail`] = "";
  });
  GEN_CAPS.forEach(({ key }) => { data[`GenCap${key}`] = false; });
  DIGITAL_CAPS.forEach(({ key }) => { data[`DigitalCap${key}`] = false; });
  return data;
}

async function parseJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
  }
  return data;
}

export default function ProjectSubmissionPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const sideNavRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [projectId, setProjectId] = useState<number | null>(null);

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
    if (!teamName.trim()) return "กรุณากรอกชื่อทีม / ชื่อผลงาน";
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
      const payload = { TeamName: teamName.trim(), SubmissionTypeCode: submissionType, Members: members };
      const res = projectId
        ? await putPublic(`/project-submissions/${projectId}/step1`, payload)
        : await postPublic("/project-submissions", payload);
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
  const setInnovationType = (no: number, text: string) => setStep2((prev) => ({ ...prev, InnovationTypeNo: no, InnovationTypeText: text }));
  const toggleIdeaSource = (key: string) => setStep2((prev) => ({ ...prev, [`IdeaSource${key}`]: !prev[`IdeaSource${key}`] }));
  const setIdeaSourceDetail = (key: string, value: string) => setStep2((prev) => ({ ...prev, [`IdeaSource${key}Detail`]: value }));
  const toggleGenCap = (key: string) => setStep2((prev) => ({ ...prev, [`GenCap${key}`]: !prev[`GenCap${key}`] }));
  const toggleDigitalCap = (key: string) => setStep2((prev) => ({ ...prev, [`DigitalCap${key}`]: !prev[`DigitalCap${key}`] }));
  const setField = (field: string, value: string) => setStep2((prev) => ({ ...prev, [field]: value }));

  const saveDraft = async () => {
    if (!projectId) return;
    setSavingDraft(true);
    try {
      await parseJson(await putPublic(`/project-submissions/${projectId}/step2`, step2));
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
      await parseJson(await postPublic(`/project-submissions/${projectId}/submit`, step2));
      router.push(`/project_submission_thank?id=${projectId}`);
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
        const id = "ps-sec-" + (i + 1);
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
        <img src="/images/space_dark.png" alt="" />
        <div className="hero-content">
          <span className="hero-eyebrow">&#9679; HACKATHON 2026</span>
          <h1>IDEA Tank 2026</h1>
          <p>ส่งผลงานนวัตกรรมของคุณ เพื่อร่วมประกวดและเปลี่ยนไอเดียให้เป็นจริง</p>
        </div>
      </div>

      <div className={`side-nav${step === 2 ? " visible" : ""}`} ref={sideNavRef}></div>

      <div className="page">
        <div className="stepper">
          <div className={`step-item${step === 1 ? " active" : ""}${step === 2 ? " done" : ""}`}>
            <div className="step-dot">1</div>
            <div>
              <div className="step-title">รายชื่อทีม</div>
              <div className="step-sub">ตั้งชื่อและเลือกประเภทผู้ส่งประกวด</div>
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
              <div className="card-head"><div className="idx">1</div><h3>ชื่อทีม และประเภทการประกวด</h3></div>

              <label className="field-label">ชื่อทีม / ชื่อผลงาน<span className="req">*</span></label>
              <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="เช่น ทีมนวัตกรรมสร้างสรรค์" />

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
                        <td><input type="text" value={m.EmpCode} onChange={(e) => updateMember(idx, "EmpCode", e.target.value)} placeholder="รหัสพนักงาน" style={{ width: 90 }} /></td>
                        <td><input type="text" value={m.FullNameTh} onChange={(e) => updateMember(idx, "FullNameTh", e.target.value)} placeholder="ชื่อ-นามสกุล" /></td>
                        <td><input type="text" value={m.PositionName} onChange={(e) => updateMember(idx, "PositionName", e.target.value)} placeholder="ตำแหน่ง" /></td>
                        <td><input type="text" value={m.OrgName} onChange={(e) => updateMember(idx, "OrgName", e.target.value)} placeholder="สังกัด" /></td>
                        <td><input type="tel" value={m.MobileNo} onChange={(e) => updateMember(idx, "MobileNo", e.target.value)} placeholder="เบอร์ติดต่อ" /></td>
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
              <div className="card-head"><div className="idx">1</div><h3>กรุณาเลือกโจทย์นวัตกรรมที่ท่านต้องการแก้ปัญหา</h3></div>
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
              <div className="card-head"><div className="idx">2</div><h3>แหล่งที่มาของแนวคิด (เลือกได้มากกว่า 1 ข้อ)</h3></div>
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
              <div className="card-head"><div className="idx">3</div><h3>อธิบายถึงลูกค้าที่เป็นกลุ่มเป้าหมาย</h3></div>
              <p className="hint">ระบุรายละเอียดของผู้ใช้งานหรือลูกค้าของแนวคิดที่นำเสนอพร้อมปัญหาของกลุ่มเป้าหมาย</p>
              <RichTextEditor
                value={String(step2.TargetCustomerHtml ?? "")}
                onChange={(html) => setField("TargetCustomerHtml", html)}
                placeholder="พิมพ์รายละเอียดที่นี่..."
              />
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">4</div><h3>ประเภทของนวัตกรรม</h3></div>
              <div className="opt-list-single">
                {INNOVATION_TYPES.map((t) => (
                  <label key={t.no} className={`opt-row${step2.InnovationTypeNo === t.no ? " checked" : ""}`} onClick={() => setInnovationType(t.no, t.text)}>
                    <input type="radio" name="innoType" checked={step2.InnovationTypeNo === t.no} readOnly />
                    <div className="opt-body"><span className="opt-title">{t.text}</span></div>
                  </label>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">5</div><h3>นำเสนอแนวคิดนวัตกรรมโดยสังเขป</h3></div>
              <p className="hint">ระบุรายละเอียดหรือภาพรวมของแนวคิด เพื่อให้เข้าใจถึงแนวทางการนำไปใช้พัฒนา/แก้ไขปัญหาที่เกิดขึ้น</p>
              <RichTextEditor
                value={String(step2.IdeaConceptHtml ?? "")}
                onChange={(html) => setField("IdeaConceptHtml", html)}
                placeholder="พิมพ์แนวคิดนวัตกรรมที่นี่..."
              />
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">6</div><h3>ประโยชน์ที่คาดว่าจะได้รับ</h3></div>
              <p className="hint">การแก้ปัญหานี้เป็นประโยชน์ต่อภาคธุรกิจอย่างไร ทั้งด้านที่เป็นตัวเงินและที่ไม่ใช่ตัวเงิน</p>
              <RichTextEditor
                value={String(step2.ExpectedBenefitHtml ?? "")}
                onChange={(html) => setField("ExpectedBenefitHtml", html)}
                placeholder="พิมพ์ประโยชน์ที่คาดว่าจะได้รับที่นี่..."
              />
            </div>

            <div className="card">
              <div className="card-head"><div className="idx">7</div><h3>ทักษะ ความรู้ และความสามารถของสมาชิกภายในทีม</h3></div>
              <div className="cap-group-title">ความสามารถด้านการบริหารโครงการ (General Capabilities)</div>
              <div className="opt-grid">
                {GEN_CAPS.map(({ key, label }) => {
                  const checked = Boolean(step2[`GenCap${key}`]);
                  return (
                    <label key={key} className={`opt-row${checked ? " checked" : ""}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleGenCap(key)} />
                      <div className="opt-body">
                        <span className="opt-title">{label}</span>
                        {checked && key === "Other" && (
                          <input
                            type="text"
                            className="opt-detail"
                            style={{ display: "block" }}
                            value={String(step2.GenCapOtherDetail ?? "")}
                            onChange={(e) => setField("GenCapOtherDetail", e.target.value)}
                            placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                          />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              <div className="cap-group-title">ความสามารถด้านดิจิทัล (Digital Capabilities)</div>
              <div className="opt-grid">
                {DIGITAL_CAPS.map(({ key, label }) => {
                  const checked = Boolean(step2[`DigitalCap${key}`]);
                  return (
                    <label key={key} className={`opt-row${checked ? " checked" : ""}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleDigitalCap(key)} />
                      <div className="opt-body">
                        <span className="opt-title">{label}</span>
                        {checked && key === "Other" && (
                          <input
                            type="text"
                            className="opt-detail"
                            style={{ display: "block" }}
                            value={String(step2.DigitalCapOtherDetail ?? "")}
                            onChange={(e) => setField("DigitalCapOtherDetail", e.target.value)}
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
              <div className="card-head"><div className="idx">8</div><h3>แรงจูงใจในการเข้าร่วมโครงการ Hackathon</h3></div>
              <p className="hint">โปรดระบุรายละเอียด เหตุใดท่านจึงสนใจสมัครเข้าร่วมโครงการนี้</p>
              <RichTextEditor
                value={String(step2.HackathonMotivationHtml ?? "")}
                onChange={(html) => setField("HackathonMotivationHtml", html)}
                placeholder="พิมพ์แรงจูงใจที่นี่..."
              />

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
