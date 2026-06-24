import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { PostDetailView } from "@/components/views/post-detail-view";
import { API_BASE_URL } from "@/lib/server-config";
import { notFound } from "next/navigation";
import React from "react";

export default async function PostDetailPage({
	params,
}: {
	params: Promise<{ postId: string }>;
}) {
	const { postId } = await params;

	const postRes = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
	if (!postRes.ok) notFound();
	const post = await postRes.json();

	const [comments, meetingsRes] = await Promise.all([
		fetch(`${API_BASE_URL}/api/comments?postId=${postId}`).then((r) => r.json()),
		fetch(`${API_BASE_URL}/api/meetings`).then((r) => r.json()),
	]);

	const meetings = meetingsRes.filter((m: any) => m.postId === postId);
	const event = post.eventId
		? await fetch(`${API_BASE_URL}/api/events/${post.eventId}`)
				.then((r) => (r.ok ? r.json() : null))
				.catch(() => null)
		: null;

	return (
		<PageContainer>
			<PageHeader
				title={post.title}
				subtitle={post.status === "draft" ? "Draft Mode" : "Thread / Discussion"}
				backHref="/app/posts"
			/>
			<PostDetailView
				post={post}
				event={event}
				initialComments={comments}
				meetings={meetings}
			/>
		</PageContainer>
	);
}
