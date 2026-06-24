import { apiFetch, setTokens, clearTokens } from "./client"
import type { TokenResponse, UserProfile } from "./types"

export async function signup(data: {
	username: string
	email: string
	password: string
}): Promise<TokenResponse> {
	const result = await apiFetch<TokenResponse>("/api/auth/signup", {
		method: "POST",
		body: JSON.stringify(data),
	})
	setTokens(result.access)
	document.cookie = "logged_in=true; path=/; max-age=86400; SameSite=Lax"
	return result
}

export async function login(data: {
	email: string
	password: string
}): Promise<TokenResponse> {
	const result = await apiFetch<TokenResponse>("/api/auth/login", {
		method: "POST",
		body: JSON.stringify(data),
	})
	setTokens(result.access)
	document.cookie = "logged_in=true; path=/; max-age=86400; SameSite=Lax"
	return result
}

export async function getProfile(): Promise<UserProfile> {
	return apiFetch<UserProfile>("/api/user/profile")
}

export async function updateProfile(data: {
	name?: string
	role?: string
	bio?: string
	avatar?: string
}): Promise<UserProfile> {
	return apiFetch<UserProfile>("/api/user/profile", {
		method: "PATCH",
		body: JSON.stringify(data),
	})
}

export function logout(): void {
	clearTokens()
	document.cookie = "logged_in=; path=/; max-age=0; SameSite=Lax"
}
