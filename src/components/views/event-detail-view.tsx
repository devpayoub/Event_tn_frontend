"use client";

import { CommentComposer } from "@/components/shared/comment-composer";
import type { CommentItem, UserProfile } from "@/lib/api";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";

interface EventDetailViewProps {
	eventId: string;
	initialComments: CommentItem[];
}

export function EventDetailView({ eventId, initialComments }: EventDetailViewProps) {
	const router = useRouter();
	const [comments, setComments] = useState<CommentItem[]>(initialComments);
	const [profile, setProfile] = useState<UserProfile | null>(null);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) return;
		fetch("/api/user/profile", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((r) => r.json())
			.then((data) => {
				if (data.name) {
					setProfile({
						name: data.name,
						role: data.role || "Event Contributor",
						avatar:
							data.avatar ||
							"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
						email: data.email,
					});
				}
			})
			.catch(console.error);
	}, []);

	useEffect(() => {
		setComments(initialComments);
	}, [initialComments]);

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
		for (const [, list] of map.entries()) {
			list.sort(
				(a, b) =>
					new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
			);
		}
		return map;
	}, [comments]);

	const [replyingTo, setReplyingTo] = useState<string | null>(null);

	const handleCommentPosted = () => {
		router.refresh();
	};

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
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
				<h2 className="font-[family-name:var(--font-geist-pixel-square)] text-sm font-bold tracking-widest uppercase">
					Discussions ({comments.length})
				</h2>
			</div>

			<div className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-4">
				{profile ? (
					<CommentComposer
						eventId={eventId}
						profile={profile}
						onSuccess={handleCommentPosted}
					/>
				) : (
					<p className="font-mono text-xs text-[var(--color-muted-foreground)] text-center py-2">
						Sign in to join the discussion.
					</p>
				)}
			</div>

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
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-2">
										<div className="w-7 h-7 rounded-full overflow-hidden border border-[var(--color-border)]">
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

								<p className="font-sans text-xs text-[var(--color-foreground)] leading-relaxed pl-9">
									{comment.content}
								</p>

								<div className="pl-9 flex gap-4">
									<button
										type="button"
										onClick={() =>
											setReplyingTo(isReplying ? null : comment.id)
										}
										className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"
									>
										{isReplying ? "Cancel" : "Reply"}
									</button>
								</div>

								{isReplying && profile && (
									<div className="pl-9 mt-2 border-l border-[var(--color-border)] py-1">
										<CommentComposer
											eventId={eventId}
											profile={profile}
											parentId={comment.id}
											onSuccess={() => {
												setReplyingTo(null);
												handleCommentPosted();
											}}
										/>
									</div>
								)}

								{replies.length > 0 && (
									<div className="pl-9 flex flex-col gap-3 mt-3 border-l border-[var(--color-border)]">
										{replies.map((reply) => (
											<div
												key={reply.id}
												className="flex flex-col gap-1.5 pt-1.5"
											>
												<div className="flex items-center gap-2">
													<div className="w-6 h-6 rounded-full overflow-hidden border border-[var(--color-border)]">
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
	);
}
