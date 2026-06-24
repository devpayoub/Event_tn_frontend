import { apiFetch } from "./client"
import type { MeetingItem } from "./types"

export async function getMeetings(postId?: string): Promise<MeetingItem[]> {
	const qs = postId ? `?postId=${postId}` : ""
	return apiFetch<MeetingItem[]>(`/api/meetings${qs}`)
}

export async function getMeetingById(id: string): Promise<MeetingItem> {
	return apiFetch<MeetingItem>(`/api/meetings/${id}`)
}

export async function createMeeting(data: {
	title: string
	date?: string
	time?: string
	postId: string
	eventId?: string
}): Promise<MeetingItem> {
	return apiFetch<MeetingItem>("/api/meetings", {
		method: "POST",
		body: JSON.stringify(data),
	})
}

export async function updateMeeting(
	id: string,
	data: { title?: string; date?: string; time?: string },
): Promise<MeetingItem> {
	return apiFetch<MeetingItem>(`/api/meetings/${id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	})
}

export async function deleteMeeting(id: string): Promise<void> {
	return apiFetch<void>(`/api/meetings/${id}`, { method: "DELETE" })
}
