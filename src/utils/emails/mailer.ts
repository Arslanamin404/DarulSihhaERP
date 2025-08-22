import nodemailer from "nodemailer"
import { config } from "../../config/env.config"

export const transporter = nodemailer.createTransport({
    host: config.MAIL_HOST,
    port: config.MAIL_PORT,
    secure: String(config.MAIL_SECURE).toLowerCase() === "true",
    auth: {
        user: config.MAIL_USER,
        pass: config.MAIL_PASSWORD
    }
})