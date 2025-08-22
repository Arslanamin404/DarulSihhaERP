import { config } from "../../config/env.config";
import { transporter } from "./mailer";
import { otpTemplate } from "./templates/otpTemplate";

export async function sendResendOtpEmail(
    to: string,
    otp: string,
    expiresInMinutes: number
) {
    const appName = "DarulSihha Pharmacy IMS";
    const subject = `${appName} – Resent OTP Code: ${otp}`;

    const html = otpTemplate({
        otp,
        appName,
        expiresInMinutes,
        logoUrl:
            "https://static.vecteezy.com/system/resources/thumbnails/013/218/336/small_2x/herbal-capsule-pill-leaf-medicine-logo-icon-illustration-template-capsule-pharmacy-medical-logo-template-free-vector.jpg",
        supportEmail: "arslanamin.org@gmail.com",
        type: "resend"
    });

    return transporter.sendMail({
        to,
        from: config.MAIL_FROM,
        subject,
        html,
        text: `Here is your resent OTP: ${otp}. It will expire in ${expiresInMinutes} minutes. If you didn’t request this, please ignore this email.`,
    });
}
