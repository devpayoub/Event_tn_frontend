import { apiFetch } from "./client"
import type { PostItem } from "./types"

export async function getPosts(): Promise<PostItem[]> {
	return apiFetch<PostItem[]>("/api/posts")
}

export async function getPostById(id: string): Promise<PostItem> {
	return apiFetch<PostItem>(`/api/posts/${id}`)
}

export async function createPost(data: {
	title: string
	content?: string
	image?: string
	eventId?: string
	status?: string
}): Promise<PostItem> {
	return apiFetch<PostItem>("/api/posts", {
		method: "POST",
		body: JSON.stringify(data),
	})
}

export async function updatePost(
	id: string,
	data: {
		title?: string
		content?: string
		image?: string
		eventId?: string
		status?: string
		likes?: number
	},
): Promise<PostItem> {
	return apiFetch<PostItem>(`/api/posts/${id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	})
}

export async function deletePost(id: string): Promise<void> {
	return apiFetch<void>(`/api/posts/${id}`, { method: "DELETE" })
}
