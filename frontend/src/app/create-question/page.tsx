"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Question = {
	question_id: string;
	question_title: string;
	question_description?: string | null;
};

export default function CreateQuestionPage() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [loadingList, setLoadingList] = useState(false);

	async function handleDelete(questionId: string) {
		if (!confirm("Are you sure you want to delete this question and its answers?")) return;
		try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}`, { method: "DELETE" });
			if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as unknown;
            const detail = (data && typeof data === "object" && "detail" in (data as Record<string, unknown>))
                ? (data as Record<string, unknown>).detail as string
                : "Failed to delete question";
            throw new Error(detail);
			}
			await loadQuestions();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Delete failed";
        alert(message);
		}
	}

	async function loadQuestions() {
		setLoadingList(true);
		try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`);
			if (!res.ok) throw new Error("Failed to load questions");
			const data = await res.json();
			setQuestions(data);
    } catch (err) {
        console.error(err);
		} finally {
			setLoadingList(false);
		}
	}

	useEffect(() => {
		loadQuestions();
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		console.log("title:", title, "description:", description);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ "question_title": title, "question_description": description }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data?.detail || "Failed to save question");
			}
			setMessage("Saved successfully");
			setTitle("");
			setDescription("");
			await loadQuestions();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error occurred";
        setMessage(message);
		} finally {
			setLoading(false);
		}
	}

	function handleReset() {
		setTitle("");
		setDescription("");
		setMessage(null);
	}

	return (
		<div className="min-h-screen flex items-top justify-center p-8">
			<main className="w-full max-w-5xl space-y-8">
				<h1 className="text-2xl font-bold text-center roboto-bold">สร้างโจทย์ปัญหา</h1>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label className="block text-sm font-medium">หัวข้อโจทย์ปัญหา</label>
						<input
							type="text"
							className="w-full rounded-md border border-black/10 dark:border-white/20 p-2 bg-transparent"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium">รายละเอียดโจทย์ปัญหา</label>
						<textarea
							className="w-full rounded-md border border-black/10 dark:border-white/20 p-2 bg-transparent min-h-[120px]"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<div className="flex items-center gap-3">
						<button
							type="submit"
							disabled={loading}
							className="inline-flex items-center rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-50 dark:bg-white dark:text-black"
						>
							{loading ? "Saving..." : "สร้างโจทย์ปัญหา / Create Question"}
						</button>
						<button
							type="button"
							onClick={handleReset}
							className="inline-flex items-center rounded-md border border-black/10 dark:border-white/20 px-4 py-2 text-sm"
						>
							เริ่มใหม่/Reset
						</button>
						<Link
							href="/"
							className="inline-flex items-center rounded-md border border-black/10 dark:border-white/20 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
						>
							Home
						</Link>
					</div>

					{message && (
						<p className="text-sm text-center">{message}</p>
					)}
				</form>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">แสดงโจทย์ปัญหาทั้งหมด</h2>
					<div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/20">
						<table className="min-w-full text-sm">
							<thead className="bg-black/5 dark:bg-white/10">
								<tr>
								<th className="text-left p-3"></th>
								<th className="text-left p-3"></th>								
									<th className="text-left p-3">โจทย์ปัญหา</th>
									<th className="text-left p-3">รายละเอียด</th>
								<th className="text-left p-3">ลบ</th>
								</tr>
							</thead>
							<tbody>
								{loadingList ? (
								<tr><td className="p-3" colSpan={6}>Loading...</td></tr>
								) : questions.length === 0 ? (
								<tr><td className="p-3" colSpan={6}>ไม่พบรายการ</td></tr>
								) : (
									questions.map((q) => (
										<tr key={q.question_id} className="border-t border-black/5 dark:border-white/10">
											<td className="p-3 align-top">
												<Link href={`/present-answer/${q.question_id}`} className="inline-flex items-center rounded-md border border-black/10 dark:border-white/20 px-3 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10">
													ความคิดเห็น
												</Link>
											</td>
										<td className="p-3 align-top">
											<Link href={`/answer_analytic/${q.question_id}`} className="inline-flex items-center rounded-md border border-black/10 dark:border-white/20 px-3 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10">
												Dashboard
											</Link>
										</td>
											
											<td className="p-3 align-top">{q.question_title}</td>
											<td className="p-3 align-top">{q.question_description || ""}</td>
										<td className="p-3 align-top">
											<button
												onClick={() => handleDelete(q.question_id)}
												className="inline-flex items-center rounded-md border border-red-300 text-red-700 px-3 py-1 text-xs hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
											>
												ลบ
											</button>
										</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</section>
			</main>
		</div>
	);
}
