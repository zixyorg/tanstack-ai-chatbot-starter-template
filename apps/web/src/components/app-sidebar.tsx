import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SquarePen, Search, Menu, X } from "lucide-react";

type NavItem = {
	label: string;
	icon: typeof SquarePen;
	hotkeys?: string[];
	variant?: "primary";
	onClick?: () => void;
};

const navItems: NavItem[] = [
	{ label: "New chat", icon: SquarePen, hotkeys: ["⌘", "N"], variant: "primary" },
	{ label: "Search chat", icon: Search },
];

const recentItems = ["Quick access to your lates...", "Pick up right where you le..."];

export function AppSidebar() {
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && mobileOpen) {
				setMobileOpen(false);
			}
		};

		if (mobileOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768 && mobileOpen) {
				setMobileOpen(false);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [mobileOpen]);

	const handleNewChat = useCallback(() => {
		console.log("New chat clicked");
		setMobileOpen(false);
	}, []);

	const handleSearchChat = useCallback(() => {
		console.log("Search chat clicked");
		setMobileOpen(false);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "n" && !e.shiftKey) {
				e.preventDefault();
				handleNewChat();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleNewChat]);

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className="fixed left-4 top-4 z-50 md:hidden text-white hover:bg-white/10"
				onClick={() => setMobileOpen(true)}
				aria-label="Open sidebar"
			>
				<Menu className="h-5 w-5" />
			</Button>

			{mobileOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 md:hidden"
					onClick={() => setMobileOpen(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setMobileOpen(false);
						}
					}}
					role="presentation"
					aria-hidden="true"
				/>
			)}

			<aside
				className={cn(
					"flex flex-col gap-6 px-2 py-6 text-white transition-all duration-200 ease-in-out",
					"md:relative md:transition-[width]",
					collapsed ? "md:w-10" : "md:w-64",
					"fixed left-0 top-0 z-50 h-full w-64 transform bg-[#181818] md:transform-none",
					mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
				)}
				aria-label="Sidebar"
			>
				<header className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className={cn("text-lg font-semibold leading-tight", collapsed && "md:sr-only")}>
							Tanstack
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="flex md:hidden items-center justify-between px-2.5 py-3 text-left text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
							onClick={() => setMobileOpen(false)}
							aria-label="Close sidebar"
						>
							<X className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="hidden md:flex items-center justify-between px-2.5 py-3 text-left text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
							onClick={() => setCollapsed((v) => !v)}
							aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
						>
							<Menu className="h-4 w-4" />
						</Button>
					</div>
				</header>

				<div className="space-y-2">
					{navItems.map((item) => {
						const { label, icon: Icon, variant, hotkeys } = item;
						const handleClick = () => {
							if (label === "New chat") {
								handleNewChat();
							} else if (label === "Search chat") {
								handleSearchChat();
							}
						};

						return (
							<Button
								key={label}
								variant="ghost"
								className={cn(
									"flex w-full items-center justify-between px-2.5 py-3 text-left text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10",
									variant === "primary" && !collapsed && "border border-white/20",
								)}
								onClick={handleClick}
							>
								<span className="flex items-center gap-4 flex-1">
									<Icon className="h-4 w-4 shrink-0" />
									<span className={cn("truncate", collapsed && "md:sr-only")}>{label}</span>
								</span>
								{hotkeys && !collapsed && (
									<span className={cn("hidden md:flex items-center gap-1 text-xs text-white/40", collapsed && "md:hidden")}>
										{hotkeys.map((key, idx) => (
											<kbd key={idx} className="px-1.5 py-0.5 rounded bg-white/10 text-xs">
												{key}
											</kbd>
										))}
									</span>
								)}
							</Button>
						);
					})}
				</div>

				<div className="flex-1 flex flex-col min-h-0">
					<div className="space-y-3">
						<div className={cn("text-xs font-semibold uppercase tracking-wide text-white/40", collapsed && "md:sr-only")}>
							Recent
						</div>
						<div className="space-y-2 text-sm text-white/80">
							{recentItems.map((item) => (
								<button
									key={item}
									className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5 transition-colors"
									onClick={() => setMobileOpen(false)}
									aria-label={`Open ${item}`}
								>
									<span className={cn("truncate", collapsed && "md:sr-only")}>{item}</span>
								</button>
							))}
						</div>
					</div>
				</div>
			</aside>
		</>
	);
}

