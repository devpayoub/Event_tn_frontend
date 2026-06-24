import React from "react";

export function SkeletonBlock({ className = "" }: { className?: string }) {
	return (
		<div
			className={`bg-[var(--color-border-subtle)] rounded-sm animate-pulse ${className}`}
		/>
	);
}

export function SkeletonText({ lines = 1 }: { lines?: number }) {
	return (
		<div className="flex flex-col gap-1.5">
			{Array.from({ length: lines }).map((_, i) => (
				<SkeletonBlock
					key={i}
					className={`h-3 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
				/>
			))}
		</div>
	);
}

export function SkeletonImage({ className = "" }: { className?: string }) {
	return <SkeletonBlock className={`w-full ${className}`} />;
}

export function EventCardSkeleton() {
	return (
		<div className="border border-[var(--color-border)] rounded-sm p-4 flex flex-col gap-3 bg-[var(--color-background)]">
			<SkeletonBlock className="w-full h-40 rounded-sm" />
			<div className="flex justify-between">
				<SkeletonBlock className="w-24 h-3" />
				<SkeletonBlock className="w-20 h-3" />
			</div>
			<SkeletonBlock className="w-3/4 h-5" />
			<SkeletonText lines={2} />
			<div className="flex gap-2 mt-2 pt-3 border-t border-[var(--color-border-subtle)]">
				<SkeletonBlock className="w-16 h-7" />
				<SkeletonBlock className="w-16 h-7" />
			</div>
		</div>
	);
}

export function PostCardSkeleton() {
	return (
		<div className="border border-[var(--color-border)] rounded-sm p-4 flex flex-col gap-3 bg-[var(--color-background)]">
			<div className="flex justify-between">
				<SkeletonBlock className="w-16 h-3" />
				<SkeletonBlock className="w-20 h-3" />
			</div>
			<SkeletonBlock className="w-3/4 h-5" />
			<SkeletonText lines={3} />
			<div className="flex justify-between mt-2 pt-3 border-t border-[var(--color-border-subtle)]">
				<SkeletonBlock className="w-20 h-3" />
				<SkeletonBlock className="w-12 h-3" />
			</div>
			<div className="flex gap-2">
				<SkeletonBlock className="w-20 h-7" />
				<SkeletonBlock className="w-16 h-7" />
			</div>
		</div>
	);
}
