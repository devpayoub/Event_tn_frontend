"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	type ReactNode,
} from "react";

interface ConfirmOptions {
	title?: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "danger" | "default";
}

interface ConfirmContextValue {
	confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
	const ctx = useContext(ConfirmContext);
	if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
	return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<{
		options: ConfirmOptions;
		resolve: (value: boolean) => void;
	} | null>(null);

	const confirm = useCallback(
		(options: ConfirmOptions): Promise<boolean> => {
			return new Promise((resolve) => {
				setState({ options, resolve });
			});
		},
		[],
	);

	const handleConfirm = () => {
		if (!state) return;
		state.resolve(true);
		setState(null);
	};

	const handleCancel = () => {
		if (!state) return;
		state.resolve(false);
		setState(null);
	};

	return (
		<ConfirmContext.Provider value={{ confirm }}>
			{children}
			{state && (
				<div
					className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm"
					onClick={handleCancel}
				>
					<div
						className="border border-[var(--color-border)] bg-[var(--color-background)] rounded-sm shadow-2xl max-w-sm w-full mx-4"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="p-5 flex flex-col gap-3">
							{state.options.title && (
								<h3 className="font-[family-name:var(--font-geist-pixel-square)] text-sm font-bold tracking-widest uppercase text-[var(--color-foreground)]">
									{state.options.title}
								</h3>
							)}
							<p className="font-mono text-xs text-[var(--color-muted-foreground)] leading-relaxed">
								{state.options.message}
							</p>
						</div>
						<div className="flex gap-2 border-t border-[var(--color-border)] p-3">
							<button
								type="button"
								onClick={handleCancel}
								className="flex-1 font-mono text-[10px] uppercase tracking-widest px-3 py-2 border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/[0.04] transition-colors rounded-sm cursor-pointer"
							>
								{state.options.cancelLabel || "Cancel"}
							</button>
							<button
								type="button"
								onClick={handleConfirm}
								className={`flex-1 font-mono text-[10px] uppercase tracking-widest px-3 py-2 border transition-colors rounded-sm cursor-pointer ${
									state.options.variant === "danger"
										? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
										: "border-[var(--color-border)] bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90"
								}`}
							>
								{state.options.confirmLabel || "Confirm"}
							</button>
						</div>
					</div>
				</div>
			)}
		</ConfirmContext.Provider>
	);
}
