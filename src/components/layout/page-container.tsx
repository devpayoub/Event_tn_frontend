import Link from "next/link";
import type React from "react";

export function PageContainer({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`flex-1 px-4 sm:px-6 md:px-8 py-6 max-w-6xl w-full mx-auto flex flex-col gap-6 md:gap-8 ${className}`}
		>
			{children}
		</div>
	);
}

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	actions?: React.ReactNode;
	backHref?: string;
}

export function PageHeader({
	title,
	subtitle,
	actions,
	backHref,
}: PageHeaderProps) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4 md:pb-5">
			<div className="flex flex-col gap-1 min-w-0">
				<div className="flex items-center gap-3">
					{backHref && (
						<Link
							href={backHref}
							className="font-mono text-xs uppercase tracking-widest border border-[var(--color-border)] px-2 py-1 hover:bg-[var(--color-foreground)]/[0.04] transition-colors rounded-sm shrink-0"
						>
							← Back
						</Link>
					)}
					<h1 className="font-[family-name:var(--font-geist-pixel-square)] text-2xl md:text-3xl font-bold tracking-wider uppercase text-[var(--color-foreground)] truncate leading-none">
						{title}
					</h1>
				</div>
				{subtitle && (
					<p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">
						{subtitle}
					</p>
				)}
			</div>
			{actions && (
				<div className="flex items-center gap-2 shrink-0">{actions}</div>
			)}
		</div>
	);
}

export function SectionCard({
	children,
	className = "",
	onClick,
	hoverable = true,
}: {
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
	hoverable?: boolean;
}) {
	const Element = onClick ? "button" : "div";
	return (
		<Element
			onClick={onClick}
			type={onClick ? "button" : undefined}
			className={`w-full text-left flex flex-col p-4 sm:p-5 md:p-6 border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm transition-all duration-200 ${
				hoverable
					? "hover:bg-[var(--color-foreground)]/[0.01] hover:border-[var(--color-muted)]"
					: ""
			} ${onClick ? "cursor-pointer" : ""} ${className}`}
		>
			{children}
		</Element>
	);
}
