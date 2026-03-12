import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { apiRequest } from "../../network/apiClient";

type MeResponse = {
	ok: boolean;
	user?: {
		id: number;
		email: string;
		createdAt: string;
		nickname?: string | null;
		timezone?: string | null;
	};
	error?: string;
};

type UpdateMeResponse = {
	ok: boolean;
	user?: MeResponse["user"];
	error?: string;
};

type ChangePasswordResponse = {
	ok: boolean;
	error?: string;
};

const TIMEZONE_OPTIONS: Array<{ value: string; label: string }> = [
	{ value: "Asia/Seoul", label: "Korea (Asia/Seoul)" },
	{ value: "UTC", label: "UTC" },
	{ value: "Asia/Tokyo", label: "Japan (Asia/Tokyo)" },
	{ value: "Asia/Shanghai", label: "China (Asia/Shanghai)" },
	{ value: "Europe/London", label: "UK (Europe/London)" },
	{ value: "Europe/Paris", label: "France (Europe/Paris)" },
	{ value: "America/New_York", label: "US East (America/New_York)" },
	{ value: "America/Los_Angeles", label: "US West (America/Los_Angeles)" },
];

function formatNowInTimezone(timezone: string) {
	try {
		return new Intl.DateTimeFormat(undefined, {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: timezone,
		}).format(new Date());
	} catch {
		return "";
	}
}

