import { NextFunction, Request, Response } from 'express';
import { loginSchema, registerSchema, resendOtpSchema, verifyOtpSchema } from './auth.validation';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { config } from '../../config/env.config';
export class AuthController {
    static async Register(req: Request, res: Response, next: NextFunction) {
        try {
            const validate_data = registerSchema.parse(req.body)
            await AuthService.Register(validate_data)
            return ApiResponse(res, true, 201, "User registered successfully. OTP sent to your email, please check it and verify your account.")
        } catch (error) {
            next(error)
        }
    }

    static async VerifyOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const validate_data = verifyOtpSchema.parse(req.body)
            await AuthService.VerifyOTP(validate_data)
            return ApiResponse(res, true, 200, "Email verified successfully")
        } catch (error) {
            next(error)
        }
    }

    static async ResendOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const validate_data = resendOtpSchema.parse(req.body)
            await AuthService.ResendOTP(validate_data)
            return ApiResponse(res, true, 201, "OTP resent to your email, please check it and verify.")
        } catch (error) {
            next(error)
        }
    }

    static async Login(req: Request, res: Response, next: NextFunction) {
        try {
            const validate_data = loginSchema.parse(req.body)
            const { accessToken, refreshToken } = await AuthService.Login(validate_data);
            const cookieOptions = {
                httpOnly: true,
                secure: config.NODE_ENV === "production",
                sameSite: "strict" as const,
            };
            res.cookie("access_token", accessToken, {
                ...cookieOptions, maxAge: 15 * 60 * 1000
            })

            res.cookie("refresh_token", refreshToken, {
                ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000
            })
            return ApiResponse(res, true, 200, "Logged In successfully")
        } catch (error) {
            next(error)
        }
    }

    static async ForgetPassword(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error)
        }
    }

    static async Logout(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.refresh_token
            if (!token)
                return ApiResponse(res, false, 401, "Session expired or already logged out");

            await AuthService.Logout(token)
            const cookieOptions = {
                httpOnly: true,
                secure: config.NODE_ENV === "production",
                sameSite: "strict" as const,
            };
            res.clearCookie("access_token", cookieOptions)
            res.clearCookie("refresh_token", cookieOptions)
            return ApiResponse(res, true, 200, "Logged Out successfully")
        } catch (error) {
            next(error)
        }
    }
    
    static async Refresh_AccessToken(req: Request, res: Response, next: NextFunction) {
        try {
            const incomming_refresh_token = req.cookies?.refresh_token;
            if (!incomming_refresh_token)
                return ApiResponse(res, false, 401, "Unauthorized Request");

            const { accessToken, refreshToken } = await AuthService.refresh_AccessToken(incomming_refresh_token, next)
            const cookieOptions = {
                httpOnly: true,
                secure: config.NODE_ENV === "production",
                sameSite: "strict" as const,
            };
            res.cookie("access_token", accessToken, cookieOptions)
            res.cookie("refresh_token", refreshToken, cookieOptions)
            return ApiResponse(res, true, 200, "Token refreshed successfully")
        } catch (error) {
            next(error)
        }
    }
}