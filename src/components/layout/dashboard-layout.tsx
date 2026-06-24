import { DashboardSidebar } from "./dashboard-sidebar";

export function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col md:flex-row min-h-screen w-full bg-[var(--color-background)] text-[var(--color-foreground)] overflow-hidden">
			<DashboardSidebar />
			<main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative">
				{children}
			</main>
		</div>
	);
}
