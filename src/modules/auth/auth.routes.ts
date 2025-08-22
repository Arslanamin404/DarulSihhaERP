import { NextFunction, Request, Response, Router } from 'express';
import { AuthController } from './auth.controller';
import { forgotPasswordLimiter, loginLimiter, resendOtpLimiter, verifyOtpLimiter } from '../../middlewares/rateLimiter';

const authRouter = Router()

authRouter.post("/register", (req: Request, res: Response, next: NextFunction) => {
    AuthController.Register(req, res, next)
})

authRouter.post("/verify-otp", verifyOtpLimiter, (req: Request, res: Response, next: NextFunction) => {
    AuthController.VerifyOTP(req, res, next)
})

authRouter.post("/resend-otp", resendOtpLimiter, (req: Request, res: Response, next: NextFunction) => {
    AuthController.ResendOTP(req, res, next)
})

authRouter.post("/login", loginLimiter, (req: Request, res: Response, next: NextFunction) => {
    AuthController.Login(req, res, next)
})

authRouter.post("/forget-password", forgotPasswordLimiter, (req: Request, res: Response, next: NextFunction) => {
    AuthController.ForgetPasswordRequest(req, res, next)
})

authRouter.post("/verify-forget-password-otp", forgotPasswordLimiter, (req: Request, res: Response, next: NextFunction) => {
    AuthController.VerifyForgetPasswordOtp(req, res, next)
})

authRouter.post("/reset-password", forgotPasswordLimiter, (req: Request, res: Response, next: NextFunction) => {
    AuthController.ResetPassword(req, res, next)
})

authRouter.post("/logout", (req: Request, res: Response, next: NextFunction) => {
    AuthController.Logout(req, res, next)
})

authRouter.post("/refresh", (req: Request, res: Response, next: NextFunction) => {
    AuthController.Refresh_AccessToken(req, res, next)
})

export default authRouter