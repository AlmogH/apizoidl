import { HttpException } from "../interfaces/http-exception.interface";
import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
    error: HttpException,
    request: Request,
    response: Response,
    next: NextFunction
) => {
    const status = error.status || 500;
    const message = error.message || "Something went wrong";
    response.status(status).send(message);
}