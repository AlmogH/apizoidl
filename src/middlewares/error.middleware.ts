import { HttpException } from "../interfaces/httpException.interface";
import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger.util";

export const errorMiddleware = (
	error: HttpException,
	request: Request,
	response: Response,
	_next: NextFunction
) => {
	const status = error.status || 500;
	const message = error.message || "Something went wrong";
	logger.error(`${request.method} ${request.path} - ${status} - ${message}`);
	response.status(status).send(message);
};
