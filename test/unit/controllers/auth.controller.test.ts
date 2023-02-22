/**
 * Required imports from libraries and other files
 */

import {
	jest,
	describe,
	test,
	expect,
	beforeEach,
	beforeAll,
	afterAll,
} from "@jest/globals";

import { OAuth2ClientMock } from "../../testUtils/mocks";
OAuth2ClientMock();
import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { GoogleUtils } from "../../../src/utils/googleAuth.util";
import fs from "fs";
/**
 * Unit tests for the AuthController class in src/controllers/auth.controller.ts
 */

// Import the AuthController class
import { AuthController } from "../../../src/controllers/auth.controller";

describe("AuthController unit tests", () => {
	let request: Request;
	let response: Response;
	let next: NextFunction;

	// beforeAll(() => {});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	beforeEach(() => {
		jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
			return Buffer.from(
				JSON.stringify({
					installed: {
						client_id: "mock_client_id",
						client_secret: "mock_client_secret",
					},
				})
			);
		});

		request = {} as Request;

		response = {
			send: jest.fn().mockReturnThis() as Response["send"],
			sendStatus: jest.fn().mockReturnThis() as Response["sendStatus"],
			writeHead: jest.fn().mockReturnThis() as Response["writeHead"],
			status: jest.fn().mockReturnThis() as Response["status"],
		} as Response;
		next = jest.fn() as NextFunction;
	});

	test("should create an instance of AuthController", () => {
		const authController = new AuthController();
		expect(authController).toBeInstanceOf(AuthController);
	});

	test("should have a property oauth2Client", () => {
		const authController = new AuthController();
		expect(authController).toHaveProperty("oauth2Client");
	});

	test("googleAuthHandler should call response.sendStatus with 200 if client is not null", async () => {
		jest
			.spyOn(GoogleUtils, "loadSavedCredentialsIfExist")
			.mockResolvedValue({} as OAuth2Client);
		const authController = new AuthController();
		await authController.googleAuthHandler(request, response);
		expect(response.sendStatus).toHaveBeenCalledWith(200);
	});

	test("googleAuthHandler should call response.writeHead with 301 and location if client is null", async () => {
		OAuth2Client.prototype.generateAuthUrl = jest
			.fn()
			.mockReturnValue("random-string") as (opts?: undefined) => string;

		const loadSavedCredentialsIfExistMock = jest
			.spyOn(GoogleUtils, "loadSavedCredentialsIfExist")
			.mockResolvedValue(null);

		const authController = new AuthController();
		await authController.googleAuthHandler(request, response);
		expect(response.writeHead).toHaveBeenCalledWith(301, {
			location: "random-string",
		});
		expect(response.send).toHaveBeenCalled();
		expect(loadSavedCredentialsIfExistMock).toHaveBeenCalled();
	});

	test("getTokenHandler should call response.sendStatus with 200 if client is not null", async () => {
		GoogleUtils.saveCredentials = jest.fn<typeof GoogleUtils.saveCredentials>();

		const mockedGetToken = jest.spyOn(OAuth2Client.prototype, "getToken");
		mockedGetToken.mockImplementationOnce(() => {
			return { tokens: "random-string" };
		});

		const mockedSetCredentials = jest.spyOn(
			OAuth2Client.prototype,
			"setCredentials"
		);

		const authController = new AuthController();
		request.query = { code: "random-string" };
		await authController.getTokenHandler(request, response, next);
		expect(response.sendStatus).toHaveBeenCalledWith(200);
		expect(GoogleUtils.saveCredentials).toHaveBeenCalled();
		expect(mockedGetToken).toHaveBeenCalled();
		expect(mockedSetCredentials).toHaveBeenCalled();
		expect(mockedSetCredentials).toHaveBeenCalledWith("random-string");
	});
});
