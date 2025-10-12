"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import * as echarts from "echarts";
import "echarts-wordcloud";
import { QRCodeCanvas } from "qrcode.react";

// Change these values to adjust the WordCloud font size range (min, max)
const WORDCLOUD_SIZE_RANGE: [number, number] = [24, 48];

type Answer = {
    answer_id: number;
    question_id: string;
    answer_text: string;
    category: string;
    answer_keywords?: string | null;
    created_at: string;
};

export default function AnswerAnalyticPage() {
    const params = useParams<{ questionId: string }>();
    const questionId = params?.questionId as string;
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [qrUrl, setQrUrl] = useState("");

    const categoryCounts = useMemo(() => {
        const countBy: Record<string, number> = {};
        for (const a of answers) {
            const c = (a.category || "").trim() || "ไม่ระบุ";
            countBy[c] = (countBy[c] || 0) + 1;
        }
        return Object.entries(countBy)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => a.category.localeCompare(b.category));
    }, [answers]);

    const totalCategoryCount = useMemo(() => categoryCounts.reduce((sum, r) => sum + r.count, 0), [categoryCounts]);

    const departmentCounts = useMemo(() => {
        const countBy: Record<string, number> = {};
        for (const a of answers) {
            const d = (a as any).create_user_department ? String((a as any).create_user_department).trim() : "ไม่ระบุ";
            const key = d || "ไม่ระบุ";
            countBy[key] = (countBy[key] || 0) + 1;
        }
        return Object.entries(countBy)
            .map(([department, count]) => ({ department, count }))
            .sort((a, b) => a.department.localeCompare(b.department));
    }, [answers]);

    useEffect(() => {
        async function load() {
            if (!questionId) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}/answers`);
                if (!res.ok) throw new Error("Failed to load answers");
                const data: Answer[] = await res.json();
                setAnswers(data);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Error loading answers";
                setError(message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [questionId]);

    useEffect(() => {
        const base = process.env.NEXT_PUBLIC_HOST_URL || (typeof window !== "undefined" ? window.location.origin : "");
        if (base && questionId) {
            setQrUrl(`${base}/present-answer/${questionId}`);
        }
    }, [questionId]);

    // Auto refresh answers every 10 seconds
    useEffect(() => {
        if (!questionId) return;
        const id = setInterval(async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}/answers`);
                if (!res.ok) return;
                const data: Answer[] = await res.json();
                setAnswers(data);
            } catch {
                // ignore polling errors
            }
        }, 10000); // 10 seconds loading answers
        return () => clearInterval(id);
    }, [questionId]);

    return (
        <div className="min-h-screen p-0">
            <main className="mx-auto max-w-5xl p-8 space-y-6">

                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <>
                    <h1 className="text-2xl font-bold text-center">สรุปผลการแสดงความคิดเห็น</h1>
                    
                    <div className="grid grid-cols-5 gap-4">
 
                        {/* QR code to present-answer for this question */}
                        <section className="flex items-start justify-center gap-6  ">
                            <div className="space-y-2">
                                <p className="text-sm opacity-80">สแกนเพื่อไปยังหน้าตอบคำถาม</p>
                                <div className="inline-block rounded-md border border-black/10 dark:border-white/20 bg-white p-3 dark:bg-white">
                                    <QRCodeCanvas value={qrUrl || `${process.env.NEXT_PUBLIC_HOST_URL}/present-answer/${questionId}`} size={160} includeMargin />
                                </div>
                            </div>
                        </section>

                        {/* Word cloud from answer_keywords */}
                        <section className="space-y-3 col-span-4" >
                            
                            {/* <h3 className="text-lg font-semibold">Keyword Word Cloud</h3> */}
                            <WordCloud categories={(() => {
                                const out: string[] = [];
                                for (const a of answers) {
                                    const raw = (a.answer_keywords || "").trim();
                                    if (!raw) continue;
                                    for (const part of raw.split(',')) {
                                        const kw = part.trim();
                                        if (kw) out.push(kw);
                                    }
                                }
                                return out;
                            })()} />
                        </section>
                        </div>

                        <h1 className="text-2xl font-bold text-center neon-pink">จำนวนไอเดีย {totalCategoryCount} รายการ</h1>

                        <div className="grid grid-cols-5 gap-4">

                            {/* Category counts table */}
                            <section className="space-y-1 col-span-3">
                                {/* <h3 className="text-lg font-semibold">จำนวนตามหมวดหมู่ (Category)</h3> */}

                                <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/20">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-black/5 dark:bg-white/10">
                                            <tr>
                                                <th className="text-left p-3">ประเภทนวัตกรรม</th>
                                                <th className="text-left p-3">จำนวน</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categoryCounts.length === 0 ? (
                                                <tr><td className="p-3" colSpan={2}>No data</td></tr>
                                            ) : (
                                                categoryCounts.map((row) => (
                                                    <tr key={row.category} className="border-t border-black/5 dark:border-white/10">
                                                        <td className="p-3 align-top">{row.category}</td>
                                                        <td className="p-3 align-top text-right">{row.count}</td>
                                                    </tr>
                                                ))
                                            )}
                                            {/* {categoryCounts.length > 0 && (
                                            <tr className="border-t border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/10 font-semibold">
                                                <td className="p-3">รวม</td>
                                                <td className="p-3">{totalCategoryCount}</td>
                                            </tr>
                                        )} */}
                                        </tbody>
                                    </table>
                                </div>
                            </section>



                            {/* Department counts table */}
                            <section className="space-y-1 col-span-2">
                                <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/20">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-black/5 dark:bg-white/10">
                                            <tr>
                                                <th className="text-left p-3">หน่วยงาน</th>
                                                <th className="text-left p-3  text-right">จำนวน</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {departmentCounts.length === 0 ? (
                                                <tr><td className="p-3" colSpan={2}>No data</td></tr>
                                            ) : (
                                                departmentCounts.map((row) => (
                                                    <tr key={row.department} className="border-t border-black/5 dark:border-white/10">
                                                        <td className="p-3 align-top">{row.department}</td>
                                                        <td className="p-3 align-top text-right">{row.count}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>

                        <div className="flex justify-center">
                            <Link
                                href={`/answer_list/${questionId}`}
                                className="mt-3 inline-flex items-center gap-2 rounded-md border-2 border-emerald-400 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-emerald-100 bg-gradient-to-r from-emerald-900/60 to-green-900/40 shadow-[0_0_8px_rgba(16,185,129,0.6),inset_0_0_12px_rgba(16,185,129,0.2)] hover:from-emerald-800/70 hover:to-green-800/60 hover:shadow-[0_0_14px_rgba(16,185,129,0.9),inset_0_0_16px_rgba(16,185,129,0.35)] transition"
                            >
                                <span className="text-emerald-300">»»</span>
                                <span>Answer List</span>
                            </Link>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}


function WordCloud({ categories }: { categories: string[] }) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const data = useMemo(() => {
        const countBy: Record<string, number> = {};
        for (const raw of categories) {
            const key = (raw || "").trim() || "Unknown";
            countBy[key] = (countBy[key] || 0) + 1;
        }
        return Object.entries(countBy)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [categories]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Reuse existing instance if any
        const instance = echarts.getInstanceByDom(el) || echarts.init(el);

        const option = {
            tooltip: {},
            series: [
                {
                    type: "wordCloud",
                    shape: "circle",
                    gridSize: 8,
                    sizeRange: WORDCLOUD_SIZE_RANGE,
                    rotationRange: [0, 0],
                    textStyle: {
                        color: () => {
                            // Pastel-ish random color
                            const r = Math.floor(150 + Math.random() * 100);
                            const g = Math.floor(150 + Math.random() * 100);
                            const b = Math.floor(150 + Math.random() * 100);
                            return `rgb(${r}, ${g}, ${b})`;
                        },
                    },
                    data,
                },
            ],
        } as echarts.EChartsOption;

        instance.setOption(option);

        const onResize = () => instance.resize();
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
            if (!instance.isDisposed()) instance.dispose();
        };
    }, [data]);

    if (data.length === 0) {
        return <p className="text-sm opacity-70">No categories yet</p>;
    }

    return <div ref={containerRef} className="w-full" style={{ height: 320 }} />;
}