export function SettingsPage() {
	const navigate = useNavigate();
	const { token } = useAuth();
	const [me, setMe] = React.useState<MeResponse["user"] | null>(null);
	const [loadError, setLoadError] = React.useState<string | null>(null);
	const [isLoading, setIsLoading] = React.useState(false);

	const [nickname, setNickname] = React.useState("");
	const [timezone, setTimezone] = React.useState("Asia/Seoul");
	const [profileError, setProfileError] = React.useState<string | null>(null);
	const [isSavingProfile, setIsSavingProfile] = React.useState(false);

	const [currentPassword, setCurrentPassword] = React.useState("");
	const [newPassword, setNewPassword] = React.useState("");
	const [confirmPassword, setConfirmPassword] = React.useState("");
	const [passwordError, setPasswordError] = React.useState<string | null>(null);
	const [passwordSuccess, setPasswordSuccess] = React.useState<string | null>(
		null,
	);
	const [isChangingPassword, setIsChangingPassword] = React.useState(false);

	React.useEffect(() => {
		if (token) return;
		navigate(`/login?next=${encodeURIComponent("/settings")}`, {
			replace: true,
		});
	}, [navigate, token]);

	React.useEffect(() => {
		if (!token) return;
		let cancelled = false;
		setIsLoading(true);
		setLoadError(null);
		apiRequest<MeResponse>({ path: "/users/me", method: "GET", token })
			.then((res) => {
				if (cancelled) return;
				if (!res.ok || !res.user) {
					setLoadError(res.error ?? "Failed to load settings.");
					return;
				}
				setMe(res.user);
				setNickname(res.user.nickname ?? "");
				setTimezone(res.user.timezone ?? "Asia/Seoul");
			})
			.catch((e: unknown) => {
				if (cancelled) return;
				setLoadError(e instanceof Error ? e.message : "Network error.");
			})
			.finally(() => {
				if (cancelled) return;
				setIsLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [token]);

	const onSaveProfile = React.useCallback(async () => {
		if (!token) return;
		if (isSavingProfile) return;
		setProfileError(null);
		setIsSavingProfile(true);
		try {
			const res = await apiRequest<UpdateMeResponse>({
				path: "/users/me",
				method: "PATCH",
				token,
				body: {
					nickname,
					timezone,
				},
			});
			if (!res.ok || !res.user) {
				setProfileError(res.error ?? "Failed to save.");
				return;
			}
			setMe(res.user);
		} catch (e: unknown) {
			setProfileError(e instanceof Error ? e.message : "Network error.");
		} finally {
			setIsSavingProfile(false);
		}
	}, [isSavingProfile, nickname, timezone, token]);

	const onChangePassword = React.useCallback(async () => {
		if (!token) return;
		if (isChangingPassword) return;
		setPasswordError(null);
		setPasswordSuccess(null);
		if (newPassword.length < 8) {
			setPasswordError("New password must be at least 8 characters.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setPasswordError("Passwords do not match.");
			return;
		}
		setIsChangingPassword(true);
		try {
			const res = await apiRequest<ChangePasswordResponse>({
				path: "/auth/change-password",
				method: "POST",
				token,
				body: {
					currentPassword,
					newPassword,
				},
			});
			if (!res.ok) {
				setPasswordError(res.error ?? "Failed to change password.");
				return;
			}
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setPasswordSuccess("Password updated.");
		} catch (e: unknown) {
			setPasswordError(e instanceof Error ? e.message : "Network error.");
		} finally {
			setIsChangingPassword(false);
		}
	}, [
		confirmPassword,
		currentPassword,
		isChangingPassword,
		newPassword,
		token,
	]);

	const preview = React.useMemo(
		() => formatNowInTimezone(timezone),
		[timezone],
	);

	return (
		<div className="min-h-screen bg-charcoal-dark text-gray-200 font-sans">
			<header className="sticky top-0 z-50 border-b border-white/10 bg-charcoal-dark/80 backdrop-blur-md">
				<div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 py-4 md:px-10">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-control-bg text-white ring-1 ring-white/10">
							<span className="material-symbols-outlined text-[22px]">
								settings
							</span>
						</div>
						<div className="leading-none">
							<div className="text-sm font-semibold tracking-wide text-gray-100">
								Settings
							</div>
							<div className="text-[11px] text-gray-400">Account</div>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Link
							to="/dashboard"
							className="h-10 px-4 rounded-full bg-control-bg ring-1 ring-white/10 text-sm font-semibold hover:bg-control-bg/80 inline-flex items-center"
						>
							Back
						</Link>
					</div>
				</div>
			</header>

			<main className="mx-auto w-full max-w-[1040px] px-6 pb-24 pt-8 md:px-10">
				{isLoading ? (
					<div className="rounded-lg bg-surface-dark p-6 ring-1 ring-white/10">
						<div className="text-sm text-gray-400">Loading settings...</div>
					</div>
				) : loadError ? (
					<div className="rounded-lg bg-surface-dark p-6 ring-1 ring-white/10">
						<div className="text-sm font-semibold text-gray-100">
							Failed to load
						</div>
						<div className="mt-2 text-sm text-gray-400">{loadError}</div>
					</div>
				) : (
					<div className="flex flex-col gap-8">
						<section className="rounded-lg bg-surface-dark p-6 ring-1 ring-white/10">
							<div className="flex items-start justify-between gap-6">
								<div>
									<h2 className="text-lg font-semibold text-gray-100">
										Account
									</h2>
									<p className="mt-1 text-sm text-gray-400">
										Basic profile settings.
									</p>
								</div>
							</div>

							<div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
								<label className="block">
									<span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
										Email
									</span>
									<div className="mt-2 rounded-xl bg-charcoal-light/60 px-4 py-3 ring-1 ring-white/10">
										<div className="text-sm text-gray-200">
											{me?.email ?? ""}
										</div>
										<div className="mt-1 text-xs text-gray-500">Read-only.</div>
									</div>
								</label>

								<label className="block">
									<span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
										Nickname
									</span>
									<div className="mt-2 rounded-xl bg-charcoal-light/60 px-4 py-3 ring-1 ring-white/10">
										<input
											className="form-input w-full border-none bg-transparent px-0 text-sm text-gray-100 placeholder:text-gray-500 focus:ring-0"
											value={nickname}
											onChange={(e) => {
												setNickname(e.target.value);
												setProfileError(null);
											}}
											placeholder="Your name"
											autoComplete="off"
										/>
									</div>
								</label>
							</div>

							{profileError ? (
								<div className="mt-4 text-sm text-red-300">{profileError}</div>
							) : null}

							<div className="mt-6 flex items-center justify-end">
								<button
									type="button"
									onClick={onSaveProfile}
									disabled={isSavingProfile}
									className="h-10 px-4 rounded-full bg-primary ring-1 ring-white/10 text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
								>
									{isSavingProfile ? "Saving..." : "Save"}
								</button>
							</div>
						</section>

						<section className="rounded-lg bg-surface-dark p-6 ring-1 ring-white/10">
							<h2 className="text-lg font-semibold text-gray-100">Time</h2>
							<p className="mt-1 text-sm text-gray-400">
								Time zone controls how we display local times.
							</p>

							<div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
								<label className="block">
									<span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
										Time zone
									</span>
									<div className="mt-2 rounded-xl bg-charcoal-light/60 px-4 py-3 ring-1 ring-white/10">
										<select
											className="w-full bg-transparent text-sm text-gray-100 focus:outline-none"
											value={timezone}
											onChange={(e) => {
												setTimezone(e.target.value);
												setProfileError(null);
											}}
										>
											{TIMEZONE_OPTIONS.map((opt) => (
												<option key={opt.value} value={opt.value}>
													{opt.label}
												</option>
											))}
										</select>
									</div>
								</label>

								<div className="rounded-xl bg-charcoal-light/60 px-4 py-3 ring-1 ring-white/10">
									<div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
										Preview
									</div>
									<div className="mt-2 text-sm text-gray-100">
										{preview || "-"}
									</div>
								</div>
							</div>

							{profileError ? (
								<div className="mt-4 text-sm text-red-300">{profileError}</div>
							) : null}

							<div className="mt-6 flex items-center justify-end">
								<button
									type="button"
									onClick={onSaveProfile}
									disabled={isSavingProfile}
									className="h-10 px-4 rounded-full bg-primary ring-1 ring-white/10 text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
								>
									{isSavingProfile ? "Saving..." : "Save"}
								</button>
							</div>
						</section>

						<section className="rounded-lg bg-surface-dark p-6 ring-1 ring-white/10">
							<h2 className="text-lg font-semibold text-gray-100">Security</h2>
							<p className="mt-1 text-sm text-gray-400">
								Change your password.
							</p>

							<div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
								<label className="block">
									<span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
										Current password
									</span>
									<div className="mt-2 rounded-xl bg-charcoal-light/60 px-4 py-3 ring-1 ring-white/10">
										<input
											type="password"
											className="form-input w-full border-none bg-transparent px-0 text-sm text-gray-100 placeholder:text-gray-500 focus:ring-0"
											value={currentPassword}
											onChange={(e) => {
												setCurrentPassword(e.target.value);
												setPasswordError(null);
												setPasswordSuccess(null);
											}}
											autoComplete="current-password"
										/>
									</div>
								</label>

								<label className="block">
									<span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
										New password
									</span>
									<div className="mt-2 rounded-xl bg-charcoal-light/60 px-4 py-3 ring-1 ring-white/10">
										<input
											type="password"
											className="form-input w-full border-none bg-transparent px-0 text-sm text-gray-100 placeholder:text-gray-500 focus:ring-0"
											value={newPassword}
											onChange={(e) => {
												setNewPassword(e.target.value);
												setPasswordError(null);
												setPasswordSuccess(null);
											}}
											autoComplete="new-password"
										/>
									</div>
								</label>

								<label className="block">
									<span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
										Confirm password
									</span>
									<div className="mt-2 rounded-xl bg-charcoal-light/60 px-4 py-3 ring-1 ring-white/10">
										<input
											type="password"
											className="form-input w-full border-none bg-transparent px-0 text-sm text-gray-100 placeholder:text-gray-500 focus:ring-0"
											value={confirmPassword}
											onChange={(e) => {
												setConfirmPassword(e.target.value);
												setPasswordError(null);
												setPasswordSuccess(null);
											}}
											autoComplete="new-password"
										/>
									</div>
								</label>
							</div>

							{passwordError ? (
								<div className="mt-4 text-sm text-red-300">{passwordError}</div>
							) : passwordSuccess ? (
								<div className="mt-4 text-sm text-green-300">
									{passwordSuccess}
								</div>
							) : null}

							<div className="mt-6 flex items-center justify-end">
								<button
									type="button"
									onClick={onChangePassword}
									disabled={isChangingPassword}
									className="h-10 px-4 rounded-full bg-control-bg ring-1 ring-white/10 text-sm font-semibold hover:bg-control-bg/80 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
								>
									{isChangingPassword ? "Updating..." : "Change password"}
								</button>
							</div>
						</section>
					</div>
				)}
			</main>
		</div>
	);
}
