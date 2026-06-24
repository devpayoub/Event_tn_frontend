"use client";

import { useConfirm } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { SectionCard } from "@/components/layout/page-container";
import { useClickSound } from "@/hooks/use-click-sound";
import type {
	EventItem,
	MeetingItem,
	PostItem,
	UserProfile,
} from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { DragDropUpload } from "../shared/drag-drop-upload";

interface ProfileViewProps {
	profile: UserProfile;
	myEvents: EventItem[];
	myPosts: PostItem[];
	myMeetings: MeetingItem[];
}

type Tab = "profile" | "events" | "posts" | "meetings";

export function ProfileView({
	profile,
	myEvents,
	myPosts,
	myMeetings,
}: ProfileViewProps) {
	const 	router = useRouter();
	const playClick = useClickSound();
	const { toast } = useToast();
	const { confirm } = useConfirm();
	const [activeTab, setActiveTab] = useState<Tab>("profile");
	const [localEvents, setLocalEvents] = useState(myEvents);
	const [localPosts, setLocalPosts] = useState(myPosts);
	const [localMeetings, setLocalMeetings] = useState(myMeetings);

	// Profile edit state
	const [name, setName] = useState(profile.name);
	const [email, setEmail] = useState(profile.email);
	const [avatar, setAvatar] = useState(profile.avatar || "");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleTabChange = (tab: Tab) => {
		playClick();
		setActiveTab(tab);
	};

	const handleDelete = async (type: "events" | "posts" | "meetings", id: string) => {
		playClick();
		const label = type.slice(0, -1);
		const ok = await confirm({
			title: `Delete ${label.charAt(0).toUpperCase() + label.slice(1)}`,
			message: `Are you sure you want to delete this ${label}? This action cannot be undone.`,
			confirmLabel: "Delete",
			variant: "danger",
		});
		if (!ok) return;
		const token = localStorage.getItem("access_token");
		const res = await fetch(`/api/${type}/${id}`, {
			method: "DELETE",
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
		if (res.ok) {
			if (type === "events") setLocalEvents((prev) => prev.filter((e) => e.id !== id));
			if (type === "posts") setLocalPosts((prev) => prev.filter((p) => p.id !== id));
			if (type === "meetings") setLocalMeetings((prev) => prev.filter((m) => m.id !== id));
			toast("success", `${type.slice(0, -1).charAt(0).toUpperCase() + type.slice(0, -1).slice(1)} deleted successfully`);
			router.refresh();
		} else {
			toast("error", `Failed to delete ${type.slice(0, -1)}`);
		}
	};

	const handleSaveProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		playClick();
		setSaving(true);
		setError("");
		setSuccess("");
		const token = localStorage.getItem("access_token");
		if (!token) return;

		try {
			const profileRes = await fetch("/api/user/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({ name, email, avatar }),
			});
			if (!profileRes.ok) {
				const data = await profileRes.json();
				throw new Error(data.detail || "Failed to update profile");
			}

			if (currentPassword && newPassword) {
				const pwRes = await fetch("/api/user/password", {
					method: "PATCH",
					headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
					body: JSON.stringify({ currentPassword, newPassword }),
				});
				if (!pwRes.ok) {
					const data = await pwRes.json();
					throw new Error(data.detail || "Failed to update password");
				}
				setCurrentPassword("");
				setNewPassword("");
			}

			setSuccess("Profile updated successfully");
			toast("success", "Profile updated successfully");
			router.refresh();
		} catch (err: any) {
			setError(err.message);
			toast("error", err.message);
		} finally {
			setSaving(false);
		}
	};

	const tabCounts = { events: localEvents.length, posts: localPosts.length, meetings: localMeetings.length };

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
			<div className="flex flex-col gap-6">
				<div className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-6 flex flex-col items-center text-center gap-4">
					<div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--color-border)] shrink-0">
						<img src={profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} alt={profile.name} className="object-cover w-full h-full" />
					</div>
					<div className="flex flex-col gap-1">
						<h2 className="font-[family-name:var(--font-geist-pixel-square)] text-lg font-bold tracking-wider uppercase text-[var(--color-foreground)]">{profile.name}</h2>
						<span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-muted-foreground)]">{profile.role}</span>
					</div>
					<p className="font-sans text-xs text-[var(--color-muted-foreground)] leading-relaxed px-2">{profile.bio}</p>
					<div className="grid grid-cols-3 border-t border-[var(--color-border-subtle)] pt-4 w-full mt-2">
						{(["events", "posts", "meetings"] as const).map((key) => (
							<div key={key} className="flex flex-col items-center">
								<span className="font-[family-name:var(--font-geist-pixel-square)] text-lg font-bold tracking-wider text-[var(--color-foreground)]">{tabCounts[key]}</span>
								<span className="font-mono text-[7px] uppercase tracking-widest text-[var(--color-muted-foreground)] mt-0.5">{key}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="lg:col-span-2 flex flex-col gap-5">
				<div className="flex border-b border-[var(--color-border)] gap-4 overflow-x-auto">
					{(["profile", "events", "posts", "meetings"] as const).map((tab) => (
						<button key={tab} type="button" onClick={() => handleTabChange(tab)} className={`font-mono text-[10px] uppercase tracking-widest pb-3 border-b-2 cursor-pointer transition-colors shrink-0 ${activeTab === tab ? "text-[var(--color-foreground)] border-[var(--color-foreground)] font-semibold" : "text-[var(--color-muted-foreground)] border-transparent hover:text-[var(--color-foreground)]"}`}>
							{tab}{tab !== "profile" ? ` (${tabCounts[tab]})` : ""}
						</button>
					))}
				</div>

				<div className="flex flex-col gap-4">
					{activeTab === "profile" && (
						<form onSubmit={handleSaveProfile} className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm p-5 sm:p-6 flex flex-col gap-5 max-w-xl">
							{error && <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-delta-negative)] border border-[var(--color-delta-negative)]/30 bg-[var(--color-delta-negative)]/5 p-3 rounded-sm">{error}</div>}
							{success && <div className="font-mono text-xs uppercase tracking-widest text-emerald-500 border border-emerald-500/30 bg-emerald-500/5 p-3 rounded-sm">{success}</div>}

							<div className="flex flex-col gap-1.5">
								<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">Name</label>
								<input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)]" />
							</div>

							<div className="flex flex-col gap-1.5">
								<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">Email</label>
								<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)]" />
							</div>

							<DragDropUpload value={avatar} onChange={setAvatar} label="Avatar" placeholder="Drop avatar image here, or click to upload" />

							<div className="border-t border-[var(--color-border-subtle)] pt-4 flex flex-col gap-4">
								<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">Change Password (optional)</span>
								<div className="flex flex-col gap-1.5">
									<label className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-muted-foreground)]">Current Password</label>
									<input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)]" />
								</div>
								<div className="flex flex-col gap-1.5">
									<label className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-muted-foreground)]">New Password</label>
									<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="font-mono text-xs px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-sm focus:outline-none focus:border-[var(--color-muted)]" />
								</div>
							</div>

							<button type="submit" disabled={saving} className="font-mono text-xs uppercase tracking-widest px-4 py-3 bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity rounded-sm mt-2 text-center">
								{saving ? "Saving..." : "Save Profile"}
							</button>
						</form>
					)}

					{activeTab === "events" && (localEvents.length === 0 ? (
						<p className="font-mono text-xs text-[var(--color-muted-foreground)] text-center py-12 border border-dashed border-[var(--color-border)]">No events created yet.</p>
					) : (
						localEvents.map((event) => (
							<SectionCard key={event.id}>
								<div className="flex justify-between items-center gap-3">
									<div className="min-w-0 flex-1">
										<span className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-muted-foreground)] block">{event.date} • {(event.location || "").split("/")[0].trim()}</span>
										<Link href={`/app/events/${event.id}`} className="font-[family-name:var(--font-geist-pixel-square)] text-sm font-bold tracking-wider uppercase text-[var(--color-foreground)] hover:text-[var(--color-muted-foreground)] truncate block mt-0.5">{event.title}</Link>
									</div>
									<span className={`font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 border rounded-sm shrink-0 ${event.status === "draft" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}>{event.status}</span>
									<div className="flex items-center gap-1 shrink-0">
										<Link href={`/app/create?type=event&editId=${event.id}`} onClick={playClick} className="font-mono text-[11px] px-1.5 py-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/[0.04] border border-transparent hover:border-[var(--color-border)] rounded-sm transition-all cursor-pointer">✎</Link>
										<button type="button" onClick={() => handleDelete("events", event.id)} className="font-mono text-[11px] px-1.5 py-1 text-[var(--color-delta-negative)] hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-sm transition-all cursor-pointer">×</button>
									</div>
								</div>
							</SectionCard>
						))
					))}

					{activeTab === "posts" && (localPosts.length === 0 ? (
						<p className="font-mono text-xs text-[var(--color-muted-foreground)] text-center py-12 border border-dashed border-[var(--color-border)]">No posts published yet.</p>
					) : (
						localPosts.map((post) => (
							<SectionCard key={post.id}>
								<div className="flex justify-between items-center gap-3">
									<div className="min-w-0 flex-1">
										<span className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-muted-foreground)] block">{post.likes} Likes • {post.status}</span>
										<Link href={`/app/posts/${post.id}`} className="font-mono text-xs uppercase tracking-wider text-[var(--color-foreground)] hover:text-[var(--color-muted-foreground)] font-semibold truncate block mt-0.5">{post.title}</Link>
									</div>
									<Link href={`/app/posts/${post.id}`} className="font-mono text-[8px] uppercase tracking-widest border border-[var(--color-border)] px-2 py-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-muted)] transition-colors rounded-sm shrink-0">Read</Link>
									<div className="flex items-center gap-1 shrink-0">
										<Link href={`/app/create?type=post&editId=${post.id}`} onClick={playClick} className="font-mono text-[11px] px-1.5 py-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/[0.04] border border-transparent hover:border-[var(--color-border)] rounded-sm transition-all cursor-pointer">✎</Link>
										<button type="button" onClick={() => handleDelete("posts", post.id)} className="font-mono text-[11px] px-1.5 py-1 text-[var(--color-delta-negative)] hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-sm transition-all cursor-pointer">×</button>
									</div>
								</div>
							</SectionCard>
						))
					))}

					{activeTab === "meetings" && (localMeetings.length === 0 ? (
						<p className="font-mono text-xs text-[var(--color-muted-foreground)] text-center py-12 border border-dashed border-[var(--color-border)]">No sync meetings scheduled yet.</p>
					) : (
						localMeetings.map((meeting) => (
							<SectionCard key={meeting.id}>
								<div className="flex justify-between items-center gap-3">
									<div className="min-w-0 flex-1">
										<span className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-muted-foreground)] block">{meeting.date} • {meeting.time} • {meeting.status}</span>
										<Link href={`/app/meetings/${meeting.id}`} className="font-mono text-xs uppercase tracking-wider text-[var(--color-foreground)] hover:text-[var(--color-muted-foreground)] font-semibold truncate block mt-0.5">{meeting.title}</Link>
									</div>
									<span className="font-mono text-[8px] uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded-sm shrink-0">Active</span>
									<div className="flex items-center gap-1 shrink-0">
										<Link href={`/app/meetings/${meeting.id}`} onClick={playClick} className="font-mono text-[11px] px-1.5 py-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/[0.04] border border-transparent hover:border-[var(--color-border)] rounded-sm transition-all cursor-pointer">✎</Link>
										<button type="button" onClick={() => handleDelete("meetings", meeting.id)} className="font-mono text-[11px] px-1.5 py-1 text-[var(--color-delta-negative)] hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-sm transition-all cursor-pointer">×</button>
									</div>
								</div>
							</SectionCard>
						))
					))}
				</div>
			</div>
		</div>
	);
}
