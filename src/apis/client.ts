export function authHeaders(): Record<string, string> {
	if (typeof window === "undefined") return {}
	const token = localStorage.getItem("access_token")
	return token ? { Authorization: `Bearer ${token}` } : {}
}

export class ApiError extends Error {
	status: number
	detail: unknown

	constructor(status: number, detail: unknown) {
		super(typeof detail === "string" ? detail : "Request failed")
		this.status = status
		this.detail = detail
	}
}

export async function apiFetch<T>(
	path: string,
	options?: RequestInit,
): Promise<T> {
	const res = await fetch(path, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...authHeaders(),
			...options?.headers,
		},
	})
	if (!res.ok) {
		let detail: unknown
		try {
			detail = await res.json()
		} catch {
			detail = res.statusText
		}
		throw new ApiError(res.status, detail)
	}
	if (res.status === 204) return undefined as T
	return res.json()
}

export function setTokens(access: string) {
	if (typeof window === "undefined") return
	localStorage.setItem("access_token", access)
}

export function clearTokens() {
	if (typeof window === "undefined") return
	localStorage.removeItem("access_token")
}
