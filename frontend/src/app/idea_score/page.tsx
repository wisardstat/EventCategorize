"use client";

import { useEffect, useState } from "react";
import { FaArrowLeft, FaSpinner, FaRandom } from "react-icons/fa";
import { useRouter } from "next/navigation";

type IdeaTank = {
    idea_seq: number;
    idea_code?: string | null;
    category_idea_type1?: string | null;
    idea_inno_type?: string | null;
    idea_name?: string | null;
    idea_detail?: string | null;
    idea_owner_empname?: string | null;
    idea_owner_deposit?: string | null;
    create_datetime: string;
    update_datetime: string;
};

type ScoreResponse = {
    scores: {
        criterion: string;
        score: number;
        explanation: string;
    }[];
    overall_score: number;
    overall_feedback: string;
};

export default function IdeaScorePage() {
    const router = useRouter();
    const [systemPrompt, setSystemPrompt] = useState<string>("");
    const [exampleIdea, setExampleIdea] = useState<IdeaTank | null>(null);
    const [resultScore, setResultScore] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [loadingRandomIdea, setLoadingRandomIdea] = useState(false);
    const [scoring, setScoring] = useState(false);
    const [savingSystemPrompt, setSavingSystemPrompt] = useState(false);
    
    // Batch scoring states
    const [selectedLimit, setSelectedLimit] = useState<string>("all");
    const [clearScores, setClearScores] = useState<boolean>(false);
    const [batchProcessing, setBatchProcessing] = useState<boolean>(false);
    
    // Idea code input state
    const [ideaCode, setIdeaCode] = useState<string>("");

    useEffect(() => {
        checkAuthAndLoad();
    }, []);

    const checkAuthAndLoad = async () => {
        setAuthChecking(true);
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            // Verify token by making a simple API call
            const authRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
            if (!authRes.ok) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }

            // Load system prompt from database
            await loadSystemPrompt();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error loading page";
            console.error(message);
        } finally {
            setAuthChecking(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/login");
    };

    const loadSystemPrompt = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/system-prompt`);
            if (!res.ok) throw new Error("Failed to load system prompt");
            const data = await res.json();
            setSystemPrompt(data.set_value);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error loading system prompt";
            console.error(message);
            // Set default system prompt if failed to load
            setSystemPrompt(`คุณมีประสบการณ์ทางด้านการพัฒนาเทคโนโลยีหรือนวัตกรรมใหม่ เคยทำงานกับ Elon musk ในโครงการ spaceX มีประสบการณ์การทำงานในธุรกิจธนาคารของประเทศไทยไม่น้อยกว่า 20ปี เคยทำงานที่ศูนย์นวัตกรรมแห่งชาติ 5ปี จบสาขาคอมพิวเตอร์และเทคโนโลยสารสนเทศ จบสาขาการงเงินการบัญชี
/ฉันเป็นกรรมการตัดสินการประกวดนวัตกรรมเพื่อนำไปสร้างผลิตภัณฑ์ใหม่ๆ หรือปรับปรุงกระบวนการทำงานในธนาคาร โดยให้ผู้เข้าแข่งขันส่งบทความเข้ามา และฉันจะให้ Ai ช่วยตัดสินจากบทความนั้นๆ
----------------------------------------
ข้อมูลองค์กรของฉัน
----------------------------------------
ชื่อเต็ม: ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.) หรือ Bank for Agriculture and Agricultural Cooperatives (BAAC) สถานะ: รัฐวิสาหกิจในสังกัดกระทรวงการคลัง ก่อตั้ง 1 พฤศจิกายน 2509
วิสัยทัศน์: เป็นธนาคารพัฒนาชนบทที่ยั่งยืน มุ่งเป็น Essence of Agriculture (แกนกลางภาคการเกษตร) สนับสนุนเศรษฐกิจฐานราก ยกระดับคุณภาพชีวิตเกษตรกร
ภารกิจหลัก:ให้ความช่วยเหลือทางการเงิน แก่เกษตรกร กลุ่มเกษตรกร สหกรณ์การเกษตร สำหรับประกอบอาชีพเกษตรกรรมและอาชีพที่เกี่ยวเนื่อง/สนับสนุนอาชีพเสริม เพิ่มรายได้นอกภาคเกษตร พัฒนาคุณภาพชีวิตเกษตรกรและครอบครัว/พัฒนาความรู้ ด้านเกษตรกรรมและอาชีพอื่นๆ เพื่อเพิ่มรายได้และพัฒนาคุณภาพชีวิต/ลดบทบาทเงินกู้นอกระบบ ช่วยเกษตรกรรายย่อยเข้าถึงแหล่งเงินทุนในระบบ/ดำเนินโครงการพัฒนา ส่งเสริมและสนับสนุนการเกษตรกรรมแบบครบวงจร
รูปแบบธุรกิจ : ธนาคารพัฒนาชนบท (Rural Development Bank)/สินเชื่อครบวงจร ครอบคลุมก่อนผลิต ระหว่างผลิต หลังผลิต /Value Chain Finance เชื่อมโยงเกษตรกรกับตลาด ตั้งแต่ผลิต แปรรูป จนจำหน่าย/Customer Centric ออกแบบผลิตภัณฑ์ตอบโจทย์บุคคล กลุ่มบุคคล ผู้ประกอบการ สหกรณ์/Digital Transformation ใช้เทคโนโลยีดิจิทัล บริหารข้อมูล พัฒนาช่องทาง Fintech/BCG Economy Model สนับสนุน Bio-Circular-Green Economy และ Green Credit/เครือข่ายกว้างขวาง 75 จังหวัด กว่า 962 สาขาทั่วประเทศ/โครงการนโยบายรัฐ ประกันรายได้เกษตรกร พักชำระหนี้ สินเชื่อดอกเบี้ยต่ำ Smart Farmer
----------------------------------------
ระบบที่ธนาคารมีอยู่แล้ว
----------------------------------------
ระบบ credit-scoring/เว็บขายสินค้าการเกษตร/ระบบ LG/ระบบ Callcenter/ระบบ VOC/ระบบ Scocial listening (zanroo)/ตู้ชำระสินเชื่อ/ระบบจัด priority การชำระสัญญาสินเชื่อ/ระบบคาดการณ์ลูกค้าผิดนัดชำระ/Dashboard ข้อมูลสินเชื่อ,เงินฝาก
/ชำระสินเชื่อ Online ผ่าน mobile banking/ระบบโอนเงิน online/
----------------------------------------
หมายเหตุที่สำคัญให้อ่านเสมอ
----------------------------------------
- หากนวัตกรรมมีความซ้ำซ้อนกับระบบที่ธนาคารมีอยู่แล้ว จะถูกหักคะแนนตามความใกล้เคียง
- ถ้าข้อความสั้นมากเกินไป เช่น มี 1 บรรทัด หรือน้อยกว่า 200 ตัวอักษร จะถูกหักคะแนนจากเกณฑ์ที่ 2 และ 3 อย่างมาก (เหลือต่ำกว่า 50 คะแนน)

