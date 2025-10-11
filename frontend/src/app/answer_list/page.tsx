"use client";

import { useEffect, useState } from "react";

type Answer = {
    answer_id: number;
    question_id: string;
    answer_text: string;
    category: string;
    answer_keywords?: string | null;
    create_user_name?: string | null;
    create_user_department?: string | null;
    created_at: string;
};

export default function AnswerListPage() {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answers`);
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
    }, []);

    return (
        <div className="min-h-screen p-8">
            <main className="mx-auto max-w-6xl space-y-6">
                <h1 className="text-2xl font-bold">แสดงความคิดเห็นทั้งหมด</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/20">
                        <table className="min-w-full text-sm">
                            <thead className="bg-black/5 dark:bg-white/10">
                                <tr>
                                    <th className="text-left p-3">create_user_name</th>
                                    <th className="text-left p-3">create_user_department</th>
                                    <th className="text-left p-3">answer_text</th>
                                    <th className="text-left p-3">category</th>
                                    <th className="text-left p-3">keywords</th>
                                    <th className="text-left p-3">created_at</th>
                                </tr>
                            </thead>
                            <tbody>
                                {answers.length === 0 ? (
                                    <tr><td className="p-3" colSpan={6}>No data</td></tr>
                                ) : (
                                    answers.map((a) => (
                                        <tr key={a.answer_id} className="border-t border-black/5 dark:border-white/10">
                                            <td className="p-3 align-top">{a.create_user_name || "-"}</td>
                                            <td className="p-3 align-top">{a.create_user_department || "-"}</td>
                                            <td className="p-3 align-top whitespace-pre-wrap">{a.answer_text}</td>
                                            <td className="p-3 align-top">{a.category}</td>
                                            <td className="p-3 align-top">{a.answer_keywords || ""}</td>
                                            <td className="p-3 align-top">{new Date(a.created_at).toLocaleString()}</td>
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


