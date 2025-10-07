"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PresentAnswerPage() {
	const params = useParams<{ questionId: string }>();
	const questionId = params?.questionId as string;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [question, setQuestion] = useState<any>(null);
	const [answerText, setAnswerText] = useState("");
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`http://localhost:8000/questions/${questionId}`);
				if (!res.ok) throw new Error("Failed to load question");
				const data = await res.json();
				setQuestion(data);
			} catch (e: any) {
				setError(e.message || "Error loading question");
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
		try {
			const res = await fetch("http://localhost:8000/answers", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question_id: questionId, answer_text: answerText }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data?.detail || "Failed to save answer");
			}
			setMessage("Saved successfully");
			setAnswerText("");
		} catch (e: any) {
			setMessage(e.message || "Error occurred");
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
			<main className="w-full max-w-2xl space-y-6">
				{loading ? (
					<p>Loading...</p>
				) : error ? (
					<p className="text-red-600">{error}</p>
				) : (
					<>
						<h1 className="text-3xl font-bold">{question?.question_title}</h1>
						<h2 className="text-xl opacity-80">{question?.question_description || ""}</h2>
						<form onSubmit={handleSave} className="space-y-4">
							<div className="space-y-2">
								<label className="block text-sm font-medium">answer_text</label>
								<textarea
									className="w-full rounded-md border border-black/10 dark:border-white/20 p-2 bg-transparent min-h-[120px]"
									value={answerText}
									onChange={(e) => setAnswerText(e.target.value)}
									required
								/>
							</div>
							<div className="flex items-center gap-3">
								<button
									type="submit"
									disabled={saving}
									className="inline-flex items-center rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-50 dark:bg-white dark:text-black"
								>
									{saving ? "Saving..." : "Save"}
								</button>
								<button
									type="button"
									onClick={handleReset}
									className="inline-flex items-center rounded-md border border-black/10 dark:border-white/20 px-4 py-2 text-sm"
								>
									Reset
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
