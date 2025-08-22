import otpGenerator from "otp-generator"
import bcrypt from "bcrypt"
import { config } from "../config/env.config";

export class OtpUtils {
    static async generateOTP() {
        try {
            const otp = otpGenerator.generate(6, {
                digits: true,
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            const hash_otp = await bcrypt.hash(otp, Number(config.BCRYPT_SALT_ROUNDS))

            return { otp, hash_otp }
        } catch (error: any) {
            console.log("Error occurred while genrating otp");
            throw new Error(`Error occurred in genrating and hashing otp: ${error.message}`);
        }
    }

    static async verifyOTP(incommingOTP: string, hash_otp: string,) {
        try {
            return await bcrypt.compare(incommingOTP, hash_otp)
        } catch (error: any) {
            console.log("Error occurred in verifying otp");
            throw new Error(`Error occurred in verifying otp: ${error.message}`)
        }
    }
}