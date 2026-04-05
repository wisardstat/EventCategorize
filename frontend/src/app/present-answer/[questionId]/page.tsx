"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getWithAuth, postWithAuth, putWithAuth } from "@/utils/api";

type Question = {
    question_id: string;
    question_title: string;
    question_description?: string | null;
};

type CreatedAnswer = {
    answer_id: number;
    question_id: string;
};

type SystemPromptSetting = {
    set_value: string;
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

export default function PresentAnswerPage() {
    const params = useParams<{ questionId: string }>();
    const questionId = params?.questionId as string;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [question, setQuestion] = useState<Question | null>(null);

    const [answerTitle, setAnswerTitle] = useState("");
    const [answerPainpoint, setAnswerPainpoint] = useState("");
    const [answerText, setAnswerText] = useState("");
    const [answerOutcome, setAnswerOutcome] = useState("");
    const [createUserCode, setCreateUserCode] = useState("");
    const [createUserName, setCreateUserName] = useState("");
    const [createUserDepartment, setCreateUserDepartment] = useState("");

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const readErrorMessage = async (response: Response, fallbackMessage: string) => {
        try {
            const data = await response.json();
            return data?.detail || fallbackMessage;
        } catch {
            return fallbackMessage;
        }
    };

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const data = await getWithAuth(`/questions/${questionId}`).then((res) => res.json());
                setQuestion(data);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดคำถาม";
                setError(msg);
            } finally {
                setLoading(false);
            }
        }

        if (questionId) {
            load();
        }
    }, [questionId]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        let createdAnswerId: number | null = null;

        try {
            const createRes = await postWithAuth("/answers", {
                question_id: questionId,
                answer_title: answerTitle,
                answer_painpoint: answerPainpoint,
                answer_text: answerText,
                answer_outcome: answerOutcome,
                create_user_name: createUserName,
                create_user_code: createUserCode,
                create_user_department: createUserDepartment,
            });

            if (!createRes.ok) {
                const msg = await readErrorMessage(createRes, "บันทึกคำตอบไม่สำเร็จ");
                throw new Error(msg);
            }

            const createdAnswer: CreatedAnswer = await createRes.json();
            createdAnswerId = createdAnswer.answer_id;

            const settingRes = await getWithAuth("/settings/system-prompt");
            if (!settingRes.ok) {
                const msg = await readErrorMessage(settingRes, "โหลด system prompt ไม่สำเร็จ");
                throw new Error(msg);
            }
            const settingData: SystemPromptSetting = await settingRes.json();
            const systemPrompt = (settingData.set_value || "").trim();
            if (!systemPrompt) {
                throw new Error("ไม่พบ system prompt สำหรับการประเมิน");
            }

            const ideaDetail = [
                `ปัญหาที่พบ:\n${answerPainpoint}`,
                `แนวทางแก้ไข/รายละเอียดคำตอบ:\n${answerText}`,
                `ผลลัพธ์ที่คาดหวัง:\n${answerOutcome}`,
            ].join("\n\n");

            const scoreRes = await postWithAuth("/ideas/score", {
                system_prompt: systemPrompt,
                idea_name: answerTitle,
                idea_detail: ideaDetail,
            });
            if (!scoreRes.ok) {
                const msg = await readErrorMessage(scoreRes, "ประเมินคำตอบไม่สำเร็จ");
                throw new Error(msg);
            }
            const scoreData: ScoreResponse = await scoreRes.json();

            const updateRes = await putWithAuth(`/answers/${createdAnswer.answer_id}/model-evaluation`, {
                scores: scoreData.scores,
                overall_score: scoreData.overall_score,
                overall_feedback: scoreData.overall_feedback,
            });
            if (!updateRes.ok) {
                const msg = await readErrorMessage(updateRes, "บันทึกผลประเมินไม่สำเร็จ");
                throw new Error(msg);
            }

            setMessage("บันทึกและประเมินผลเรียบร้อย");
            setAnswerTitle("");
            setAnswerPainpoint("");
            setAnswerText("");
            setAnswerOutcome("");
            setCreateUserCode("");
            setCreateUserName("");
            setCreateUserDepartment("");

            router.push(`/answer_evaluation/${createdAnswer.answer_id}`);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
            if (createdAnswerId) {
                setMessage(`บันทึกคำตอบแล้ว (ID: ${createdAnswerId}) แต่ประเมินผลไม่สำเร็จ: ${msg}`);
            } else {
                setMessage(msg);
            }
        } finally {
            setSaving(false);
        }
    }

    function handleReset() {
        setAnswerTitle("");
        setAnswerPainpoint("");
        setAnswerText("");
        setAnswerOutcome("");
        setCreateUserCode("");
        setCreateUserName("");
        setCreateUserDepartment("");
        setMessage(null);
    }

    return (
        <div className="min-h-screen flex items-top justify-center p-8">
            <main className="w-full max-w-4xl space-y-6">
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-center">{question?.question_title}</h1>
                        <h2 className="text-xl opacity-80 text-center">{question?.question_description || ""}</h2>

                        <div className="flex justify-center">
                            <Link
                                href={`/answer_analytic/${questionId}`}
                                className="mt-3 inline-flex items-center gap-2 rounded-md border-2 border-emerald-400 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-emerald-100 bg-gradient-to-r from-emerald-900/60 to-green-900/40 shadow-[0_0_8px_rgba(16,185,129,0.6),inset_0_0_12px_rgba(16,185,129,0.2)] hover:from-emerald-800/70 hover:to-green-800/60 hover:shadow-[0_0_14px_rgba(16,185,129,0.9),inset_0_0_16px_rgba(16,185,129,0.35)] transition"
                            >
                                <span>Dashboard</span>
                            </Link>
                        </div>

                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-sm text-yellow-400 font-medium">หัวข้อคำตอบ (answer_title)</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-500 p-2 bg-[#0c2316]"
                                    value={answerTitle}
                                    rows={1}
                                    onChange={(e) => setAnswerTitle(e.target.value)}
                                    placeholder="เช่น แนวทางลดขั้นตอนงานเอกสารด้วยระบบดิจิทัล"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm text-yellow-400 font-medium">ปัญหาที่พบ (answer_painpoint)</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-500 p-2 bg-[#0c2316]"
                                    value={answerPainpoint}
                                    onChange={(e) => setAnswerPainpoint(e.target.value)}
                                    placeholder="เช่น ใช้เวลาตรวจสอบเอกสารนาน ทำให้ลูกค้ารอคิวเพิ่มขึ้น"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm text-yellow-400 font-medium">แนวทางแก้ไข/รายละเอียดคำตอบ (answer_text)</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-500 p-2 bg-[#0c2316]"
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    placeholder="เช่น จัดทำแบบฟอร์มออนไลน์และตั้งระบบแจ้งเตือนเอกสารไม่ครบอัตโนมัติ"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm text-yellow-400 font-medium">ผลลัพธ์ที่คาดหวัง (answer_outcome)</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-500 p-2 bg-[#0c2316]"
                                    value={answerOutcome}
                                    onChange={(e) => setAnswerOutcome(e.target.value)}
                                    placeholder="เช่น ลดเวลารอคิวลง 30% และลดข้อผิดพลาดจากการกรอกข้อมูล"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">รหัสพนักงาน</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น 5801207"
                                        maxLength={7}
                                        className="w-full rounded-md border border-gray-500 p-2 bg-[#0c2316]"
                                        value={createUserCode}
                                        onChange={(e) => setCreateUserCode(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">ชื่อผู้ตอบคำถาม</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น นายสมชาย เข็มกลัด"
                                        className="w-full rounded-md border border-gray-500 p-2 bg-[#0c2316]"
                                        value={createUserName}
                                        onChange={(e) => setCreateUserName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">หน่วยงานผู้ตอบคำถาม</label>
                                    <input
                                        type="text"
                                        placeholder="เช่น วพ. บข. สบ."
                                        className="w-full rounded-md border border-gray-500 p-2 bg-[#0c2316]"
                                        value={createUserDepartment}
                                        onChange={(e) => setCreateUserDepartment(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center rounded-md border border-black/10 dark:border-white/20 px-4 py-2 text-sm"
                                >
                                    {saving ? "กำลังบันทึกและประเมิน..." : "ส่งความคิดเห็น"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center rounded-md border border-black/10 dark:border-white/20 px-4 py-2 text-sm"
                                >
                                    ล้างข้อมูล
                                </button>
                            </div>

                            {message && <p className="text-sm">{message}</p>}
                        </form>
                    </>
                )}
            </main>
        </div>
    );
}