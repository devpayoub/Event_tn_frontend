"use client";

import { useToast } from "@/components/shared/toast";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { MeetingForm } from "@/components/forms/meeting-form";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";

export default function MeetingDetailPage() {
	const params = useParams<{ meetingId: string }>();
	const 	router = useRouter();
	const { toast } = useToast();
	const [meeting, setMeeting] = useState<any>(null);
	const [events, setEvents] = useState<any[]>([]);
	const [posts, setPosts] = useState<any[]>([]);
	const [editing, setEditing] = useState(false);
	const [isAuth, setIsAuth] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		setIsAuth(!!token);
		const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

		Promise.all([
			fetch(`/api/meetings/${params.meetingId}`, { headers: authHeaders }).then((r) => (r.ok ? r.json() : null)),
			fetch("/api/events").then((r) => r.json()),
			fetch("/api/posts").then((r) => r.json()),
		])
			.then(([m, evts, psts]) => {
				if (!m) { router.push("/app/meetings"); return; }
				setMeeting(m);
				setEvents(evts);
				setPosts(psts);
			})
			.catch(() => router.push("/app/meetings"))
			.finally(() => setLoading(false));
	}, [params.meetingId, router]);

	const handleDelete = async () => {
		const token = localStorage.getItem("access_token");
		const res = await fetch(`/api/meetings/${params.meetingId}`, {
			method: "DELETE",
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
		if (res.ok) {
			toast("success", "Meeting deleted successfully");
			router.push("/app/meetings");
		} else {
			toast("error", "Failed to delete meeting");
		}
	};

	if (loading) {
		return (
			<PageContainer>
				<div className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-foreground)] py-12 text-center">Loading...</div>
			</PageContainer>
		);
	}

	if (!meeting) return null;

	if (editing) {
		return (
			<PageContainer>
				<PageHeader title="Edit Meeting" subtitle={meeting.title} backHref={`/app/meetings/${params.meetingId}`} />
				<div className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-5 sm:p-6 md:p-8 flex justify-center">
					<MeetingForm
						initialData={meeting}
						events={events}
						posts={posts}
						prefilledEventId={meeting.eventId}
						prefilledPostId={meeting.postId}
					/>
				</div>
			</PageContainer>
		);
	}

	const participants = meeting.participants ? meeting.participants.split(",").map((p: string) => p.trim()).filter(Boolean) : [];

	return (
		<PageContainer>
			<PageHeader
				title={meeting.title}
				subtitle={meeting.status === "completed" ? "Completed" : "Scheduled"}
				backHref="/app/meetings"
			/>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
				<div className="lg:col-span-2 flex flex-col gap-5">
					{meeting.description && (
						<div className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-5">
							<p className="font-sans text-sm text-[var(--color-foreground)] leading-relaxed">{meeting.description}</p>
						</div>
					)}
				</div>

				<div className="flex flex-col gap-6">
					<div className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-5 flex flex-col gap-4">
						<h3 className="font-[family-name:var(--font-geist-pixel-square)] text-xs font-bold tracking-widest uppercase border-b border-[var(--color-border)] pb-2">
							Quick Info
						</h3>
						<div className="flex flex-col gap-3 font-mono text-[10px] uppercase tracking-widest">
							<div className="flex justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-1.5">
								<span className="text-[var(--color-muted-foreground)]">Date:</span>
								<span className="text-[var(--color-foreground)] font-semibold">{meeting.date}</span>
							</div>
							<div className="flex justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-1.5">
								<span className="text-[var(--color-muted-foreground)]">Time:</span>
								<span className="text-[var(--color-foreground)] font-semibold">{meeting.time}</span>
							</div>
							<div className="flex justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-1.5">
								<span className="text-[var(--color-muted-foreground)]">Status:</span>
								<span className={`font-semibold ${meeting.status === "completed" ? "text-emerald-500" : "text-yellow-500"}`}>
									{meeting.status}
								</span>
							</div>
							{participants.length > 0 && (
								<div className="flex flex-col gap-2 border-b border-[var(--color-border-subtle)] pb-1.5">
									<span className="text-[var(--color-muted-foreground)]">Participants:</span>
									<div className="flex flex-wrap gap-1">
										{participants.map((p: string) => (
											<span key={p} className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 border border-[var(--color-border)] rounded-sm text-[var(--color-foreground)] bg-[var(--color-foreground)]/[0.02]">
												{p}
											</span>
										))}
									</div>
								</div>
							)}
							<div className="flex justify-between gap-2">
								<span className="text-[var(--color-muted-foreground)]">Host:</span>
								<span className="text-[var(--color-foreground)] font-semibold">{meeting.authorName}</span>
							</div>
						</div>
					</div>

					{isAuth && (
						<div className="flex gap-2">
							<button type="button" onClick={() => setEditing(true)} className="flex-1 font-mono text-[10px] uppercase tracking-widest px-3 py-2 border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/[0.04] transition-colors rounded-sm cursor-pointer text-center">
								Edit
							</button>
							<button type="button" onClick={handleDelete} className="flex-1 font-mono text-[10px] uppercase tracking-widest px-3 py-2 border border-transparent text-[var(--color-delta-negative)] hover:border-[var(--color-delta-negative)] transition-colors rounded-sm cursor-pointer text-center">
								Delete
							</button>
						</div>
					)}
				</div>
			</div>
		</PageContainer>
	);
}
