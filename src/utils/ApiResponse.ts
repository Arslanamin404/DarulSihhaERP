import { Response } from "express";

export const ApiResponse = (
    res: Response,
    success: boolean,
    statusCode: number,
    message: string | undefined = undefined,
    data: object | undefined = undefined,
    token: string | undefined = undefined

) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
        token
    })
}