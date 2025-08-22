import bcrypt from 'bcrypt';
import { prisma } from "../../lib/prisma";
import { OtpUtils } from "../../utils/otpUtils";
import { ForgetPasswordInput, LoginInput, RegisterInput, ResendOtpInput, RestPasswordInput, VerifyForgetPasswordInput, VerifyOtpInput } from "./auth.validation";
import { config } from '../../config/env.config';
import { sendOtpEmail } from '../../utils/emails/sendOtpEmail';
import { ApiError } from '../../utils/ApiError';
import { sendResendOtpEmail } from '../../utils/emails/resendOtpEmail';
import { JwtUtils } from '../../utils/jwtUtils';
import { NextFunction } from 'express';
import { sendForgetPasswordOtpEmail } from '../../utils/emails/sendForgetPasswordOtpEmail';

enum OtpType {
    REGISTER = "REGISTER",
    FORGET_PASSWORD = "FORGET_PASSWORD",
}

export class AuthService {
    static async Register(data: RegisterInput) {
        try {
            const { email, fullname, username, password } = data

            const existing = await prisma.user.findFirst({
                where: { OR: [{ email }, { username }] }
            })
            if (existing)
                throw new ApiError(400, "User with this email or username already exists.");

            const { otp, hash_otp } = await OtpUtils.generateOTP()
            const hash_password = await bcrypt.hash(password, Number(config.BCRYPT_SALT_ROUNDS))
            const otp_expiry = new Date(Date.now() + (Number(config.OTP_EXPIRY_MINUTES) * 60 * 1000))

            const user = await prisma.$transaction(async (tx) => {
                const created_user = await tx.user.create({
                    data: {
                        email,
                        fullname,
                        username,
                        password: hash_password,
                    }
                })
                await tx.otp.create({
                    data: {
                        userId: created_user.id,
                        code: hash_otp,
                        type: OtpType.REGISTER,
                        expiresAt: otp_expiry
                    }
                })
                return created_user
            })

            try {
                await sendOtpEmail(email, otp, config.OTP_EXPIRY_MINUTES)
            } catch (error) {
                await prisma.user.delete({ where: { id: user.id } })
                throw new ApiError(500, "Failed to send OTP. Please try again.");
            }
        }
        catch (error: any) {
            if (error instanceof ApiError)
                throw error;
            throw new ApiError(500, error.message || "Internal Server Error")
        }
    }

    static async VerifyOTP(data: VerifyOtpInput) {
        try {
            const { email, otp } = data;
            const user = await prisma.user.findFirst({ where: { email } })

            if (!user)
                throw new ApiError(400, "Invalid credentials")

            if (user.isVerfied)
                throw new ApiError(400, "This account is already verified. You can proceed to login.")

            const otpRecord = await prisma.otp.findFirst({
                where: {
                    userId: user.id,
                    type: OtpType.REGISTER,
                    used: false,
                    expiresAt: { gt: new Date() }
                },
                orderBy: { createdAt: "desc" }
            });
            if (!otpRecord) throw new ApiError(400, "No active OTP request found");

            const isOtpValid = await OtpUtils.verifyOTP(otp, otpRecord.code)
            if (!isOtpValid) throw new ApiError(400, "Invalid or expired OTP")

            await prisma.$transaction(async (tx) => {
                tx.user.update({ where: { id: user.id }, data: { isVerfied: true } })
                tx.otp.update({ where: { id: otpRecord.id }, data: { used: true } })
            })
        } catch (error: any) {
            if (error instanceof ApiError)
                throw error;
            throw new ApiError(500, error.message || "Internal Server Error")
        }
    }

    static async ResendOTP(data: ResendOtpInput) {
        try {
            const { email } = data;
            const user = await prisma.user.findFirst({ where: { email } })
            if (!user)
                throw new ApiError(400, "Invalid credentials!")
            if (user.isVerfied)
                throw new ApiError(400, "This account is already verified. You can proceed to login.")

            const { otp, hash_otp } = await OtpUtils.generateOTP()
            const otp_expiry = new Date(Date.now() + (Number(config.OTP_EXPIRY_MINUTES) * 60 * 1000))
            await prisma.otp.create({
                data: {
                    userId: user.id,
                    code: hash_otp,
                    expiresAt: otp_expiry,
                    type: OtpType.REGISTER
                }
            })
            await sendResendOtpEmail(user.email, otp, config.OTP_EXPIRY_MINUTES)
        } catch (error: any) {
            if (error instanceof ApiError)
                throw error;
            throw new ApiError(500, error.message || "Internal Server Error")
        }
    }

