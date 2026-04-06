"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getWithAuth } from "@/utils/api";

type Answer = {
    answer_id: number;
    question_id: string;
    answer_title?: string | null;
    answer_painpoint?: string | null;
    answer_text: string;
    answer_outcome?: string | null;
    model_overall_score?: number | null;
    category: string;
    create_user_code?: string | null;
    answer_keywords?: string | null;
    create_user_name?: string | null;
    create_user_department?: string | null;
    created_at: string;
};

type Question = {
    question_id: string;
    question_title: string;
    question_description?: string | null;
};

export default function AnswerListByQuestionPage() {
    const params = useParams<{ questionId: string }>();
    const questionId = params?.questionId as string;

    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("__ALL__");
    const [selectedDept, setSelectedDept] = useState<string>("__ALL__");

    useEffect(() => {
        async function load() {
            if (!questionId) return;
            setLoading(true);
            setError(null);
            try {
                const [qRes, aRes] = await Promise.all([
                    getWithAuth(`/questions/${questionId}`),
                    getWithAuth(`/questions/${questionId}/answers`),
                ]);
                if (!qRes.ok) throw new Error("Failed to load question");
                if (!aRes.ok) throw new Error("Failed to load answers");

                const qData: Question = await qRes.json();
                const aData: Answer[] = await aRes.json();
                setQuestion(qData);
                setAnswers(aData);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Error loading data";
                setError(message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [questionId]);

    function handleExport() {
        const headers = [
            "create_user_code",
            "create_user_name",
            "create_user_department",
            "answer_text",
            "category",
            "answer_keywords",
            "created_at",
        ];

        const csvEscape = (val: unknown) => {
            const s = String(val ?? "");
            return '"' + s.replace(/"/g, '""') + '"';
        };

        const rows = answers.map((a) =>
            [
                csvEscape(a.create_user_code),
                csvEscape(a.create_user_name),
                csvEscape(a.create_user_department),
                csvEscape(a.answer_text),
                csvEscape(a.category),
                csvEscape(a.answer_keywords),
                csvEscape(new Date(a.created_at).toISOString()),
            ].join(",")
        );

        const content = [headers.join(","), ...rows].join("\n");
        const bom = "\ufeff";
        const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `answers_${questionId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    const categories = useMemo(() => {
        const set = new Set<string>();
        for (const a of answers) {
            const c = (a.category || "").trim() || "Unknown";
            set.add(c);
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [answers]);

    const departments = useMemo(() => {
        const set = new Set<string>();
        for (const a of answers) {
            const d = (a.create_user_department || "").trim() || "Unknown";
            set.add(d);
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [answers]);

    const filteredAnswers = useMemo(() => {
        return answers
            .filter((a) => {
                const c = (a.category || "").trim() || "Unknown";
                const d = (a.create_user_department || "").trim() || "Unknown";
                const catOk = selectedCategory === "__ALL__" || c === selectedCategory;
                const deptOk = selectedDept === "__ALL__" || d === selectedDept;
                return catOk && deptOk;
            })
            .sort((a, b) => {
                const scoreA = a.model_overall_score ?? Number.NEGATIVE_INFINITY;
                const scoreB = b.model_overall_score ?? Number.NEGATIVE_INFINITY;
                if (scoreB !== scoreA) return scoreB - scoreA;

                const timeA = new Date(a.created_at).getTime();
                const timeB = new Date(b.created_at).getTime();
                return timeB - timeA;
            });
    }, [answers, selectedCategory, selectedDept]);

    return (
        <div className="min-h-screen p-8">
            <main className="mx-auto max-w-6xl space-y-6">
                <h1 className="text-2xl font-bold text-center">
                    {question?.question_title || `Answer list for question: ${questionId}`}
                </h1>
                <h2 className="text-lg opacity-80 text-center">{question?.question_description || ""}</h2>

                <div className="mx-auto flex max-w-6xl flex-col items-center gap-3">
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-sm opacity-80 w-32">หมวดหมู่</label>
                            <select
                                className="w-full rounded-md border border-white/40 bg-black text-white p-2 text-sm"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="__ALL__">All</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm opacity-80 w-32">Department</label>
                            <select
                                className="w-full rounded-md border border-white/40 bg-black text-white p-2 text-sm"
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                            >
                                <option value="__ALL__">All</option>
                                {departments.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-center gap-3">
                        <Link
                            href={`/answer_analytic/${questionId}`}
                            className="mt-3 inline-flex items-center gap-2 rounded-md border-2 border-emerald-400 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-emerald-100 bg-gradient-to-r from-emerald-900/60 to-green-900/40 shadow-[0_0_8px_rgba(16,185,129,0.6),inset_0_0_12px_rgba(16,185,129,0.2)] hover:from-emerald-800/70 hover:to-green-800/60 hover:shadow-[0_0_14px_rgba(16,185,129,0.9),inset_0_0_16px_rgba(16,185,129,0.35)] transition"
                        >
                            <span>Dashboard</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleExport}
                            className="mt-3 inline-flex items-center gap-2 rounded-md border-2 border-sky-400 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-sky-100 bg-gradient-to-r from-sky-900/60 to-cyan-900/40 shadow-[0_0_8px_rgba(56,189,248,0.6),inset_0_0_12px_rgba(56,189,248,0.2)] hover:from-sky-800/70 hover:to-cyan-800/60 hover:shadow-[0_0_14px_rgba(56,189,248,0.9),inset_0_0_16px_rgba(56,189,248,0.35)] transition"
                        >
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/20">
                        <table className="min-w-full text-sm border border-gray-500">
                            <thead className="bg-black/5 dark:bg-white/10">
                                <tr>
                                    <th className="text-left p-3">Answers</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAnswers.length === 0 ? (
                                    <tr>
                                        <td className="p-3" colSpan={1}>
                                            No data
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAnswers.map((a) => (
                                        <tr key={a.answer_id} className="border-t border-black/5 dark:border-white/10">
                                            <td className="p-3 align-top whitespace-pre-wrap border border-gray-500">
                                             

                                                <div className="mt-0 space-y-3">
                                                    <div>                                                      
                                                        <span className="mt-1 text-lg font-normal whitespace-pre-wrap pl-0">{a.answer_title || "-"}</span>
                                                    </div>
                                                    {/* <div>
                                                        <b className="text-green-500 pt-3">ปัญหาที่พบ:</b>
                                                        <div className="mt-1 whitespace-pre-wrap pl-6">{a.answer_painpoint || "-"}</div>
                                                    </div> 
                                                    <div>
                                                        <b className="text-green-500 pt-3">แนวทางแก้ไข / รายละเอียดคำตอบ:</b>
                                                        <div className="mt-1 whitespace-pre-wrap pl-6">{a.answer_text || "-"}</div>
                                                    </div>
                                                    <div>
                                                        <b className="text-green-500 pt-3">ผลลัพธ์ที่คาดหวัง:</b>
                                                        <div className="mt-1 whitespace-pre-wrap pl-6">{a.answer_outcome || "-"}</div>
                                                    </div>
                                                    */}
                                                </div>

                                                <div className="text-blue-300 mt-1">
                                                    <b>หมวดหมู่:</b> {a.category || "-"}
                                                    <br />
                                                    <b>Keywords:</b>{" "}
                                                    {(a.answer_keywords || "")
                                                        .split(",")
                                                        .filter(Boolean)
                                                        .map((k, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-block mr-2 mb-1 rounded bg-black/10 dark:bg-white/10 px-2 py-0.5 text-xs"
                                                            >
                                                                {k.trim()}
                                                            </span>
                                                        ))}
                                                </div>
                                                <div className="text-gray-400">
                                                    <b>รหัสพนักงาน:</b> {a.create_user_code || "-"}
                                                    &nbsp;&nbsp; <b>ชื่อ:</b> {a.create_user_name || "-"}
                                                    &nbsp;&nbsp; <b>แผนก:</b> {a.create_user_department || "-"}
                                                    &nbsp;&nbsp; <span className="text-gray-400"> <b>วันที่สร้าง:</b> {new Date(a.created_at).toLocaleString()} </span>
                                                </div>
                                                

                                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-center">
                                                    <div className="rounded-md border border-emerald-400/50 bg-emerald-900/20 px-3 py-2 text-emerald-200">
                                                        <div className="text-xs opacity-80">คะแนนประเมิน </div>
                                                        <div className="mt-1 text-lg font-semibold leading-none">
                                                            {a.model_overall_score ?? "-"}
                                                        </div>
                                                    </div>
                                                    <div className="flex sm:justify-end">
                                                        <Link
                                                            href={`/answer_evaluation/${a.answer_id}`}
                                                            className="inline-flex items-center rounded-md border border-sky-400 px-3 py-1.5 text-xs font-semibold text-sky-200 hover:bg-sky-900/20 transition"
                                                        >
                                                            View Evaluation
                                                        </Link>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
