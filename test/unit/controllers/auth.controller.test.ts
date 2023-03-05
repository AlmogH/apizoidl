/**
 * =============================================
 * ============= Testing imports ===============
 * =============================================
 */
import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import "../../testUtils/googleAuth.util.mock";
import "../../testUtils/oAuth2Client.mock";

/**
 * =============================================
 * =================== Imports =================
 * =============================================
 */

// Import the express Request and Response interfaces
import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

// Import the GoogleUtils class
import {
	loadSavedCredentialsIfExist,
	saveCredentials,
} from "../../../src/utils/googleAuth.util";

// Import the fs module
import fs from "fs";

/**
 * Unit tests for the AuthController class in src/controllers/auth.controller.ts
 */

// Import the AuthController class
import { AuthController } from "../../../src/controllers/auth.controller";
import { SCOPES } from "../../../src/configs/google.config";
import { afterEach } from "node:test";

// describe the AuthController class for unit testing and define the unit tests
describe("AuthController unit tests", () => {
	/**
	 * =============================================
	 * =================== Mocks ===================
	 * =============================================
	 */
	let request: Request;
	let response: Response;
	let next: NextFunction;
	let mockedReadFileSync: jest.SpiedFunction<typeof fs.readFileSync>;

	// Restore all mocks after all tests are done
	afterEach(() => {
		jest.restoreAllMocks();
	});

	/**
	 * Mock the fs.readFileSync method to return a mock client_id and client_secret
	 * mock the express Request, Response and NextFunction interfaces
	 */
	beforeEach(() => {
		mockedReadFileSync = jest
			.spyOn(fs, "readFileSync")
			.mockImplementationOnce(() => {
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

	/**
	 * =============================================
	 * =================== Tests ===================
	 * =============================================
	 */

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

	// test AuthController class constructor with error reading credentials file
	test("should throw an error if there is an error reading the credentials file", () => {
		// mock the fs.readFileSync method to throw an error
		mockedReadFileSync.mockReset();
		jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
			throw new Error("Error reading credentials file");
		});

		// call the AuthController class constructor and expect it to throw an error
		expect(() => new AuthController()).toThrowError(
			"Error reading credentials file"
		);
	});

	/**
	 * Test the googleAuthHandler method of the AuthController class
	 * should call response.sendStatus with 200 if client is not null
	 */
	test("googleAuthHandler should call response.sendStatus with 200 if client is not null", async () => {
		// mock the loadSavedCredentialsIfExist method of the GoogleUtils class to return a mock OAuth2Client
		const mockLoadSavedCredentialsIfExist =
			loadSavedCredentialsIfExist as jest.MockedFunction<
				typeof loadSavedCredentialsIfExist
			>;
		mockLoadSavedCredentialsIfExist.mockResolvedValue({} as OAuth2Client);

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
		const mockLoadSavedCredentialsIfExist =
			loadSavedCredentialsIfExist as jest.MockedFunction<
				typeof loadSavedCredentialsIfExist
			>;
		mockLoadSavedCredentialsIfExist.mockResolvedValue(null);

		// call the googleAuthHandler method of the AuthController class
		const authController = new AuthController();
		await authController.googleAuthHandler(request, response);

		// expect the response.writeHead method to be called with 301 and location
		expect(response.writeHead).toHaveBeenCalledWith(301, {
			location: "random-string",
		});
		expect(response.send).toHaveBeenCalled();
		expect(mockLoadSavedCredentialsIfExist).toHaveBeenCalled();
		expect(OAuth2Client.prototype.generateAuthUrl).toHaveBeenCalledWith({
			access_type: "offline",
			scope: SCOPES,
			include_granted_scopes: true,
		});
	});

	// TODO add error handling tests for googleAuthHandler method
	test("googleAuthHandler should call next with an error if there is an error", async () => {
		// mock the loadSavedCredentialsIfExist method of the GoogleUtils class to throw an error
		const mockLoadSavedCredentialsIfExist =
			loadSavedCredentialsIfExist as jest.MockedFunction<
				typeof loadSavedCredentialsIfExist
			>;
		mockLoadSavedCredentialsIfExist.mockRejectedValue(
			new Error("Error loading saved credentials")
		);

		// call the googleAuthHandler method of the AuthController class
		const authController = new AuthController();
		await expect(
			authController.googleAuthHandler(request, response, next)
		).rejects.toThrow("Error loading saved credentials");
	});

	test("getTokenHandler should call response.sendStatus with 200 if client is not null", async () => {
		// mock the Request object to have a query property with a code property
		request.query = { code: "random-string" };
		const mockTokenValue = "random-string";

		// mock the getToken method of the OAuth2Client class to return a mock tokens object
		const mockedGetToken = jest
			.spyOn(OAuth2Client.prototype, "getToken")
			.mockImplementationOnce(() => {
				return { tokens: mockTokenValue };
			});

		// mock the setCredentials method of the OAuth2Client class
		const mockedSetCredentials = jest.spyOn(
			OAuth2Client.prototype,
			"setCredentials"
		);

		// mock the saveCredentials method of the GoogleUtils class
		const mockSaveCredentials = saveCredentials as jest.MockedFunction<
			typeof saveCredentials
		>;

		const authController = new AuthController();

		await authController.getTokenHandler(request, response, next);
		expect(response.sendStatus).toHaveBeenCalledWith(200);
		expect(mockSaveCredentials).toHaveBeenCalled();
		expect(mockedGetToken).toHaveBeenCalledWith(request.query.code);
		expect(mockedSetCredentials).toHaveBeenCalled();
		expect(mockedSetCredentials).toHaveBeenCalledWith(mockTokenValue);
	});

	test("getTokenHandler should call next with request error if client is null", async () => {
		// mock the Request object to have a query property with a error property
		request.query = { error: "random-string" };
		// call the getTokenHandler method of the AuthController class
		const authController = new AuthController();
		await authController.getTokenHandler(request, response, next);
		// expect the next function to be called with the request error
		expect(next).toHaveBeenCalledWith(new Error(request.query.error as string));
	});

	test("getTokenHandler should call next with error if client is null and req.query.error", async () => {
		// call the getTokenHandler method of the AuthController class
		const authController = new AuthController();
		await authController.getTokenHandler(request, response, next);
		// expect the next function to be called with the request error
		expect(next).toHaveBeenCalledWith(new Error("No code provided"));
	});
});