    static async Login(data: LoginInput) {
        try {
            const { username, password } = data

            const user = await prisma.user.findFirst({ where: { username } })
            if (!user)
                throw new ApiError(400, "Invalid Credentials")

            if (!user.isVerfied)
                throw new ApiError(403, "Please verify your email before logging in.");

            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid)
                throw new ApiError(400, "Invalid Credentials")

            const { accessToken, refreshToken } = JwtUtils.generateTokens(user.id, username, user.role)
            await prisma.user.update({ where: { username }, data: { refreshToken } })
            return { accessToken, refreshToken }

        } catch (error: any) {
            if (error instanceof ApiError)
                throw error
            throw new ApiError(500, error.message || "Internal Server Error")
        }
    }

    static async ForgetPasswordRequest(data: ForgetPasswordInput) {
        try {
            const { email } = data
            const user = await prisma.user.findFirst({ where: { email } })
            if (!user)
                throw new ApiError(200, "If this email is registered, you will receive an OTP shortly.");

            const { otp, hash_otp } = await OtpUtils.generateOTP()
            const otp_expiry = new Date(Date.now() + (Number(config.OTP_EXPIRY_MINUTES) * 60 * 1000))

            await prisma.$transaction(async (tx) => {
                // mark all prev unused otps as used
                await tx.otp.updateMany({
                    where: { userId: user.id, used: false, type: OtpType.FORGET_PASSWORD },
                    data: { used: true }
                })

                await tx.otp.create({
                    data: {
                        userId: user.id,
                        code: hash_otp,
                        expiresAt: otp_expiry,
                        type: OtpType.FORGET_PASSWORD
                    }
                })
                try {
                    await sendForgetPasswordOtpEmail(user.email, otp, config.OTP_EXPIRY_MINUTES)
                } catch (error) {
                    throw new ApiError(500, "Failed to send forget password OTP. Please try again.");
                }
            })
        } catch (error: any) {
            if (error instanceof ApiError)
                throw error
            throw new ApiError(500, error.message || "Internal Server Error")
        }
    }

    static async VerifyForgetPasswordOTP(data: VerifyForgetPasswordInput) {
        try {
            const { email, otp } = data
            const user = await prisma.user.findFirst({ where: { email } })
            if (!user)
                throw new ApiError(400, "Invalid Request")

            const otp_record = await prisma.otp.findFirst({
                where: {
                    userId: user.id,
                    type: OtpType.FORGET_PASSWORD,
                    used: false,
                    expiresAt: { gt: new Date() }
                },
                orderBy: { createdAt: "desc" }
            })

            if (!otp_record)
                throw new ApiError(400, "Invalid or expired OTP")

            const isOtpValid = await OtpUtils.verifyOTP(otp, otp_record.code);
            if (!isOtpValid) throw new ApiError(400, "Invalid or expired OTP");

            await prisma.otp.update({
                where: { id: otp_record.id },
                data: { used: true }
            })
        } catch (error: any) {
            if (error instanceof ApiError)
                throw error
            throw new ApiError(500, error.message || "Internal Server Error")
        }
    }

    static async ResetPassword(data: RestPasswordInput) {
        try {
            const { email, password } = data;
            const user = await prisma.user.findFirst({ where: { email } })
            if (!user)
                throw new ApiError(400, "Invalid Request")

            const otp_record = await prisma.otp.findFirst({
                where: {
                    userId: user.id,
                    used: true,
                    type: OtpType.FORGET_PASSWORD
                },
                orderBy: { createdAt: "desc" }
            })
            if (!otp_record || !otp_record.used) throw new ApiError(400, "OTP verification required");

            const hash_password = await bcrypt.hash(password, Number(config.BCRYPT_SALT_ROUNDS))

            await prisma.$transaction(async (tx) => {
                await tx.user.update({ where: { email }, data: { password: hash_password } })
                // mark all realted otps as used
                await tx.otp.updateMany({
                    where: { userId: user.id, type: "FORGET_PASSWORD" },
                    data: { used: true }
                })
            })
        } catch (error: any) {
            if (error instanceof ApiError)
                throw error
            throw new ApiError(500, error.message || "Internal Server Error")
        }
    }

    static async Logout(token: string) {
        try {
            const result = await prisma.user.updateMany({
                where: { refreshToken: token },
                data: { refreshToken: null },
            });
            if (result.count === 0)
                throw new ApiError(401, "Session expired or already logged out");

        } catch (error: any) {
            if (error instanceof ApiError)
                throw error
            throw new ApiError(500, error.message || "Internal Server Error")
        }
    }

    static async refresh_AccessToken(incommingRefreshToken: string, next: NextFunction) {
        try {
            if (!config.REFRESH_TOKEN_SECRET)
                throw new ApiError(400, "Failed to load token secret")
            const decodedToken = JwtUtils.verifyToken(incommingRefreshToken, config.REFRESH_TOKEN_SECRET)
            if (!decodedToken)
                throw new ApiError(401, "Invalid or Expired Token")

            const user = await prisma.user.findUnique({ where: { id: decodedToken.id } })

            if (!user)
                throw new ApiError(401, "Invalid or Expired Token")

            if (user.refreshToken !== incommingRefreshToken)
                throw new ApiError(401, "Invalid or Expired Token");

            const { accessToken, refreshToken } = JwtUtils.generateTokens(user.id, user.username, user.role)
            await prisma.user.update({ where: { id: user.id }, data: { refreshToken } })

            return { accessToken, refreshToken }
        } catch (error: any) {
            if (error instanceof ApiError)
                throw error
            throw new ApiError(500, error.message || "Internal Server Error")
        }
    }
}