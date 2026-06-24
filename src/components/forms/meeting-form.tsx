"use client";

import { useClickSound } from "@/hooks/use-click-sound";
import type { EventItem, MeetingItem, PostItem } from "@/lib/api";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

interface MeetingFormProps {
	initialData?: MeetingItem;
	events: Pick<EventItem, "id" | "title">[];
	posts: Pick<PostItem, "id" | "title">[];
	prefilledEventId?: string | null;
	prefilledPostId?: string | null;
}

export function MeetingForm({
	initialData,
	events,
	posts,
	prefilledEventId,
	prefilledPostId,
}: MeetingFormProps) {
	const router = useRouter();
	const playClick = useClickSound();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [title, setTitle] = useState(initialData?.title || "");
	const [date, setDate] = useState(initialData?.date || "");
	const [time, setTime] = useState(initialData?.time || "");
	const [eventId, setEventId] = useState(
		initialData?.eventId || prefilledEventId || "",
	);
	const [postId, setPostId] = useState(
		initialData?.postId || prefilledPostId || "",
	);
	const [participants, setParticipants] = useState(
		initialData?.participants || "",
	);
	const [description, setDescription] = useState(
		initialData?.description || "",
	);
	const [status, setStatus] = useState<"scheduled" | "completed">(
		initialData?.status === "completed" ? "completed" : "scheduled",
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		playClick();
		setLoading(true);
		setError("");

		const payload = {
			title,
			date,
			time,
			description,
			eventId: eventId || "",
			postId: postId || "",
			participants,
			status,
		};

		const token = localStorage.getItem("access_token");

		try {
			const url = initialData ? `/api/meetings/${initialData.id}` : "/api/meetings";
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
				throw new Error(data.error || "Failed to save meeting");
			}

			if (initialData) {
				router.push(`/app/meetings/${initialData.id}`);
			} else if (prefilledPostId) {
				router.push(`/app/posts/${prefilledPostId}`);
			} else if (prefilledEventId) {
				router.push(`/app/events/${prefilledEventId}`);
			} else {
				router.push("/app/meetings");
			}
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
					Meeting Title
				</label>
				<input
					type="text"
					required
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g. Sync & Caching Discussion"
					className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] placeholder-[var(--color-muted-foreground)]"
				/>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="flex flex-col gap-1.5">
					<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
						Date
					</label>
					<input
						type="date"
						required
						value={date}
						onChange={(e) => setDate(e.target.value)}
						className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)]"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
						Time
					</label>
					<input
						type="time"
						required
						value={time}
						onChange={(e) => setTime(e.target.value)}
						className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)]"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="flex flex-col gap-1.5">
					<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
						Related Event (Optional)
					</label>
					<select
						value={eventId}
						onChange={(e) => setEventId(e.target.value)}
						className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] cursor-pointer"
					>
						<option value="">None</option>
						{events.map((ev) => (
							<option key={ev.id} value={ev.id}>
								{ev.title}
							</option>
						))}
					</select>
				</div>

				<div className="flex flex-col gap-1.5">
					<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
						Related Post (Optional)
					</label>
					<select
						value={postId}
						onChange={(e) => setPostId(e.target.value)}
						className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] cursor-pointer"
					>
						<option value="">None</option>
						{posts.map((p) => (
							<option key={p.id} value={p.id}>
								{p.title}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
					Participants (Comma-separated)
				</label>
				<input
					type="text"
					value={participants}
					onChange={(e) => setParticipants(e.target.value)}
					placeholder="Sarah Chen, Marcus Aurelius, Alex Rivera"
					className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] placeholder-[var(--color-muted-foreground)]"
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
					Description / Agenda
				</label>
				<textarea
					rows={3}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Briefly state the goal of this sync..."
					className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] placeholder-[var(--color-muted-foreground)] resize-y"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				className="font-mono text-xs uppercase tracking-widest px-4 py-3 bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity rounded-sm mt-2 text-center"
			>
				{loading ? "Saving..." : initialData ? "Update Meeting" : "Schedule Meeting"}
			</button>
		</form>
	);
}
