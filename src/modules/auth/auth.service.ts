import bcrypt from 'bcrypt';
import { prisma } from "../../lib/prisma";
import { OtpUtils } from "../../utils/otpUtils";
import { LoginInput, RegisterInput, ResendOtpInput, VerifyOtpInput } from "./auth.validation";
import { config } from '../../config/env.config';
import { Role } from '@prisma/client';
import { sendOtpEmail } from '../../utils/emails/sendOtpEmail';
import { ApiError } from '../../utils/ApiError';
import { sendResendOtpEmail } from '../../utils/emails/resendOtpEmail';
import { JwtUtils } from '../../utils/jwtUtils';
import { NextFunction } from 'express';

export class AuthService {
    static async Register(data: RegisterInput) {
        try {
            const { email, fullname, username, password, role } = data

            const user = await prisma.user.findFirst({
                where: { OR: [{ email }, { username }] }
            })
            if (user)
                throw new ApiError(400, "User with this email or username already exists.");

            const { otp, hash_otp } = await OtpUtils.generateOTP()
            const hash_password = await bcrypt.hash(password, Number(config.BCRYPT_SALT_ROUNDS))
            const otp_expiry = new Date(Date.now() + (Number(config.OTP_EXPIRY_MINUTES) * 60 * 1000))

            const new_user = await prisma.user.create({
                data: {
                    email,
                    fullname,
                    username,
                    password: hash_password,
                    role: role as Role,
                    otp: hash_otp,
                    otpExpiresAt: otp_expiry
                }
            })

            // rollback if failed
            try {
                await sendOtpEmail(email, otp, config.OTP_EXPIRY_MINUTES)
            } catch (error) {
                await prisma.user.delete({ where: { id: new_user.id } })
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

            if (!user.otpExpiresAt || Date.now() > new Date(user.otpExpiresAt).getTime())
                throw new ApiError(400, "Invalid or expired OTP")

            if (!user.otp)
                throw new ApiError(400, "Invalid or expired OTP")

            const isOtpValid = await OtpUtils.verifyOTP(otp, user.otp)
            if (!isOtpValid)
                throw new ApiError(400, "Invalid or expired OTP")

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    isVerfied: true,
                    otp: null,
                    otpExpiresAt: null
                }
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
                throw new ApiError(400, "Invalid credentials! Please enter a registered email.")
            if (user.isVerfied)
                throw new ApiError(400, "This account is already verified. You can proceed to login.")

            const { otp, hash_otp } = await OtpUtils.generateOTP()
            const otp_expiry = new Date(Date.now() + (Number(config.OTP_EXPIRY_MINUTES) * 60 * 1000))
            await prisma.user.update({
                where: { email }, data: {
                    otp: hash_otp,
                    otpExpiresAt: otp_expiry
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
            const decodedToken = JwtUtils.verifyToken(incommingRefreshToken, config.REFRESH_TOKEN_SECRET, next)
            if (!decodedToken)
                throw new ApiError(401, "Invalid or Expired Token")

            const user = await prisma.user.findUnique({ where: { id: decodedToken.id } })

            if (!user)
                throw new ApiError(401, "Invalid or Expired Token")

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