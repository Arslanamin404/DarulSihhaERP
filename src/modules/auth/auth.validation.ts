import { z } from "zod"

export const registerSchema = z.object({
    email: z
        .string({ error: "Email is required" })
        .trim()
        .regex(z.regexes.email, { message: "Invalid email format" }),
    password: z
        .string()
        .trim()
        .min(7, "password must be at least of 7 characters"),
    username: z
        .string()
        .trim()
        .min(5, "username must be at least of 5 characters")
        .max(20, "username cannot exceed 20 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters, numbers"),
    fullname: z
        .string()
        .trim()
        .min(5, "fullname must be at least of 5 characters")
});

export const verifyOtpSchema = z.object({
    email: z
        .string({ error: "Email is required" })
        .trim()
        .regex(z.regexes.email, { message: "Invalid email format" }),
    otp: z
        .string({ error: "OTP is required" })
        .trim()
        .regex(/^[0-9]{6}$/, "OTP must be exactly 6 digits.")

})

export const resendOtpSchema = z.object({
    email: z
        .string({ error: "Email is required" })
        .trim()
        .regex(z.regexes.email, { message: "Invalid email format" }),
})

export const loginSchema = z.object({
    username: z
        .string()
        .trim()
        .min(5, "username must be at least of 5 characters")
        .max(15, "username cannot exceed 15 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters, numbers"),
    password: z
        .string()
        .trim()
        .min(7, "password must be at least of 7 characters"),
})

export const forgetPasswordSchema = z.object({
    email: z
        .string({ error: "Email is required" })
        .trim()
        .regex(z.regexes.email, { message: "Invalid email format" }),
})

export const verifyForgetPasswordSchema = z.object({
    email: z
        .string({ error: "Email is required" })
        .trim()
        .regex(z.regexes.email, { message: "Invalid email format" }),
    otp: z
        .string({ error: "OTP is required" })
        .trim()
        .regex(/^[0-9]{6}$/, "OTP must be exactly 6 digits."),
})

export const resetPasswordSchema = z.object({
    email: z
        .string({ error: "Email is required" })
        .trim()
        .regex(z.regexes.email, { message: "Invalid email format" }),
    new_password: z
        .string()
        .trim()
        .min(7, "password must be at least of 7 characters"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type ResendOtpInput = z.infer<typeof resendOtpSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgetPasswordInput = z.infer<typeof forgetPasswordSchema>
export type VerifyForgetPasswordInput = z.infer<typeof verifyForgetPasswordSchema>
export type RestPasswordInput = z.infer<typeof resetPasswordSchema>