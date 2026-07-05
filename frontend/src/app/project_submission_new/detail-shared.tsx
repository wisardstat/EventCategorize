import {
  IDEA_SOURCES,
  STRATEGIC_OBJECTIVES,
  FINANCIAL_VALUE_ITEMS,
  NONFINANCIAL_VALUE_ITEMS,
} from "./constants";

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

export interface SubmissionNewOut {
  ProjectId: number;
  EventYear: number;
  SubmissionTypeCode: string;
  SubmissionTypeNameTh: string;
  TeamName?: string | null;
  CreativeIdeaName: string;
  ChallengeNo?: number | null;
  ChallengeText?: string | null;
  ChallengeCategoryNo?: number | null;
  ChallengeCategoryText?: string | null;
  TargetCustomerTypeNo?: number | null;
  TargetCustomerTypeText?: string | null;
  TargetCustomerProblemHtml?: string | null;
  InnovationTypeNo?: number | null;
  InnovationTypeText?: string | null;
  IdeaConceptHtml?: string | null;
  DigitalInnovationNo?: number | null;
  DigitalInnovationText?: string | null;
  NoveltyLevelNo?: number | null;
  NoveltyLevelText?: string | null;
  InnovationValueFinancial: boolean;
  FinancialValueDetailHtml?: string | null;
  InnovationValueNonFinancial: boolean;
  NonFinancialValueDetailHtml?: string | null;
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

export function SubmissionDetailCardsNew({ data }: { data: SubmissionNewOut }) {
  const checkedSOs = STRATEGIC_OBJECTIVES.filter(({ key }) => Boolean(data[`StrategicObjective${key}`]));
  const checkedIdeaSources = IDEA_SOURCES.filter(({ key }) => Boolean(data[`IdeaSource${key}`]));
  const checkedFinancial = FINANCIAL_VALUE_ITEMS.filter(({ key }) => Boolean(data[`FinancialValue${key}`]));
  const checkedNonFinancial = NONFINANCIAL_VALUE_ITEMS.filter(({ key }) => Boolean(data[`NonFinancialValue${key}`]));

  return (
    <>
      <div className="card">
        <div className="card-head"><div className="idx">✓</div><h3>ข้อมูลการส่งผลงาน</h3></div>
        <div className="headline-value">
          <div className="k">ชื่อความคิดสร้างสรรค์</div>
          <div className="v">{data.CreativeIdeaName}</div>
        </div>
        <div className="kv-grid">
          <div className="kv-item"><div className="k">รหัสผลงาน</div><div className="v">#{data.ProjectId}</div></div>
          {data.TeamName ? <div className="kv-item"><div className="k">ชื่อทีม</div><div className="v">{data.TeamName}</div></div> : null}
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
        <div className="card-head"><div className="idx">3</div><h3>ประเภทของโจทย์นวัตกรรม</h3></div>
        <p className="html-block">{data.ChallengeCategoryText || <span className="empty-note">ไม่ได้ระบุ</span>}</p>
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">4</div><h3>ความสอดคล้องกับวัตถุประสงค์เชิงยุทธศาสตร์ (SO)</h3></div>
        {checkedSOs.length ? (
          <div className="tag-list">
            {checkedSOs.map(({ key, label }) => <span key={key} className="tag">{label}</span>)}
          </div>
        ) : (
          <p className="empty-note">ไม่ได้ระบุ</p>
        )}
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">5</div><h3>แหล่งที่มาของแนวคิด</h3></div>
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
        <div className="card-head"><div className="idx">6</div><h3>ลูกค้ากลุ่มเป้าหมาย</h3></div>
        <p className="html-block" style={{ marginBottom: 10 }}>{data.TargetCustomerTypeText || <span className="empty-note">ไม่ได้ระบุประเภทลูกค้า</span>}</p>
        {data.TargetCustomerProblemHtml ? (
          <div className="html-block" dangerouslySetInnerHTML={{ __html: data.TargetCustomerProblemHtml }} />
        ) : (
          <p className="empty-note">ไม่ได้ระบุ</p>
        )}
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">7</div><h3>ประเภทของนวัตกรรม</h3></div>
        <p className="html-block">{data.InnovationTypeText || <span className="empty-note">ไม่ได้ระบุ</span>}</p>
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">8</div><h3>แนวคิดนวัตกรรมโดยสังเขป</h3></div>
        {data.IdeaConceptHtml ? (
          <div className="html-block" dangerouslySetInnerHTML={{ __html: data.IdeaConceptHtml }} />
        ) : (
          <p className="empty-note">ไม่ได้ระบุ</p>
        )}
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">9</div><h3>ผลงานนวัตกรรมเทคโนโลยีดิจิทัล</h3></div>
        <p className="html-block">{data.DigitalInnovationText || <span className="empty-note">ไม่ได้ระบุ</span>}</p>
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">10</div><h3>ระดับความใหม่ของความคิดสร้างสรรค์</h3></div>
        <p className="html-block">{data.NoveltyLevelText || <span className="empty-note">ไม่ได้ระบุ</span>}</p>
      </div>

      <div className="card">
        <div className="card-head"><div className="idx">11</div><h3>มูลค่านวัตกรรม (Innovation Value)</h3></div>
        <div className="cap-group-title">ด้านการเงิน</div>
        {data.InnovationValueFinancial ? (
          <>
            {checkedFinancial.length ? (
              <div className="tag-list">{checkedFinancial.map(({ key, label }) => <span key={key} className="tag">{label}</span>)}</div>
            ) : null}
            {data.FinancialValueDetailHtml ? (
              <div className="html-block" style={{ marginTop: 10 }} dangerouslySetInnerHTML={{ __html: data.FinancialValueDetailHtml }} />
            ) : null}
          </>
        ) : (
          <p className="empty-note">ไม่ได้ระบุ</p>
        )}
        <div className="cap-group-title" style={{ marginTop: 18 }}>ไม่ใช่การเงิน</div>
        {data.InnovationValueNonFinancial ? (
          <>
            {checkedNonFinancial.length ? (
              <div className="tag-list">{checkedNonFinancial.map(({ key, label }) => <span key={key} className="tag">{label}</span>)}</div>
            ) : null}
            {data.NonFinancialValueDetailHtml ? (
              <div className="html-block" style={{ marginTop: 10 }} dangerouslySetInnerHTML={{ __html: data.NonFinancialValueDetailHtml }} />
            ) : null}
          </>
        ) : (
          <p className="empty-note">ไม่ได้ระบุ</p>
        )}
      </div>
    </>
  );
}
