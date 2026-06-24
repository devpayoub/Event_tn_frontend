import { MeetingForm } from "@/components/forms/meeting-form";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { API_BASE_URL } from "@/lib/server-config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function MeetingCreatePage({
	searchParams,
}: {
	searchParams: Promise<{ eventId?: string; postId?: string }>;
}) {
	const cookieStore = await cookies();
	if (cookieStore.get("logged_in")?.value !== "true") redirect("/login");
	const params = await searchParams;
	const [events, posts] = await Promise.all([
		fetch(`${API_BASE_URL}/api/events`).then((r) => r.json()),
		fetch(`${API_BASE_URL}/api/posts`).then((r) => r.json()),
	]);

	return (
		<PageContainer>
			<PageHeader
				title="Schedule Sync"
				subtitle="Coordinate a virtual review session"
				backHref="/app/meetings"
			/>
			<div className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-5 sm:p-6 md:p-8 flex justify-center">
				<MeetingForm
					events={events}
					posts={posts}
					prefilledEventId={params.eventId}
					prefilledPostId={params.postId}
				/>
			</div>
		</PageContainer>
	);
}