----------------------------------------
เกณฑ์การตัดสินบทความนวัตกรรมธนาคาร (5 เกณฑ์)
----------------------------------------
1. ผลกระทบทางธุรกิจและมูลค่าเชิงนวัตกรรม : นวัตกรรมสร้างคุณค่าทางธุรกิจที่วัดผลได้ชัดเจน ไม่ว่าจะเป็นการเพิ่มรายได้ ลดต้นทุน หรือขยายฐานลูกค้า พร้อมทั้งมีความแตกต่างจากที่มีอยู่ในตลาดอย่างมีนัยสำคัญ
2. ความเป็นไปได้ในการนำไปใช้จริง : มีแผนการดำเนินงานที่ชัดเจน ทรัพยากรที่ต้องใช้สมเหตุสมผล และสามารถบูรณาการเข้ากับระบบปัจจุบันของธนาคารได้โดยไม่ซับซ้อนเกินไป รวมถึงมีระยะเวลาในการพัฒนาที่เหมาะสม
3. การแก้ปัญหาและตอบโจทย์ลูกค้า :นวัตกรรมแก้ไขปัญหาที่แท้จริงของลูกค้าหรือปรับปรุง Customer Experience อย่างเป็นรูปธรรม มีการศึกษาความต้องการของกลุ่มเป้าหมายอย่างชัดเจน และสามารถวัดความพึงพอใจหรือการยอมรับได้
4. ความเป็นเลิศทางเทคนิคและความสามารถในการขยายขนาด :ใช้เทคโนโลยีที่เหมาะสม มีสถาปัตยกรรมที่รองรับการเติบโตในอนาคต ประสิทธิภาพสูง และสามารถปรับขนาดเพื่อรองรับผู้ใช้งานจำนวนมากได้โดยไม่ส่งผลกระทบต่อคุณภาพการให้บริการ ต้องไม่ซ้ำซ้อนกับระบบที่ธนาคารมีอยู่แล้ว ถ้าซ้ำต้องลดคะแนนให้น้อยที่สุดตามความใกล้เคียง
5. การบริหารความเสี่ยงและการปฏิบัติตามกฎระเบียบ :คำนึงถึงความปลอดภัยทางไซเบอร์ การคุ้มครองข้อมูลส่วนบุคคล และสอดคล้องกับข้อกำหนดของ ธปท. และกฎหมายที่เกี่ยวข้อง พร้อมทั้งมีแผนบริหารความเสี่ยงที่ครอบคลุม

