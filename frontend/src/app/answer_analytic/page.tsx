"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Question = {
    question_id: string;
    question_title: string;
    question_description?: string | null;
};

export default function AnswerAnalyticIndexPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("http://localhost:8000/questions");
                if (!res.ok) throw new Error("Failed to load questions");
                const data: Question[] = await res.json();
                setQuestions(data);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Error loading questions";
                setError(message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="min-h-screen p-0">
            <main className="mx-auto max-w-5xl p-8 space-y-6">
                <h1 className="text-2xl font-bold">Answer Analytics</h1>

                <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/20">
                    <table className="min-w-full text-sm">
                        <thead className="bg-black/5 dark:bg-white/10">
                            <tr>
                                <th className="text-left p-3">select</th>
                                <th className="text-left p-3">question_id</th>
                                <th className="text-left p-3">title</th>
                                <th className="text-left p-3">description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td className="p-3" colSpan={4}>Loading...</td></tr>
                            ) : error ? (
                                <tr><td className="p-3 text-red-600" colSpan={4}>{error}</td></tr>
                            ) : questions.length === 0 ? (
                                <tr><td className="p-3" colSpan={4}>No data</td></tr>
                            ) : (
                                questions.map((q) => (
                                    <tr key={q.question_id} className="border-t border-black/5 dark:border-white/10">
                                        <td className="p-3 align-top">
                                            <Link href={`/answer_analytic/${q.question_id}`} className="inline-flex items-center rounded-md border border-black/10 dark:border-white/20 px-3 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10">
                                                goto analytic
                                            </Link>
                                        </td>
                                        <td className="p-3 align-top">{q.question_id}</td>
                                        <td className="p-3 align-top">{q.question_title}</td>
                                        <td className="p-3 align-top">{q.question_description || ""}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}


