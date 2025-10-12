"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PresentAnswerPage() {
	const params = useParams<{ questionId: string }>();
	const questionId = params?.questionId as string;
	const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
type Question = { question_id: string; question_title: string; question_description?: string | null };
const [question, setQuestion] = useState<Question | null>(null);
	const [answerText, setAnswerText] = useState("");
	const [createUserName, setCreateUserName] = useState("");
	const [createUserDepartment, setCreateUserDepartment] = useState("");
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [answers, setAnswers] = useState<{
		answer_id: number;
		question_id: string;
		answer_text: string;
		category: string;
		create_user_name?: string | null;
		create_user_department?: string | null;
		answer_keywords?: string | null;
		created_at: string;
	}[]>([]);
	const [loadingAnswers, setLoadingAnswers] = useState(false);
// QR code not used currently on this page

	useEffect(() => {
		async function load() {
			setLoading(true);
			setError(null);
			try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}`);
				if (!res.ok) throw new Error("Failed to load question");
				const data = await res.json();
				setQuestion(data);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Error loading question";
                setError(message);
			} finally {
				setLoading(false);
			}
		}
		if (questionId) {
			load();
		}
	}, [questionId]);

// Removed unused QR url state/effect

	async function loadAnswers() {
		if (!questionId) return;
		setLoadingAnswers(true);
		try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}/answers`);
			if (!res.ok) throw new Error("Failed to load answers");
			const data = await res.json();
			setAnswers(data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoadingAnswers(false);
		}
	}

	useEffect(() => {
		loadAnswers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [questionId]);

	async function handleSave(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setMessage(null);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answers`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question_id: questionId,
                answer_text: answerText,
                create_user_name: createUserName,
                create_user_department: createUserDepartment,
            }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data?.detail || "Failed to save answer");
			}
			setMessage("Saved successfully");
			setAnswerText("");
        setCreateUserName("");
        setCreateUserDepartment("");
			await loadAnswers();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error occurred";
        setMessage(message);
		} finally {
			setSaving(false);
		}
	}

	function handleReset() {
		setAnswerText("");
		setMessage(null);
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-8">
			<main className="w-full max-w-4xl space-y-6">
				{loading ? (
					<p>Loading...</p>
				) : error ? (
					<p className="text-red-600">{error}</p>
				) : (
					<>
					
					{/* <section className="flex items-start justify-center gap-6">
						<div className="space-y-2">
							<p className="text-sm opacity-80">Scan to open this page:</p>
							<div className="inline-block rounded-md border border-black/10 dark:border-white/20 bg-white p-3 dark:bg-white">
								<QRCodeCanvas value={qrUrl || `${process.env.NEXT_PUBLIC_HOST_URL}/present-answer/${questionId}`} size={160} includeMargin />
							</div>
						</div>
					</section> */}

					<h1 className="text-3xl font-bold text-center">{question?.question_title}</h1>
					
						<h2 className="text-xl opacity-80 text-center">{question?.question_description || ""}</h2>

						<div className="flex justify-center">
							<Link
								href={`/answer_analytic/${questionId}`}
								className="mt-3 inline-flex items-center gap-2 rounded-md border-2 border-emerald-400 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-emerald-100 bg-gradient-to-r from-emerald-900/60 to-green-900/40 shadow-[0_0_8px_rgba(16,185,129,0.6),inset_0_0_12px_rgba(16,185,129,0.2)] hover:from-emerald-800/70 hover:to-green-800/60 hover:shadow-[0_0_14px_rgba(16,185,129,0.9),inset_0_0_16px_rgba(16,185,129,0.35)] transition"
							>
								<span className="text-emerald-300">»»</span>
								<span>Dashboard</span>
							</Link>
						</div>

						<form onSubmit={handleSave} className="space-y-4">
							
							<div className="space-y-2">
								<label className="block text-sm font-medium">เชิญแสดงความคิดเห็นของท่าน</label>
								<textarea
									className="w-full rounded-md border border-black/10 dark:border-white/20 p-2 bg-transparent min-h-[120px]"
									value={answerText}
									onChange={(e) => setAnswerText(e.target.value)}
									required
								/>
							</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="block text-sm font-medium">ชื่อผู้ตอบคำถาม</label>
								<input
									type="text"  placeholder="เช่น นายสมชาย เข็มกลัด เป็นต้น"
									className="w-full rounded-md border border-black/10 dark:border-white/20 p-2 bg-transparent"
									value={createUserName}
									onChange={(e) => setCreateUserName(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium">หน่วยงานผู้ตอบคำถาม</label>
								<input
									type="text" placeholder="เช่น วพ. บข. สบ. เป็นต้น"
									className="w-full rounded-md border border-black/10 dark:border-white/20 p-2 bg-transparent"
									value={createUserDepartment}
									onChange={(e) => setCreateUserDepartment(e.target.value)}
								/>
							</div>
						</div>
							<div className="flex items-center gap-3">
								<button
									type="submit"
									disabled={saving}
									className="inline-flex items-center rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-50 dark:bg-white dark:text-black"
								>
									{saving ? "Saving..." : "ส่งความคิดเห็น"}
								</button>
								<button
									type="button"
									onClick={handleReset}
									className="inline-flex items-center rounded-md border border-black/10 dark:border-white/20 px-4 py-2 text-sm"
								>
									เริ่มใหม่/Reset
								</button>
							</div>
							{message && <p className="text-sm">{message}</p>}
						</form>

						<section className="space-y-3">
							<h3 className="text-lg font-semibold">แสดงความคิดเห็นทั้งหมด</h3>
							<div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/20">
								<table className="min-w-full text-sm">
									<thead className="bg-black/5 dark:bg-white/10">
										<tr>
											<th className="text-left p-3">ความคิดเห็น</th>
																						
											<th className="text-left p-3">Update</th>
										</tr>
									</thead>
									<tbody>
										{loadingAnswers ? (
											<tr><td className="p-3" colSpan={6}>Loading...</td></tr>
										) : answers.length === 0 ? (
											<tr><td className="p-3" colSpan={6}>No data</td></tr>
										) : (
											answers.map((a) => (
												<tr key={a.answer_id} className="border-t border-black/5 dark:border-white/10">
													<td className="p-3 align-top whitespace-pre-wrap">

													<div className="text-yellow-500">
														<b> ชื่อผู้ตอบคำถาม : </b> {a.create_user_name || "-"}
														&nbsp;&nbsp; <b>หน่วยงานผู้ตอบคำถาม : </b> {a.create_user_department || "-"}
													</div>
													<br /><br /> {a.answer_text}

													<div className="text-blue-300">

														<br /><br /> <b  >หมวดหมู่ : </b> {a.category}
														<br /> <b  >คำสำคัญ : </b>  {(a.answer_keywords || "").split(",").filter(Boolean).map((k, i) => (
															<span key={i} className="inline-block mr-2 mb-1 rounded bg-black/10 dark:bg-white/10 px-2 py-0.5 text-xs">{k.trim()}</span>
														))}
													</div>

													</td>
													
													 
													<td className="p-3 align-top">{new Date(a.created_at).toLocaleString()}</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</section>
					</>
				)}
			</main>
		</div>
	);
}
