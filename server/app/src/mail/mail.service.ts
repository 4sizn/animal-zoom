import { Injectable } from "@nestjs/common";
import nodemailer from "nodemailer";

void nodemailer;

@Injectable()
export class MailService {
  async sendPasswordResetEmail(input: {
    to: string;
    token: string;
  }): Promise<void> {
    const host = process.env.MAILTRAP_HOST;
    const port = Number.parseInt(process.env.MAILTRAP_PORT ?? "2525", 10);
    const user = process.env.MAILTRAP_USER;
    const pass = process.env.MAILTRAP_PASS;
    const from = process.env.MAIL_FROM ?? "no-reply@animal-zoom.local";

    if (!host || !user || !pass) {
      console.log("mailtrap not configured; reset token:", input.token);
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      auth: { user, pass }
    });

    await transporter.sendMail({
      from,
      to: input.to,
      subject: "Reset your password",
      text: `Use this token to reset your password: ${input.token}`
    });
  }
}
