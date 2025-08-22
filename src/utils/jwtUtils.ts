import jwt, { SignOptions, JwtPayload } from "jsonwebtoken"
import { config } from "../config/env.config"
import { NextFunction } from "express"

export interface TokenPayload extends JwtPayload {
    id: string
    username: string
    role: "STAFF" | "ADMIN"
}

export class JwtUtils {
    private static generateToken(
        id: string,
        username: string,
        role: "STAFF" | "ADMIN",
        secret: string,
        expiresIn: SignOptions["expiresIn"]
    ) {
        const payload: TokenPayload = { id, username, role }
        const options: SignOptions = { expiresIn }

        return jwt.sign(payload, secret, options)
    }

    static generateTokens(id: string, username: string, role: "STAFF" | "ADMIN") {
        if (!config.ACCESS_TOKEN_SECRET)
            throw new Error("ACCESS_TOKEN_SECRET is not defined")
        if (!config.REFRESH_TOKEN_SECRET)
            throw new Error("REFRESH_TOKEN_SECRET is not defined")

        const accessToken = JwtUtils.generateToken(
            id,
            username,
            role,
            config.ACCESS_TOKEN_SECRET,
            config.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]
        )
        const refreshToken = JwtUtils.generateToken(
            id,
            username,
            role,
            config.REFRESH_TOKEN_SECRET,
            config.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]
        )
        return { accessToken, refreshToken }
    }

    static verifyToken(token: string, secret: string, next: NextFunction): TokenPayload | null {
        try {
            return jwt.verify(token, secret) as TokenPayload
        } catch (error) {
            next(error)
            return null
        }
    }
}
