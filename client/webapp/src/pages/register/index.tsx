import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

export function RegisterPage() {
	const { register } = useAuth();
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		try {
			const res = await register({ email, password });
			if (!res.ok) {
				setError(res.error ?? "register failed");
				return;
			}
			window.location.href = "/login";
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div style={{ maxWidth: 520, margin: "48px auto", padding: 16 }}>
			<h1 style={{ fontSize: 24, fontWeight: 700 }}>Register</h1>
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
				<label>
					Password
					<input
						value={password}
						type="password"
						onChange={(e) => setPassword(e.target.value)}
						style={{ width: "100%" }}
					/>
				</label>
				<button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Creating..." : "Create account"}
				</button>
			</form>
			{error ? <p style={{ color: "crimson" }}>{error}</p> : null}

			<nav style={{ display: "flex", gap: 12, marginTop: 16 }}>
				<Link to="/login">Login</Link>
			</nav>
		</div>
	);
}
