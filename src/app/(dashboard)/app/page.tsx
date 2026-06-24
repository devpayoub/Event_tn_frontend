import { PageContainer, SectionCard } from "@/components/layout/page-container";
import type { EventItem } from "@/lib/api";
import { API_BASE_URL } from "@/lib/server-config";
import Link from "next/link";
import React from "react";

export default async function HomePage() {
	const events = await fetch(`${API_BASE_URL}/api/events`).then((r) => r.json()) as EventItem[];

	const sortedEvents = [...events].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);

	return (
		<PageContainer>
			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-2">
					<h1 className="font-[family-name:var(--font-geist-pixel-square)] text-3xl font-bold tracking-wider uppercase text-[var(--color-foreground)]">
						Events
					</h1>
					<p className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
						Explore upcoming events, discussions, and sync meetings
					</p>
				</div>

				{sortedEvents.length === 0 ? (
					<div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded-sm">
						<p className="font-mono text-xs text-[var(--color-muted-foreground)]">
							No events scheduled yet.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{sortedEvents.map((event) => {
							const isDraft = event.status === "draft";
							return (
								<Link key={event.id} href={`/app/events/${event.id}`} className="group block">
									<SectionCard className="relative overflow-hidden flex flex-col h-full">
										<div className="relative w-full h-40 overflow-hidden border border-[var(--color-border)] rounded-sm bg-[var(--color-border-subtle)] mb-4">
											{event.coverImage && (
												<img
													src={event.coverImage}
													alt={event.title}
													className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
												/>
											)}
											{isDraft && (
												<span className="absolute top-3 left-3 font-mono text-[8px] uppercase tracking-widest bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-2 py-0.5 rounded-sm">
													Draft
												</span>
											)}
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
												<h3 className="font-[family-name:var(--font-geist-pixel-square)] text-base font-bold tracking-wider uppercase text-[var(--color-foreground)] line-clamp-1 group-hover:text-[var(--color-muted-foreground)] transition-colors">
													{event.title}
												</h3>
												<p className="font-sans text-xs text-[var(--color-muted-foreground)] line-clamp-2 leading-relaxed">
													{event.description}
												</p>
											</div>

											<div className="flex items-center gap-2 mt-5 pt-3 border-t border-[var(--color-border-subtle)]">
												<span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
													Hosted by {event.authorName}
												</span>
												<span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-foreground)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
													View Details →
												</span>
											</div>
										</div>
									</SectionCard>
								</Link>
							);
						})}
					</div>
				)}
			</div>
		</PageContainer>
	);
}
