import "reflect-metadata";
import "dotenv/config";
import crypto from "node:crypto";
import { NestFactory } from "@nestjs/core";
import express from "express";
import { Client as MinioClient } from "minio";
import { AppModule } from "./app.module";
import { getMinioConfig } from "./assets/minio";
import { AuthService } from "./auth/auth.service";
import { MailService } from "./mail/mail.service";
import { UsersService } from "./users/users.service";

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
	};

	const http = app.getHttpAdapter().getInstance() as unknown as HttpAdapter;
	const usersService = app.get(UsersService);
	const authService = app.get(AuthService);
	const mailService = app.get(MailService);

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
