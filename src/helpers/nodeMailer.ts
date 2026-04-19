import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";
import CustomError from "./CustomError";
import config from "../config";


// Create transporter with fast-fail timeouts so the server doesn't hang for 30+ seconds
const transporter: Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: config.mailer.hostMail,
    pass: config.mailer.appPassword,
  },
});

interface MailerOptions {
  subject: string;
  template: string;
  email: string;
}

export const mailer = async ({
  subject,
  template,
  email,
}: MailerOptions): Promise<void> => {
  if (!config.mailer.hostMail || !config.mailer.appPassword) {
    throw new CustomError(501, "Mail service not configured. HOST_MAIL or APP_PASSWORD is missing.");
  }

  try {
    await transporter.sendMail({
      from: `${config.email.appName} <${config.mailer.hostMail}>`,
      to: email,
      subject,
      html: template,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown mail error";
    throw new CustomError(501, `Mail send failed: ${errMsg}`);
  }
};
