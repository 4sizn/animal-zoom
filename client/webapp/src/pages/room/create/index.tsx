import React from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../auth/AuthContext";
import { apiRequest } from "../../../network/apiClient";

function createRoomId(): string {
	const id = `room-${Date.now().toString(36)}`;

	if (id.length === 0) {
		throw new Error("Failed to create room id");
	}

	return id;
}

export function RoomCreatePage() {
	const navigate = useNavigate();
	const { token } = useAuth();
	const [roomName, setRoomName] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	type CreateRoomResponse =
		| { ok: true; room: { id: string } }
		| { ok: false; error?: string };

	const goBack = React.useCallback(() => {
		navigate("/dashboard");
	}, [navigate]);

	const onSubmit = React.useCallback(
		async (e: React.FormEvent) => {
			if (isSubmitting) {
				return;
			}
			e.preventDefault();
			setError(null);
			const trimmed = roomName.trim();
			if (trimmed.length === 0) {
				setError("Room name is required.");
				return;
			}

			setIsSubmitting(true);
			try {
				if (!token) {
					const demoRoomId = createRoomId();
					navigate(`/room/study/${demoRoomId}`, { replace: true });
					return;
				}

				const res = await apiRequest<CreateRoomResponse>({
					path: "/rooms",
					method: "POST",
					body: { name: trimmed },
					token,
				});

				if (res.ok) {
					navigate(`/room/study/${res.room.id}`, { replace: true });
					return;
				}

				setError(res.error ?? "Failed to create room.");
			} catch (e2: unknown) {
				setError(e2 instanceof Error ? e2.message : "Network error.");
			} finally {
				setIsSubmitting(false);
			}
		},
		[isSubmitting, navigate, roomName, token],
	);

	return (
		<div className="min-h-screen bg-charcoal-dark text-gray-200 font-sans flex items-center justify-center px-6 py-10">
			<div className="w-full max-w-[560px]">
				<header className="flex items-center justify-between gap-4 mb-6">
					<div className="flex items-center gap-3">
						<div className="h-12 w-12 rounded-2xl bg-control-bg ring-1 ring-white/10 grid place-items-center">
							<span className="material-symbols-outlined text-[22px] text-primary">
								add_box
							</span>
						</div>
						<div>
							<h1 className="text-xl font-semibold tracking-tight text-gray-100">
								Create a room
							</h1>
							<p className="text-xs text-gray-400">
								Set up a session between dashboard and study.
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={goBack}
						className="h-10 px-4 rounded-full bg-control-bg ring-1 ring-white/10 text-sm font-semibold hover:bg-control-bg/80"
					>
						Back
					</button>
				</header>

				<div className="rounded-2xl bg-surface-dark ring-1 ring-white/10 p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
					<div>
						<p className="text-sm text-gray-400">Room details</p>
						<h2 className="mt-1 text-2xl font-semibold text-gray-100 tracking-tight">
							Pick a name to get started.
						</h2>
					</div>

					<form onSubmit={onSubmit} className="mt-6 space-y-5">
						<div className="space-y-2">
							<label
								className="block text-sm font-semibold text-gray-200"
								htmlFor="room-name"
							>
								Room name
							</label>
							<div className="flex items-center gap-3 rounded-xl bg-charcoal-light/60 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-primary/50 px-4 h-12">
								<span className="material-symbols-outlined text-[18px] text-gray-400">
									home
								</span>
								<input
									id="room-name"
									className="form-input w-full border-none bg-transparent px-0 text-sm text-gray-100 placeholder:text-gray-500 focus:ring-0"
									value={roomName}
									onChange={(e) => {
										setRoomName(e.target.value);
										setError(null);
									}}
									placeholder="e.g. The Cozy Cafe"
									autoComplete="off"
								/>
							</div>
							<p className="text-xs text-gray-500">
								{token
									? "Creates a real room tied to your account."
									: "Sign in to create a real room. You can still start a demo room."}
							</p>
						</div>

						{error ? (
							<div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
								{error}
							</div>
						) : null}

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition"
						>
							{isSubmitting
								? "Creating..."
								: token
									? "Create room"
									: "Create demo room"}
						</button>

						{token ? null : (
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<button
									type="button"
									onClick={() => navigate("/login")}
									className="h-12 rounded-xl bg-control-bg text-gray-100 text-sm font-semibold ring-1 ring-white/10 hover:bg-control-bg/80 active:scale-[0.99] transition"
								>
									Sign in
								</button>
								<button
									type="button"
									disabled={isSubmitting}
									onClick={() => {
										if (isSubmitting) return;
										setError(null);
										const trimmed = roomName.trim();
										if (trimmed.length === 0) {
											setError("Room name is required.");
											return;
										}
										setIsSubmitting(true);
										const demoRoomId = createRoomId();
										navigate(`/room/study/${demoRoomId}`, { replace: true });
									}}
									className="h-12 rounded-xl bg-charcoal-light/60 text-gray-100 text-sm font-semibold ring-1 ring-white/10 hover:bg-charcoal-light/80 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
								>
									Continue as demo
								</button>
							</div>
						)}
					</form>
				</div>

				<p className="mt-6 text-center text-xs text-gray-500">
					This page is the bridge between dashboard and the study room.
				</p>
			</div>
		</div>
	);
}
