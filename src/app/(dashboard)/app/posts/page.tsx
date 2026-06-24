import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { PostsView } from "@/components/views/posts-view";
import { API_BASE_URL } from "@/lib/server-config";
import { cookies } from "next/headers";
import Link from "next/link";
import React from "react";

export default async function PostsPage() {
	const [postsRes, eventsRes] = await Promise.all([
		fetch(`${API_BASE_URL}/api/posts`).then((r) => r.json()),
		fetch(`${API_BASE_URL}/api/events?limit=0`).then((r) => r.json()),
	]) as any[];
	const { items: initialPosts, total, pages } = postsRes;
	const events = (eventsRes as any).items ?? [];

	const allCommentsRes = await Promise.all(
		(initialPosts as any[]).map((p) =>
			fetch(`${API_BASE_URL}/api/comments?postId=${p.id}`).then((r) =>
				r.json(),
			),
		),
	);
	const comments = allCommentsRes.flat();

	const cookieStore = await cookies();
	const isAuth = cookieStore.get("logged_in")?.value === "true";

	return (
		<PageContainer>
			<PageHeader
				title="Discussion Board"
				subtitle="Announcements, design updates, and workshop logs"
				actions={
					isAuth ? (
						<Link
							href="/app/create?type=post"
							className="font-mono text-[10px] uppercase tracking-widest px-3 py-2 bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-95 transition-opacity rounded-sm"
						>
							+ Create Post
						</Link>
					) : undefined
				}
			/>
			<PostsView initialPosts={initialPosts ?? []} events={events} comments={comments} initialTotal={total ?? 0} initialPages={pages ?? 1} />
		</PageContainer>
	);
}
