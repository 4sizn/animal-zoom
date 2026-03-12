import type { AuthResponse } from "@animal-zoom/share";
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { apiRequest } from "../../network/apiClient";

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { login, token, logout, setToken } = useAuth();
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [redirectTo, setRedirectTo] = React.useState<string | null>(null);

	const getNextPath = React.useCallback(() => {
		const params = new URLSearchParams(location.search);
		const nextRaw = params.get("next") ?? "";
		return nextRaw.startsWith("/") && !nextRaw.startsWith("//")
			? nextRaw
			: "/dashboard";
	}, [location.search]);

	const submitLogin = React.useCallback(
		async (
			credentials: { email: string; password: string },
			fallbackError: string,
		) => {
			if (isSubmitting) {
				return;
			}

			setIsSubmitting(true);
			setError(null);
			try {
				const res = await login(credentials);
				if (!res.ok) {
					setError(res.error ?? fallbackError);
					return;
				}
				setRedirectTo(getNextPath());
			} finally {
				setIsSubmitting(false);
			}
		},
		[getNextPath, isSubmitting, login],
	);

	React.useEffect(() => {
		if (!redirectTo) return;
		if (!token) return;
		navigate(redirectTo, { replace: true });
		setRedirectTo(null);
	}, [navigate, redirectTo, token]);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		await submitLogin({ email, password }, "login failed");
	}

	async function onContinueAsDemo() {
		if (isSubmitting) return;
		setIsSubmitting(true);
		setError(null);
		try {
			const res = await apiRequest<AuthResponse>({
				path: "/auth/demo",
				method: "POST",
				token: null,
			});
			if (!res.ok || !res.accessToken) {
				setError(res.error ?? "Demo login failed");
				return;
			}
			setToken(res.accessToken);
			setRedirectTo(getNextPath());
		} catch (e) {
			setError(e instanceof Error ? e.message : "Demo login failed");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="min-h-screen bg-charcoal-dark text-gray-200 font-sans flex items-center justify-center px-6 py-10">
			<div className="w-full max-w-[520px]">
				<header className="flex items-center justify-between gap-4 mb-6">
					<div className="flex items-center gap-3">
						<div className="h-12 w-12 rounded-2xl bg-control-bg ring-1 ring-white/10 grid place-items-center">
							<span className="material-symbols-outlined text-[22px] text-primary">
								pets
							</span>
						</div>
						<div>
							<h1 className="text-xl font-semibold tracking-tight text-gray-100">
								Sign in
							</h1>
							<p className="text-xs text-gray-400">Animal Zoom WebApp</p>
						</div>
					</div>

					{token ? (
						<button
							type="button"
							onClick={logout}
							className="h-10 px-4 rounded-full bg-control-bg ring-1 ring-white/10 text-sm font-semibold hover:bg-control-bg/80"
						>
							Logout
						</button>
					) : null}
				</header>

				<div className="rounded-2xl bg-surface-dark ring-1 ring-white/10 p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-sm text-gray-400">Welcome back.</p>
							<h2 className="mt-1 text-2xl font-semibold text-gray-100 tracking-tight">
								Let’s get you in.
							</h2>
						</div>
					</div>

					<form onSubmit={onSubmit} className="mt-6 space-y-5">
						<div className="space-y-2">
							<label
								className="block text-sm font-semibold text-gray-200"
								htmlFor="login-email"
							>
								Email
							</label>
							<div className="flex items-center gap-3 rounded-xl bg-charcoal-light/60 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-primary/50 px-4 h-12">
								<span className="material-symbols-outlined text-[18px] text-gray-400">
									mail
								</span>
								<input
									id="login-email"
									className="form-input w-full border-none bg-transparent px-0 text-sm text-gray-100 placeholder:text-gray-500 focus:ring-0"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
									type="email"
									autoComplete="email"
									inputMode="email"
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label
								className="block text-sm font-semibold text-gray-200"
								htmlFor="login-password"
							>
								Password
							</label>
							<div className="flex items-center gap-3 rounded-xl bg-charcoal-light/60 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-primary/50 px-4 h-12">
								<span className="material-symbols-outlined text-[18px] text-gray-400">
									lock
								</span>
								<input
									id="login-password"
									className="form-input w-full border-none bg-transparent px-0 text-sm text-gray-100 placeholder:text-gray-500 focus:ring-0"
									value={password}
									type="password"
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									autoComplete="current-password"
									required
								/>
							</div>
						</div>

						{error ? (
							<div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
								{error}
							</div>
						) : null}

						<div className="space-y-3">
							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition"
							>
								<span className="inline-flex items-center justify-center gap-2">
									<span>{isSubmitting ? "Signing in..." : "Sign in"}</span>
									<span className="material-symbols-outlined text-[18px]">
										door_open
									</span>
								</span>
							</button>
							<button
								type="button"
								onClick={onContinueAsDemo}
								disabled={isSubmitting}
								className="w-full h-12 rounded-xl bg-control-bg ring-1 ring-white/10 text-gray-100 text-sm font-semibold hover:bg-control-bg/80 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition"
							>
								Continue as demo
							</button>
						</div>
					</form>

					<div className="mt-6 flex items-center justify-between gap-4 text-sm">
						<div className="flex items-center gap-4">
							<Link className="text-gray-300 hover:text-white" to="/register">
								Create account
							</Link>
							{token ? (
								<Link
									className="text-gray-400 hover:text-gray-200"
									to="/dashboard"
								>
									Dashboard
								</Link>
							) : null}
						</div>
						<Link
							className="text-gray-400 hover:text-gray-200"
							to="/forgot-password"
						>
							Forgot password
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
