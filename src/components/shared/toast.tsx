"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
	id: string;
	type: ToastType;
	message: string;
}

interface ToastContextValue {
	toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used within ToastProvider");
	return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<ToastItem[]>([]);

	const toast = useCallback((type: ToastType, message: string) => {
		const id = crypto.randomUUID();
		setItems((prev) => [...prev, { id, type, message }]);
		setTimeout(() => {
			setItems((prev) => prev.filter((t) => t.id !== id));
		}, 3500);
	}, []);

	const dismiss = useCallback((id: string) => {
		setItems((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const colors = {
		success: { bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400", icon: "✓" },
		error: { bg: "bg-red-500/10 border-red-500/30 text-red-400", icon: "✕" },
		info: { bg: "bg-blue-500/10 border-blue-500/30 text-blue-400", icon: "ℹ" },
	};

	return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			<div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
				{items.map((item) => (
					<div
						key={item.id}
						className={`pointer-events-auto border ${colors[item.type].bg} backdrop-blur-md rounded-sm px-4 py-3 flex items-start gap-3 shadow-xl animate-in slide-in-from-top-2`}
						style={{
							animation: "toast-slide 0.3s ease-out",
						}}
					>
						<span className="font-mono text-xs font-bold shrink-0 mt-0.5">
							{colors[item.type].icon}
						</span>
						<p className="font-mono text-[11px] leading-relaxed flex-1">
							{item.message}
						</p>
						<button
							type="button"
							onClick={() => dismiss(item.id)}
							className="font-mono text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] cursor-pointer shrink-0"
						>
							×
						</button>
					</div>
				))}
			</div>
			<style>{`
				@keyframes toast-slide {
					from { opacity: 0; transform: translateX(100%); }
					to { opacity: 1; transform: translateX(0); }
				}
			`}</style>
		</ToastContext.Provider>
	);
}
