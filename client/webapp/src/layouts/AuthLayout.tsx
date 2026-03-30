import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

const NAV_ITEMS = [
	{ icon: "home", path: "/dashboard", label: "Dashboard" },
	{ icon: "calendar_month", path: "/calendar", label: "Calendar" },
	{ icon: "settings", path: "/settings", label: "Settings" },
	{ icon: "meeting_room", path: "/room/create", label: "Create Room" },
] as const;

function SocketIndicator({
	status,
}: {
	status: "connected" | "connecting" | "disconnected";
}): React.JSX.Element {
	const color =
		status === "connected"
			? "bg-green-500"
			: status === "connecting"
				? "bg-yellow-500"
				: "bg-gray-500";

	return (
		<span
			className={`inline-block w-2 h-2 rounded-full ${color}`}
			title={status}
		/>
	);
}

export function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	const { token, logout, socketStatus } = useAuth();
	const location = useLocation();

	if (!token) {
		return <Navigate replace to="/login" />;
	}

	return (
		<div className="h-screen w-screen flex overflow-hidden bg-surface">
			{/* Fixed Left Icon Navigation */}
			<nav className="flex flex-col items-center h-screen w-20 py-6 bg-surface-container-lowest border-r border-[rgba(72,72,71,0.2)]">
				{/* Brand Identity */}
				<div className="mb-10 flex flex-col items-center gap-1">
					<span className="text-xl font-bold text-[#FF6719] font-headline">
						AZ
					</span>
					<div className="w-1 h-1 rounded-full bg-[#FF6719]" />
				</div>

				{/* Navigation Items */}
				<div className="flex flex-col gap-4 flex-1">
					{NAV_ITEMS.map((item) => {
						const isActive = location.pathname === item.path;
						return (
							<Link
								key={item.path}
								to={item.path}
								title={item.label}
								className={
									isActive
										? "relative flex items-center justify-center w-12 h-12 bg-surface-variant text-[#FF6719] rounded-xl before:absolute before:left-[-12px] before:w-[2px] before:h-6 before:bg-[#FF6719]"
										: "flex items-center justify-center w-12 h-12 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded-xl"
								}
							>
								<span className="material-symbols-outlined">
									{item.icon}
								</span>
							</Link>
						);
					})}
				</div>

				{/* Bottom: Logout */}
				<div className="flex flex-col gap-6 items-center">
					<button
						type="button"
						onClick={logout}
						title="Logout"
						className="flex items-center justify-center w-12 h-12 text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors rounded-xl"
					>
						<span className="material-symbols-outlined">
							power_settings_new
						</span>
					</button>
				</div>
			</nav>

			{/* Main Content Shell */}
			<main className="flex-1 flex flex-col overflow-hidden">
				{/* Header Bar */}
				<header className="h-16 px-8 flex items-center justify-between bg-surface/80 backdrop-blur-xl border-b border-[rgba(72,72,71,0.2)]">
					<div className="flex items-center gap-3">
						<h2 className="text-lg font-semibold text-on-surface font-headline">
							{NAV_ITEMS.find((item) =>
								location.pathname.startsWith(item.path),
							)?.label ?? "Animal Zoom"}
						</h2>
					</div>
					<div className="flex items-center gap-4">
						<SocketIndicator status={socketStatus} />
						<div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant text-sm font-semibold">
							<span className="material-symbols-outlined text-base">
								person
							</span>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<div className="flex-1 overflow-auto">{children}</div>
			</main>
		</div>
	);
}
