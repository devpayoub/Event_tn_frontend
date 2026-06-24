// ── User ──
export interface UserProfile {
	id?: string
	name: string
	email?: string
	role?: string
	bio?: string
	avatar?: string
}

// ── Events ──
export interface EventItem {
	id: string
	title: string
	description: string
	date: string
	time: string
	location: string
	coverImage: string
	authorId: string
	authorName: string
	createdAt: string
	// backward-compat aliases
	organizer?: string
	created_at?: string
	status?: string
	ticketUrl?: string
}

// ── Posts ──
export interface PostItem {
	id: string
	title: string
	content: string
	image: string
	authorId: string
	authorName: string
	authorAvatar: string
	eventId: string
	likes: number
	likedBy: string[]
	status: string
	publishedAt: string | null
	createdAt: string
	// backward-compat aliases
	author?: string
	coverImage?: string
	created_at?: string
}

// ── Comments ──
export interface CommentItem {
	id: string
	postId: string
	eventId: string
	parentId: string | null
	authorId: string
	authorName: string
	authorAvatar: string
	content: string
	timestamp: string
	// backward-compat aliases
	created_at?: string
}

// ── Meetings ──
export interface MeetingItem {
	id: string
	title: string
	date: string
	time: string
	postId: string
	eventId: string
	authorId: string
	authorName: string
	createdAt: string
	// backward-compat aliases
	participants?: string
	description?: string
	status?: string
	created_at?: string
}

// ── Tokens ──
export interface TokenResponse {
	access: string
}
