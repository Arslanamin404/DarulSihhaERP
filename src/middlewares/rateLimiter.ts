import rateLimit from "express-rate-limit";

export const resendOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    message: {
        success: false,
        error: "OTP resend limit reached. Please wait 15 minutes before trying again."
    },
})

export const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: {
        success: false,
        error: "Verify OTP limit reached. Please wait 15 minutes before trying again."
    },
})

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: {
        success: false,
        error: "Too many login attempts. Please wait 15 minutes before retrying."
    },
});

export const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: {
        success: false,
        error: "Password reset limit reached. Please try again after 1 hour.",
    },
});