`);
        }
    };

    const saveSystemPrompt = async () => {
        if (!systemPrompt.trim()) {
            alert("กรุณากรอกเกณฑ์การให้คะแนน");
            return;
        }

        setSavingSystemPrompt(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/system-prompt`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    set_value: systemPrompt,
                    set_description: "System prompt for AI idea scoring"
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save system prompt");
            }

            alert("บันทึกเกณฑ์การให้คะแนนเรียบร้อยแล้ว");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error saving system prompt";
            alert(`เกิดข้อผิดพลาด: ${message}`);
        } finally {
            setSavingSystemPrompt(false);
        }
    };

    const handleBack = () => {
        router.push("/idea_tank");
    };

    const getRandomIdea = async () => {
        setLoadingRandomIdea(true);
        try {
            let res;
            if (ideaCode.trim()) {
                // If idea_code is provided, get specific idea by code
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ideas/code/${ideaCode.trim()}`);
                if (!res.ok) throw new Error("Failed to get idea by code");
            } else {
                // Otherwise get random idea
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ideas/random`);
                if (!res.ok) throw new Error("Failed to get random idea");
            }
            const data: IdeaTank = await res.json();
            setExampleIdea(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error getting idea";
            alert(`เกิดข้อผิดพลาด: ${message}`);
        } finally {
            setLoadingRandomIdea(false);
        }
    };

    const handleScoreIdea = async () => {
        if (!systemPrompt.trim()) {
            alert("กรุณากรอกเกณฑ์การให้คะแนน");
            return;
        }

        if (!exampleIdea) {
            alert("กรุณาเลือกตัวอย่างความคิดสร้างสรรค์");
            return;
        }

        setScoring(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ideas/score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    system_prompt: systemPrompt,
                    idea_name: exampleIdea.idea_name,
                    idea_detail: exampleIdea.idea_detail,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to score idea");
            }

            const data: ScoreResponse = await response.json();
            
            // Format the result for display
            let formattedResult = "=== ผลการประเมินความคิดสร้างสรรค์ ===\n\n";
            
            data.scores.forEach(score => {
                formattedResult += `${score.criterion}\n`;
                formattedResult += `คะแนน: ${score.score}/20\n`;
                formattedResult += `คำอธิบาย: ${score.explanation}\n\n`;
            });
            
            formattedResult += `คะแนนรวม: ${data.overall_score}/100\n`;
            formattedResult += `เฉลี่ย: ${(data.overall_score / 5).toFixed(1)}/20\n\n`;
            formattedResult += `ข้อเสนอแนะโดยรวม:\n${data.overall_feedback}`;
            
            setResultScore(formattedResult);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error scoring idea";
            alert(`เกิดข้อผิดพลาด: ${message}`);
        } finally {
            setScoring(false);
        }
    };

    const handleBatchScoreIdeas = async () => {
        if (!systemPrompt.trim()) {
            alert("กรุณากรอกเกณฑ์การให้คะแนน");
            return;
        }

        setBatchProcessing(true);

        try {
            // Convert selected limit to number or null for "all"
            const limit = selectedLimit === "all" ? null : parseInt(selectedLimit);
            
            // Show confirmation message with details about the operation
            const limitText = selectedLimit === "all" ? "ทั้งหมด" : `${selectedLimit} รายการ (เฉพาะรายการที่ยังไม่มี score)`;
            const confirmMessage = `คุณต้องการทำการประเมินคะแนน ${limitText} ใช่หรือไม่?`;
            
            if (!confirm(confirmMessage)) {
                setBatchProcessing(false);
                return;
            }
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ideas/batch-score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    system_prompt: systemPrompt,
                    limit: limit,
                    clear_scores: clearScores
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to batch score ideas");
            }

            const data = await response.json();
            
            // Show completion alert with results
            let alertMessage = `ประมวลผลเสร็จสิ้น!\n\n`;
            alertMessage += `รายการที่ประมวลผล: ${data.processed_count}\n`;
            alertMessage += `สำเร็จ: ${data.success_count}\n`;
            alertMessage += `ผิดพลาด: ${data.error_count}\n`;
            
            if (data.errors.length > 0) {
                alertMessage += `\nรายละเอียดข้อผิดพลาด:\n`;
                data.errors.forEach((error: string, index: number) => {
                    alertMessage += `${index + 1}. ${error}\n`;
                });
            }
            
            alert(alertMessage);
            
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error batch scoring ideas";
            alert(`เกิดข้อผิดพลาด: ${message}`);
        } finally {
            setBatchProcessing(false);
        }
    };

    if (authChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-muted">กำลังตรวจสอบสิทธิ์...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-body min-h-screen">
            <div className="container-fluid">
                {/* Page Title */}
                <div className="page-title mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <button
                                onClick={handleBack}
                                className="btn btn-light d-flex align-items-center gap-2"
                                type="button"
                            >
                                <FaArrowLeft />
                                <span>กลับ</span>
                            </button>
                        </div>
                        <div className="md:col-span-1">
                            <h3 className="mb-0 text-center">
                                <span className="text-primary">ระบบประเมินคะแนนความคิดสร้างสรรค์</span>
                            </h3>
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                            {/* Empty for balance */}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="row">
                    <div className="col-12">
                        {/* System Prompt Card */}
                        <div className="card mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">เกณฑ์การให้คะแนน (System Prompt)</h5>
                                <div className="ms-auto">
                                    <button
                                        onClick={saveSystemPrompt}
                                        className="btn btn-success btn-sm d-flex align-items-center gap-2"
                                        disabled={savingSystemPrompt}
                                    >
                                        {savingSystemPrompt ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                กำลังบันทึก...
                                            </>
                                        ) : (
                                            <>
                                                <span>บันทึก</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label htmlFor="systemPrompt" className="form-label">
                                            กรอกเงื่อนไข/เกณฑ์ในการให้คะแนนความคิดสร้างสรรค์ (5 เกณฑ์)
                                        </label>
                                        <textarea
                                            id="systemPrompt"
                                            className="form-control"
                                            rows={10}
                                            value={systemPrompt}
                                            onChange={(e) => setSystemPrompt(e.target.value)}
                                            placeholder="กรอกเกณฑ์การให้คะแนน..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Example Idea Card */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 mr-5">ตัวอย่างความคิดสร้างสรรค์</h5>
                                    <div className="d-flex align-items-center gap-2">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="idea_code"
                                            value={ideaCode}
                                            onChange={(e) => setIdeaCode(e.target.value)}
                                            style={{ width: "120px" }}
                                        />
                                        <button
                                            onClick={getRandomIdea}
                                            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                                            disabled={loadingRandomIdea}
                                        >
                                            {loadingRandomIdea ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    {ideaCode.trim() ? "กำลังโหลด..." : "กำลังสุ่ม..."}
                                                </>
                                            ) : (
                                                <>
                                                    <FaRandom />
                                                    {ideaCode.trim() ? "เลือก" : "สุ่มไอเดีย"}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                {exampleIdea ? (
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label">ชื่อความคิดสร้างสรรค์</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={exampleIdea.idea_name || "-"}
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">รายละเอียดความคิดสร้างสรรค์</label>
                                            <textarea
                                                className="form-control"
                                                rows={8}
                                                value={exampleIdea.idea_detail || "-"}
                                                 
                                            />
                                        </div>
                                        {exampleIdea.idea_owner_deposit && (
                                            <div className="col-md-6">
                                                <label className="form-label">หน่วยงานเจ้าของไอเดีย</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={exampleIdea.idea_owner_deposit}
                                                    readOnly
                                                />
                                            </div>
                                        )}
                                        {exampleIdea.idea_owner_empname && (
                                            <div className="col-md-6">
                                                <label className="form-label">ชื่อเจ้าของไอเดีย</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={exampleIdea.idea_owner_empname}
                                                    readOnly
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted">กรุณาคลิกปุ่ม "สุ่มไอเดีย" หรือกรอก idea_code แล้วกด "เลือก" เพื่อเลือกตัวอย่างความคิดสร้างสรรค์</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Score Button */}
                        <div className="text-center mb-4">
                            <button
                                onClick={handleScoreIdea}
                                className="btn btn-primary btn-lg d-flex align-items-center gap-2 mx-auto"
                                disabled={scoring || !exampleIdea}
                            >
                                {scoring ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        กำลังประเมิน...
                                    </>
                                ) : (
                                    "ทดสอบให้คะแนน idea"
                                )}
                            </button>
                        </div>

                       

                        {/* Result Score Card */}
                        <div className="card">
                            <div className="card-header">
                                <h5>ผลการประเมิน</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label htmlFor="resultScore" className="form-label">
                                            ผลการประเมินจาก AI
                                        </label>
                                        <textarea
                                            id="resultScore"
                                            className="form-control"
                                            rows={15}
                                            value={resultScore}
                                            readOnly
                                            placeholder="ผลการประเมินจะแสดงที่นี่..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>


                         {/* Update idea Score Card */}
                        <div className="card mt-4">
                            <div className="card-header">
                                <h5 className="mb-0">Update idea Score</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label htmlFor="itemLimit" className="form-label">
                                            จำนวนรายการที่ต้องการสร้าง score
                                            <small className="text-muted d-block">
                                                (เลือก "ทั้งหมด" หรือระบุจำนวนเฉพาะรายการที่ยังไม่มี score)
                                            </small>
                                        </label>
                                        <select
                                            id="itemLimit"
                                            className="form-select"
                                            value={selectedLimit}
                                            onChange={(e) => setSelectedLimit(e.target.value)}
                                            disabled={batchProcessing}
                                        >
                                            <option value="all">ทั้งหมด</option>
                                            <option value="3">3 รายการ</option>
                                            <option value="10">10 รายการ</option>
                                            <option value="20">20 รายการ</option>
                                            <option value="50">50 รายการ</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-check mt-4">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="clearScores"
                                                checked={clearScores}
                                                onChange={(e) => setClearScores(e.target.checked)}
                                                disabled={batchProcessing}
                                            />
                                            <label className="form-check-label" htmlFor="clearScores">
                                                ล้างคะแนนทั้งหมด
                                            </label>
                                            <small className="text-muted d-block">
                                                (Update idea_tank set idea_score=null)
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                {/* Process Button */}
                                <div className="text-center mt-4">
                                    <button
                                        onClick={handleBatchScoreIdeas}
                                        className="btn btn-primary btn-lg d-flex align-items-center gap-2 mx-auto"
                                        disabled={batchProcessing || !systemPrompt.trim()}
                                    >
                                        {batchProcessing ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                กำลังประมวลผล...
                                            </>
                                        ) : (
                                            "ประมวลผล"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}