import express, { Request, Response } from "express";
import swagerUi from "swagger-ui-express"
import fs from 'fs'
import { config } from "./config/env.config";
import { ErrorHandler } from "./middlewares/error.middleware";
import authRouter from "./modules/auth/auth.routes";
import { ApiResponse } from "./utils/ApiResponse";
import cors from "cors";


const PORT = Number(config.PORT)

const app = express()
app.use(express.json())


app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));



const swaggerFile = JSON.parse(fs.readFileSync("./swagger-output.json", "utf-8"));
app.use(`/api/v1/docs`, swagerUi.serve, swagerUi.setup(swaggerFile));

// --- API HEALTH CHECK ---
app.get(`/api/v1/health`, (req: Request, res: Response) => {
    return ApiResponse(res, true, 200, "API is healthy");
});

// --- ROUTES ---
app.use(`/api/v1/auth`, authRouter)


// --- GLOBAL ERROR HANDLER ---
app.use(ErrorHandler)

app.listen(PORT, () => {
    console.log("Server is live on PORT", PORT);
    console.log(`📖 Swagger docs available at http://localhost:${PORT}/api/v1/docs`);
})