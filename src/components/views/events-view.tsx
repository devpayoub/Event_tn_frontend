"use client";

import { useToast } from "@/components/shared/toast";
import { SectionCard } from "@/components/layout/page-container";
import { useClickSound } from "@/hooks/use-click-sound";
import type { EventItem } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";

interface EventsViewProps {
	initialEvents: EventItem[];
}

export function EventsView({ initialEvents }: EventsViewProps) {
	const router = useRouter();
	const playClick = useClickSound();
	const { toast } = useToast();
	const [events, setEvents] = useState<EventItem[]>(initialEvents);
	const [isAuth, setIsAuth] = useState(false);

	useEffect(() => {
		setIsAuth(!!localStorage.getItem("access_token"));
	}, []);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "published" | "draft"
	>("all");

	// Filter and Search Logic
	const filteredEvents = useMemo(() => {
		return events.filter((ev) => {
			const matchesSearch =
				ev.title.toLowerCase().includes(search.toLowerCase()) ||
				ev.description.toLowerCase().includes(search.toLowerCase()) ||
				ev.location.toLowerCase().includes(search.toLowerCase());

			const matchesStatus =
				statusFilter === "all" || ev.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [events, search, statusFilter]);

	// Mutate Functions
	const togglePublish = async (
		id: string,
		currentStatus: "published" | "draft",
	) => {
		playClick();
		const nextStatus = currentStatus === "published" ? "draft" : "published";

		const token = localStorage.getItem("access_token");
		try {
			const res = await fetch(`/api/events/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({ status: nextStatus }),
			});

			if (res.ok) {
				setEvents((prev) =>
					prev.map((e) => (e.id === id ? { ...e, status: nextStatus } : e)),
				);
				toast("success", `Event ${nextStatus === "published" ? "published" : "unpublished"} successfully`);
				router.refresh();
			} else {
				toast("error", "Failed to toggle publish status");
			}
		} catch (err) {
			toast("error", "Failed to toggle publish status");
		}
	};

	const handleDelete = async (id: string) => {
		playClick();

		const delToken = localStorage.getItem("access_token");
		try {
			const res = await fetch(`/api/events/${id}`, {
				method: "DELETE",
				headers: delToken ? { Authorization: `Bearer ${delToken}` } : {},
			});

			if (res.ok) {
				setEvents((prev) => prev.filter((e) => e.id !== id));
				toast("success", "Event deleted successfully");
				router.refresh();
			} else {
				toast("error", "Failed to delete event");
			}
		} catch (err) {
			toast("error", "Failed to delete event");
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Toolbar: Search and Filter */}
			<div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
				{/* Search Input */}
				<div className="relative flex-1 max-w-md">
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search events by title, description, or location..."
						className="font-mono text-xs w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] placeholder-[var(--color-muted-foreground)]"
					/>
					{search && (
						<button
							type="button"
							onClick={() => setSearch("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
						>
							Clear
						</button>
					)}
				</div>

				{/* Filter Tabs */}
				<div className="flex gap-1 border border-[var(--color-border)] p-0.5 rounded-sm bg-[var(--color-background)] shrink-0 self-start md:self-auto">
					{(["all", "published", "draft"] as const).map((status) => (
						<button
							key={status}
							type="button"
							onClick={() => {
								setStatusFilter(status);
								playClick();
							}}
							className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
								statusFilter === status
									? "text-[var(--color-foreground)] bg-[var(--color-foreground)]/[0.06] font-semibold"
									: "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
							}`}
						>
							{status}
						</button>
					))}
				</div>
			</div>

			{/* Event Grid */}
			{filteredEvents.length === 0 ? (
				<div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded-sm">
					<p className="font-mono text-xs text-[var(--color-muted-foreground)]">
						No events found matching your search and filters.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{filteredEvents.map((event) => {
						const isDraft = event.status === "draft";
						return (
							<SectionCard
								key={event.id}
								className="relative group overflow-hidden flex flex-col h-full"
							>
								<div className="relative w-full h-40 overflow-hidden border border-[var(--color-border)] rounded-sm bg-[var(--color-border-subtle)] mb-4">
									{event.coverImage && (
									/* eslint-disable-next-line @next/next/no-img-element */
									<img
										src={event.coverImage}
										alt={event.title}
										className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-300"
									/>
									)}
									<span
										className={`absolute top-3 left-3 font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 border rounded-sm ${
											isDraft
												? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
												: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
										}`}
									>
										{event.status}
									</span>
								</div>

								<div className="flex-1 flex flex-col justify-between">
									<div className="flex flex-col gap-2">
										<div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-muted-foreground)]">
											<span>
												{event.date} • {event.time}
											</span>
											<span className="truncate max-w-[150px]">
												{event.location}
											</span>
										</div>
										<h3 className="font-[family-name:var(--font-geist-pixel-square)] text-base font-bold tracking-wider uppercase text-[var(--color-foreground)] line-clamp-1">
											{event.title}
										</h3>
										<p className="font-sans text-xs text-[var(--color-muted-foreground)] line-clamp-2 leading-relaxed">
											{event.description}
										</p>
									</div>

									{/* Action buttons */}
									<div className="flex items-center gap-2 mt-5 pt-3 border-t border-[var(--color-border-subtle)]">
										<Link
											href={`/app/events/${event.id}`}
											className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1.5 border border-[var(--color-border)] hover:bg-[var(--color-foreground)]/[0.04] transition-colors rounded-sm text-center shrink-0"
										>
											Details
										</Link>
										{isAuth && (
											<>
												<button
													type="button"
													onClick={() => togglePublish(event.id, event.status as "published" | "draft")}
													className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1.5 border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors rounded-sm cursor-pointer shrink-0"
												>
													{isDraft ? "Publish" : "Draft"}
												</button>
												<button
													type="button"
													onClick={() => handleDelete(event.id)}
													className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1.5 border border-transparent text-[var(--color-delta-negative)] hover:border-[var(--color-delta-negative)] transition-colors rounded-sm cursor-pointer ml-auto"
												>
													×
												</button>
											</>
										)}
									</div>
								</div>
							</SectionCard>
						);
					})}
				</div>
			)}
		</div>
	);
}
