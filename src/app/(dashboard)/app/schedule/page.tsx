import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { API_BASE_URL } from "@/lib/server-config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";

interface AgendaItem {
	id: string;
	title: string;
	time: string;
	date: string;
	type: "event" | "post" | "meeting";
	detail: string;
	link: string;
}

export default async function SchedulePage() {
	const cookieStore = await cookies();
	if (cookieStore.get("logged_in")?.value !== "true") redirect("/login");
	const [events, posts, meetings] = await Promise.all([
		fetch(`${API_BASE_URL}/api/events`).then((r) => r.json()),
		fetch(`${API_BASE_URL}/api/posts`).then((r) => r.json()),
		fetch(`${API_BASE_URL}/api/meetings`).then((r) => r.json()),
	]);

	const agendaItems: AgendaItem[] = [];

	for (const event of events as any[]) {
		agendaItems.push({
			id: event.id,
			title: event.title,
			time: event.time || "00:00",
			date: event.date,
			type: "event",
			detail: `Location: ${event.location}`,
			link: `/app/events/${event.id}`,
		});
	}

	for (const post of posts as any[]) {
		const d = new Date(post.created_at || post.createdAt);
		if (isNaN(d.getTime())) continue;
		const dateStr = d.toISOString().split("T")[0];
		const timeStr = d.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
		});
		agendaItems.push({
			id: post.id,
			title: post.title,
			time: timeStr,
			date: dateStr,
			type: "post",
			detail: `Status: ${post.status}`,
			link: `/app/posts/${post.id}`,
		});
	}

	for (const meeting of meetings as any[]) {
		agendaItems.push({
			id: meeting.id,
			title: meeting.title,
			time: meeting.time,
			date: meeting.date,
			type: "meeting",
			detail: `${(meeting.participants || "").split(",").filter(Boolean).length} participants joined`,
			link: `/app/meetings/${meeting.id}`,
		});
	}

	agendaItems.sort((a, b) => {
		const dateCompare = a.date.localeCompare(b.date);
		if (dateCompare !== 0) return dateCompare;
		return a.time.localeCompare(b.time);
	});

	const groups: { [dateStr: string]: AgendaItem[] } = {};
	for (const item of agendaItems) {
		if (!groups[item.date]) groups[item.date] = [];
		groups[item.date].push(item);
	}

	const sortedDates = Object.keys(groups).sort();

	const formatDateLabel = (dateStr: string) => {
		const d = new Date(dateStr);
		return d.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getTypeBadgeStyle = (type: "event" | "post" | "meeting") => {
		if (type === "event") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
		if (type === "post") return "bg-blue-500/10 text-blue-500 border-blue-500/20";
		return "bg-purple-500/10 text-purple-500 border-purple-500/20";
	};

	return (
		<PageContainer>
			<PageHeader
				title="Schedule Planning"
				subtitle="Chronological timeline of posts, events, and sync meetings"
				actions={
					<Link
						href="/app/create?type=meeting"
						className="font-mono text-[10px] uppercase tracking-widest px-3 py-2 border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/[0.04] transition-colors rounded-sm"
					>
						⏰ Schedule Sync
					</Link>
				}
			/>

			{sortedDates.length === 0 ? (
				<div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded-sm">
					<p className="font-mono text-xs text-[var(--color-muted-foreground)]">
						No scheduled items found in the system.
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-6 md:gap-8">
					{sortedDates.map((dateStr) => {
						const items = groups[dateStr];
						return (
							<div
								key={dateStr}
								className="flex flex-col md:flex-row gap-4 md:gap-8 items-start"
							>
								<div className="w-full md:w-48 shrink-0 sticky top-0 md:top-6 bg-[var(--color-background)] py-1.5 md:py-0 border-b md:border-b-0 border-[var(--color-border)] z-10">
									<h3 className="font-[family-name:var(--font-geist-pixel-square)] text-xs md:text-sm font-bold tracking-wider uppercase text-[var(--color-foreground)]">
										{formatDateLabel(dateStr)}
									</h3>
									<p className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-muted-foreground)] mt-0.5">
										{items.length} items scheduled
									</p>
								</div>

								<div className="flex-1 w-full flex flex-col gap-3">
									{items.map((item) => (
										<div
											key={`${item.type}-${item.id}`}
											className="flex items-center gap-4 p-4 border border-[var(--color-border)] rounded-sm bg-[var(--color-background)] hover:border-[var(--color-muted)] hover:bg-[var(--color-foreground)]/[0.005] transition-all"
										>
											<div className="font-mono text-[11px] font-semibold text-[var(--color-foreground)] shrink-0 w-12 text-left">
												{item.time}
											</div>
											<div className="w-[1px] h-8 bg-[var(--color-border)] shrink-0" />
											<span
												className={`font-mono text-[7px] uppercase tracking-widest px-2 py-0.5 border rounded-sm shrink-0 w-16 text-center ${getTypeBadgeStyle(
													item.type,
												)}`}
											>
												{item.type}
											</span>
											<div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
												<div className="min-w-0">
													<Link
														href={item.link}
														className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-foreground)] font-semibold hover:text-[var(--color-muted-foreground)] transition-colors truncate block"
													>
														{item.title}
													</Link>
													<p className="font-sans text-[11px] text-[var(--color-muted-foreground)] truncate mt-0.5">
														{item.detail}
													</p>
												</div>
												<Link
													href={item.link}
													className="font-mono text-[9px] uppercase tracking-widest border border-[var(--color-border)] px-2 py-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-muted)] transition-colors rounded-sm shrink-0 self-start sm:self-auto text-center"
												>
													View
												</Link>
											</div>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</PageContainer>
	);
}
