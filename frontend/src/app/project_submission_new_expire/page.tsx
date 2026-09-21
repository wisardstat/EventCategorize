import { kanit } from "../project_submission_new/fonts";
import "../project_submission_new/project_submission_new.css";

export default function ProjectSubmissionNewExpirePage() {
  return (
    <main className={`ps-wizard ${kanit.variable}`}>
      <section className="thank-hero" aria-labelledby="registration-closed-title">
        <img src="/images/space_dark.png" alt="" />
        <div className="thank-hero-content">
          <span className="eyebrow">&#9679; Idea to Innovation</span>
          <h1 id="registration-closed-title">หมดเวลารับสมัครแล้ว</h1>
          <p>ขอขอบคุณที่สนใจกิจกรรมเสนอความคิดสร้างสรรค์</p>
        </div>
      </section>
    </main>
  );
}
