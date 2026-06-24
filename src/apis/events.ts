import { apiFetch } from "./client"
import type { EventItem, PaginatedResponse } from "./types"

export async function getEvents(skip = 0, limit = 20): Promise<PaginatedResponse<EventItem>> {
	return apiFetch<PaginatedResponse<EventItem>>(`/api/events?skip=${skip}&limit=${limit}`)
}

export async function getEventById(id: string): Promise<EventItem> {
	return apiFetch<EventItem>(`/api/events/${id}`)
}

export async function createEvent(data: {
	title: string
	description?: string
	date?: string
	time?: string
	location?: string
	coverImage?: string
}): Promise<EventItem> {
	return apiFetch<EventItem>("/api/events", {
		method: "POST",
		body: JSON.stringify(data),
	})
}

export async function updateEvent(
	id: string,
	data: {
		title?: string
		description?: string
		date?: string
		time?: string
		location?: string
		coverImage?: string
	},
): Promise<EventItem> {
	return apiFetch<EventItem>(`/api/events/${id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	})
}

export async function deleteEvent(id: string): Promise<void> {
	return apiFetch<void>(`/api/events/${id}`, { method: "DELETE" })
}
