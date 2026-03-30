import type { Room as ApiRoom, DashboardResponse } from "@animal-zoom/share";
import React from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { apiRequest } from "../../network/apiClient";
import { getSessionsByDate } from "../calendar/data";
import type { DashboardRoom, FriendStatus } from "./data";
import { createDashboardDataWithRooms, type DashboardData } from "./data";

function getTodayFocusKey() {
	return `today_focus_${new Date().toISOString().slice(0, 10)}`;
}

function loadTodayFocus(): string | null {
	try {
		const raw = localStorage.getItem(getTodayFocusKey());
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { text: string; setAt: string };
		return parsed.text ?? null;
	} catch {
		return null;
	}
}

function saveTodayFocus(text: string): void {
	try {
		localStorage.setItem(
			getTodayFocusKey(),
			JSON.stringify({ text, setAt: new Date().toISOString() }),
		);
	} catch {
		// ignore storage errors
	}
}

const QUICK_CHIPS = ["코딩 공부", "자격증 준비", "외국어 학습", "업무 집중"] as const;

function toneFromId(id: string): DashboardRoom["tone"] {
	let sum = 0;
	for (let i = 0; i < id.length; i += 1) {
		sum += id.charCodeAt(i);
	}
	const bucket = sum % 3;
	if (bucket === 0) return "cozy";
	if (bucket === 1) return "focus";
	return "deep";
}

function toDashboardRoomFromApiRoom(apiRoom: ApiRoom): DashboardRoom {
	return {
		id: apiRoom.id,
		name: apiRoom.name,
		description: "Continue studying in this room.",
		tone: toneFromId(apiRoom.id),
		participants: [{ name: "You" }],
	};
}

function toneToIcon(tone: DashboardRoom["tone"]): string {
	switch (tone) {
		case "cozy":
			return "local_cafe";
		case "focus":
			return "auto_stories";
		case "deep":
			return "water";
	}
}

function toneToAccent(tone: DashboardRoom["tone"]): string {
	switch (tone) {
		case "cozy":
			return "text-primary bg-primary/10";
		case "focus":
			return "text-blue-300 bg-blue-500/10";
		case "deep":
			return "text-emerald-300 bg-emerald-500/10";
	}
}

function sessionToneBadgeClass(tone: "focus" | "cozy" | "deep"): string {
	switch (tone) {
		case "focus":
			return "text-xs px-1.5 py-0.5 rounded bg-white/5 text-blue-400";
		case "deep":
			return "text-xs px-1.5 py-0.5 rounded bg-white/5 text-purple-400";
		case "cozy":
			return "text-xs px-1.5 py-0.5 rounded bg-white/5 text-green-400";
	}
}

function statusDot(status: FriendStatus): string {
	switch (status) {
		case "online":
			return "bg-emerald-500";
		case "away":
			return "bg-amber-400";
		case "offline":
			return "bg-slate-400";
	}
}

