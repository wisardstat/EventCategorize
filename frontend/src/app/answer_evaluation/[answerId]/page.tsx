"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getPublic } from "@/utils/api";

type AnswerDetail = {
    answer_id: number;
    question_id: string;
    answer_title?: string | null;
    answer_painpoint?: string | null;
    answer_text: string;
    answer_outcome?: string | null;
    model_scores_criterion?: string | null;
    model_overall_score?: number | null;
    model_overall_feedback?: string | null;
};

type CriterionScore = {
    criterion: string;
    score: number;
};

type ScoreImageMeta = {
    src: string;
    label: "farmer" | "knight" | "king" | "dragon";
};

export default function AnswerEvaluationPage() {
    const params = useParams<{ answerId: string }>();
    const answerId = params?.answerId as string;
    const pageTitle = "\u0e1b\u0e23\u0e30\u0e40\u0e21\u0e34\u0e19\u0e1c\u0e25\u0e44\u0e2d\u0e40\u0e14\u0e35\u0e22";

    const [answer, setAnswer] = useState<AnswerDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);

    useEffect(() => {
        const syncAdminRole = () => {
            try {
                const userStr = localStorage.getItem("user");
                if (!userStr) {
                    setIsAdmin(false);
                    return;
                }
                const user = JSON.parse(userStr) as { user_role?: string };
                setIsAdmin(user?.user_role === "admin");
            } catch {
                setIsAdmin(false);
            }
        };

        syncAdminRole();
        window.addEventListener("storage", syncAdminRole);
        window.addEventListener("auth-change", syncAdminRole);

        return () => {
            window.removeEventListener("storage", syncAdminRole);
            window.removeEventListener("auth-change", syncAdminRole);
        };
    }, []);

    useEffect(() => {
        async function load() {
            if (!answerId) return;
            setLoading(true);
            setError(null);

            try {
                const res = await getPublic(`/answers/${answerId}`);
                if (!res.ok) {
                    throw new Error("Failed to load evaluation result");
                }
                const data: AnswerDetail = await res.json();
                setAnswer(data);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Error loading evaluation result";
                setError(msg);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [answerId]);

    const criteriaScores = useMemo(() => {
        if (!answer?.model_scores_criterion) return [] as CriterionScore[];
        try {
            const parsed = JSON.parse(answer.model_scores_criterion);
            if (!Array.isArray(parsed)) return [] as CriterionScore[];

            return parsed
                .map((item) => ({
                    criterion: String(item?.criterion ?? "").trim(),
                    score: Number(item?.score ?? 0),
                }))
                .filter((item) => item.criterion);
        } catch {
            return [] as CriterionScore[];
        }
    }, [answer?.model_scores_criterion]);

    const scoreImageMeta = useMemo(() => {
        const rawScore = answer?.model_overall_score;
        if (rawScore === null || rawScore === undefined) return null;

        const score = Number(rawScore);
        if (!Number.isFinite(score)) return null;

        if (score <= 30) {
            return { src: "/images/farmer.png", label: "farmer" } as ScoreImageMeta;
        }
        if (score <= 60) {
            return { src: "/images/knight.png", label: "knight" } as ScoreImageMeta;
        }
        if (score <= 85) {
            return { src: "/images/king.png", label: "king" } as ScoreImageMeta;
        }
        return { src: "/images/dragon.png", label: "dragon" } as ScoreImageMeta;
    }, [answer?.model_overall_score]);

    const scoreCompliment = useMemo(() => {
        if (!scoreImageMeta) return "";

        switch (scoreImageMeta.label) {
            case "farmer":
                return "จุดเริ่มต้นของนักผจญภัยชัดเจนมาก ลุยต่อได้อีกไกล!";
            case "knight":
                return "ไอเดียนี้แกร่งแบบอัศวิน พร้อมออกผจญภัยด่านถัดไป!";
            case "king":
                return "ไอเดียนี้สง่างามระดับราชา นำทีมบุกภารกิจใหญ่ได้เลย!";
            case "dragon":
                return "ไอเดียคุณสุดยอดมาก เป็นระดับมังกรในตำนานเลยทีเดียว";
            default:
                return "";
        }
    }, [scoreImageMeta]);

    return (
        <div className="min-h-screen p-8">
            <main className="mx-auto max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold text-center">{pageTitle}</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : !answer ? (
                    <p className="text-red-600">No data found</p>
                ) : (
                    <>
                        <section className="rounded-md border border-black/10 dark:border-white/20 p-4 space-y-4">
                            <h2 className="text-lg font-semibold text-yellow-500">รายละเอียดคำตอบ</h2>

                            <div>
                                <p className="font-medium text-blue-300">หัวข้อคำตอบ</p>
                                <p className="whitespace-pre-wrap">{answer.answer_title || "-"}</p>
                            </div>
                            <div>
                                <p className="font-medium text-blue-300">ปัญหาที่พบ</p>
                                <p className="whitespace-pre-wrap">{answer.answer_painpoint || "-"}</p>
                            </div>
                            <div>
                                <p className="font-medium text-blue-300">แนวทางแก้ไข / รายละเอียดคำตอบ</p>
                                <p className="whitespace-pre-wrap">{answer.answer_text || "-"}</p>
                            </div>
                            <div>
                                <p className="font-medium text-blue-300">ผลลัพธ์ที่คาดหวัง</p>
                                <p className="whitespace-pre-wrap">{answer.answer_outcome || "-"}</p>
                            </div>
                        </section>

                        <section className="rounded-md border border-black/10 dark:border-white/20 p-4 space-y-4">
                            <h2 className="text-lg font-semibold text-yellow-500">Model Evaluation</h2>

                            <div className="grid grid-cols-2 gap-4">
                                
                                <div className="rounded border border-black/10 dark:border-white/20 p-4">
                                    <p className="font-medium text-blue-300">Overall Feedback</p>
                                    <p className="whitespace-pre-wrap">{answer.model_overall_feedback || "-"}</p>
                                </div>

                                <div className="rounded border border-black/10 dark:border-white/20 p-4 text-center">
                                    <p className="font-medium text-2xl text-blue-300">Overall Score</p>
                                    <p className="text-2xl">{answer.model_overall_score ?? "-"}</p>
                                    {scoreImageMeta && (
                                        <div className="mt-3 flex justify-center">
                                            <div className="flex flex-col items-center">
                                                <Image
                                                    src={scoreImageMeta.src}
                                                    alt={scoreImageMeta.label}
                                                    width={180}
                                                    height={180}
                                                    className="mx-auto h-auto w-[140px] md:w-[180px] object-contain rounded-xl"
                                                    priority
                                                />
                                                <p className="mt-2 max-w-[260px] text-center text-sm text-emerald-300">
                                                    {scoreCompliment}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="font-medium text-blue-300">Scores by Criterion</p>
                                {criteriaScores.length === 0 ? (
                                    <p>-</p>
                                ) : (
                                    <div className="space-y-2">
                                        {criteriaScores.map((item, idx) => (
                                            <div key={`${item.criterion}-${idx}`} className="rounded border border-black/10 dark:border-white/20 p-2">
                                                <p>{item.criterion}</p>
                                                <p>Score: {item.score}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="flex justify-center gap-3">
                            <Link
                                href={`/answer_analytic/${answer.question_id}`}
                                className="inline-flex items-center rounded-md border border-black/10 dark:border-white/20 px-4 py-2 text-sm"
                            >
                                Dashboard
                            </Link>
                            {isAdmin && (
                                <Link
                                    href={`/answer_list/${answer.question_id}`}
                                    className="inline-flex items-center rounded-md border border-sky-400 px-4 py-2 text-sm font-semibold text-sky-200 hover:bg-sky-900/20 transition"
                                >
                                    Answer list
                                </Link>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
