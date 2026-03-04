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
		<div style={{ maxWidth: 520, margin: "48px auto", padding: 16 }}>
			<h1 style={{ fontSize: 24, fontWeight: 700 }}>Forgot password</h1>
			<form
				onSubmit={onSubmit}
				style={{ display: "grid", gap: 12, marginTop: 16 }}
			>
				<label>
					Email
					<input
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						style={{ width: "100%" }}
					/>
				</label>
				<button type="submit" disabled={status === "sending"}>
					{status === "sending" ? "Sending..." : "Send reset email"}
				</button>
			</form>

			{status === "sent" ? (
				<p style={{ color: "seagreen" }}>
					If the account exists, a reset email was sent.
				</p>
			) : null}
			{error ? <p style={{ color: "crimson" }}>{error}</p> : null}

			<nav style={{ display: "flex", gap: 12, marginTop: 16 }}>
				<Link to="/login">Login</Link>
				<Link to="/register">Register</Link>
			</nav>
		</div>
	);
}
