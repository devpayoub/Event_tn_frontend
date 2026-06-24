"use client";

import { useConfirm } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { SectionCard } from "@/components/layout/page-container";
import { useClickSound } from "@/hooks/use-click-sound";
import type { CommentItem, EventItem, PostItem } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";

interface PostsViewProps {
	initialPosts: PostItem[];
	events: Pick<EventItem, "id" | "title">[];
	comments: CommentItem[];
}

export function PostsView({ initialPosts, events, comments }: PostsViewProps) {
	const 	router = useRouter();
	const playClick = useClickSound();
	const { toast } = useToast();
	const { confirm } = useConfirm();
	const [posts, setPosts] = useState<PostItem[]>(initialPosts);
	const [isAuth, setIsAuth] = useState(false);

	useEffect(() => {
		setIsAuth(!!localStorage.getItem("access_token"));
	}, []);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "published" | "draft"
	>("all");

	const eventMap = useMemo(() => {
		return new Map(events.map((e) => [e.id, e.title]));
	}, [events]);

	// Filter and Search Logic
	const filteredPosts = useMemo(() => {
		return posts.filter((post) => {
			const matchesSearch =
				post.title.toLowerCase().includes(search.toLowerCase()) ||
				post.content.toLowerCase().includes(search.toLowerCase());

			const matchesStatus =
				statusFilter === "all" || post.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [posts, search, statusFilter]);

	// Count comments per post
	const getCommentCount = (postId: string) => {
		return comments.filter((c) => c.postId === postId).length;
	};

	// Mutate Functions
	const togglePublish = async (
		id: string,
		currentStatus: "published" | "draft",
	) => {
		playClick();
		const nextStatus = currentStatus === "published" ? "draft" : "published";

		const token = localStorage.getItem("access_token");
		try {
			const res = await fetch(`/api/posts/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					status: nextStatus,
					publishedAt:
						nextStatus === "published" ? new Date().toISOString() : null,
				}),
			});

			if (res.ok) {
				setPosts((prev) =>
					prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)),
				);
				toast("success", `Post ${nextStatus === "published" ? "published" : "unpublished"} successfully`);
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
		const ok = await confirm({
			title: "Delete Post",
			message: "Are you sure you want to delete this post? This action cannot be undone.",
			confirmLabel: "Delete",
			variant: "danger",
		});
		if (!ok) return;

		const delToken = localStorage.getItem("access_token");
		try {
			const res = await fetch(`/api/posts/${id}`, {
				method: "DELETE",
				headers: delToken ? { Authorization: `Bearer ${delToken}` } : {},
			});

			if (res.ok) {
				setPosts((prev) => prev.filter((p) => p.id !== id));
				toast("success", "Post deleted successfully");
				router.refresh();
			} else {
				toast("error", "Failed to delete post");
			}
		} catch (err) {
			toast("error", "Failed to delete post");
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Toolbar */}
			<div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
				{/* Search Input */}
				<div className="relative flex-1 max-w-md">
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search posts..."
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

			{/* Posts Grid */}
			{filteredPosts.length === 0 ? (
				<div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded-sm">
					<p className="font-mono text-xs text-[var(--color-muted-foreground)]">
						No posts found matching your search and filters.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredPosts.map((post) => {
						const commentCount = getCommentCount(post.id);
						const eventTitle = post.eventId ? eventMap.get(post.eventId) : null;
						const isDraft = post.status === "draft";

						return (
							<SectionCard
								key={post.id}
								className="flex flex-col justify-between h-full group"
							>
								<div className="flex flex-col gap-3">
									<div className="flex justify-between items-start gap-2">
										<span className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
											{post.status}
										</span>
										{eventTitle && (
											<span className="font-mono text-[8px] uppercase tracking-widest bg-[var(--color-foreground)]/[0.04] border border-[var(--color-border)] px-1.5 py-0.5 rounded-sm max-w-[150px] truncate text-[var(--color-muted-foreground)]">
												{eventTitle}
											</span>
										)}
									</div>

									{post.image && (
										<div className="w-full h-32 overflow-hidden border border-[var(--color-border)] rounded-sm bg-[var(--color-border-subtle)] relative">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={post.image}
												alt={post.title}
												className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-300"
											/>
										</div>
									)}

									<h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-foreground)] font-semibold truncate mt-1">
										{post.title}
									</h3>
									<p className="font-sans text-xs text-[var(--color-muted-foreground)] line-clamp-3 leading-relaxed">
										{post.content}
									</p>
								</div>

								{/* Action Bar */}
								<div className="mt-5 pt-3 border-t border-[var(--color-border-subtle)] flex flex-col gap-3">
									{/* Info Indicators */}
									<div className="flex justify-between items-center text-[9px] font-mono text-[var(--color-muted-foreground)]">
										<span>{commentCount} comments</span>
										<span>{post.likes} likes</span>
									</div>

									{/* Action Button Row */}
									<div className="flex items-center gap-2">
										<Link
											href={`/app/posts/${post.id}`}
											className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border border-[var(--color-border)] hover:bg-[var(--color-foreground)]/[0.04] transition-colors rounded-sm text-center shrink-0"
										>
											Read Thread
										</Link>
										{isAuth && (
											<>
												<button
													type="button"
													onClick={() => togglePublish(post.id, post.status as "published" | "draft")}
													className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors rounded-sm cursor-pointer shrink-0"
												>
													{isDraft ? "Publish" : "Draft"}
												</button>
												<button
													type="button"
													onClick={() => handleDelete(post.id)}
													className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border border-transparent text-[var(--color-delta-negative)] hover:border-[var(--color-delta-negative)] transition-colors rounded-sm cursor-pointer ml-auto"
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
