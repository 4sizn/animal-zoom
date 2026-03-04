import React from "react";

import type { DashboardRoom, FriendStatus } from "./data";
import { type DashboardData, loadDashboardData } from "./data";

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
	const [state, setState] = React.useState<
		| { status: "loading" }
		| { status: "error"; message: string }
		| { status: "ready"; data: DashboardData }
	>(() => ({ status: "loading" }));

	const load = React.useCallback(() => {
		setState({ status: "loading" });
		loadDashboardData()
			.then((data) => setState({ status: "ready", data }))
			.catch((e: unknown) =>
				setState({
					status: "error",
					message: e instanceof Error ? e.message : String(e),
				}),
			);
	}, []);

	React.useEffect(() => {
		load();
	}, [load]);

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

	const { rooms, friends, dailyGoal, weeklyBars } = state.data;
	const dailyPct = Math.max(
		0,
		Math.min(100, (dailyGoal.done / dailyGoal.target) * 100),
	);

	if (rooms.length === 0) {
		return (
			<div className="min-h-screen bg-charcoal-dark text-gray-200 font-sans flex items-center justify-center px-6 py-10">
				<div className="w-full max-w-[560px] rounded-2xl bg-surface-dark ring-1 ring-white/10 p-6 md:p-8">
					<h1 className="text-xl font-semibold text-gray-100">
						No active rooms
					</h1>
					<p className="mt-2 text-sm text-gray-400">
						Create a new room to get started.
					</p>
					<div className="mt-6 grid gap-3">
						<button
							type="button"
							className="w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-red-600 active:scale-[0.99] transition"
						>
							New room
						</button>
						<button
							type="button"
							onClick={load}
							className="w-full h-12 rounded-xl bg-control-bg text-gray-100 text-sm font-semibold ring-1 ring-white/10 hover:bg-control-bg/80 active:scale-[0.99] transition"
						>
							Refresh
						</button>
					</div>
				</div>
			</div>
		);
	}

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
								value=""
								readOnly
							/>
							<span className="px-4 text-[11px] text-gray-500">Ctrl K</span>
						</div>
					</label>

					<div className="flex items-center gap-2">
						<button
							type="button"
							className="flex h-10 w-10 items-center justify-center rounded-full bg-control-bg ring-1 ring-white/10 hover:bg-control-bg/80"
							title="Notifications"
						>
							<span className="material-symbols-outlined text-[20px]">
								notifications
							</span>
						</button>
						<button
							type="button"
							className="flex h-10 w-10 items-center justify-center rounded-full bg-control-bg ring-1 ring-white/10 hover:bg-control-bg/80"
							title="Settings"
						>
							<span className="material-symbols-outlined text-[20px]">
								settings
							</span>
						</button>
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
						<section className="relative overflow-hidden rounded-lg bg-surface-dark ring-1 ring-white/10">
							<div className="absolute -right-10 -bottom-10 opacity-10">
								<span className="material-symbols-outlined text-[180px] text-primary">
									eco
								</span>
							</div>
							<div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
								<div className="flex items-center gap-4">
									<div className="grid h-16 w-16 place-items-center rounded-full bg-primary/20 ring-4 ring-charcoal-dark/60">
										<span className="material-symbols-outlined text-[28px] text-primary">
											person
										</span>
									</div>
									<div>
										<h1 className="text-2xl font-semibold tracking-tight text-gray-100 md:text-3xl">
											Welcome back
										</h1>
										<p className="mt-1 text-sm text-gray-400 md:text-base">
											Ready for a focused session?
										</p>
									</div>
								</div>

								<div className="flex-1">
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
								</div>
							</div>
						</section>

						<section>
							<div className="mb-5 flex items-center justify-between">
								<h2 className="flex items-center gap-2 text-xl font-semibold text-gray-100 md:text-2xl">
									<span className="material-symbols-outlined text-primary">
										dashboard
									</span>
									Active rooms
								</h2>
								<button
									type="button"
									className="text-sm font-semibold text-gray-300 hover:text-white"
								>
									View all
								</button>
							</div>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								{rooms.map((room) => (
									<article
										key={room.id}
										className="rounded-lg bg-surface-dark p-5 ring-1 ring-white/10 hover:ring-white/20 transition"
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

										<button
											type="button"
											className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.99] transition"
										>
											<span className="material-symbols-outlined text-[18px]">
												eco
											</span>
											Join room
										</button>
									</article>
								))}

								<button
									type="button"
									className="rounded-lg border border-dashed border-white/15 bg-surface-dark/30 p-5 text-left ring-1 ring-white/10 hover:ring-white/20 transition"
								>
									<div className="flex items-center gap-3">
										<div className="grid h-12 w-12 place-items-center rounded-full bg-control-bg text-gray-200 ring-1 ring-white/10">
											<span className="material-symbols-outlined text-[22px]">
												add
											</span>
										</div>
										<div>
											<div className="text-base font-semibold text-gray-100">
												New room
											</div>
											<div className="text-sm text-gray-400">
												Start your own session
											</div>
										</div>
									</div>
								</button>
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
