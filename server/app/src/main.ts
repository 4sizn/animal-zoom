import "reflect-metadata";
import "dotenv/config";
import crypto from "node:crypto";
import { NestFactory } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import express from "express";
import { Client as MinioClient } from "minio";
import { AppModule } from "./app.module";
import { getMinioConfig } from "./assets/minio";
import { AuthService } from "./auth/auth.service";
import { MailService } from "./mail/mail.service";
import {
	type UserAvatarType,
	type UserEnvironmentTheme,
	UsersService,
} from "./users/users.service";

function parseHttpOrigin(rawOrigin: string): URL | null {
	const value = rawOrigin.trim();
	if (value.length === 0) {
		return null;
	}

	try {
		const url = new URL(value);
		if (url.protocol !== "http:" && url.protocol !== "https:") {
			return null;
		}

		if (url.pathname !== "/" || url.search.length > 0 || url.hash.length > 0) {
			return null;
		}

		return url;
	} catch {
		return null;
	}
}

function rewriteUrlOrigin(rawUrl: string, publicOrigin: URL | null): string {
	if (!publicOrigin) {
		return rawUrl;
	}

	try {
		const url = new URL(rawUrl);
		url.protocol = publicOrigin.protocol;
		url.host = publicOrigin.host;
		return url.toString();
	} catch {
		return rawUrl;
	}
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors();

	type HttpRequest = { body?: unknown };
	type HttpResponse = {
		status: (code: number) => HttpResponse;
		json: (body: unknown) => unknown;
	};
	type HttpAdapter = {
		get: (
			path: string,
			...handlers: Array<(req: HttpRequest, res: HttpResponse) => unknown>
		) => void;
		post: (
			path: string,
			...handlers: Array<(req: HttpRequest, res: HttpResponse) => unknown>
		) => void;
		patch: (
			path: string,
			...handlers: Array<(req: HttpRequest, res: HttpResponse) => unknown>
		) => void;
	};

	const http = app.getHttpAdapter().getInstance() as unknown as HttpAdapter;
	const usersService = app.get(UsersService);
	const authService = app.get(AuthService);
	const jwtService = app.get(JwtService);
	const mailService = app.get(MailService);

	type RequestWithHeaders = HttpRequest & {
		headers?: { authorization?: unknown };
	};
	async function requireUser(req: HttpRequest) {
		const headers = (req as RequestWithHeaders).headers ?? {};
		const authHeader = headers.authorization;
		const raw = typeof authHeader === "string" ? authHeader : "";
		const token = raw.startsWith("Bearer ") ? raw.slice("Bearer ".length) : "";
		if (!token) {
			return null;
		}
		try {
			const payload = await jwtService.verifyAsync(token);
			const userId = Number((payload as { sub?: unknown }).sub);
			if (!Number.isSafeInteger(userId) || userId <= 0) return null;
			const user = await usersService.findById(userId);
			return user ?? null;
		} catch {
			return null;
		}
	}

	const json = express.json();
	const minioConfig = getMinioConfig();
	const rawAssetPresignTtl = Number.parseInt(
		process.env.ASSET_PRESIGN_TTL_SECONDS ?? "",
		10,
	);
	const assetPresignTtlSeconds =
		Number.isFinite(rawAssetPresignTtl) && rawAssetPresignTtl > 0
			? rawAssetPresignTtl
			: 600;
	const assetPresignPublicOrigin = parseHttpOrigin(
		process.env.ASSET_PRESIGN_PUBLIC_ORIGIN ?? "",
	);
	const assetAllowedPrefixes = ["characters/", "personal-space/"];
	const minioClient = new MinioClient({
		endPoint: minioConfig.endpoint,
		port: minioConfig.port,
		useSSL: minioConfig.useSSL,
		accessKey: minioConfig.accessKey,
		secretKey: minioConfig.secretKey,
	});

	http.post("/users/register", json as any, async (req, res) => {
		const body = (req.body ?? {}) as Record<string, unknown>;
		const email = typeof body.email === "string" ? body.email : "";
		const password = typeof body.password === "string" ? body.password : "";

		if (email.length < 3 || !email.includes("@")) {
			return res.status(400).json({ ok: false, error: "invalid email" });
		}

		if (password.length < 8) {
			return res.status(400).json({ ok: false, error: "password too short" });
		}

		const user = await usersService.createUser({ email, password });
		return res.json({ ok: true, user });
	});

	http.post("/auth/login", json as any, async (req, res) => {
		const body = (req.body ?? {}) as Record<string, unknown>;
		const email = typeof body.email === "string" ? body.email : "";
		const password = typeof body.password === "string" ? body.password : "";

		try {
			const auth = await authService.login({ email, password });
			return res.json({ ok: true, ...auth });
		} catch {
			return res.status(401).json({ ok: false, error: "invalid credentials" });
		}
	});

	http.post("/auth/demo", json as any, async (_req, res) => {
		const allowDemoLogin =
			process.env.ALLOW_DEMO_LOGIN === "true" ||
			process.env.NODE_ENV !== "production";
		if (!allowDemoLogin) {
			return res.status(404).json({ ok: false, error: "not found" });
		}

		const email = `demo+${Date.now()}-${crypto.randomBytes(6).toString("hex")}@animal-zoom.local`;
		const password = crypto.randomBytes(18).toString("base64url");
		try {
			const auth = await authService.createDemoSession({ email, password });
			return res.json({ ok: true, ...auth });
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			return res.status(400).json({ ok: false, error: message });
		}
	});

	http.post("/auth/forgot-password", json as any, async (req, res) => {
		const body = (req.body ?? {}) as Record<string, unknown>;
		const email = typeof body.email === "string" ? body.email : "";

		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

		const existing = await usersService.findByEmail(email);
		if (existing) {
			await usersService.setPasswordResetToken({ email, token, expiresAt });
			await mailService.sendPasswordResetEmail({ to: email, token });
		}

		return res.json({ ok: true });
	});

	http.get("/users/me", async (req, res) => {
		const user = await requireUser(req);
		if (!user) {
			return res.status(401).json({ ok: false, error: "unauthorized" });
		}
		return res.json({
			ok: true,
			user: {
				id: user.id,
				email: user.email,
				createdAt: user.createdAt,
				nickname: user.nickname ?? null,
				timezone: user.timezone ?? null,
			},
		});
	});

	http.patch("/users/me", json as any, async (req, res) => {
		const user = await requireUser(req);
		if (!user) {
			return res.status(401).json({ ok: false, error: "unauthorized" });
		}
		const body = (req.body ?? {}) as Record<string, unknown>;
		const nicknameRaw =
			typeof body.nickname === "string" ? body.nickname : undefined;
		const timezoneRaw =
			typeof body.timezone === "string" ? body.timezone : undefined;

		const nickname = nicknameRaw !== undefined ? nicknameRaw.trim() : null;
		const timezone = timezoneRaw !== undefined ? timezoneRaw.trim() : null;

		if (nickname !== null && nickname.length > 40) {
			return res.status(400).json({ ok: false, error: "nickname too long" });
		}
		if (timezone !== null && timezone.length > 64) {
			return res.status(400).json({ ok: false, error: "timezone too long" });
		}
		if (timezone !== null && timezone.length > 0) {
			const ok =
				timezone === "UTC" ||
				/^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+){1,2}$/.test(timezone);
			if (!ok) {
				return res.status(400).json({ ok: false, error: "invalid timezone" });
			}
		}

		const updated = await usersService.updateProfile({
			userId: user.id,
			nickname: nickname && nickname.length > 0 ? nickname : null,
			timezone: timezone && timezone.length > 0 ? timezone : null,
		});
		return res.json({
			ok: true,
			user: {
				id: updated.id,
				email: updated.email,
				createdAt: updated.createdAt,
				nickname: updated.nickname ?? null,
				timezone: updated.timezone ?? null,
			},
		});
	});

	http.get("/users/me/3d-profile", async (req, res) => {
		const user = await requireUser(req);
		if (!user) {
			return res.status(401).json({ ok: false, error: "unauthorized" });
		}

		const profile = await usersService.getOrCreate3DProfile(user.id);
		return res.json({
			ok: true,
			profile: {
				avatarType: profile.avatarType,
				environmentTheme: profile.environmentTheme,
				updatedAt: profile.updatedAt,
			},
		});
	});

	http.patch("/users/me/3d-profile", json as any, async (req, res) => {
		const user = await requireUser(req);
		if (!user) {
			return res.status(401).json({ ok: false, error: "unauthorized" });
		}

		const body = (req.body ?? {}) as Record<string, unknown>;
		const avatarType =
			typeof body.avatarType === "string" ? body.avatarType.trim() : "";
		const environmentTheme =
			typeof body.environmentTheme === "string"
				? body.environmentTheme.trim()
				: "";

		if (!allowedAvatarTypes.includes(avatarType as UserAvatarType)) {
			return res.status(400).json({ ok: false, error: "invalid avatarType" });
		}
		if (
			!allowedEnvironmentThemes.includes(
				environmentTheme as UserEnvironmentTheme,
			)
		) {
			return res
				.status(400)
				.json({ ok: false, error: "invalid environmentTheme" });
		}

		const profile = await usersService.update3DProfile({
			userId: user.id,
			avatarType: avatarType as UserAvatarType,
			environmentTheme: environmentTheme as UserEnvironmentTheme,
		});

		return res.json({
			ok: true,
			profile: {
				avatarType: profile.avatarType,
				environmentTheme: profile.environmentTheme,
				updatedAt: profile.updatedAt,
			},
		});
	});

	http.post("/auth/change-password", json as any, async (req, res) => {
		const user = await requireUser(req);
		if (!user) {
			return res.status(401).json({ ok: false, error: "unauthorized" });
		}
		const body = (req.body ?? {}) as Record<string, unknown>;
		const currentPassword =
			typeof body.currentPassword === "string" ? body.currentPassword : "";
		const newPassword =
			typeof body.newPassword === "string" ? body.newPassword : "";
		if (newPassword.length < 8) {
			return res.status(400).json({ ok: false, error: "password too short" });
		}
		try {
			await authService.changePassword({
				userId: user.id,
				currentPassword,
				newPassword,
			});
			return res.json({ ok: true });
		} catch {
			return res.status(401).json({ ok: false, error: "invalid credentials" });
		}
	});

	http.get("/assets/meta", (_req, res) => {
		return res.json({
			ok: true,
			bucket: minioConfig.bucket,
			allowedPrefixes: assetAllowedPrefixes,
			presignTtlSeconds: assetPresignTtlSeconds,
		});
	});

	http.post("/assets/presign", json as any, async (req, res) => {
		const body = (req.body ?? {}) as Record<string, unknown>;
		const rawKey = typeof body.key === "string" ? body.key : "";
		const key = rawKey.trim();

		if (key.length === 0) {
			return res.status(400).json({ ok: false, error: "invalid key" });
		}

		if (key.startsWith("/")) {
			return res.status(400).json({ ok: false, error: "invalid key" });
		}

		if (key.includes("..")) {
			return res.status(400).json({ ok: false, error: "invalid key" });
		}

		const isAllowedKey = assetAllowedPrefixes.some((prefix) =>
			key.startsWith(prefix),
		);
		if (!isAllowedKey) {
			return res.status(400).json({ ok: false, error: "invalid key" });
		}

		try {
			const rawUrl = await minioClient.presignedGetObject(
				minioConfig.bucket,
				key,
				assetPresignTtlSeconds,
			);
			const url = rewriteUrlOrigin(rawUrl, assetPresignPublicOrigin);
			return res.json({ ok: true, url });
		} catch {
			return res.status(400).json({ ok: false, error: "failed to presign" });
		}
	});

	const port = Number(process.env.PORT ?? 3000);
	await app.listen(port);
}

bootstrap();
const allowedAvatarTypes: readonly UserAvatarType[] = [
	"apollo",
	"villager_oc",
	"macchiato",
	"molly_duck",
];
const allowedEnvironmentThemes: readonly UserEnvironmentTheme[] = [
	"default",
	"music",
	"cafe",
	"study",
];
