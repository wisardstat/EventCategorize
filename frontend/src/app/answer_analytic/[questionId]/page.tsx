"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import * as echarts from "echarts";
import "echarts-wordcloud";

// Change these values to adjust the WordCloud font size range (min, max)
const WORDCLOUD_SIZE_RANGE: [number, number] = [24, 48];

type Answer = {
    answer_id: number;
    question_id: string;
    answer_text: string;
    category: string;
    created_at: string;
};

export default function AnswerAnalyticPage() {
    const params = useParams<{ questionId: string }>();
    const questionId = params?.questionId as string;
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <div className="min-h-screen p-0">
            <main className="mx-auto max-w-5xl p-8 space-y-6">
                <h1 className="text-2xl font-bold">Answer Analytic</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <>
                        {/* Word cloud from categories */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-semibold">Category Word Cloud</h3>
                            <WordCloud categories={answers.map(a => a.category)} />
                        </section>

                        <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/20">
                            <table className="min-w-full text-sm">
                                <thead className="bg-black/5 dark:bg-white/10">
                                    <tr>
                                        <th className="text-left p-3">answer_text</th>
                                        <th className="text-left p-3">category</th>
                                        <th className="text-left p-3">created_at</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {answers.length === 0 ? (
                                        <tr><td className="p-3" colSpan={3}>No data</td></tr>
                                    ) : (
                                        answers.map((a) => (
                                            <tr key={a.answer_id} className="border-t border-black/5 dark:border-white/10">
                                                <td className="p-3 align-top whitespace-pre-wrap">{a.answer_text}</td>
                                                <td className="p-3 align-top">{a.category}</td>
                                                <td className="p-3 align-top">{new Date(a.created_at).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
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


