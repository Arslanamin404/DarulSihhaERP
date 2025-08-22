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
    AuthController.ForgetPassword(req, res, next)
})

authRouter.post("/logout", (req: Request, res: Response, next: NextFunction) => {
    AuthController.Logout(req, res, next)
})

export default authRouter