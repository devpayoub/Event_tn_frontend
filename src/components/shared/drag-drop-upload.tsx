"use client";

import { useToast } from "@/components/shared/toast";
import type React from "react";
import { useRef, useState } from "react";

interface DragDropUploadProps {
	value: string;
	onChange: (value: string) => void;
	label: string;
	placeholder?: string;
}

export function DragDropUpload({
	value,
	onChange,
	label,
	placeholder = "Drag & drop an image here, or click to browse",
}: DragDropUploadProps) {
	const { toast } = useToast();
	const [isDragOver, setIsDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = () => {
		setIsDragOver(false);
	};

	const processFile = (file: File) => {
		if (!file.type.startsWith("image/")) {
			toast("error", "Please upload an image file.");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") {
				onChange(reader.result);
			}
		};
		reader.readAsDataURL(file);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			processFile(e.dataTransfer.files[0]);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			processFile(e.target.files[0]);
		}
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="flex flex-col gap-1.5 w-full">
			<label className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
				{label}
			</label>

			{/* biome-ignore lint/a11y/useKeyWithClickEvents: drag and drop trigger zone */}
			<div
				onClick={() => fileInputRef.current?.click()}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={`relative group border rounded-sm flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 min-h-[140px] bg-[var(--color-background)] ${
					isDragOver
						? "border-[var(--color-foreground)] bg-[var(--color-foreground)]/[0.04] scale-[1.01]"
						: "border-dashed border-[var(--color-border)] hover:border-[var(--color-muted)] hover:bg-[var(--color-foreground)]/[0.02]"
				}`}
			>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileSelect}
					accept="image/*"
					className="hidden"
				/>

				{value ? (
					<div className="relative w-full h-full flex flex-col items-center gap-3">
						<div className="relative max-h-[180px] rounded-sm overflow-hidden border border-[var(--color-border)] bg-[var(--color-border-subtle)]">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={value}
								alt="Upload preview"
								className="object-contain max-h-[180px] w-full"
							/>
						</div>
						<button
							type="button"
							onClick={handleClear}
							className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-sm transition-colors cursor-pointer"
						>
							× Remove Image
						</button>
					</div>
				) : (
					<div className="flex flex-col items-center gap-2">
						<span className="text-2xl opacity-60 group-hover:scale-110 transition-transform duration-300">
							📁
						</span>
						<p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors px-4">
							{placeholder}
						</p>
						<span className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-muted-foreground)]/60">
							Supports PNG, JPG, GIF up to 5MB
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
