"use client";

import { useToast } from "@/components/shared/toast";
import { useClickSound } from "@/hooks/use-click-sound";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "../theme-switcher";

interface UserProfile {
	name: string;
	role: string;
	avatar: string;
	email: string;
}

const PUBLIC_NAV = [
	{ href: "/app", label: "Home", icon: "⌂" },
	{ href: "/app/events", label: "Events", icon: "▤" },
];

const AUTH_NAV = [
	{ href: "/app", label: "Home", icon: "⌂" },
	{ href: "/app/events", label: "Events", icon: "▤" },
	{ href: "/app/posts", label: "Posts", icon: "✦" },
	{ href: "/app/create", label: "Create", icon: "⊕" },
	{ href: "/app/schedule", label: "Schedule", icon: "◷" },
];

export function DashboardSidebar() {
	const pathname = usePathname();
	const 	router = useRouter();
	const playClick = useClickSound();
	const { toast } = useToast();
	const [isOpen, setIsOpen] = useState(false);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			setLoading(false);
			return;
		}
		fetch("/api/user/profile", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((r) => r.json())
			.then((data) => {
				if (data.name) {
					setProfile({
						name: data.name,
						role: data.role || "Event Contributor",
						avatar:
							data.avatar ||
							"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
						email: data.email,
					});
				}
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	const isLinkActive = (href: string) => {
		if (href === "/app") return pathname === "/app";
		return pathname.startsWith(href);
	};

	const isAuth = !!profile;
	const navItems = isAuth ? AUTH_NAV : PUBLIC_NAV;

	const handleLogout = () => {
		playClick();
		localStorage.removeItem("access_token");
		document.cookie = "logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
		setProfile(null);
		toast("success", "Logged out successfully");
		router.push("/login");
	};

	return (
		<>
			<div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-background)] z-30 sticky top-0 w-full">
				<Link
					href="/app"
					onClick={playClick}
					className="font-[family-name:var(--font-geist-pixel-square)] font-bold text-xl uppercase tracking-widest text-[var(--color-foreground)]"
				>
					Events
				</Link>
				<div className="flex items-center gap-2">
					<ThemeSwitcher ambientMode={false} onToggleAmbient={() => {}} />
					<button
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						className="font-mono text-lg px-2.5 py-1 border border-[var(--color-border)] rounded-sm hover:bg-[var(--color-foreground)]/[0.04]"
					>
						{isOpen ? "×" : "≡"}
					</button>
				</div>
			</div>

			{isOpen && (
				<div
					onClick={() => setIsOpen(false)}
					className="md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"
				/>
			)}

			<aside
				className={`fixed md:sticky top-[53px] md:top-0 left-0 bottom-0 z-40 w-64 md:w-60 lg:w-64 border-r border-[var(--color-border)] bg-[var(--color-background)] flex flex-col justify-between py-6 px-4 transition-transform duration-300 md:translate-x-0 h-[calc(100vh-53px)] md:h-screen ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex flex-col gap-6 md:gap-8">
					<div className="hidden md:block px-2">
						<Link
							href="/app"
							onClick={playClick}
							className="font-[family-name:var(--font-geist-pixel-square)] font-bold text-2xl uppercase tracking-widest text-[var(--color-foreground)] hover:opacity-80 transition-opacity"
						>
							Events
						</Link>
						<p className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-muted-foreground)] mt-1">
							{isAuth ? "Management Hub" : "Community Board"}
						</p>
					</div>

					<nav className="flex flex-col gap-1.5">
						{navItems.map(({ href, label, icon }) => {
							const active = isLinkActive(href);
							return (
								<Link
									key={href}
									href={href}
									onClick={() => {
										setIsOpen(false);
										playClick();
									}}
									className={`flex items-center gap-3.5 px-3 py-2.5 rounded-sm transition-colors border ${
										active
											? "text-[var(--color-foreground)] bg-[var(--color-foreground)]/[0.04] border-[var(--color-border)] font-medium"
											: "text-[var(--color-muted-foreground)] border-transparent hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/[0.02]"
									}`}
								>
									<span className="text-lg leading-none w-5 text-center">
										{icon}
									</span>
									<span className="font-mono text-xs uppercase tracking-widest leading-none">
										{label}
									</span>
								</Link>
							);
						})}

						{isAuth && (
							<Link
								href="/app/profile"
								onClick={() => {
									setIsOpen(false);
									playClick();
								}}
								className={`flex items-center gap-3.5 px-3 py-2.5 rounded-sm transition-colors border ${
									isLinkActive("/app/profile")
										? "text-[var(--color-foreground)] bg-[var(--color-foreground)]/[0.04] border-[var(--color-border)] font-medium"
										: "text-[var(--color-muted-foreground)] border-transparent hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/[0.02]"
								}`}
							>
								<div className="relative w-5 h-5 rounded-full overflow-hidden border border-[var(--color-border)] shrink-0">
									<img
										src={
											profile?.avatar ||
											"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
										}
										alt={profile?.name || "User"}
										className="object-cover w-full h-full"
									/>
								</div>
								<span className="font-mono text-xs uppercase tracking-widest leading-none">
									Profile
								</span>
							</Link>
						)}
					</nav>
				</div>

				<div className="flex flex-col gap-4 border-t border-[var(--color-border)] pt-4 px-2">
					<div className="hidden md:flex items-center justify-between">
						<span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
							Theme
						</span>
						<ThemeSwitcher ambientMode={false} onToggleAmbient={() => {}} />
					</div>

					{isAuth ? (
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2 min-w-0">
								<div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--color-border)] shrink-0">
									<img
										src={
											profile?.avatar ||
											"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
										}
										alt={profile?.name || "User"}
										className="object-cover w-full h-full"
									/>
								</div>
								<div className="min-w-0 flex flex-col justify-center">
									<p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-foreground)] truncate leading-tight font-semibold">
										{profile?.name || "User"}
									</p>
									<p className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-muted-foreground)] truncate leading-none mt-0.5">
										{profile?.role || ""}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={handleLogout}
								className="font-mono text-[8px] uppercase tracking-widest px-2 py-1.5 border border-[var(--color-border)] hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 text-[var(--color-muted-foreground)] transition-all rounded-sm cursor-pointer shrink-0"
							>
								Logout
							</button>
						</div>
					) : (
						<div className="flex flex-col gap-2">
							<Link
								href="/login"
								onClick={() => {
									setIsOpen(false);
									playClick();
								}}
								className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm border border-[var(--color-border)] bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity font-mono text-xs uppercase tracking-widest"
							>
								Login
							</Link>
							<Link
								href="/signup"
								onClick={() => {
									setIsOpen(false);
									playClick();
								}}
								className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors font-mono text-xs uppercase tracking-widest"
							>
								Sign Up
							</Link>
						</div>
					)}
				</div>
			</aside>
		</>
	);
}
