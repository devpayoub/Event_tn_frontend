import {
	PageContainer,
	PageHeader,
	SectionCard,
} from "@/components/layout/page-container";
import { API_BASE_URL } from "@/lib/server-config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";

export default async function MeetingsPage() {
	const cookieStore = await cookies();
	if (cookieStore.get("logged_in")?.value !== "true") redirect("/login");
	const [meetings, eventsRes, postsRes] = await Promise.all([
		fetch(`${API_BASE_URL}/api/meetings`).then((r) => r.json()),
		fetch(`${API_BASE_URL}/api/events?limit=0`).then((r) => r.json()),
		fetch(`${API_BASE_URL}/api/posts?limit=0`).then((r) => r.json()),
	]);
	const events = (eventsRes as any).items ?? [];
	const posts = (postsRes as any).items ?? [];

	const eventMap = new Map((events as any[]).map((e: any) => [e.id, e]));
	const postMap = new Map((posts as any[]).map((p: any) => [p.id, p]));

	const sortedMeetings = [...(meetings as any[])].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);

	return (
		<PageContainer>
			<PageHeader
				title="Sync Meetings"
				subtitle="Coordinate schedules, design reviews, and virtual syncs"
				actions={
					<Link
						href="/app/create?type=meeting"
						className="font-mono text-[10px] uppercase tracking-widest px-3 py-2 bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-95 transition-opacity rounded-sm"
					>
						+ Schedule Sync
					</Link>
				}
			/>

			{sortedMeetings.length === 0 ? (
				<div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded-sm">
					<p className="font-mono text-xs text-[var(--color-muted-foreground)]">
						No sync meetings scheduled.
					</p>
					<Link
						href="/app/create?type=meeting"
						className="mt-3 inline-block font-mono text-[10px] uppercase tracking-widest border border-[var(--color-border)] px-3 py-1.5 hover:bg-[var(--color-foreground)]/[0.04]"
					>
						Schedule a Sync
					</Link>
				</div>
			) : (
				<div className="flex flex-col gap-4">
					{sortedMeetings.map((meeting: any) => {
						const relatedEvent = meeting.eventId
							? eventMap.get(meeting.eventId)
							: null;
						const relatedPost = meeting.postId
							? postMap.get(meeting.postId)
							: null;

						return (
							<SectionCard key={meeting.id} hoverable={false} className="gap-4">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-3">
									<div className="flex flex-col gap-0.5">
										<Link href={`/app/meetings/${meeting.id}`} className="font-mono text-xs uppercase tracking-wider text-[var(--color-foreground)] font-semibold leading-snug hover:text-[var(--color-muted-foreground)] transition-colors">
											{meeting.title}
										</Link>
									</div>
									<div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono text-[10px] uppercase tracking-widest bg-[var(--color-foreground)]/[0.04] border border-[var(--color-border)] px-2.5 py-1 rounded-sm">
										<span>📅 {meeting.date}</span>
										<span className="text-[var(--color-muted-foreground)]">|</span>
										<span className="text-emerald-500 font-semibold">
											{meeting.time}
										</span>
									</div>
								</div>

								<p className="font-sans text-xs text-[var(--color-muted-foreground)] leading-relaxed">
									{meeting.description}
								</p>

								<div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between pt-3 border-t border-[var(--color-border-subtle)]">
									<div className="flex flex-wrap items-center gap-1.5">
										<span className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-muted-foreground)] mr-1">
											Joined:
										</span>
										{(meeting.participants || "").split(",").map((p: string) => p.trim()).filter(Boolean).map((p: string) => (
											<span
												key={p}
												className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 border border-[var(--color-border)] rounded-sm text-[var(--color-foreground)] bg-[var(--color-foreground)]/[0.02]"
											>
												{p}
											</span>
										))}
									</div>

									<div className="flex items-center gap-2 shrink-0">
										<Link
											href={`/app/meetings/${meeting.id}`}
											className="font-mono text-[8px] uppercase tracking-widest border border-[var(--color-border)] px-2 py-0.5 rounded-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
										>
											Details
										</Link>
										{relatedEvent && (
											<Link
												href={`/app/events/${relatedEvent.id}`}
												className="font-mono text-[8px] uppercase tracking-widest bg-emerald-500/5 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-sm hover:opacity-80 transition-opacity"
											>
												Event: {relatedEvent.title}
											</Link>
										)}
										{relatedPost && (
											<Link
												href={`/app/posts/${relatedPost.id}`}
												className="font-mono text-[8px] uppercase tracking-widest bg-blue-500/5 text-blue-600 border border-blue-500/20 px-2 py-0.5 rounded-sm hover:opacity-80 transition-opacity"
											>
												Post: {relatedPost.title}
											</Link>
										)}
									</div>
								</div>
							</SectionCard>
						);
					})}
				</div>
			)}
		</PageContainer>
	);
}
