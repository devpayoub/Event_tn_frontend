import { apiFetch } from "./client"
import type { PaginatedResponse, PostItem } from "./types"

export async function getPosts(skip = 0, limit = 20): Promise<PaginatedResponse<PostItem>> {
	return apiFetch<PaginatedResponse<PostItem>>(`/api/posts?skip=${skip}&limit=${limit}`)
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
