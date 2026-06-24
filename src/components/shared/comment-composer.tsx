"use client";

import { useClickSound } from "@/hooks/use-click-sound";
import type { UserProfile } from "@/lib/api";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

interface CommentComposerProps {
	postId?: string;
	eventId?: string;
	profile: UserProfile;
	parentId?: string | null;
	onSuccess?: () => void;
}

export function CommentComposer({
	postId = "",
	eventId = "",
	profile,
	parentId = null,
	onSuccess,
}: CommentComposerProps) {
	const router = useRouter();
	const playClick = useClickSound();
	const [content, setContent] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		playClick();
		setSubmitting(true);

		const token = localStorage.getItem("access_token");

		try {
			const res = await fetch("/api/comments", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					postId,
					eventId,
					authorName: profile.name,
					authorAvatar: profile.avatar,
					content: content.trim(),
					parentId,
				}),
			});

			if (res.ok) {
				setContent("");
				if (onSuccess) onSuccess();
				router.refresh();
			}
		} catch (err) {
			console.error("Failed to post comment:", err);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-3 items-start">
			<div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--color-border)] shrink-0">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={profile.avatar}
					alt={profile.name}
					className="object-cover w-full h-full"
				/>
			</div>
			<div className="flex-1 flex flex-col gap-2 min-w-0">
				<textarea
					rows={parentId ? 2 : 3}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder={
						parentId ? "Write a reply..." : "Add to the discussion..."
					}
					className="font-mono text-xs w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)] placeholder-[var(--color-muted-foreground)] resize-y"
				/>
				<div className="flex justify-end">
					<button
						type="submit"
						disabled={submitting || !content.trim()}
						className="font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity rounded-sm"
					>
						{submitting ? "Posting..." : parentId ? "Reply" : "Post Comment"}
					</button>
				</div>
			</div>
		</form>
	);
}
