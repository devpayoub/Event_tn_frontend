"use client";

import { useToast } from "@/components/shared/toast";
import { useClickSound } from "@/hooks/use-click-sound";
import type { EventItem } from "@/lib/api";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { DragDropUpload } from "../shared/drag-drop-upload";

interface EventFormProps {
	initialData?: EventItem;
}

export function EventForm({ initialData }: EventFormProps) {
	const router = useRouter();
	const playClick = useClickSound();
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [title, setTitle] = useState(initialData?.title || "");
	const [description, setDescription] = useState(
		initialData?.description || "",
	);
	const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
	const [ticketUrl, setTicketUrl] = useState(initialData?.ticketUrl || "");
	const [date, setDate] = useState(initialData?.date || "");
	const [time, setTime] = useState(initialData?.time || "");
	const [location, setLocation] = useState(initialData?.location || "");
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
			description,
			coverImage:
				coverImage ||
				"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&h=450&q=80",
			date,
			time,
			location,
			status,
			ticketUrl: ticketUrl || undefined,
		};

		const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

		try {
			const url = initialData ? `/api/events/${initialData.id}` : "/api/events";
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
				throw new Error(data.error || "Failed to save event");
			}

			const created = initialData ? null : await res.json();
			toast("success", initialData ? "Event updated successfully" : "Event created successfully");
			router.push(`/app/events/${created ? created.id : id}`);
		} catch (err: any) {
			setError(err.message || "An unexpected error occurred");
			toast("error", err.message || "An unexpected error occurred");
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
					Event Title
				</label>
				<input
					type="text"
					required
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g. Design Systems Summit"
					className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] placeholder-[var(--color-muted-foreground)]"
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
					Description
				</label>
				<textarea
					required
					rows={4}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Provide details about the event topic, speakers, or schedule..."
					className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] placeholder-[var(--color-muted-foreground)] resize-y"
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

			<div className="flex flex-col gap-1.5">
				<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
					Location
				</label>
				<input
					type="text"
					required
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					placeholder="e.g. San Francisco, CA / Zoom"
					className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] placeholder-[var(--color-muted-foreground)]"
				/>
			</div>

			<DragDropUpload
				value={coverImage}
				onChange={setCoverImage}
				label="Cover Image"
				placeholder="Drop cover image here, or click to upload"
			/>

			<div className="flex flex-col gap-1.5">
				<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
					Ticket Purchase URL (Optional)
				</label>
				<input
					type="url"
					value={ticketUrl}
					onChange={(e) => setTicketUrl(e.target.value)}
					placeholder="e.g. https://tickets.example.com/event-123"
					className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] placeholder-[var(--color-muted-foreground)]"
				/>
			</div>

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
				{loading ? "Saving..." : initialData ? "Update Event" : "Create Event"}
			</button>
		</form>
	);
}
