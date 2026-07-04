import { IDEA_SOURCES, GEN_CAPS, DIGITAL_CAPS } from "./constants";

export interface MemberOut {
  ProjectMemberId: number;
  MemberSeq: number;
  EmpCode: string;
  FullNameTh: string;
  PositionName?: string | null;
  OrgName?: string | null;
  MobileNo?: string | null;
  IsTeamLeader: boolean;
  IsMainContact: boolean;
}

export interface SubmissionOut {
  ProjectId: number;
  EventYear: number;
  SubmissionTypeCode: string;
  SubmissionTypeNameTh: string;
  TeamName: string;
  ChallengeNo?: number | null;
  ChallengeText?: string | null;
  TargetCustomerHtml?: string | null;
  InnovationTypeNo?: number | null;
  InnovationTypeText?: string | null;
  IdeaConceptHtml?: string | null;
  ExpectedBenefitHtml?: string | null;
  HackathonMotivationHtml?: string | null;
  StatusCode: string;
  SubmittedAt?: string | null;
  CreatedAt: string;
  members: MemberOut[];
  [key: string]: unknown;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("th-TH", { dateStyle: "long", timeStyle: "short" });
  } catch {
    return value;
  }
}

export function SubmissionDetailCards({ data }: { data: SubmissionOut }) {
  const checkedIdeaSources = IDEA_SOURCES.filter(({ key }) => Boolean(data[`IdeaSource${key}`]));
  const checkedGenCaps = GEN_CAPS.filter(({ key }) => Boolean(data[`GenCap${key}`]));
  const checkedDigitalCaps = DIGITAL_CAPS.filter(({ key }) => Boolean(data[`DigitalCap${key}`]));

  return (
    <>
      <div className="card">
        <div className="card-head"><div className="idx">✓</div><h3>ข้อมูลการส่งผลงาน</h3></div>
        <div className="kv-grid">
          <div className="kv-item"><div className="k">รหัสผลงาน</div><div className="v">#{data.ProjectId}</div></div>
          <div className="kv-item"><div className="k">ชื่อทีม / ผลงาน</div><div className="v">{data.TeamName}</div></div>
          <div className="kv-item"><div className="k">ประเภทการประกวด</div><div className="v">{data.SubmissionTypeNameTh}</div></div>
          <div className="kv-item"><div className="k">สถานะ</div><div className="v">{data.StatusCode === "SUBMITTED" ? "ส่งผลงานแล้ว" : data.StatusCode}</div></div>
          <div className="kv-item"><div className="k">วันที่ส่งผลงาน</div><div className="v">{formatDateTime(data.SubmittedAt)}</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">1</div><h3>รายชื่อสมาชิกในทีม</h3></div>
        <table className="summary-table">
          <thead><tr><th>รหัสพนักงาน</th><th>ชื่อ-นามสกุล</th><th>ตำแหน่ง</th><th>สังกัด</th><th>เบอร์ติดต่อ</th></tr></thead>
          <tbody>
            {data.members.map((m) => (
              <tr key={m.ProjectMemberId}>
                <td>{m.EmpCode}</td>
                <td>{m.FullNameTh} {m.IsTeamLeader ? <span className="badge-leader" style={{ marginLeft: 6 }}>หัวหน้าทีม</span> : null}</td>
                <td>{m.PositionName || "-"}</td>
                <td>{m.OrgName || "-"}</td>
                <td>{m.MobileNo || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">2</div><h3>โจทย์นวัตกรรมที่เลือก</h3></div>
        <p className="html-block">{data.ChallengeText || <span className="empty-note">ไม่ได้ระบุ</span>}</p>
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">3</div><h3>แหล่งที่มาของแนวคิด</h3></div>
        {checkedIdeaSources.length ? (
          <div className="tag-list">
            {checkedIdeaSources.map(({ key, label }) => {
              const detail = data[`IdeaSource${key}Detail`] as string | undefined;
              return <span key={key} className="tag">{label}{detail ? `: ${detail}` : ""}</span>;
            })}
          </div>
        ) : (
          <p className="empty-note">ไม่ได้ระบุ</p>
        )}
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">4</div><h3>กลุ่มลูกค้าเป้าหมาย</h3></div>
        {data.TargetCustomerHtml ? (
          <div className="html-block" dangerouslySetInnerHTML={{ __html: data.TargetCustomerHtml }} />
        ) : (
          <p className="empty-note">ไม่ได้ระบุ</p>
        )}
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">5</div><h3>ประเภทของนวัตกรรม</h3></div>
        <p className="html-block">{data.InnovationTypeText || <span className="empty-note">ไม่ได้ระบุ</span>}</p>
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">6</div><h3>แนวคิดนวัตกรรมโดยสังเขป</h3></div>
        {data.IdeaConceptHtml ? (
          <div className="html-block" dangerouslySetInnerHTML={{ __html: data.IdeaConceptHtml }} />
        ) : (
          <p className="empty-note">ไม่ได้ระบุ</p>
        )}
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">7</div><h3>ประโยชน์ที่คาดว่าจะได้รับ</h3></div>
        {data.ExpectedBenefitHtml ? (
          <div className="html-block" dangerouslySetInnerHTML={{ __html: data.ExpectedBenefitHtml }} />
        ) : (
          <p className="empty-note">ไม่ได้ระบุ</p>
        )}
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">8</div><h3>ทักษะ ความรู้ และความสามารถของทีม</h3></div>
        <div className="cap-group-title">General Capabilities</div>
        {checkedGenCaps.length ? (
          <div className="tag-list">
            {checkedGenCaps.map(({ key, label }) => (
              <span key={key} className="tag">{label}{key === "Other" && data.GenCapOtherDetail ? `: ${data.GenCapOtherDetail}` : ""}</span>
            ))}
          </div>
        ) : (
          <p className="empty-note">ไม่ได้ระบุ</p>
        )}
        <div className="cap-group-title" style={{ marginTop: 18 }}>Digital Capabilities</div>
        {checkedDigitalCaps.length ? (
          <div className="tag-list">
            {checkedDigitalCaps.map(({ key, label }) => (
              <span key={key} className="tag">{label}{key === "Other" && data.DigitalCapOtherDetail ? `: ${data.DigitalCapOtherDetail}` : ""}</span>
            ))}
          </div>
        ) : (
          <p className="empty-note">ไม่ได้ระบุ</p>
        )}
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">9</div><h3>แรงจูงใจในการเข้าร่วมโครงการ</h3></div>
        {data.HackathonMotivationHtml ? (
          <div className="html-block" dangerouslySetInnerHTML={{ __html: data.HackathonMotivationHtml }} />
        ) : (
          <p className="empty-note">ไม่ได้ระบุ</p>
        )}
      </div>
    </>
  );
}
