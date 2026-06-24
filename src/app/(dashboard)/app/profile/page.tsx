"use client";

import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { ProfileView } from "@/components/views/profile-view";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";

export default function ProfilePage() {
	const router = useRouter();
	const [profile, setProfile] = useState<any>(null);
	const [events, setEvents] = useState<any[]>([]);
	const [posts, setPosts] = useState<any[]>([]);
	const [meetings, setMeetings] = useState<any[]>([]);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			router.push("/login");
			return;
		}
		const headers: Record<string, string> = { "Content-Type": "application/json" };
		headers["Authorization"] = `Bearer ${token}`;

		Promise.all([
			fetch("/api/user/profile", { headers }).then((r) => (r.ok ? r.json() : { name: "User", role: "", bio: "", avatar: "" })),
			fetch("/api/events?limit=0", { headers }).then((r) => r.json()),
			fetch("/api/posts?limit=0", { headers }).then((r) => r.json()),
			fetch("/api/meetings", { headers }).then((r) => r.json()),
		]).then(([prof, evtsRaw, pstsRaw, meets]) => {
			setProfile(prof);
			setEvents((evtsRaw as any).items ?? []);
			setPosts((pstsRaw as any).items ?? []);
			setMeetings(meets);
		}).catch(() => {});
	}, []);

	const myEvents = events.filter((e: any) => e.authorId === profile?.id);
	const myPosts = posts.filter((p: any) => p.authorId === profile?.id);
	const myMeetings = meetings.filter((m: any) => m.authorId === profile?.id);

	return (
		<PageContainer>
			<PageHeader
				title="User Profile"
				subtitle="Manage account and created schedules"
			/>
			{profile && (
				<ProfileView
					profile={profile}
					myEvents={myEvents}
					myPosts={myPosts}
					myMeetings={myMeetings}
				/>
			)}
		</PageContainer>
	);
}
