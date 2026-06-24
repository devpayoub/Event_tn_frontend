import {
	PageContainer,
	PageHeader,
	SectionCard,
} from "@/components/layout/page-container";
import { EventDetailView } from "@/components/views/event-detail-view";
import { API_BASE_URL } from "@/lib/server-config";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

export default async function EventDetailPage({
	params,
}: {
	params: Promise<{ eventId: string }>;
}) {
	const { eventId } = await params;

	const [eventRes, allPosts, allMeetings, comments] = await Promise.all([
		fetch(`${API_BASE_URL}/api/events/${eventId}`).then((r) => {
			if (!r.ok) throw new Error("not found");
			return r.json() as Promise<Record<string, unknown>>;
		}).catch(() => null),
		fetch(`${API_BASE_URL}/api/posts`).then((r) => r.json()) as Promise<Record<string, unknown>[]>,
		fetch(`${API_BASE_URL}/api/meetings`).then((r) => r.json()) as Promise<Record<string, unknown>[]>,
		fetch(`${API_BASE_URL}/api/comments?eventId=${eventId}`).then((r) => r.json()) as Promise<Record<string, unknown>[]>,
	]);

	const event = eventRes as { id: string; title: string; description: string; date: string; time: string; location: string; coverImage: string; authorName: string; status?: string; ticketUrl?: string } | null;
	if (!event) notFound();

	const relatedPosts = allPosts.filter((p: Record<string, unknown>) => p.eventId === eventId);
	const relatedMeetings = allMeetings.filter((m: Record<string, unknown>) => m.eventId === eventId);

	return (
		<PageContainer>
			<PageHeader
				title={event.title}
				subtitle={`${event.date} • ${event.time}`}
				backHref="/app/events"
				actions={
					<div className="flex items-center gap-2">
						{event.ticketUrl && (
							<a
								href={event.ticketUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="font-mono text-[10px] uppercase tracking-widest px-3 py-2 bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity rounded-sm cursor-pointer"
							>
								🎟 Buy Tickets
							</a>
						)}
						<Link
							href={`/app/meetings/create?eventId=${event.id}`}
							className="font-mono text-[10px] uppercase tracking-widest px-3 py-2 border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/[0.04] transition-colors rounded-sm"
						>
							⏰ Schedule Sync
						</Link>
					</div>
				}
			/>

			<div className="relative w-full h-64 sm:h-80 border border-[var(--color-border)] rounded-sm overflow-hidden bg-[var(--color-border-subtle)]">
				{event.coverImage && (
					<img
						src={event.coverImage}
						alt={event.title}
						className="w-full h-full object-cover rounded-sm"
					/>
				)}
				<span
					className={`absolute top-4 left-4 font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 border rounded-sm ${
						event.status === "draft"
							? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
							: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
					}`}
				>
					{event.status}
				</span>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
				<div className="lg:col-span-2 flex flex-col gap-6">
					<div className="flex flex-col gap-3">
						<h2 className="font-[family-name:var(--font-geist-pixel-square)] text-xs font-bold tracking-widest uppercase border-b border-[var(--color-border)] pb-2.5">
							About the Event
						</h2>
						<p className="font-sans text-sm text-[var(--color-foreground)] leading-relaxed whitespace-pre-wrap">
							{event.description}
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<h2 className="font-[family-name:var(--font-geist-pixel-square)] text-xs font-bold tracking-widest uppercase border-b border-[var(--color-border)] pb-2.5">
							Associated Discussions & Updates
						</h2>
						{relatedPosts.length === 0 ? (
							<p className="font-mono text-[10px] text-[var(--color-muted-foreground)] py-2">
								No posts related to this event.
							</p>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{relatedPosts.map((post: Record<string, unknown>) => (
									<SectionCard key={post.id as string}>
										<div className="flex flex-col gap-2.5 h-full justify-between">
											<div className="flex flex-col gap-1.5">
												<span className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
													{post.status as string}
												</span>
												<h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-foreground)] font-semibold truncate">
													{post.title as string}
												</h3>
												<p className="font-sans text-xs text-[var(--color-muted-foreground)] line-clamp-2">
													{post.content as string}
												</p>
											</div>
											<Link
												href={`/app/posts/${post.id as string}`}
												className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-foreground)] hover:text-[var(--color-muted-foreground)] pt-3 border-t border-[var(--color-border-subtle)] block"
											>
												Read thread →
											</Link>
										</div>
									</SectionCard>
								))}
							</div>
						)}
					</div>

					<EventDetailView eventId={eventId} initialComments={comments as any} />
				</div>

				<div className="flex flex-col gap-6">
					<div className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-5 flex flex-col gap-4">
						<h3 className="font-[family-name:var(--font-geist-pixel-square)] text-xs font-bold tracking-widest uppercase border-b border-[var(--color-border)] pb-2">
							Quick Info
						</h3>
						<div className="flex flex-col gap-3 font-mono text-[10px] uppercase tracking-widest">
							<div className="flex justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-1.5">
								<span className="text-[var(--color-muted-foreground)]">Date:</span>
								<span className="text-[var(--color-foreground)] font-semibold">{event.date}</span>
							</div>
							<div className="flex justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-1.5">
								<span className="text-[var(--color-muted-foreground)]">Time:</span>
								<span className="text-[var(--color-foreground)] font-semibold">{event.time}</span>
							</div>
							<div className="flex justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-1.5">
								<span className="text-[var(--color-muted-foreground)]">Location:</span>
								<span className="text-[var(--color-foreground)] font-semibold text-right max-w-[150px] truncate">
									{event.location}
								</span>
							</div>
							{event.ticketUrl && (
								<div className="flex justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-1.5">
									<span className="text-[var(--color-muted-foreground)]">Tickets:</span>
									<a
										href={event.ticketUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-[var(--color-foreground)] hover:underline truncate font-semibold cursor-pointer"
									>
										Get Tickets ↗
									</a>
								</div>
							)}
							<div className="flex justify-between gap-2">
								<span className="text-[var(--color-muted-foreground)]">Host:</span>
								<span className="text-[var(--color-foreground)] font-semibold">{event.authorName}</span>
							</div>
						</div>
					</div>

					<div className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-5 flex flex-col gap-4">
						<div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
							<h3 className="font-[family-name:var(--font-geist-pixel-square)] text-xs font-bold tracking-widest uppercase">
								Scheduled Syncs
							</h3>
						</div>
						{relatedMeetings.length === 0 ? (
							<div className="text-center py-4 flex flex-col gap-2">
								<p className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
									No meetings scheduled for this event.
								</p>
							</div>
						) : (
							<div className="flex flex-col gap-3">
								{relatedMeetings.map((meeting: Record<string, unknown>) => (
									<div
										key={meeting.id as string}
										className="border border-[var(--color-border)] bg-[var(--color-border-subtle)] rounded-sm p-3.5 flex flex-col gap-1.5"
									>
										<div className="flex justify-between items-start">
											<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-foreground)] font-semibold truncate pr-2">
												{meeting.title as string}
											</span>
											<span className="font-mono text-[8px] uppercase tracking-widest text-emerald-500 font-semibold">
												{meeting.time as string}
											</span>
										</div>
										<p className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
											{meeting.date as string}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
