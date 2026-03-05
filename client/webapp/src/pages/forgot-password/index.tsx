import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

export function ForgotPasswordPage() {
	const { forgotPassword } = useAuth();
	const [email, setEmail] = React.useState("");
	const [status, setStatus] = React.useState<"idle" | "sending" | "sent">(
		"idle",
	);
	const [error, setError] = React.useState<string | null>(null);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setStatus("sending");
		setError(null);
		try {
			const res = await forgotPassword({ email });
			if (!res.ok) {
				setError(res.error ?? "failed to send");
				setStatus("idle");
				return;
			}
			setStatus("sent");
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : String(e));
			setStatus("idle");
		}
	}

	return (
		<div className="min-h-screen bg-charcoal-dark text-gray-200 font-sans flex items-center justify-center px-6 py-10">
			<div className="w-full max-w-[520px]">
				<header className="flex items-center justify-between gap-4 mb-6">
					<div className="flex items-center gap-3">
						<div className="h-12 w-12 rounded-2xl bg-control-bg ring-1 ring-white/10 grid place-items-center">
							<span className="material-symbols-outlined text-[22px] text-primary">
								encrypted
							</span>
						</div>
						<div>
							<h1 className="text-xl font-semibold tracking-tight text-gray-100">
								Forgot password
							</h1>
							<p className="text-xs text-gray-400">We’ll send a reset link.</p>
						</div>
					</div>

					<Link
						className="text-sm text-gray-400 hover:text-gray-200"
						to="/login"
					>
						Back to sign in
					</Link>
				</header>

				<div className="rounded-2xl bg-surface-dark ring-1 ring-white/10 p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
					<div>
						<p className="text-sm text-gray-400">No worries.</p>
						<h2 className="mt-1 text-2xl font-semibold text-gray-100 tracking-tight">
							Reset your password.
						</h2>
					</div>

					<form onSubmit={onSubmit} className="mt-6 space-y-5">
						<div className="space-y-2">
							<label
								className="block text-sm font-semibold text-gray-200"
								htmlFor="forgot-email"
							>
								Email
							</label>
							<div className="flex items-center gap-3 rounded-xl bg-charcoal-light/60 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-primary/50 px-4 h-12">
								<span className="material-symbols-outlined text-[18px] text-gray-400">
									mail
								</span>
								<input
									id="forgot-email"
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

						{status === "sent" ? (
							<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
								If the account exists, a reset email was sent.
							</div>
						) : null}

						{error ? (
							<div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
								{error}
							</div>
						) : null}

						<button
							type="submit"
							disabled={status === "sending"}
							className="w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition"
						>
							<span className="inline-flex items-center justify-center gap-2">
								<span>
									{status === "sending" ? "Sending..." : "Send reset email"}
								</span>
								<span className="material-symbols-outlined text-[18px]">
									send
								</span>
							</span>
						</button>
					</form>

					<div className="mt-6 flex items-center justify-between gap-4 text-sm">
						<Link className="text-gray-300 hover:text-white" to="/register">
							Create account
						</Link>
						<Link className="text-gray-400 hover:text-gray-200" to="/login">
							Sign in
						</Link>
					</div>
				</div>

				<p className="mt-6 text-center text-xs text-gray-500">
					UI only for now; backend wiring comes later.
				</p>
			</div>
		</div>
	);
}
