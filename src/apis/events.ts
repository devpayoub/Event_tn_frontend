import { apiFetch } from "./client"
import type { EventItem } from "./types"

export async function getEvents(): Promise<EventItem[]> {
	return apiFetch<EventItem[]>("/api/events")
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
