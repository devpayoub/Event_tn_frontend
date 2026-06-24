"use client";

import { useToast } from "@/components/shared/toast";
import { DragDropUpload } from "@/components/shared/drag-drop-upload";
import { useClickSound } from "@/hooks/use-click-sound";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

export default function SignupPage() {
	const 	router = useRouter();
	const playClick = useClickSound();
	const { toast } = useToast();
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [role, setRole] = useState("Event Contributor");
	const [bio, setBio] = useState("");
	const [avatar, setAvatar] = useState("");
	const [password, setPassword] = useState("");
	const [password2, setPassword2] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		playClick();
		setLoading(true);
		setError("");

		if (password !== password2) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		try {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: name,
					email,
					password,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				const detail = data.detail;
				const msg = Array.isArray(detail) ? detail[0]?.msg || detail[0] : detail;
				throw new Error(msg || "Signup failed");
			}

			const data = await res.json();
			localStorage.setItem("access_token", data.access);

			document.cookie = "logged_in=true; path=/; max-age=86400; SameSite=Lax";
			toast("success", "Account created successfully! Welcome aboard.");
			router.push("/app");
		} catch (err: any) {
			setError(err.message || "An error occurred");
			toast("error", err.message || "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-[#fafafa] relative overflow-hidden py-12 px-4">
			<div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
			<div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="w-full max-w-lg border border-[#1a1a1a] bg-black/60 backdrop-blur-md rounded-sm p-8 sm:p-10 flex flex-col gap-6"
			>
				<div className="text-center flex flex-col gap-1.5">
					<h1 className="font-[family-name:var(--font-geist-pixel-square)] font-bold text-3xl uppercase tracking-widest text-[#fafafa]">
						Events
					</h1>
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Create your profile to join
					</p>
				</div>

				<form onSubmit={handleSignup} className="flex flex-col gap-4">
					{error && (
						<div className="font-mono text-[10px] uppercase tracking-widest text-[#f87171] border border-[#f87171]/20 bg-[#f87171]/5 p-3 rounded-sm">
							Error: {error}
						</div>
					)}

					<div className="flex flex-col gap-1.5">
						<label className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							Email
						</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							className="font-mono text-xs px-3 py-2.5 border border-[#1a1a1a] bg-zinc-900/50 text-[#fafafa] rounded-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-600 transition-colors"
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex flex-col gap-1.5">
							<label className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
								Full Name
							</label>
							<input
								type="text"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g. Alex Rivera"
								className="font-mono text-xs px-3 py-2.5 border border-[#1a1a1a] bg-zinc-900/50 text-[#fafafa] rounded-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-600 transition-colors"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
								Role / Title
							</label>
							<input
								type="text"
								value={role}
								onChange={(e) => setRole(e.target.value)}
								placeholder="e.g. Lead Coordinator"
								className="font-mono text-xs px-3 py-2.5 border border-[#1a1a1a] bg-zinc-900/50 text-[#fafafa] rounded-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-600 transition-colors"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
							Bio
						</label>
						<textarea
							rows={2}
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							placeholder="Tell us about yourself..."
							className="font-mono text-xs px-3 py-2.5 border border-[#1a1a1a] bg-zinc-900/50 text-[#fafafa] rounded-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-600 transition-colors resize-none"
						/>
					</div>

					<DragDropUpload
						value={avatar}
						onChange={setAvatar}
						label="Avatar / Profile Picture"
						placeholder="Drop profile picture here, or click to upload"
					/>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex flex-col gap-1.5">
							<label className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
								Password
							</label>
							<input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								className="font-mono text-xs px-3 py-2.5 border border-[#1a1a1a] bg-zinc-900/50 text-[#fafafa] rounded-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-600 transition-colors"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
								Confirm Password
							</label>
							<input
								type="password"
								required
								value={password2}
								onChange={(e) => setPassword2(e.target.value)}
								placeholder="••••••••"
								className="font-mono text-xs px-3 py-2.5 border border-[#1a1a1a] bg-zinc-900/50 text-[#fafafa] rounded-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-600 transition-colors"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="font-mono text-xs uppercase tracking-widest px-4 py-3 bg-[#fafafa] text-[#0a0a0a] hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity rounded-sm mt-3 text-center"
					>
						{loading ? "Registering..." : "Create Account"}
					</button>
				</form>

				<div className="border-t border-[#1a1a1a] pt-4 text-center">
					<p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
						Already have an account?{" "}
						<Link
							href="/login"
							onClick={playClick}
							className="text-[#fafafa] hover:underline"
						>
							Log In
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
}
