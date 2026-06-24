import { apiFetch } from "./client"
import type { CommentItem } from "./types"

export async function getComments(postId: string): Promise<CommentItem[]> {
	return apiFetch<CommentItem[]>(`/api/comments?postId=${postId}`)
}

export async function createComment(data: {
	postId: string
	content: string
	parentId?: string | null
}): Promise<CommentItem> {
	return apiFetch<CommentItem>("/api/comments", {
		method: "POST",
		body: JSON.stringify(data),
	})
}

export async function updateComment(
	id: string,
	data: { content?: string },
): Promise<CommentItem> {
	return apiFetch<CommentItem>(`/api/comments/${id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	})
}

export async function deleteComment(id: string): Promise<void> {
	return apiFetch<void>(`/api/comments/${id}`, { method: "DELETE" })
}
