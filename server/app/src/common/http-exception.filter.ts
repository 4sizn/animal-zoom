import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      // If the response already has ok/error fields, pass it through
      if (typeof body === "object" && body !== null && "ok" in body) {
        response.status(status).json(body);
        return;
      }

      // Normalize NestJS default error format
      const message =
        typeof body === "string"
          ? body
          : typeof body === "object" && "message" in body
            ? String((body as { message: unknown }).message)
            : "Request failed";

      response.status(status).json({ ok: false, error: message });
      return;
    }

    // Unexpected errors
    response.status(500).json({ ok: false, error: "Internal server error" });
  }
}
