import { jest, describe, test, expect, beforeEach } from "@jest/globals";

import { errorMiddleware } from "../../../src/middlewares/error.middleware";
import { HttpException } from "../../../src/interfaces/httpException.interface";
import { Request, Response, NextFunction } from "express";

describe("errorMiddleware", () => {
	let error: HttpException;
	let request: Request;
	let response: Response;
	let next: NextFunction;

	beforeEach(() => {
		error = { status: 400, message: "Bad Request" };
		request = {} as Request;
		response = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as unknown as Response;
		next = jest.fn();
	});

	test("should set the response status to the error status", () => {
		errorMiddleware(error, request, response, next);
		expect(response.status).toHaveBeenCalledWith(error.status);
	});

	test("should set the response body to the error message", () => {
		errorMiddleware(error, request, response, next);
		expect(response.send).toHaveBeenCalledWith(error.message);
	});

	test("should set the response status to 500 if no error status is provided", () => {
		error = { message: "Internal Server Error" };
		errorMiddleware(error, request, response, next);
		expect(response.status).toHaveBeenCalledWith(500);
	});

	test("should set the response message to 'Something went wrong' if no error message is provided", () => {
		error = { status: 404 };
		errorMiddleware(error, request, response, next);
		expect(response.send).toHaveBeenCalledWith("Something went wrong");
	});
});
