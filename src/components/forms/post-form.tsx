"use client";

import { useClickSound } from "@/hooks/use-click-sound";
import type { EventItem, PostItem } from "@/lib/api";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { DragDropUpload } from "../shared/drag-drop-upload";

interface PostFormProps {
	initialData?: PostItem;
	events: Pick<EventItem, "id" | "title">[];
}

export function PostForm({ initialData, events }: PostFormProps) {
	const router = useRouter();
	const playClick = useClickSound();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [title, setTitle] = useState(initialData?.title || "");
	const [content, setContent] = useState(initialData?.content || "");
	const [image, setImage] = useState(initialData?.image || "");
	const [eventId, setEventId] = useState(initialData?.eventId || "");
	const [status, setStatus] = useState<"draft" | "published">(
		initialData?.status === "published" ? "published" : "draft",
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		playClick();
		setLoading(true);
		setError("");

		const id =
			initialData?.id ||
			title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)/g, "");

		const payload = {
			id,
			title,
			content,
			image: image || null,
			eventId: eventId || null,
			status,
			publishedAt: status === "published" ? new Date().toISOString() : null,
		};

		const token = localStorage.getItem("access_token");

		try {
			const url = initialData ? `/api/posts/${initialData.id}` : "/api/posts";
			const method = initialData ? "PATCH" : "POST";

			const res = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to save post");
			}

			const created = initialData ? null : await res.json();
			router.push(`/app/posts/${created ? created.id : id}`);
			router.refresh();
		} catch (err: any) {
			setError(err.message || "An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-5 max-w-xl w-full"
		>
			{error && (
				<div className="font-mono text-xs uppercase tracking-widest text-[var(--color-delta-negative)] border border-[var(--color-delta-negative)]/30 bg-[var(--color-delta-negative)]/5 p-3 rounded-sm">
					Error: {error}
				</div>
			)}

			<div className="flex flex-col gap-1.5">
				<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
					Post Title
				</label>
				<input
					type="text"
					required
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g. Tips for Tailwind CSS v4"
					className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] placeholder-[var(--color-muted-foreground)]"
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
					Content
				</label>
				<textarea
					required
					rows={6}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Write your article/discussion details here..."
					className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] placeholder-[var(--color-muted-foreground)] resize-y"
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
					Associated Event (Optional)
				</label>
				<select
					value={eventId}
					onChange={(e) => setEventId(e.target.value)}
					className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] appearance-none cursor-pointer"
				>
					<option value="">None</option>
					{events.map((ev) => (
						<option key={ev.id} value={ev.id}>
							{ev.title}
						</option>
					))}
				</select>
			</div>

			<DragDropUpload
				value={image}
				onChange={setImage}
				label="Post Image"
				placeholder="Drop post image here, or click to upload"
			/>

			<div className="flex flex-col gap-1.5">
				<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
					Publishing Status
				</label>
				<div className="flex gap-2">
					{(["draft", "published"] as const).map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => {
								setStatus(s);
								playClick();
							}}
							className={`font-mono text-[10px] uppercase tracking-widest px-3 py-2 border rounded-sm cursor-pointer transition-colors ${
								status === s
									? "text-[var(--color-foreground)] border-[var(--color-muted)] bg-[var(--color-foreground)]/[0.06]"
									: "text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:text-[var(--color-foreground)]"
							}`}
						>
							{s}
						</button>
					))}
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				className="font-mono text-xs uppercase tracking-widest px-4 py-3 bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity rounded-sm mt-2 text-center"
			>
				{loading ? "Saving..." : initialData ? "Update Post" : "Create Post"}
			</button>
		</form>
	);
}
