/**
 * Required imports from libraries and other files
 */

import {
	jest,
	describe,
	test,
	expect,
	beforeEach,
	afterAll,
} from "@jest/globals";

// import mocks for OAuth2Client class from google-auth-library package for unit testing
import { OAuth2ClientMock } from "../../testUtils/mocks";
OAuth2ClientMock();

// Import the express Request and Response interfaces
import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

// Import the GoogleUtils class
import { GoogleUtils } from "../../../src/utils/googleAuth.util";

// Import the fs module
import fs from "fs";

/**
 * Unit tests for the AuthController class in src/controllers/auth.controller.ts
 */

// Import the AuthController class
import { AuthController } from "../../../src/controllers/auth.controller";

// describe the AuthController class for unit testing and define the unit tests
describe("AuthController unit tests", () => {
	let request: Request;
	let response: Response;
	let next: NextFunction;

	// Restore all mocks after all tests are done
	afterAll(() => {
		jest.restoreAllMocks();
	});

	/**
	 * Mock the fs.readFileSync method to return a mock client_id and client_secret
	 * mock the express Request, Response and NextFunction interfaces
	 */
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

	// test the AuthController class constructor
	test("should create an instance of AuthController", () => {
		const authController = new AuthController();
		expect(authController).toBeInstanceOf(AuthController);
	});

	// test the oauth2Client property of the AuthController class
	test("should have a property oauth2Client", () => {
		const authController = new AuthController();
		expect(authController).toHaveProperty("oauth2Client");
	});

	/**
	 * Test the googleAuthHandler method of the AuthController class
	 * should call response.sendStatus with 200 if client is not null
	 */
	test("googleAuthHandler should call response.sendStatus with 200 if client is not null", async () => {
		// mock the loadSavedCredentialsIfExist method of the GoogleUtils class to return a mock OAuth2Client
		jest
			.spyOn(GoogleUtils, "loadSavedCredentialsIfExist")
			.mockResolvedValue({} as OAuth2Client);
		const authController = new AuthController();
		await authController.googleAuthHandler(request, response);
		expect(response.sendStatus).toHaveBeenCalledWith(200);
	});

	/**
	 * Test the googleAuthHandler method of the AuthController class
	 * should call response.writeHead with 301 and location if client is null
	 */
	test("googleAuthHandler should call response.writeHead with 301 and location if client is null", async () => {
		// mock the generateAuthUrl method of the OAuth2Client class to return a random string
		OAuth2Client.prototype.generateAuthUrl = jest
			.fn()
			.mockReturnValue("random-string") as (opts?: undefined) => string;

		// mock the loadSavedCredentialsIfExist method of the GoogleUtils class to return null
		const loadSavedCredentialsIfExistMock = jest
			.spyOn(GoogleUtils, "loadSavedCredentialsIfExist")
			.mockResolvedValue(null);

		const authController = new AuthController();
		await authController.googleAuthHandler(request, response);
		// expect the response.writeHead method to be called with 301 and location
		expect(response.writeHead).toHaveBeenCalledWith(301, {
			location: "random-string",
		});
		expect(response.send).toHaveBeenCalled();
		expect(loadSavedCredentialsIfExistMock).toHaveBeenCalled();
	});

	test("getTokenHandler should call response.sendStatus with 200 if client is not null", async () => {
		// mock the loadSavedCredentialsIfExist method of the GoogleUtils class to return a mock OAuth2Client
		GoogleUtils.saveCredentials = jest.fn<typeof GoogleUtils.saveCredentials>();

		// mock the getToken method of the OAuth2Client class to return a mock tokens object
		const mockedGetToken = jest.spyOn(OAuth2Client.prototype, "getToken");
		mockedGetToken.mockImplementationOnce(() => {
			return { tokens: "random-string" };
		});

		// mock the setCredentials method of the OAuth2Client class
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
