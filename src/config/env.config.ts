import dotenv from "dotenv";
dotenv.config();

export const config = {
    PORT: Number(process.env.PORT) || 3000,
    DATABASE_URL: process.env.DATABASE_URL as string,
    NODE_ENV: String(process.env.NODE_ENV).toLowerCase(),
    BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
    OTP_EXPIRY_MINUTES: Number(process.env.OTP_EXPIRY_MINUTES) || 5,
    MAIL_HOST: process.env.MAIL_HOST as string,
    MAIL_PORT: Number(process.env.MAIL_PORT) || 587,
    MAIL_SECURE: process.env.MAIL_SECURE === "true",
    MAIL_USER: process.env.MAIL_USER as string,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD as string,
    MAIL_FROM: process.env.MAIL_FROM as string,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
};
