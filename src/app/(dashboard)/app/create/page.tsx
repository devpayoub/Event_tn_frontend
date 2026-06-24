import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { CreateView } from "@/components/views/create-view";
import { API_BASE_URL } from "@/lib/server-config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

export default async function CreatePage() {
	const cookieStore = await cookies();
	if (cookieStore.get("logged_in")?.value !== "true") redirect("/login");
	const [events, posts] = await Promise.all([
		fetch(`${API_BASE_URL}/api/events`).then((r) => r.json()),
		fetch(`${API_BASE_URL}/api/posts`).then((r) => r.json()),
	]);

	return (
		<PageContainer>
			<PageHeader
				title="Creation Hub"
				subtitle="Add new content profiles and scheduled syncs"
			/>
			<Suspense
				fallback={
					<div className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-foreground)] py-12 text-center">
						Loading Hub...
					</div>
				}
			>
				<CreateView events={events} posts={posts} />
			</Suspense>
		</PageContainer>
	);
}
