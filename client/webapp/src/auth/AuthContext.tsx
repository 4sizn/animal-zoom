import type {
	AuthResponse,
	ForgotPasswordDto,
	LoginDto,
	RegisterDto,
	RegisterResponse,
} from "@animal-zoom/share";
import React from "react";
import { io, type Socket } from "socket.io-client";

import { apiRequest } from "../network/apiClient";
import { ZOOM_SOCKET_URL } from "../system/env";
import { getString, remove, setString } from "../system/storage";

type AuthState = {
	token: string | null;
	socket: Socket | null;
	socketStatus: "disconnected" | "connecting" | "connected";
	setToken: (token: string | null) => void;
	login: (dto: LoginDto) => Promise<AuthResponse>;
	register: (dto: RegisterDto) => Promise<RegisterResponse>;
	forgotPassword: (
		dto: ForgotPasswordDto,
	) => Promise<{ ok: boolean; error?: string }>;
	logout: () => void;
};

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setTokenState] = React.useState<string | null>(() => {
		return getString("auth_token");
	});
	const [socketStatus, setSocketStatus] =
		React.useState<AuthState["socketStatus"]>("disconnected");
	const socketRef = React.useRef<Socket | null>(null);

	const setToken = React.useCallback((next: string | null) => {
		setTokenState(next);
		if (next) {
			setString("auth_token", next);
		} else {
			remove("auth_token");
		}
	}, []);

	React.useEffect(() => {
		if (!token) {
			socketRef.current?.disconnect();
			socketRef.current = null;
			setSocketStatus("disconnected");
			return;
		}

		setSocketStatus("connecting");
		const socket = io(ZOOM_SOCKET_URL, {
			transports: ["websocket"],
			auth: { token },
		});
		socketRef.current = socket;

		socket.on("connect", () => setSocketStatus("connected"));
		socket.on("disconnect", () => setSocketStatus("disconnected"));
		socket.on("connect_error", () => setSocketStatus("disconnected"));

		return () => {
			socket.disconnect();
			socketRef.current = null;
			setSocketStatus("disconnected");
		};
	}, [token]);

	const login = React.useCallback(
		async (dto: LoginDto) => {
			const res = await apiRequest<AuthResponse>({
				path: "/auth/login",
				method: "POST",
				body: dto,
				token: null,
			});

			if (res.ok && res.accessToken) {
				setToken(res.accessToken);
			}

			return res;
		},
		[setToken],
	);

	const register = React.useCallback(async (dto: RegisterDto) => {
		return await apiRequest<RegisterResponse>({
			path: "/users/register",
			method: "POST",
			body: dto,
			token: null,
		});
	}, []);

	const forgotPassword = React.useCallback(async (dto: ForgotPasswordDto) => {
		const res = await apiRequest<{ ok: boolean; error?: string }>({
			path: "/auth/forgot-password",
			method: "POST",
			body: dto,
			token: null,
		});
		return res;
	}, []);

	const logout = React.useCallback(() => {
		setToken(null);
	}, [setToken]);

	const value: AuthState = {
		token,
		socket: socketRef.current,
		socketStatus,
		setToken,
		login,
		register,
		forgotPassword,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
	const ctx = React.useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return ctx;
}
