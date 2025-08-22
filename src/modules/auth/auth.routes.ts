import { NextFunction, Request, Response, Router } from 'express';
import { AuthController } from './auth.controller';
import { forgotPasswordLimiter, loginLimiter, resendOtpLimiter, verifyOtpLimiter } from '../../middlewares/rateLimiter';

const authRouter = Router()

authRouter.post("/register", (req: Request, res: Response, next: NextFunction) => {
    /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Register new user'
  #swagger.description = 'Registers a user and sends OTP for verification.'
  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $email: "user@example.com",
        $password: "123456",
        $username: "newuser",
        $fullname: "New User",
      }
  }
  #swagger.responses[201] = {
      description: "User registered successfully. OTP sent to your email, please check it and verify your account."
  }
*/
    AuthController.Register(req, res, next)
})

authRouter.post("/verify-otp", verifyOtpLimiter, (req: Request, res: Response, next: NextFunction) => {
    /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Verify Otp for register'
  #swagger.description = 'Verief your account.'
  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $email: "user@example.com",
        $otp: "162731",
      }
  }
  #swagger.responses[200] = {
      description: "otp verief successfully. You can now proceed to login."
  }
*/
    AuthController.VerifyOTP(req, res, next)
})

authRouter.post("/resend-otp", resendOtpLimiter, (req: Request, res: Response, next: NextFunction) => {
    /*
       #swagger.tags = ['Auth']
      #swagger.summary = 'Resend OTP for registration'
      #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            $email: "user@example.com"
          }
      }
      #swagger.responses[200] = { description: "OTP resent successfully." }
*/
    AuthController.ResendOTP(req, res, next)
})

authRouter.post("/login", loginLimiter, (req: Request, res: Response, next: NextFunction) => {
    /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Login user'
  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $username: "newuser",
        $password: "123456"
      }
  }
  #swagger.responses[200] = {
       description: "Login successful. Sets HttpOnly refreshToken cookie and accessToken."
  }
*/
    AuthController.Login(req, res, next)
})

authRouter.post("/forget-password", forgotPasswordLimiter, (req: Request, res: Response, next: NextFunction) => {
    /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Request OTP for password reset'
  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $email: "user@example.com"
      }
  }
  #swagger.responses[200] = { description: "OTP sent for password reset." }
*/
    AuthController.ForgetPasswordRequest(req, res, next)
})

authRouter.post("/verify-forget-password-otp", forgotPasswordLimiter, (req: Request, res: Response, next: NextFunction) => {
    /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Verify OTP for password reset'
  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $email: "user@example.com",
        $otp: "123456"
      }
  }
  #swagger.responses[200] = { description: "OTP verified. User can reset password." }
*/
    AuthController.VerifyForgetPasswordOtp(req, res, next)
})

authRouter.post("/reset-password", forgotPasswordLimiter, (req: Request, res: Response, next: NextFunction) => {
    /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Reset password after verifying OTP'
  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $email: "user@example.com",
        $new_password: "newPass123"
      }
  }
  #swagger.responses[200] = { description: "Password reset successfully." }
*/
    AuthController.ResetPassword(req, res, next)
})

authRouter.post("/logout", (req: Request, res: Response, next: NextFunction) => {
    /*
   #swagger.tags = ['Auth']
   #swagger.summary = 'Logout user'
   #swagger.responses[200] = { description: "Logout successful." }
 */
    AuthController.Logout(req, res, next)
})

authRouter.post("/refresh", (req: Request, res: Response, next: NextFunction) => {
    /*
      #swagger.tags = ['Auth']
      #swagger.summary = 'Refresh access token using refresh token'
      #swagger.description = 'Reads HttpOnly refreshToken from cookie, validates it, and issues a new access token.'
      #swagger.responses[200] = {
          description: "New access token issued.",
      }
      #swagger.responses[401] = { description: "Invalid or expired refresh token." }
    */
    AuthController.Refresh_AccessToken(req, res, next)
})

export default authRouter