import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AuthService } from "./auth/auth.service";
import { MailService } from "./mail/mail.service";
import { UsersService } from "./users/users.service";
import crypto from "node:crypto";
import express from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  type HttpRequest = { body?: unknown };
  type HttpResponse = {
    status: (code: number) => HttpResponse;
    json: (body: unknown) => unknown;
  };
  type HttpAdapter = {
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

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

bootstrap();