export function DashboardPage() {
	const navigate = useNavigate();
	const { token, logout } = useAuth();
	const [search, setSearch] = React.useState("");
	const [showAllRooms, setShowAllRooms] = React.useState(false);
	const [panel, setPanel] = React.useState<null | "notifications">(null);
	const [todayFocus, setTodayFocus] = React.useState<string | null>(() =>
		loadTodayFocus(),
	);
	const [focusInput, setFocusInput] = React.useState("");

	const handleSetFocus = React.useCallback((text: string) => {
		const trimmed = text.trim();
		if (!trimmed) return;
		saveTodayFocus(trimmed);
		setTodayFocus(trimmed);
		setFocusInput("");
	}, []);

	const handleResetFocus = React.useCallback(() => {
		localStorage.removeItem(getTodayFocusKey());
		setTodayFocus(null);
		setFocusInput("");
	}, []);

	const todaySessions = React.useMemo(() => {
		const today = new Date().toISOString().slice(0, 10);
		return getSessionsByDate(today);
	}, []);

	const [state, setState] = React.useState<
		| { status: "loading" }
		| { status: "error"; message: string }
		| { status: "ready"; data: DashboardData }
	>(() => ({ status: "loading" }));

	const load = React.useCallback(() => {
		if (!token) {
			navigate(`/login?next=${encodeURIComponent("/dashboard")}`, {
				replace: true,
			});
			return;
		}

		setState({ status: "loading" });
		apiRequest<DashboardResponse>({ path: "/dashboard", method: "GET", token })
			.then((res) => {
				if (!res.ok) {
					if (res.error === "unauthorized") {
						logout();
						navigate(`/login?next=${encodeURIComponent("/dashboard")}`, {
							replace: true,
						});
						return;
					}
					setState({ status: "error", message: res.error ?? "Failed to load" });
					return;
				}

				const rooms: DashboardRoom[] = (res.rooms ?? []).map(
					toDashboardRoomFromApiRoom,
				);
				setState({
					status: "ready",
					data: createDashboardDataWithRooms(rooms),
				});
			})
			.catch((e: unknown) =>
				setState({
					status: "error",
					message: e instanceof Error ? e.message : String(e),
				}),
			);
	}, [createDashboardDataWithRooms, logout, navigate, token]);

	const goToCreateRoom = React.useCallback(() => {
		navigate("/room/create");
	}, [navigate]);

	const goToJoinRoom = React.useCallback(
		(roomId: string) => {
			navigate(`/room/join/${roomId}`);
		},
		[navigate],
	);

	React.useEffect(() => {
		load();
	}, [load]);

	const filteredRooms = React.useMemo(() => {
		if (state.status !== "ready") return [];
		const needle = search.trim().toLowerCase();
		const list = needle.length
			? state.data.rooms.filter((room) =>
					room.name.toLowerCase().includes(needle),
				)
			: state.data.rooms;
		return showAllRooms ? list : list.slice(0, 4);
	}, [search, showAllRooms, state]);

	if (state.status === "loading") {
		return (
			<div className="min-h-screen bg-charcoal-dark text-gray-200 font-sans">
				<header className="sticky top-0 z-50 border-b border-white/10 bg-charcoal-dark/80 backdrop-blur-md">
					<div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 py-4 md:px-10">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-control-bg ring-1 ring-white/10" />
							<div className="space-y-2">
								<div className="h-3 w-24 rounded bg-control-bg ring-1 ring-white/10" />
								<div className="h-3 w-16 rounded bg-control-bg ring-1 ring-white/10" />
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-10 w-10 rounded-full bg-control-bg ring-1 ring-white/10" />
							<div className="h-10 w-10 rounded-full bg-control-bg ring-1 ring-white/10" />
							<div className="h-10 w-10 rounded-full bg-control-bg ring-1 ring-white/10" />
						</div>
					</div>
				</header>

				<main className="mx-auto w-full max-w-[1440px] px-6 pb-24 pt-8 md:px-10">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
						<div className="flex flex-col gap-8">
							<section className="rounded-lg bg-surface-dark ring-1 ring-white/10 p-8">
								<div className="animate-pulse space-y-4">
									<div className="h-6 w-56 rounded bg-charcoal-light/70" />
									<div className="h-4 w-80 rounded bg-charcoal-light/70" />
									<div className="h-3 w-full rounded bg-charcoal-light/70" />
								</div>
							</section>

							<section>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									{Array.from({ length: 4 }).map((_, idx) => (
										<div
											key={idx}
											className="rounded-lg bg-surface-dark p-5 ring-1 ring-white/10"
										>
											<div className="animate-pulse space-y-3">
												<div className="h-10 w-10 rounded bg-charcoal-light/70" />
												<div className="h-4 w-40 rounded bg-charcoal-light/70" />
												<div className="h-3 w-full rounded bg-charcoal-light/70" />
											</div>
										</div>
									))}
								</div>
							</section>
						</div>

						<aside className="flex flex-col gap-6">
							<section className="rounded-lg bg-surface-dark p-6 ring-1 ring-white/10">
								<div className="animate-pulse space-y-4">
									<div className="h-4 w-40 rounded bg-charcoal-light/70" />
									<div className="h-40 w-full rounded bg-charcoal-light/40" />
								</div>
							</section>
							<section className="rounded-lg bg-surface-dark p-6 ring-1 ring-white/10">
								<div className="animate-pulse space-y-3">
									<div className="h-4 w-32 rounded bg-charcoal-light/70" />
									{Array.from({ length: 3 }).map((_, idx) => (
										<div
											key={idx}
											className="h-10 w-full rounded bg-charcoal-light/40"
										/>
									))}
								</div>
							</section>
						</aside>
					</div>
				</main>
			</div>
		);
	}

	if (state.status === "error") {
		return (
			<div className="min-h-screen bg-charcoal-dark text-gray-200 font-sans flex items-center justify-center px-6 py-10">
				<div className="w-full max-w-[560px] rounded-2xl bg-surface-dark ring-1 ring-white/10 p-6 md:p-8">
					<h1 className="text-xl font-semibold text-gray-100">
						Dashboard failed to load
					</h1>
					<p className="mt-2 text-sm text-gray-400">{state.message}</p>
					<button
						type="button"
						onClick={load}
						className="mt-6 w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-red-600 active:scale-[0.99] transition"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	const { friends, dailyGoal, weeklyBars } = state.data;
	const rooms = filteredRooms;
	const dailyPct = Math.max(
		0,
		Math.min(100, (dailyGoal.done / dailyGoal.target) * 100),
	);

	return (
		<div className="min-h-screen bg-charcoal-dark text-gray-200 font-sans">
			<header className="sticky top-0 z-50 border-b border-white/10 bg-charcoal-dark/80 backdrop-blur-md">
				<div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 py-4 md:px-10">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-control-bg text-white ring-1 ring-white/10">
							<span className="material-symbols-outlined text-[22px]">
								park
							</span>
						</div>
						<div className="leading-none">
							<div className="text-sm font-semibold tracking-wide text-gray-100">
								Animal Zoom
							</div>
							<div className="text-[11px] text-gray-400">Dashboard</div>
						</div>
					</div>

					<label className="hidden w-full max-w-md md:block">
						<span className="sr-only">Search</span>
						<div className="flex h-10 w-full items-center rounded-full bg-control-bg ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-primary/50">
							<span className="material-symbols-outlined px-4 text-[20px] text-gray-400">
								search
							</span>
							<input
								className="form-input h-full w-full border-none bg-transparent px-0 text-sm text-gray-100 placeholder:text-gray-500 focus:ring-0"
								placeholder="Find a room..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
							<span className="px-4 text-[11px] text-gray-500">Ctrl K</span>
						</div>
					</label>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setPanel("notifications")}
							className="flex h-10 w-10 items-center justify-center rounded-full bg-control-bg ring-1 ring-white/10 hover:bg-control-bg/80"
							title="Notifications"
						>
							<span className="material-symbols-outlined text-[20px]">
								notifications
							</span>
						</button>
						<button
							type="button"
							onClick={() => navigate("/settings")}
							className="flex h-10 w-10 items-center justify-center rounded-full bg-control-bg ring-1 ring-white/10 hover:bg-control-bg/80"
							title="Settings"
						>
							<span className="material-symbols-outlined text-[20px]">
								settings
							</span>
						</button>
						{token ? (
							<button
								type="button"
								onClick={() => {
									logout();
									navigate("/login", { replace: true });
								}}
								className="h-10 px-4 rounded-full bg-control-bg ring-1 ring-white/10 text-sm font-semibold hover:bg-control-bg/80"
								title="Logout"
							>
								Logout
							</button>
						) : null}
						<div className="h-10 w-10 overflow-hidden rounded-full bg-surface-dark ring-2 ring-primary/60">
							<div className="grid h-full w-full place-items-center text-sm font-semibold text-gray-100">
								AZ
							</div>
						</div>
					</div>
				</div>
			</header>

			<main className="mx-auto w-full max-w-[1440px] px-6 pb-24 pt-8 md:px-10">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
					<div className="flex flex-col gap-8">
						{todayFocus === null ? (
							<section className="relative overflow-hidden rounded-lg bg-surface-dark ring-2 ring-primary/40">
								<div className="absolute -right-10 -bottom-10 opacity-10">
									<span className="material-symbols-outlined text-[180px] text-primary">
										edit_note
									</span>
								</div>
								<div className="relative flex flex-col gap-5 p-6 md:p-8">
									<div>
										<h1 className="text-xl font-semibold tracking-tight text-gray-100 md:text-2xl">
											What's on your agenda today?
										</h1>
										<p className="mt-1 text-sm text-gray-400">
											오늘 목표를 설정하면 더 집중된 세션을 시작할 수 있어요.
										</p>
									</div>

									{todaySessions.length > 0 ? (
										<div className="mb-3">
											<p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
												오늘 예정된 세션
											</p>
											<div className="flex flex-col">
												{todaySessions.map((session) => (
													<button
														key={session.id}
														type="button"
														onClick={() => handleSetFocus(session.roomName)}
														className="flex items-center gap-2 text-sm text-slate-300 py-1 cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 transition-colors"
													>
														<span className="text-xs text-slate-400 font-mono w-24 shrink-0">
															{session.startTime}–{session.endTime}
														</span>
														<span className="flex-1 truncate text-left">
															{session.roomName}
														</span>
														<span className={sessionToneBadgeClass(session.tone)}>
															{session.tone}
														</span>
													</button>
												))}
											</div>
										</div>
									) : null}

									<div className="flex flex-wrap gap-2">
										{QUICK_CHIPS.map((chip) => (
											<button
												key={chip}
												type="button"
												onClick={() => setFocusInput(chip)}
												className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-200 hover:bg-white/10 transition"
											>
												{chip}
											</button>
										))}
									</div>

									<div className="flex gap-2">
										<input
											className="flex-1 h-11 rounded-xl bg-control-bg px-4 text-sm text-gray-100 placeholder:text-gray-500 ring-1 ring-white/10 focus:ring-2 focus:ring-primary/50 focus:outline-none"
											placeholder="직접 입력하기..."
											value={focusInput}
											onChange={(e) => setFocusInput(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") handleSetFocus(focusInput);
											}}
										/>
										<button
											type="button"
											onClick={() => handleSetFocus(focusInput)}
											className="h-11 px-5 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.99] transition"
										>
											시작하기
										</button>
									</div>
								</div>
							</section>
						) : (
							<section className="relative overflow-hidden rounded-lg bg-surface-dark ring-1 ring-white/10">
								<div className="absolute -right-10 -bottom-10 opacity-10">
									<span className="material-symbols-outlined text-[180px] text-primary">
										eco
									</span>
								</div>
								<div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:p-8">
									<div className="flex flex-1 items-center gap-4">
										<div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary/20 ring-4 ring-charcoal-dark/60">
											<span className="material-symbols-outlined text-[28px] text-primary">
												emoji_events
											</span>
										</div>
										<div className="min-w-0">
											<p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
												오늘의 목표 🎯
											</p>
											<h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-100 md:text-3xl truncate">
												{todayFocus}
											</h1>
										</div>
									</div>

									<div className="flex shrink-0 items-center gap-3">
										<button
											type="button"
											onClick={handleResetFocus}
											className="h-9 px-4 rounded-xl bg-control-bg text-xs font-semibold text-gray-300 ring-1 ring-white/10 hover:bg-control-bg/80 transition"
										>
											목표 변경
										</button>
										<button
											type="button"
											onClick={goToCreateRoom}
											className="h-9 px-5 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.99] transition flex items-center gap-2"
										>
											<span className="material-symbols-outlined text-[18px]">
												meeting_room
											</span>
											방 바로 입장
										</button>
									</div>
								</div>

								<div className="relative border-t border-white/10 px-6 pb-5 pt-4 md:px-8">
									<div className="rounded-xl bg-charcoal-light/60 p-4 ring-1 ring-white/10">
										<div className="flex items-end justify-between">
											<span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
												Daily study goal
											</span>
											<span className="text-sm font-semibold text-gray-200">
												{dailyGoal.done} / {dailyGoal.target} min
											</span>
										</div>
										<div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-control-bg ring-1 ring-white/10">
											<div
												className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400"
												style={{ width: `${dailyPct}%` }}
											/>
										</div>
										<p className="mt-3 text-xs text-gray-500">
											Keep going. Small sessions stack.
										</p>
									</div>

									{todaySessions.length > 0 ? (
										<div className="mt-4">
											<p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
												오늘 예정된 세션
											</p>
											<div className="flex flex-col">
												{todaySessions.map((session) => (
													<div
														key={session.id}
														className="flex items-center gap-2 text-sm text-slate-300 py-1"
													>
														<span className="text-xs text-slate-400 font-mono w-24 shrink-0">
															{session.startTime}–{session.endTime}
														</span>
														<span className="flex-1 truncate">
															{session.roomName}
														</span>
														<span className={sessionToneBadgeClass(session.tone)}>
															{session.tone}
														</span>
													</div>
												))}
											</div>
										</div>
									) : null}
								</div>
							</section>
						)}

						<section>
							<div className="mb-5 flex items-center justify-between">
								<h2 className="flex items-center gap-2 text-xl font-semibold text-gray-100 md:text-2xl">
									<span className="material-symbols-outlined text-primary">
										dashboard
									</span>
									Active rooms
								</h2>
								{state.data.rooms.length > 4 ? (
									<button
										type="button"
										onClick={() => setShowAllRooms((prev) => !prev)}
										className="text-sm font-semibold text-gray-300 hover:text-white"
									>
										{showAllRooms ? "Collapse" : "View all"}
									</button>
								) : null}
							</div>

							{rooms.length === 0 ? (
								<p className="mb-4 text-sm text-gray-400">
									{state.data.rooms.length === 0
										? "No rooms yet. Create one to get started."
										: "No rooms match your search."}
								</p>
							) : null}

							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<button
									type="button"
									onClick={goToCreateRoom}
									className="rounded-lg bg-surface-dark p-5 text-left ring-1 ring-white/10 hover:ring-white/20 transition flex flex-col"
								>
									<div className="mb-4 flex items-start justify-between">
										<div className="grid h-14 w-14 place-items-center rounded-lg bg-control-bg text-gray-200 ring-1 ring-white/10">
											<span className="material-symbols-outlined text-[28px]">
												add
											</span>
										</div>
										<div className="grid h-8 w-8 place-items-center rounded-full bg-charcoal-light text-[11px] font-semibold text-gray-100 ring-2 ring-charcoal-dark">
											Y
										</div>
									</div>
									<h3 className="text-base font-semibold text-gray-100">
										Create a new room
									</h3>
									<p className="mt-1 text-sm text-gray-400">
										Start fresh with a new link.
									</p>
									<div className="mt-auto pt-4">
										<div className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.99] transition">
											<span className="material-symbols-outlined text-[18px]">
												add
											</span>
											Create new room
										</div>
									</div>
								</button>
								{rooms.map((room) => (
									<article
										key={room.id}
										className="rounded-lg bg-surface-dark p-5 ring-1 ring-white/10 hover:ring-white/20 transition flex flex-col"
									>
										<div className="mb-4 flex items-start justify-between">
											<div
												className={`flex h-14 w-14 items-center justify-center rounded-lg ${toneToAccent(
													room.tone,
												)}`}
											>
												<span className="material-symbols-outlined text-[28px]">
													{toneToIcon(room.tone)}
												</span>
											</div>

											<div className="flex -space-x-2">
												{room.participants.slice(0, 3).map((p) => (
													<div
														key={p.name}
														className="grid h-8 w-8 place-items-center rounded-full bg-charcoal-light text-[11px] font-semibold text-gray-100 ring-2 ring-charcoal-dark"
														title={p.name}
													>
														{p.name.slice(0, 1)}
													</div>
												))}
												{room.participants.length > 3 ? (
													<div className="grid h-8 w-8 place-items-center rounded-full bg-charcoal-light text-[10px] font-semibold text-gray-200 ring-2 ring-charcoal-dark">
														+{room.participants.length - 3}
													</div>
												) : null}
											</div>
										</div>

										<h3 className="text-base font-semibold text-gray-100">
											{room.name}
										</h3>
										<p className="mt-1 text-sm text-gray-400">
											{room.description}
										</p>

										<div className="mt-auto pt-4">
											<button
												type="button"
												onClick={() => goToJoinRoom(room.id)}
												className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.99] transition"
											>
												<span className="material-symbols-outlined text-[18px]">
													door_open
												</span>
												Enter room
											</button>
										</div>
									</article>
								))}
							</div>
						</section>
					</div>

					<aside className="flex flex-col gap-6">
						<section className="rounded-lg bg-surface-dark p-6 ring-1 ring-white/10">
							<h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-100">
								<span className="material-symbols-outlined text-primary">
									bar_chart
								</span>
								Weekly growth
							</h3>

							<div className="mb-6 flex h-40 items-end justify-between gap-2">
								{weeklyBars.map((h, idx) => (
									<div
										key={idx}
										className="flex flex-1 flex-col items-center gap-2"
									>
										<div
											className={
												idx === 3
													? "w-full rounded-t-lg bg-primary"
													: "w-full rounded-t-lg bg-primary/30"
											}
											style={{ height: `${h}%` }}
										/>
										<span className="text-[10px] font-semibold text-gray-500">
											{"MTWTFSS".charAt(idx)}
										</span>
									</div>
								))}
							</div>

							<div className="space-y-3">
								<div className="flex items-center justify-between rounded-xl bg-charcoal-light/60 p-3 ring-1 ring-white/10">
									<div className="flex items-center gap-3">
										<span className="material-symbols-outlined text-primary">
											schedule
										</span>
										<span className="text-sm font-medium text-gray-200">
											Total focus
										</span>
									</div>
									<span className="text-sm font-semibold text-gray-100">
										14.5h
									</span>
								</div>
								<div className="flex items-center justify-between rounded-xl bg-charcoal-light/60 p-3 ring-1 ring-white/10">
									<div className="flex items-center gap-3">
										<span className="material-symbols-outlined text-emerald-300">
											local_florist
										</span>
										<span className="text-sm font-medium text-gray-200">
											Sessions
										</span>
									</div>
									<span className="text-sm font-semibold text-gray-100">
										12
									</span>
								</div>
							</div>
						</section>

						<section className="rounded-lg bg-surface-dark p-6 ring-1 ring-white/10">
							<h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-100">
								<span className="material-symbols-outlined text-blue-300">
									group
								</span>
								Friends
							</h3>

							<div className="space-y-4">
								{friends.map((f) => (
									<div key={f.id} className="flex items-center gap-3">
										<div className="relative">
											<div className="grid h-10 w-10 place-items-center rounded-full bg-charcoal-light text-sm font-semibold text-gray-100 ring-1 ring-white/10">
												{f.name.slice(0, 1)}
											</div>
											<div
												className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-charcoal-dark ${statusDot(
													f.status,
												)}`}
											/>
										</div>
										<div className="min-w-0 flex-1">
											<div className="truncate text-sm font-semibold text-gray-100">
												{f.name}
											</div>
											<div
												className={
													f.status === "offline"
														? "truncate text-xs text-gray-500 italic"
														: "truncate text-xs text-gray-400"
												}
											>
												{f.activity}
											</div>
										</div>
									</div>
								))}
							</div>

							<button
								type="button"
								className="mt-6 w-full rounded-xl bg-control-bg px-4 py-2 text-sm font-semibold text-gray-200 ring-1 ring-white/10 hover:bg-control-bg/80"
							>
								View more
							</button>
						</section>
					</aside>
				</div>
			</main>

			{panel === "notifications" ? (
				<div
					className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6"
					role="dialog"
					aria-modal="true"
					onClick={() => setPanel(null)}
				>
					<div
						className="w-full max-w-[520px] rounded-2xl bg-surface-dark ring-1 ring-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-sm text-gray-400">Notifications</p>
								<h3 className="mt-1 text-2xl font-semibold text-gray-100 tracking-tight">
									All caught up
								</h3>
							</div>
							<button
								type="button"
								onClick={() => setPanel(null)}
								className="h-10 w-10 rounded-full bg-control-bg ring-1 ring-white/10 hover:bg-control-bg/80"
								title="Close"
							>
								<span className="material-symbols-outlined text-[20px]">
									close
								</span>
							</button>
						</div>
						<div className="mt-6 space-y-3 text-sm text-gray-300">
							<p>
								No new notifications right now. Jump into a room when you're
								ready.
							</p>
						</div>
					</div>
				</div>
			) : null}

			<nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-charcoal-dark/90 backdrop-blur-md md:hidden">
				<div className="mx-auto flex max-w-[1440px] items-center justify-around py-3">
					<button
						type="button"
						className="flex flex-col items-center text-primary"
					>
						<span className="material-symbols-outlined">dashboard</span>
						<span className="text-[10px] font-semibold">Home</span>
					</button>
					<button
						type="button"
						className="flex flex-col items-center text-gray-500"
					>
						<span className="material-symbols-outlined">park</span>
						<span className="text-[10px] font-medium">Rooms</span>
					</button>
					<button
						type="button"
						className="flex flex-col items-center text-gray-500"
					>
						<span className="material-symbols-outlined">analytics</span>
						<span className="text-[10px] font-medium">Stats</span>
					</button>
					<button
						type="button"
						className="flex flex-col items-center text-gray-500"
					>
						<span className="material-symbols-outlined">person</span>
						<span className="text-[10px] font-medium">Profile</span>
					</button>
				</div>
			</nav>
		</div>
	);
}
