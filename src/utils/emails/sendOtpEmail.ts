import { config } from "../../config/env.config";
import { transporter } from "./mailer";
import { otpTemplate } from "./templates/otpTemplate";

export async function sendOtpEmail(to: string, otp: string, expiresInMinutes: number) {
    const appName = "DarulSihha Pharamacy IMS";
    const subject = `${appName} – Your OTP Code: ${otp}`;

    const html = otpTemplate({
        otp, appName, expiresInMinutes,
        logoUrl: "https://static.vecteezy.com/system/resources/thumbnails/013/218/336/small_2x/herbal-capsule-pill-leaf-medicine-logo-icon-illustration-template-capsule-pharmacy-medical-logo-template-free-vector.jpg",
        supportEmail: "arslanamin.org@gmail.com"
    })

    return transporter.sendMail({
        to,
        from: config.MAIL_FROM,
        subject,
        html,
        text: `${otp} is your OTP. Expires in ${expiresInMinutes} minutes.`,
    })
}