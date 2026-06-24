import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { EventsView } from "@/components/views/events-view";
import { API_BASE_URL } from "@/lib/server-config";
import { cookies } from "next/headers";
import Link from "next/link";
import React from "react";

export default async function EventsPage() {
	const eventsRes = await fetch(`${API_BASE_URL}/api/events`).then((r) => r.json()) as any;
	const { items: initialEvents, total, pages } = eventsRes;
	const cookieStore = await cookies();
	const isAuth = cookieStore.get("logged_in")?.value === "true";

	return (
		<PageContainer>
			<PageHeader
				title="Events Directory"
				subtitle="Explore and coordinate scheduling profiles"
				actions={
					isAuth ? (
						<Link
							href="/app/create?type=event"
							className="font-mono text-[10px] uppercase tracking-widest px-3 py-2 bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-95 transition-opacity rounded-sm"
						>
							+ Create Event
						</Link>
					) : undefined
				}
			/>
			<EventsView initialEvents={initialEvents ?? []} initialTotal={total ?? 0} initialPages={pages ?? 1} />
		</PageContainer>
	);
}
