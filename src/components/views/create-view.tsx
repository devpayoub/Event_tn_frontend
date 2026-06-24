"use client";

import { SectionCard } from "@/components/layout/page-container";
import { useClickSound } from "@/hooks/use-click-sound";
import type { EventItem, PostItem } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { EventForm } from "../forms/event-form";
import { MeetingForm } from "../forms/meeting-form";
import { PostForm } from "../forms/post-form";

interface CreateViewProps {
	events: Pick<EventItem, "id" | "title">[];
	posts: Pick<PostItem, "id" | "title">[];
}

export function CreateView({ events, posts }: CreateViewProps) {
	const searchParams = useSearchParams();
	const playClick = useClickSound();

	const initialType = searchParams.get("type") as "event" | "post" | "meeting" | null;
	const editId = searchParams.get("editId");

	const [activeType, setActiveType] = useState<"event" | "post" | "meeting" | null>(initialType);
	const [editData, setEditData] = useState<any>(null);
	const [loadingEdit, setLoadingEdit] = useState(!!editId);

	useEffect(() => {
		if (!editId) return;
		const type = activeType || initialType;
		if (!type) return;
		const token = localStorage.getItem("access_token");
		const endpoint = type === "event" ? `/api/events/${editId}` : `/api/posts/${editId}`;
		fetch(endpoint, {
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		})
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (data) setEditData(data);
			})
			.finally(() => setLoadingEdit(false));
	}, [editId, activeType, initialType]);

	const handleSelectType = (type: "event" | "post" | "meeting") => {
		playClick();
		setActiveType(type);
	};

	if (!activeType) {
		return (
			<div className="flex flex-col gap-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
					<SectionCard onClick={() => handleSelectType("event")} className="flex flex-col items-center justify-center text-center p-8 gap-4 min-h-[220px]">
						<span className="text-4xl">📅</span>
						<div className="flex flex-col gap-1">
							<h3 className="font-[family-name:var(--font-geist-pixel-square)] text-base font-bold tracking-widest uppercase">Create Event</h3>
							<p className="font-sans text-xs text-[var(--color-muted-foreground)]">Draft or publish summit profiles, workshop sessions, or meetups.</p>
						</div>
					</SectionCard>
					<SectionCard onClick={() => handleSelectType("post")} className="flex flex-col items-center justify-center text-center p-8 gap-4 min-h-[220px]">
						<span className="text-4xl">✍</span>
						<div className="flex flex-col gap-1">
							<h3 className="font-[family-name:var(--font-geist-pixel-square)] text-base font-bold tracking-widest uppercase">Create Post</h3>
							<p className="font-sans text-xs text-[var(--color-muted-foreground)]">Publish announcements, update threads, or write design logs.</p>
						</div>
					</SectionCard>
					<SectionCard onClick={() => handleSelectType("meeting")} className="flex flex-col items-center justify-center text-center p-8 gap-4 min-h-[220px]">
						<span className="text-4xl">⏰</span>
						<div className="flex flex-col gap-1">
							<h3 className="font-[family-name:var(--font-geist-pixel-square)] text-base font-bold tracking-widest uppercase">Schedule Sync</h3>
							<p className="font-sans text-xs text-[var(--color-muted-foreground)]">Coordinate virtual reviews or calendar tasks related to updates.</p>
						</div>
					</SectionCard>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
				<button type="button" onClick={() => { setActiveType(null); setEditData(null); playClick(); }} className="font-mono text-xs uppercase tracking-widest border border-[var(--color-border)] px-2.5 py-1.5 hover:bg-[var(--color-foreground)]/[0.04] transition-colors rounded-sm cursor-pointer">← Hub</button>
				<div className="flex gap-1.5 border border-[var(--color-border)] p-0.5 bg-[var(--color-background)] rounded-sm ml-auto">
					{(["event", "post", "meeting"] as const).map((type) => (
						<button key={type} type="button" onClick={() => handleSelectType(type)} className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${activeType === type ? "text-[var(--color-foreground)] bg-[var(--color-foreground)]/[0.06] font-semibold" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"}`}>{type}</button>
					))}
				</div>
			</div>

			{loadingEdit ? (
				<div className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-foreground)] py-12 text-center">Loading...</div>
			) : (
				<div className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-5 sm:p-6 md:p-8 flex justify-center">
					{activeType === "event" && <EventForm initialData={editData} />}
					{activeType === "post" && <PostForm events={events} initialData={editData} />}
					{activeType === "meeting" && (
						<MeetingForm events={events} posts={posts} prefilledEventId={searchParams.get("eventId")} prefilledPostId={searchParams.get("postId")} />
					)}
				</div>
			)}
		</div>
	);
}
