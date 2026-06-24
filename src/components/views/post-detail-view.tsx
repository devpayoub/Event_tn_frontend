"use client";

import { SectionCard } from "@/components/layout/page-container";
import { CommentComposer } from "@/components/shared/comment-composer";
import { useClickSound } from "@/hooks/use-click-sound";
import type {
	CommentItem,
	EventItem,
	MeetingItem,
	PostItem,
	UserProfile,
} from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";

interface PostDetailViewProps {
	post: PostItem;
	event: EventItem | null;
	initialComments: CommentItem[];
	meetings: MeetingItem[];
}

export function PostDetailView({
	post,
	event,
	initialComments,
	meetings,
}: PostDetailViewProps) {
	const router = useRouter();
	const playClick = useClickSound();
	const [comments, setComments] = useState<CommentItem[]>(initialComments);
	const [likes, setLikes] = useState(post.likes);
	const [hasLiked, setHasLiked] = useState(false);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);

	React.useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) return;
		fetch("/api/user/profile", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((r) => r.json())
			.then((data) => {
				if (data.name) {
					setProfile({
						id: data.id,
						name: data.name,
						role: data.role || "Event Contributor",
						avatar:
							data.avatar ||
							"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
						email: data.email,
					});
					if (data.id && post.likedBy?.includes(data.id)) {
						setHasLiked(true);
					}
				}
			})
			.catch(console.error);
	}, [post.likedBy]);

	// Separate parent comments from replies
	const parentComments = useMemo(() => {
		return comments.filter((c) => !c.parentId);
	}, [comments]);

	const repliesMap = useMemo(() => {
		const map = new Map<string, CommentItem[]>();
		for (const comment of comments) {
			if (comment.parentId) {
				const list = map.get(comment.parentId) || [];
				list.push(comment);
				map.set(comment.parentId, list);
			}
		}
		// Sort replies by timestamp asc
		for (const [parentId, list] of map.entries()) {
			list.sort(
				(a, b) =>
					new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
			);
		}
		return map;
	}, [comments]);

	const handleLike = async () => {
		playClick();
		const prevLikes = likes;
		const prevHasLiked = hasLiked;
		setHasLiked(!hasLiked);
		setLikes(hasLiked ? likes - 1 : likes + 1);

		const token = localStorage.getItem("access_token");
		try {
			const res = await fetch(`/api/posts/${post.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({ likes: 1 }),
			});
			if (!res.ok) throw new Error("Failed to update likes");
			const updated = await res.json();
			setLikes(updated.likes);
			if (profile?.id) {
				setHasLiked(updated.likedBy?.includes(profile.id) ?? false);
			}
		} catch (err) {
			setLikes(prevLikes);
			setHasLiked(prevHasLiked);
		}
	};

	const handleCommentPosted = () => {
		router.refresh();
	};

	// We can update local state when initialComments props change
	React.useEffect(() => {
		setComments(initialComments);
	}, [initialComments]);

	const formatDate = (isoStr: string) => {
		const d = new Date(isoStr);
		return d.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
			{/* Main Column */}
			<div className="lg:col-span-2 flex flex-col gap-6">
				{/* Post Article */}
				<SectionCard hoverable={false} className="gap-4">
					<div className="flex justify-between items-center text-[10px] font-mono text-[var(--color-muted-foreground)]">
						<span>
							{post.publishedAt ? formatDate(post.publishedAt) : "Draft Mode"}
						</span>
						{event && (
							<Link
								href={`/app/events/${event.id}`}
								className="hover:text-[var(--color-foreground)] border border-[var(--color-border)] px-2 py-0.5 rounded-sm bg-[var(--color-foreground)]/[0.02]"
							>
								{event.title}
							</Link>
						)}
					</div>

					{post.image && (
						<div className="w-full h-64 sm:h-80 overflow-hidden border border-[var(--color-border)] rounded-sm bg-[var(--color-border-subtle)] relative">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={post.image}
								alt={post.title}
								className="object-cover w-full h-full"
							/>
						</div>
					)}

					<div className="font-sans text-sm text-[var(--color-foreground)] leading-relaxed whitespace-pre-wrap mt-2">
						{post.content}
					</div>

					<div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
						<button
							type="button"
							onClick={handleLike}
							className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 border rounded-sm transition-colors cursor-pointer ${
								hasLiked
									? "text-red-500 border-red-500/30 bg-red-500/5"
									: "text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:text-[var(--color-foreground)]"
							}`}
						>
							♥ {likes} Likes
						</button>
						<span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-muted-foreground)] ml-auto">
							{comments.length} Comments
						</span>
					</div>
				</SectionCard>

				{/* Discussions (Comments) */}
				<div className="flex flex-col gap-5">
					<div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
						<h2 className="font-[family-name:var(--font-geist-pixel-square)] text-sm font-bold tracking-widest uppercase">
							Discussions ({comments.length})
						</h2>
						<Link
							href={`/app/meetings/create?postId=${post.id}${
								event ? `&eventId=${event.id}` : ""
							}`}
							className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-foreground)] border border-[var(--color-border)] px-2.5 py-1 hover:bg-[var(--color-foreground)]/[0.04] transition-colors rounded-sm"
						>
							⏰ Schedule Sync
						</Link>
					</div>

					{/* Composer */}
					<div className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-4">
						{profile ? (
							<CommentComposer
								postId={post.id}
								profile={profile}
								onSuccess={handleCommentPosted}
							/>
						) : (
							<p className="font-mono text-xs text-[var(--color-muted-foreground)] text-center py-2">
								Sign in to join the discussion.
							</p>
						)}
					</div>

					{/* Comments List */}
					{parentComments.length === 0 ? (
						<div className="text-center py-8 border border-dashed border-[var(--color-border)] rounded-sm">
							<p className="font-mono text-xs text-[var(--color-muted-foreground)]">
								No comments yet. Start the conversation!
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-4">
							{parentComments.map((comment) => {
								const replies = repliesMap.get(comment.id) || [];
								const isReplying = replyingTo === comment.id;

								return (
									<div
										key={comment.id}
										className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-4 flex flex-col gap-3"
									>
										{/* Comment Header */}
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-2">
												<div className="w-7 h-7 rounded-full overflow-hidden border border-[var(--color-border)]">
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img
														src={comment.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
														alt={comment.authorName}
														className="object-cover w-full h-full"
													/>
												</div>
												<div className="flex flex-col">
													<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-foreground)] font-semibold">
														{comment.authorName}
													</span>
													<span className="font-mono text-[7px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
														{formatDate(comment.timestamp)}
													</span>
												</div>
											</div>
										</div>

										{/* Comment Text */}
										<p className="font-sans text-xs text-[var(--color-foreground)] leading-relaxed pl-9">
											{comment.content}
										</p>

										{/* Comment Actions (Reply toggle) */}
										<div className="pl-9 flex gap-4">
											<button
												type="button"
												onClick={() => {
													setReplyingTo(isReplying ? null : comment.id);
													playClick();
												}}
												className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"
											>
												{isReplying ? "Cancel" : "Reply"}
											</button>
										</div>

										{/* Inline Reply Composer */}
										{isReplying && profile && (
											<div className="pl-9 mt-2 border-l border-[var(--color-border)] py-1">
												<CommentComposer
													postId={post.id}
													profile={profile}
													parentId={comment.id}
													onSuccess={() => {
														setReplyingTo(null);
														handleCommentPosted();
													}}
												/>
											</div>
										)}

										{/* Replies List */}
										{replies.length > 0 && (
											<div className="pl-9 flex flex-col gap-3 mt-3 border-l border-[var(--color-border)]">
												{replies.map((reply) => (
													<div
														key={reply.id}
														className="flex flex-col gap-1.5 pt-1.5"
													>
														<div className="flex items-center gap-2">
															<div className="w-6 h-6 rounded-full overflow-hidden border border-[var(--color-border)]">
																{/* eslint-disable-next-line @next/next/no-img-element */}
																<img
																	src={reply.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
																	alt={reply.authorName}
																	className="object-cover w-full h-full"
																/>
															</div>
															<div className="flex flex-col">
																<span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-foreground)] font-semibold">
																	{reply.authorName}
																</span>
																<span className="font-mono text-[7px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
																	{formatDate(reply.timestamp)}
																</span>
															</div>
														</div>
														<p className="font-sans text-xs text-[var(--color-foreground)] leading-relaxed pl-8">
															{reply.content}
														</p>
													</div>
												))}
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* Sidebar Column: Context Detail */}
			<div className="flex flex-col gap-6">
				{/* Associated Event Details Card */}
				{event && (
					<div className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-5 flex flex-col gap-4">
						<h3 className="font-[family-name:var(--font-geist-pixel-square)] text-xs font-bold tracking-widest uppercase border-b border-[var(--color-border)] pb-2">
							Associated Event
						</h3>
						{event.coverImage && (
							<div className="relative w-full h-24 overflow-hidden border border-[var(--color-border)] rounded-sm bg-[var(--color-border-subtle)]">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={event.coverImage}
									alt={event.title}
									className="object-cover w-full h-full"
								/>
							</div>
						)}
						<div className="flex flex-col gap-1">
							<h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-foreground)] font-semibold">
								{event.title}
							</h4>
							<p className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
								{event.date} • {event.location.split("/")[0].trim()}
							</p>
						</div>
						<Link
							href={`/app/events/${event.id}`}
							className="font-mono text-[9px] uppercase tracking-widest text-center border border-[var(--color-border)] py-1.5 hover:bg-[var(--color-foreground)]/[0.04] transition-colors rounded-sm block"
						>
							View Event details
						</Link>
					</div>
				)}

				{/* Related Meetings list */}
				<div className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-5 flex flex-col gap-4">
					<h3 className="font-[family-name:var(--font-geist-pixel-square)] text-xs font-bold tracking-widest uppercase border-b border-[var(--color-border)] pb-2">
						Related Syncs
					</h3>
					{meetings.length === 0 ? (
						<p className="font-mono text-[10px] text-[var(--color-muted-foreground)] text-center py-2">
							No meetings syncs scheduled.
						</p>
					) : (
						<div className="flex flex-col gap-3">
							{meetings.map((meeting) => (
								<div
									key={meeting.id}
									className="border border-[var(--color-border)] bg-[var(--color-border-subtle)] rounded-sm p-3 flex flex-col gap-1"
								>
									<div className="flex items-center justify-between">
										<span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-foreground)] font-semibold truncate pr-2">
											{meeting.title}
										</span>
										<span className="font-mono text-[8px] uppercase tracking-widest text-emerald-500 shrink-0 font-semibold">
											{meeting.time}
										</span>
									</div>
									<p className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
										{meeting.date}
									</p>
								</div>
							))}
						</div>
					)}
					<Link
						href={`/app/meetings/create?postId=${post.id}${
							event ? `&eventId=${event.id}` : ""
						}`}
						className="font-mono text-[9px] uppercase tracking-widest text-center px-3 py-2 bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-95 transition-opacity rounded-sm block"
					>
						+ Schedule Sync
					</Link>
				</div>
			</div>
		</div>
	);
}
